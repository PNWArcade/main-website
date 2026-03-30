import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateSponsorSchema } from '@/lib/schemas/project'
import { z } from 'zod'

const uuidSchema = z.string().uuid()

interface RouteParams {
    params: Promise<{ id: string }>
}

// PATCH - Update a sponsor
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params

        const idResult = uuidSchema.safeParse(id)
        if (!idResult.success) {
            return NextResponse.json({ error: 'Invalid sponsor ID' }, { status: 400 })
        }

        const supabase = await createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const validationResult = updateSponsorSchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validationResult.error.flatten() },
                { status: 400 }
            )
        }

        const updateData: Record<string, unknown> = {
            name: validationResult.data.name,
            tier: validationResult.data.tier,
            description: validationResult.data.description,
            order_index: validationResult.data.order_index,
        }
        
        // Only set fields if they were explicitly provided
        if ('logo_url' in validationResult.data) {
            updateData.logo_url = validationResult.data.logo_url || null
        }
        // Map 'link' to database column 'Link'
        if ('link' in validationResult.data) {
            updateData.Link = validationResult.data.link || null
        }

        const { data, error } = await supabase
            .from('sponsors')
            .update(updateData)
            .eq('id', id)
            .select('*')
            .single()

        if (error) {
            console.error('Error updating sponsor:', error)
            return NextResponse.json({ error: 'Failed to update sponsor' }, { status: 500 })
        }

        // Transform 'Link' column to 'link' for frontend consistency
        const transformedData = {
            ...data,
            link: data.Link ?? null,
            Link: undefined,
        }

        return NextResponse.json({ data: transformedData })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE - Delete a sponsor
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params

        const idResult = uuidSchema.safeParse(id)
        if (!idResult.success) {
            return NextResponse.json({ error: 'Invalid sponsor ID' }, { status: 400 })
        }

        const supabase = await createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { error } = await supabase
            .from('sponsors')
            .delete()
            .eq('id', id)

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
