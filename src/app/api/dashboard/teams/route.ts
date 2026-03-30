import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createTeamSchema } from '@/lib/schemas/project'
import { z } from 'zod'

// GET - List all team categories
export async function GET() {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('teams')
            .select('*')
            .order('order_index', { ascending: true, nullsFirst: false })
            .order('name', { ascending: true })

        if (error) {
            console.error('Error fetching teams:', error)
            return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 })
        }

        return NextResponse.json({ data })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST - Create a new team category
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const validationResult = createTeamSchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validationResult.error.flatten() },
                { status: 400 }
            )
        }

        const { data, error } = await supabase
            .from('teams')
            .insert(validationResult.data)
            .select()
            .single()

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json({ error: 'A team with this name or slug already exists' }, { status: 409 })
            }
            console.error('Error creating team:', error)
            return NextResponse.json({ error: 'Failed to create team' }, { status: 500 })
        }

        return NextResponse.json({ data }, { status: 201 })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
