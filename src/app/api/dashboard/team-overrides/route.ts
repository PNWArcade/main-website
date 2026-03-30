import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createOverrideSchema = z.object({
    member_name: z.string().min(1, 'Member name is required'),
    custom_image_url: z.string().url().nullable().optional(),
    linkedin_url: z.string().url().nullable().optional(),
    email: z.string().email().nullable().optional(),
})

// GET all team member overrides
export async function GET() {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!profile) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }

        const { data, error } = await supabase
            .from('team_member_overrides')
            .select('*')
            .order('member_name', { ascending: true })

        if (error) {
            console.error('Error fetching team overrides:', error)
            return NextResponse.json({ error: 'Failed to fetch overrides' }, { status: 500 })
        }

        return NextResponse.json({ data })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST create a new team member override
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!profile) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }

        const body = await request.json()
        const validation = createOverrideSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid data', details: validation.error.flatten() },
                { status: 400 }
            )
        }

        const { data, error } = await supabase
            .from('team_member_overrides')
            .upsert(
                {
                    member_name: validation.data.member_name,
                    custom_image_url: validation.data.custom_image_url ?? null,
                    linkedin_url: validation.data.linkedin_url ?? null,
                    email: validation.data.email ?? null,
                },
                { onConflict: 'member_name' }
            )
            .select()
            .single()

        if (error) {
            console.error('Error creating/updating override:', error)
            return NextResponse.json({ error: 'Failed to save override' }, { status: 500 })
        }

        return NextResponse.json({ data }, { status: 201 })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
