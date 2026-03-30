import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateProjectTeamMemberSchema } from '@/lib/schemas/project'
import { z } from 'zod'

const uuidSchema = z.string().uuid()

interface RouteParams {
    params: Promise<{ id: string; memberId: string }>
}

// PATCH - Update a team member
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: projectId, memberId } = await params

        if (!uuidSchema.safeParse(projectId).success || !uuidSchema.safeParse(memberId).success) {
            return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
        }

        const supabase = await createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const validationResult = updateProjectTeamMemberSchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validationResult.error.flatten() },
                { status: 400 }
            )
        }

        const updateData = {
            ...validationResult.data,
            image_url: validationResult.data.image_url || null,
            team_id: validationResult.data.team_id || null,
        }

        const { data, error } = await supabase
            .from('project_team')
            .update(updateData)
            .eq('id', memberId)
            .eq('project_id', projectId)
            .select(`
                *,
                team:teams(*)
            `)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
            }
            console.error('Error updating team member:', error)
            return NextResponse.json({ error: 'Failed to update team member' }, { status: 500 })
        }

        return NextResponse.json({ data })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE - Delete a team member
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: projectId, memberId } = await params

        if (!uuidSchema.safeParse(projectId).success || !uuidSchema.safeParse(memberId).success) {
            return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
        }

        const supabase = await createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data, error } = await supabase
            .from('project_team')
            .delete()
            .eq('id', memberId)
            .eq('project_id', projectId)
            .select()

        if (error) {
            console.error('Error deleting team member:', error)
            return NextResponse.json({ error: 'Failed to delete team member' }, { status: 500 })
        }

        if (!data || data.length === 0) {
            return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
