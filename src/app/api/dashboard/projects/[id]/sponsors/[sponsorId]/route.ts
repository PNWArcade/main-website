import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateProjectSponsorSchema } from '@/lib/schemas/project'
import { z } from 'zod'

const uuidSchema = z.string().uuid()

interface RouteParams {
    params: Promise<{ id: string; sponsorId: string }>
}

// PATCH - Update a sponsor
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: projectId, sponsorId } = await params

        const projectIdResult = uuidSchema.safeParse(projectId)
        const sponsorIdResult = uuidSchema.safeParse(sponsorId)
        if (!projectIdResult.success || !sponsorIdResult.success) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
        }

        const supabase = await createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const validationResult = updateProjectSponsorSchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validationResult.error.flatten() },
                { status: 400 }
            )
        }

        const updateData = {
            ...validationResult.data,
            logo_url: validationResult.data.logo_url || null,
            website_url: validationResult.data.website_url || null,
        }

        const { data, error } = await supabase
            .from('project_sponsors')
            .update(updateData)
            .eq('id', sponsorId)
            .eq('project_id', projectId)
            .select('*')
            .single()

        if (error) {
            console.error('Error updating sponsor:', error)
            return NextResponse.json({ error: 'Failed to update sponsor' }, { status: 500 })
        }

        return NextResponse.json({ data })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE - Delete a sponsor
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: projectId, sponsorId } = await params

        const projectIdResult = uuidSchema.safeParse(projectId)
        const sponsorIdResult = uuidSchema.safeParse(sponsorId)
        if (!projectIdResult.success || !sponsorIdResult.success) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
        }

        const supabase = await createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { error } = await supabase
            .from('project_sponsors')
            .delete()
            .eq('id', sponsorId)
            .eq('project_id', projectId)

        if (error) {
            console.error('Error deleting sponsor:', error)
            return NextResponse.json({ error: 'Failed to delete sponsor' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
