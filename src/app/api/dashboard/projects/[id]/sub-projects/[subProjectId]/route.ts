import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateSubProjectSchema } from '@/lib/schemas/project'
import { z } from 'zod'

const uuidSchema = z.string().uuid()

interface RouteParams {
    params: Promise<{ id: string; subProjectId: string }>
}

// GET - Get single sub-project
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: projectId, subProjectId } = await params

        if (!uuidSchema.safeParse(projectId).success || !uuidSchema.safeParse(subProjectId).success) {
            return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
        }

        const supabase = await createClient()

        const { data, error } = await supabase
            .from('sub_projects')
            .select('*')
            .eq('id', subProjectId)
            .eq('project_id', projectId)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Sub-project not found' }, { status: 404 })
            }
            console.error('Error fetching sub-project:', error)
            return NextResponse.json({ error: 'Failed to fetch sub-project' }, { status: 500 })
        }

        return NextResponse.json({ data })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PATCH - Update a sub-project
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: projectId, subProjectId } = await params

        if (!uuidSchema.safeParse(projectId).success || !uuidSchema.safeParse(subProjectId).success) {
            return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
        }

        const supabase = await createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const validationResult = updateSubProjectSchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validationResult.error.flatten() },
                { status: 400 }
            )
        }

        const updateData: Record<string, unknown> = {
            ...validationResult.data,
        }

        if (validationResult.data.image_url !== undefined) {
            updateData.image_url = validationResult.data.image_url || null
        }

        if (validationResult.data.author_name !== undefined) {
            updateData.author_name = validationResult.data.author_name || null
        }

        // Set published_at when status changes to published
        if (validationResult.data.status === 'published') {
            updateData.published_at = new Date().toISOString()
        }

        const { data, error } = await supabase
            .from('sub_projects')
            .update(updateData)
            .eq('id', subProjectId)
            .eq('project_id', projectId)
            .select()
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Sub-project not found' }, { status: 404 })
            }
            if (error.code === '23505') {
                return NextResponse.json({ error: 'A sub-project with this slug already exists' }, { status: 409 })
            }
            console.error('Error updating sub-project:', error)
            return NextResponse.json({ error: 'Failed to update sub-project' }, { status: 500 })
        }

        return NextResponse.json({ data })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE - Delete a sub-project
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: projectId, subProjectId } = await params

        if (!uuidSchema.safeParse(projectId).success || !uuidSchema.safeParse(subProjectId).success) {
            return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
        }

        const supabase = await createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data, error } = await supabase
            .from('sub_projects')
            .delete()
            .eq('id', subProjectId)
            .eq('project_id', projectId)
            .select()

        if (error) {
            console.error('Error deleting sub-project:', error)
            return NextResponse.json({ error: 'Failed to delete sub-project' }, { status: 500 })
        }

        if (!data || data.length === 0) {
            return NextResponse.json({ error: 'Sub-project not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
