import { createAdminClient } from "@/lib/supabase/admin"
import { listChapterMembers } from "@/lib/chapter-team"

export type PublicPastPresident = {
  id: string
  name: string
  photo_url: string | null
  year: string
  linkedin_url?: string | null
  email?: string | null
}

export async function getPublishedPastPresidents(): Promise<PublicPastPresident[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("past_presidents")
    .select("id, name, photo_url, year")
    .eq("status", "published")
    .order("order_index", { ascending: true, nullsFirst: false })
    .order("year", { ascending: false })

  if (error) throw new Error("Failed to fetch past presidents")

  const presidents = data ?? []
  const extrasByName = new Map<
    string,
    { photo_url: string | null; linkedin_url: string | null; email: string | null }
  >()

  try {
    const [{ data: overrides }, manuals] = await Promise.all([
      supabase
        .from("team_member_overrides")
        .select("member_name, custom_image_url, linkedin_url, email"),
      listChapterMembers(supabase),
    ])

    for (const member of manuals) {
      extrasByName.set(member.name.toLowerCase(), {
        photo_url: member.image_url,
        linkedin_url: member.linkedin_url,
        email: member.email,
      })
    }

    if (overrides) {
      for (const override of overrides) {
        extrasByName.set(override.member_name.toLowerCase(), {
          photo_url: override.custom_image_url,
          linkedin_url: override.linkedin_url,
          email: override.email,
        })
      }
    }
  } catch (contactError) {
    console.error("Failed to fetch former president extras:", contactError)
  }

  return presidents.map((president) => {
    const extras = extrasByName.get(president.name.toLowerCase())
    return {
      ...president,
      photo_url: extras?.photo_url || president.photo_url,
      linkedin_url: extras?.linkedin_url ?? null,
      email: extras?.email ?? null,
    }
  })
}
