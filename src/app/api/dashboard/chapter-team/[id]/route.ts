import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateChapterTeamMemberSchema } from '@/lib/schemas/team'
import { deleteChapterMember, updateChapterMember } from '@/lib/chapter-team'

function emptyToNull(value?: string | null) {
  if (value === undefined) return undefined
  if (!value) return null
  return value
}

async function requireDashboardUser() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return { error: NextResponse.json({ error: 'Access denied' }, { status: 403 }) }
  }

  return { supabase }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireDashboardUser()
    if (auth.error) return auth.error

    const { id } = await params
    const body = await request.json()
    const validation = updateChapterTeamMemberSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const data = await updateChapterMember(auth.supabase, id, {
      ...validation.data,
      image_url: emptyToNull(validation.data.image_url),
      linkedin_url: emptyToNull(validation.data.linkedin_url),
      email: emptyToNull(validation.data.email),
    })

    return NextResponse.json({ data })
  } catch (error) {
    const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : ''
    if (code === '23505') {
      return NextResponse.json({ error: 'A team member with this name already exists' }, { status: 409 })
    }
    console.error('Error updating chapter team member:', error)
    return NextResponse.json({ error: 'Failed to update team member' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireDashboardUser()
    if (auth.error) return auth.error

    const { id } = await params
    await deleteChapterMember(auth.supabase, id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting chapter team member:', error)
    return NextResponse.json({ error: 'Failed to remove team member' }, { status: 500 })
  }
}
