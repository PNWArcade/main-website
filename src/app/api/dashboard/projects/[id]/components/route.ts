import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createProjectComponentSchema, updateProjectComponentSchema } from '@/lib/schemas/project'
import { z } from 'zod'

const uuidSchema = z.string().uuid()

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET - List all components for a project
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: projectId } = await params

        const idResult = uuidSchema.safeParse(projectId)
        if (!idResult.success) {
            return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })
        }

        const supabase = await createClient()

        const { data, error } = await supabase
            .from('project_components')
            .select('*')
            .eq('project_id', projectId)
            .order('order_index', { ascending: true })

        if (error) {
            console.error('Error fetching components:', error)
            return NextResponse.json({ error: 'Failed to fetch components' }, { status: 500 })
        }

        return NextResponse.json({ data })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST - Create a new component
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
        const validationResult = createProjectComponentSchema.safeParse({
            ...body,
            project_id: projectId,
        })

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validationResult.error.flatten() },
                { status: 400 }
            )
        }

        // Get max order_index
        const { data: maxOrder } = await supabase
            .from('project_components')
            .select('order_index')
            .eq('project_id', projectId)
            .order('order_index', { ascending: false })
            .limit(1)
            .single()

        const componentData = {
            ...validationResult.data,
            order_index: body.order_index ?? (maxOrder?.order_index ?? -1) + 1,
            image_url: validationResult.data.image_url || null,
        }

        const { data, error } = await supabase
            .from('project_components')
            .insert(componentData)
            .select()
            .single()

        if (error) {
            console.error('Error creating component:', error)
            return NextResponse.json({ error: 'Failed to create component' }, { status: 500 })
        }

        return NextResponse.json({ data }, { status: 201 })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PUT - Bulk update component order
export async function PUT(request: NextRequest, { params }: RouteParams) {
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
        const orderSchema = z.array(z.object({
            id: z.string().uuid(),
            order_index: z.number()
        }))

        const orderResult = orderSchema.safeParse(body)
        if (!orderResult.success) {
            return NextResponse.json(
                { error: 'Invalid order data', details: orderResult.error.flatten() },
                { status: 400 }
            )
        }

        // Update each component's order
        const updates = orderResult.data.map(item =>
            supabase
                .from('project_components')
                .update({ order_index: item.order_index })
                .eq('id', item.id)
                .eq('project_id', projectId)
        )

        await Promise.all(updates)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
