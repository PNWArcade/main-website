import type { SupabaseClient } from '@supabase/supabase-js'
import type { TeamCategory } from '@/lib/pnw-team'

export const CHAPTER_MEMBER_SLUG_PREFIX = 'member-'

export interface ChapterTeamMember {
  id: string
  name: string
  position: string
  category: TeamCategory
  image_url: string | null
  linkedin_url: string | null
  email: string | null
  order_index: number | null
}

interface ChapterMemberPayload {
  _type: 'chapter_member'
  position: string
  category: TeamCategory
  image_url: string | null
  linkedin_url: string | null
  email: string | null
}

const CATEGORIES: TeamCategory[] = ['leadership', 'officers', 'mentors', 'advisors']

export function isTeamCategory(value: string): value is TeamCategory {
  return CATEGORIES.includes(value as TeamCategory)
}

export function slugifyMemberName(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `${CHAPTER_MEMBER_SLUG_PREFIX}${slug || 'member'}`
}

function parsePayload(description: string | null): ChapterMemberPayload | null {
  if (!description) return null
  try {
    const parsed = JSON.parse(description) as Partial<ChapterMemberPayload>
    if (parsed._type !== 'chapter_member' || !parsed.position || !parsed.category) return null
    if (!isTeamCategory(parsed.category)) return null
    return {
      _type: 'chapter_member',
      position: parsed.position,
      category: parsed.category,
      image_url: parsed.image_url ?? null,
      linkedin_url: parsed.linkedin_url ?? null,
      email: parsed.email ?? null,
    }
  } catch {
    return null
  }
}

function toPayload(input: {
  position: string
  category: TeamCategory
  image_url?: string | null
  linkedin_url?: string | null
  email?: string | null
}): string {
  const payload: ChapterMemberPayload = {
    _type: 'chapter_member',
    position: input.position,
    category: input.category,
    image_url: input.image_url ?? null,
    linkedin_url: input.linkedin_url ?? null,
    email: input.email ?? null,
  }
  return JSON.stringify(payload)
}

function toMember(row: {
  id: string
  name: string
  description: string | null
  order_index: number | null
}): ChapterTeamMember | null {
  const payload = parsePayload(row.description)
  if (!payload) return null
  return {
    id: row.id,
    name: row.name,
    position: payload.position,
    category: payload.category,
    image_url: payload.image_url,
    linkedin_url: payload.linkedin_url,
    email: payload.email,
    order_index: row.order_index,
  }
}

export async function listChapterMembers(supabase: SupabaseClient): Promise<ChapterTeamMember[]> {
  const { data, error } = await supabase
    .from('teams')
    .select('id, name, slug, description, order_index')
    .like('slug', `${CHAPTER_MEMBER_SLUG_PREFIX}%`)
    .order('order_index', { ascending: true, nullsFirst: false })
    .order('name', { ascending: true })

  if (error) throw error

  return (data ?? []).map(toMember).filter((member): member is ChapterTeamMember => member !== null)
}

export async function insertChapterMember(
  supabase: SupabaseClient,
  input: {
    name: string
    position: string
    category: TeamCategory
    image_url?: string | null
    linkedin_url?: string | null
    email?: string | null
    order_index?: number | null
  }
): Promise<ChapterTeamMember> {
  const { data, error } = await supabase
    .from('teams')
    .insert({
      name: input.name,
      slug: slugifyMemberName(input.name),
      description: toPayload(input),
      order_index: input.order_index ?? null,
    })
    .select('id, name, description, order_index')
    .single()

  if (error) throw error
  const member = toMember(data)
  if (!member) throw new Error('Failed to parse created team member')
  return member
}

export async function updateChapterMember(
  supabase: SupabaseClient,
  id: string,
  input: {
    name?: string
    position?: string
    category?: TeamCategory
    image_url?: string | null
    linkedin_url?: string | null
    email?: string | null
    order_index?: number | null
  }
): Promise<ChapterTeamMember> {
  const { data: existing, error: existingError } = await supabase
    .from('teams')
    .select('id, name, slug, description, order_index')
    .eq('id', id)
    .single()

  if (existingError) throw existingError
  const current = toMember(existing)
  if (!current) throw new Error('Not a chapter team member')

  const next = {
    name: input.name ?? current.name,
    position: input.position ?? current.position,
    category: input.category ?? current.category,
    image_url: input.image_url === undefined ? current.image_url : input.image_url,
    linkedin_url: input.linkedin_url === undefined ? current.linkedin_url : input.linkedin_url,
    email: input.email === undefined ? current.email : input.email,
    order_index: input.order_index === undefined ? current.order_index : input.order_index,
  }

  const { data, error } = await supabase
    .from('teams')
    .update({
      name: next.name,
      slug: slugifyMemberName(next.name),
      description: toPayload(next),
      order_index: next.order_index,
    })
    .eq('id', id)
    .select('id, name, description, order_index')
    .single()

  if (error) throw error
  const member = toMember(data)
  if (!member) throw new Error('Failed to parse updated team member')
  return member
}

export async function deleteChapterMember(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from('teams').delete().eq('id', id)
  if (error) throw error
}

/** Apply a custom photo to any past_presidents row with this name. */
export async function applyPhotoOverrideToPastPresidents(
  supabase: SupabaseClient,
  name: string,
  photoUrl: string | null | undefined
): Promise<void> {
  if (!name || !photoUrl) return

  const { error } = await supabase
    .from('past_presidents')
    .update({ photo_url: photoUrl })
    .ilike('name', name)

  if (error) {
    console.error(`Failed to apply photo override to former president ${name}:`, error)
  }
}
