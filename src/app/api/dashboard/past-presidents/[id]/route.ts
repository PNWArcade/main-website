import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireDashboardUser()
    if (auth.error) return auth.error

    const { id } = await params
    const { error } = await auth.supabase.from('past_presidents').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ error: 'Failed to remove former president' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting former president:', error)
    return NextResponse.json({ error: 'Failed to remove former president' }, { status: 500 })
  }
}
