import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateProjectSchema } from '@/lib/schemas/project'
import { z } from 'zod'

const uuidSchema = z.string().uuid()

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET - Get single project with all relations
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params

        const idResult = uuidSchema.safeParse(id)
        if (!idResult.success) {
            return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })
        }

        const supabase = await createClient()

        const { data, error } = await supabase
            .from('projects')
            .select(`
                *,
                category:project_categories(*),
                components:project_components(*)
            `)
            .eq('id', id)
            .order('order_index', { foreignTable: 'project_components', ascending: true })
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Project not found' }, { status: 404 })
            }
            console.error('Error fetching project:', error)
            return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 })
        }

        return NextResponse.json({ data })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PATCH - Update project
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params

        const idResult = uuidSchema.safeParse(id)
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
        const validationResult = updateProjectSchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validationResult.error.flatten() },
                { status: 400 }
            )
        }

        const updateData = {
            ...validationResult.data,
            hero_image_url: validationResult.data.hero_image_url || null,
            category_id: validationResult.data.category_id || null,
        }

        const { data, error } = await supabase
            .from('projects')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Project not found' }, { status: 404 })
            }
            if (error.code === '23505') {
                return NextResponse.json({ error: 'A project with this slug already exists' }, { status: 409 })
            }
            console.error('Error updating project:', error)
            return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
        }

        return NextResponse.json({ data })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE - Delete project
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params

        const idResult = uuidSchema.safeParse(id)
        if (!idResult.success) {
            return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })
        }

        const supabase = await createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data, error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id)
            .select()

        if (error) {
            console.error('Error deleting project:', error)
            return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
        }

        if (!data || data.length === 0) {
            return NextResponse.json({ error: 'Project not found or not authorized' }, { status: 404 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
