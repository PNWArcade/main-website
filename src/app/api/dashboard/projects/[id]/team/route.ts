import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createProjectTeamMemberSchema, updateProjectTeamMemberSchema } from '@/lib/schemas/project'
import { z } from 'zod'

const uuidSchema = z.string().uuid()

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET - List all team members for a project
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: projectId } = await params

        const idResult = uuidSchema.safeParse(projectId)
        if (!idResult.success) {
            return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })
        }

        const supabase = await createClient()

        const { data, error } = await supabase
            .from('project_team')
            .select(`
                *,
                team:teams(*)
            `)
            .eq('project_id', projectId)
            .order('order_index', { ascending: true, nullsFirst: false })
            .order('name', { ascending: true })

        if (error) {
            console.error('Error fetching team members:', error)
            return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 })
        }

        return NextResponse.json({ data })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST - Create a new team member
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: projectId } = await params

        const idResult = uuidSchema.safeParse(projectId)
        if (!idResult.success) {
            return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })
        }

        const supabase = await createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const validationResult = createProjectTeamMemberSchema.safeParse({
            ...body,
            project_id: projectId,
        })

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validationResult.error.flatten() },
                { status: 400 }
            )
        }

        const memberData = {
            ...validationResult.data,
            image_url: validationResult.data.image_url || null,
            team_id: validationResult.data.team_id || null,
        }

        const { data, error } = await supabase
            .from('project_team')
            .insert(memberData)
            .select(`
                *,
                team:teams(*)
            `)
            .single()

        if (error) {
            console.error('Error creating team member:', error)
            return NextResponse.json({ error: 'Failed to create team member' }, { status: 500 })
        }

        return NextResponse.json({ data }, { status: 201 })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
