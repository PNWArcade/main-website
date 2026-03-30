import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - List all published projects (public)
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        
        const { searchParams } = new URL(request.url)
        const featured = searchParams.get('featured')

        let query = supabase
            .from('projects')
            .select(`
                *,
                category:project_categories(*)
            `)
            .eq('status', 'published')
            .order('order_index', { ascending: true, nullsFirst: false })
            .order('created_at', { ascending: false })

        if (featured === 'true') {
            query = query.eq('featured', true)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching projects:', error)
            return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
        }

        return NextResponse.json({ data })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
