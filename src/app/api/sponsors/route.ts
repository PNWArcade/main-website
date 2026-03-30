import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - List all sponsors (public, for main page)
export async function GET() {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('sponsors')
            .select('*')
            .order('order_index', { ascending: true, nullsFirst: false })
            .order('name', { ascending: true })

        if (error) {
            console.error('Error fetching sponsors:', error)
            return NextResponse.json({ error: 'Failed to fetch sponsors' }, { status: 500 })
        }

        // Group by tier
        const grouped = {
            platinum: data?.filter(s => s.tier === 'platinum') || [],
            gold: data?.filter(s => s.tier === 'gold') || [],
            silver: data?.filter(s => s.tier === 'silver') || [],
            bronze: data?.filter(s => s.tier === 'bronze') || [],
        }

        return NextResponse.json({ data: grouped })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
