import { NextResponse } from 'next/server'
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

export async function GET() {
  try {
    const auth = await requireDashboardUser()
    if (auth.error) return auth.error

    const { data, error } = await auth.supabase
      .from('past_presidents')
      .select('id, name, photo_url, year, status, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch former presidents' }, { status: 500 })
    }

    return NextResponse.json({ data: data ?? [] })
  } catch (error) {
    console.error('Error fetching former presidents:', error)
    return NextResponse.json({ error: 'Failed to fetch former presidents' }, { status: 500 })
  }
}
