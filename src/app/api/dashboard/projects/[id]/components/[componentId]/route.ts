import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateProjectComponentSchema } from '@/lib/schemas/project'
import { z } from 'zod'

const uuidSchema = z.string().uuid()

interface RouteParams {
    params: Promise<{ id: string; componentId: string }>
}

// PATCH - Update a component
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: projectId, componentId } = await params

        if (!uuidSchema.safeParse(projectId).success || !uuidSchema.safeParse(componentId).success) {
            return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
        }

        const supabase = await createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const validationResult = updateProjectComponentSchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validationResult.error.flatten() },
                { status: 400 }
            )
        }

        const updateData = {
            ...validationResult.data,
            image_url: validationResult.data.image_url || null,
        }

        const { data, error } = await supabase
            .from('project_components')
            .update(updateData)
            .eq('id', componentId)
            .eq('project_id', projectId)
            .select()
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Component not found' }, { status: 404 })
            }
            console.error('Error updating component:', error)
            return NextResponse.json({ error: 'Failed to update component' }, { status: 500 })
        }

        return NextResponse.json({ data })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE - Delete a component
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: projectId, componentId } = await params

        if (!uuidSchema.safeParse(projectId).success || !uuidSchema.safeParse(componentId).success) {
            return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
        }

        const supabase = await createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data, error } = await supabase
            .from('project_components')
            .delete()
            .eq('id', componentId)
            .eq('project_id', projectId)
            .select()

        if (error) {
            console.error('Error deleting component:', error)
            return NextResponse.json({ error: 'Failed to delete component' }, { status: 500 })
        }

        if (!data || data.length === 0) {
            return NextResponse.json({ error: 'Component not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
