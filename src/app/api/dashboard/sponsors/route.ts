import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSponsorSchema } from '@/lib/schemas/project'

// GET - List all sponsors
export async function GET() {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('sponsors')
            .select('*')
            .order('tier', { ascending: true })
            .order('order_index', { ascending: true, nullsFirst: false })
            .order('name', { ascending: true })

        if (error) {
            console.error('Error fetching sponsors:', error)
            return NextResponse.json({ error: 'Failed to fetch sponsors' }, { status: 500 })
        }

        // Transform 'Link' column to 'link' for frontend consistency
        const transformedData = data?.map(sponsor => ({
            ...sponsor,
            link: sponsor.Link ?? null,
            Link: undefined,
        }))

        return NextResponse.json({ data: transformedData })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST - Create a new sponsor
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const validationResult = createSponsorSchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validationResult.error.flatten() },
                { status: 400 }
            )
        }

        const sponsorData: Record<string, unknown> = {
            name: validationResult.data.name,
            tier: validationResult.data.tier,
            logo_url: validationResult.data.logo_url || null,
            description: validationResult.data.description || null,
            order_index: validationResult.data.order_index ?? null,
        }
        
        // Map 'link' to database column 'Link'
        if ('link' in validationResult.data) {
            sponsorData.Link = validationResult.data.link || null
        }

        const { data, error } = await supabase
            .from('sponsors')
            .insert(sponsorData)
            .select('*')
            .single()

        if (error) {
            console.error('Error creating sponsor:', error)
            return NextResponse.json({ error: 'Failed to create sponsor' }, { status: 500 })
        }

        // Transform 'Link' column to 'link' for frontend consistency
        const transformedData = {
            ...data,
            link: data.Link ?? null,
            Link: undefined,
        }

        return NextResponse.json({ data: transformedData }, { status: 201 })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
