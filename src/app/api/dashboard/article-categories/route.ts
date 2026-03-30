import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createArticleCategorySchema } from '@/lib/schemas/project'

// GET - List all article categories
export async function GET() {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('article_categories')
            .select('*')
            .order('name', { ascending: true })

        if (error) {
            console.error('Error fetching article categories:', error)
            return NextResponse.json({ error: 'Failed to fetch article categories' }, { status: 500 })
        }

        return NextResponse.json({ data })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST - Create a new article category
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const validationResult = createArticleCategorySchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validationResult.error.flatten() },
                { status: 400 }
            )
        }

        const { data, error } = await supabase
            .from('article_categories')
            .insert(validationResult.data)
            .select()
            .single()

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json({ error: 'A category with this name or slug already exists' }, { status: 409 })
            }
            console.error('Error creating article category:', error)
            return NextResponse.json({ error: 'Failed to create article category' }, { status: 500 })
        }

        return NextResponse.json({ data }, { status: 201 })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
