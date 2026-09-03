import { createAdminClient } from "@/lib/supabase/admin"
import {
  categorizeMembers,
  DEFAULT_PNW_HEADERS,
  getPnwTeamPageUrl,
  inferTeamCategory,
  parseOfficerCards,
  type ScrapedTeamMember,
} from "@/lib/pnw-team"
import { listChapterMembers } from "@/lib/chapter-team"

export interface PublicTeamMember extends ScrapedTeamMember {
  linkedin_url?: string | null
  email?: string | null
  original_image?: string
  source?: "scraped" | "manual"
}

export type CategorizedPublicTeam = {
  leadership: PublicTeamMember[]
  mentors: PublicTeamMember[]
  officers: PublicTeamMember[]
  advisors: PublicTeamMember[]
}

export async function getPublicTeam(): Promise<{
  count: number
  data: CategorizedPublicTeam
}> {
  const response = await fetch(getPnwTeamPageUrl(), {
    headers: DEFAULT_PNW_HEADERS,
    next: { revalidate: 600 },
  })

  if (!response.ok) {
    throw new Error(`Upstream error: ${response.status}`)
  }

  const html = await response.text()
  const members = parseOfficerCards(html)

  const overridesMap = new Map<
    string,
    { custom_image_url: string | null; linkedin_url: string | null; email: string | null }
  >()
  let manualMembers: Awaited<ReturnType<typeof listChapterMembers>> = []

  try {
    const supabase = createAdminClient()
    const [{ data: overrides }, listed] = await Promise.all([
      supabase
        .from("team_member_overrides")
        .select("member_name, custom_image_url, linkedin_url, email"),
      listChapterMembers(supabase),
    ])

    manualMembers = listed

    if (overrides) {
      for (const override of overrides) {
        overridesMap.set(override.member_name.toLowerCase(), {
          custom_image_url: override.custom_image_url,
          linkedin_url: override.linkedin_url,
          email: override.email,
        })
      }
    }
  } catch (dbError) {
    console.error("Failed to fetch team extras:", dbError)
  }

  const mergedMembers: PublicTeamMember[] = members.map((member) => {
    const override = overridesMap.get(member.name.toLowerCase())
    if (!override) return { ...member, source: "scraped" }
    return {
      ...member,
      source: "scraped",
      original_image: member.image,
      image: override.custom_image_url || member.image,
      linkedin_url: override.linkedin_url || null,
      email: override.email || null,
    }
  })

  const byName = new Map(mergedMembers.map((member) => [member.name.toLowerCase(), member]))

  for (const manual of manualMembers) {
    const key = manual.name.toLowerCase()
    const existing = byName.get(key)
    const next: PublicTeamMember = {
      name: manual.name,
      position: manual.position,
      image: manual.image_url || existing?.image || "",
      linkedin_url: manual.linkedin_url || existing?.linkedin_url || null,
      email: manual.email || existing?.email || null,
      original_image: existing?.original_image || existing?.image,
      source: "manual",
    }

    if (existing) {
      Object.assign(existing, next)
    } else {
      mergedMembers.push(next)
      byName.set(key, next)
    }
  }

  const categorized = categorizeMembers(mergedMembers) as CategorizedPublicTeam

  for (const manual of manualMembers) {
    const inferred = inferTeamCategory(manual.position)
    if (inferred === manual.category) continue
    const key = manual.name.toLowerCase()
    for (const section of Object.values(categorized)) {
      const idx = section.findIndex((member: ScrapedTeamMember) => member.name.toLowerCase() === key)
      if (idx >= 0) {
        const [moved] = section.splice(idx, 1)
        categorized[manual.category].push(moved)
        break
      }
    }
  }

  return {
    count: mergedMembers.length,
    data: categorized,
  }
}
