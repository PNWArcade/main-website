import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSubProjectSchema } from '@/lib/schemas/project'
import { z } from 'zod'

const uuidSchema = z.string().uuid()

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET - List all sub-projects for a project
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: projectId } = await params

        const idResult = uuidSchema.safeParse(projectId)
        if (!idResult.success) {
            return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })
        }

        const supabase = await createClient()

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')

        let query = supabase
            .from('sub_projects')
            .select('*')
            .eq('project_id', projectId)
            .order('order_index', { ascending: true, nullsFirst: false })
            .order('created_at', { ascending: false })

        if (status && status !== 'all') {
            query = query.eq('status', status)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching sub-projects:', error)
            return NextResponse.json({ error: 'Failed to fetch sub-projects' }, { status: 500 })
        }

        return NextResponse.json({ data })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST - Create a new sub-project
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
        const validationResult = createSubProjectSchema.safeParse({
            ...body,
            project_id: projectId,
        })

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validationResult.error.flatten() },
                { status: 400 }
            )
        }

        const subProjectData = {
            ...validationResult.data,
            image_url: validationResult.data.image_url || null,
            author_name: validationResult.data.author_name || null,
        }

        const { data, error } = await supabase
            .from('sub_projects')
            .insert(subProjectData)
            .select()
            .single()

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json({ error: 'A sub-project with this slug already exists in this project' }, { status: 409 })
            }
            console.error('Error creating sub-project:', error)
            return NextResponse.json({ error: 'Failed to create sub-project' }, { status: 500 })
        }

        return NextResponse.json({ data }, { status: 201 })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
