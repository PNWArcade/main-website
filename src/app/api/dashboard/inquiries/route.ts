import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
    inquiryQueryParamsSchema,
    contactSubmissionSchema,
    type ContactSubmission
} from '@/lib/schemas/inquiry'
import { z } from 'zod'

// GET all inquiries (with optional status filter)
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Parse and validate query parameters
        const { searchParams } = new URL(request.url)
        const queryResult = inquiryQueryParamsSchema.safeParse({
            status: searchParams.get('status') || undefined,
            limit: searchParams.get('limit') || undefined,
            offset: searchParams.get('offset') || undefined,
        })

        if (!queryResult.success) {
            return NextResponse.json(
                { error: 'Invalid query parameters', details: queryResult.error.flatten() },
                { status: 400 }
            )
        }

        const { status, limit, offset } = queryResult.data

        // Build query
        let query = supabase
            .from('contact_submissions')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

        // Apply status filter if provided
        if (status) {
            query = query.eq('status', status)
        }

        const { data, error, count } = await query

        if (error) {
            console.error('Error fetching inquiries:', error)
            return NextResponse.json(
                { error: 'Failed to fetch inquiries' },
                { status: 500 }
            )
        }

        // Validate response data
        const validatedData = z.array(contactSubmissionSchema).safeParse(data)
        if (!validatedData.success) {
            console.error('Data validation error:', validatedData.error)
            return NextResponse.json(
                { error: 'Data validation failed' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            data: validatedData.data as ContactSubmission[],
            count,
            limit,
            offset
        })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
