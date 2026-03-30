import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
    uuidSchema,
    updateStatusRequestSchema,
    contactSubmissionSchema,
} from '@/lib/schemas/inquiry'

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET single inquiry by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        
        // Validate UUID
        const idResult = uuidSchema.safeParse(id)
        if (!idResult.success) {
            return NextResponse.json(
                { error: 'Invalid inquiry ID format' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { data, error } = await supabase
            .from('contact_submissions')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json(
                    { error: 'Inquiry not found' },
                    { status: 404 }
                )
            }
            console.error('Error fetching inquiry:', error)
            return NextResponse.json(
                { error: 'Failed to fetch inquiry' },
                { status: 500 }
            )
        }

        // Validate response data
        const validatedData = contactSubmissionSchema.safeParse(data)
        if (!validatedData.success) {
            console.error('Data validation error:', validatedData.error)
            return NextResponse.json(
                { error: 'Data validation failed' },
                { status: 500 }
            )
        }

        return NextResponse.json({ data: validatedData.data })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// PATCH - Update inquiry status
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        
        // Validate UUID
        const idResult = uuidSchema.safeParse(id)
        if (!idResult.success) {
            return NextResponse.json(
                { error: 'Invalid inquiry ID format' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Validate request body
        const body = await request.json()
        const bodyResult = updateStatusRequestSchema.safeParse(body)
        
        if (!bodyResult.success) {
            return NextResponse.json(
                { 
                    error: 'Invalid request body',
                    details: bodyResult.error.flatten()
                },
                { status: 400 }
            )
        }

        const { status } = bodyResult.data

        const { data, error } = await supabase
            .from('contact_submissions')
            .update({ status })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json(
                    { error: 'Inquiry not found' },
                    { status: 404 }
                )
            }
            console.error('Error updating inquiry:', error)
            return NextResponse.json(
                { error: 'Failed to update inquiry' },
                { status: 500 }
            )
        }

        // Validate response data
        const validatedData = contactSubmissionSchema.safeParse(data)
        if (!validatedData.success) {
            console.error('Data validation error:', validatedData.error)
            return NextResponse.json(
                { error: 'Data validation failed' },
                { status: 500 }
            )
        }

        return NextResponse.json({ data: validatedData.data })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// DELETE - Remove inquiry
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        
        // Validate UUID
        const idResult = uuidSchema.safeParse(id)
        if (!idResult.success) {
            return NextResponse.json(
                { error: 'Invalid inquiry ID format' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { data, error } = await supabase
            .from('contact_submissions')
            .delete()
            .eq('id', id)
            .select()

        if (error) {
            console.error('Error deleting inquiry:', error)
            return NextResponse.json(
                { error: 'Failed to delete inquiry' },
                { status: 500 }
            )
        }

        // Check if any row was deleted (RLS might block the delete for non-admins)
        if (!data || data.length === 0) {
            return NextResponse.json(
                { error: 'Not authorized to delete this inquiry. Only admins can delete.' },
                { status: 403 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
