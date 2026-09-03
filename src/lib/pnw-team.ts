export interface ScrapedTeamMember {
  name: string
  position: string
  image: string
}

export type TeamCategory = 'leadership' | 'officers' | 'mentors' | 'advisors'

export interface CategorizedTeam {
  leadership: ScrapedTeamMember[]
  mentors: ScrapedTeamMember[]
  officers: ScrapedTeamMember[]
  advisors: ScrapedTeamMember[]
}

export const TEAM_PAGE_PATH = '/arcade/leadership-team/'
export const DEFAULT_PNW_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
}

export function getPnwTeamPageUrl(): string {
  const base = process.env.PNW_BASE_URL
  if (!base) {
    throw new Error('PNW_BASE_URL is not configured')
  }
  return `${base}${TEAM_PAGE_PATH}`
}

export function decodeHtmlEntities(str: string): string {
  return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
}

export function toAbsolutePnwUrl(path: string): string {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${process.env.PNW_BASE_URL}${path}`
}

/** True only for the chapter President — never Vice-President or other titles. */
export function isChapterPresident(position: string): boolean {
  const normalized = decodeHtmlEntities(position).replace(/\s+/g, ' ').trim().toLowerCase()
  return normalized === 'president' || normalized === 'chapter president'
}

export function inferTeamCategory(position: string): TeamCategory {
  const pos = position.toLowerCase()
  if (isChapterPresident(position) || (pos.includes('vice') && pos.includes('president'))) {
    return 'leadership'
  }
  if (pos.includes('mentor')) return 'mentors'
  if (pos.includes('advisor')) return 'advisors'
  return 'officers'
}

/**
 * Parse PNW officer cards one at a time.
 * Cards are `type-team` blocks; name + position must come from the same card.
 */
export function parseOfficerCards(html: string): ScrapedTeamMember[] {
  const chunks = html.split(/class="[^"]*\btype-team\b[^"]*"/i)
  const members: ScrapedTeamMember[] = []
  const seen = new Set<string>()

  for (const chunk of chunks.slice(1)) {
    const nameMatch = chunk.match(/<span class="h5">([^<]+)<\/span>/)
    const positionMatch = chunk.match(/officers_position[^"]*"[^>]*>([^<]*)<\/span>/)
    if (!nameMatch || !positionMatch) continue

    const name = nameMatch[1].trim()
    const position = decodeHtmlEntities(positionMatch[1].trim())
    if (!name || !position || seen.has(name.toLowerCase())) continue

    const imageMatch = chunk.match(/<img[^>]*src="([^"]+)"[^>]*>/i)
    seen.add(name.toLowerCase())
    members.push({
      name,
      position,
      image: toAbsolutePnwUrl(imageMatch?.[1] ?? ''),
    })
  }

  return members
}

export function categorizeMembers(members: ScrapedTeamMember[]): CategorizedTeam {
  const result: CategorizedTeam = {
    leadership: [],
    mentors: [],
    officers: [],
    advisors: [],
  }

  for (const member of members) {
    result[inferTeamCategory(member.position)].push(member)
  }

  result.leadership.sort((a, b) => (isChapterPresident(a.position) ? -1 : isChapterPresident(b.position) ? 1 : 0))
  return result
}

export function findChapterPresident(members: ScrapedTeamMember[]): ScrapedTeamMember | undefined {
  return members.find((member) => isChapterPresident(member.position))
}
