import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createArticleSchema } from '@/lib/schemas/project'

// GET - List all articles for a project
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: projectId } = await params
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching articles:', error)
            return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 })
        }

        return NextResponse.json({ data })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST - Create a new article
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: projectId } = await params
        const supabase = await createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const validatedData = createArticleSchema.omit({ project_id: true }).parse(body)

        // Transform empty strings to null for optional fields
        const insertData = {
            ...validatedData,
            project_id: projectId,
            category_id: validatedData.category_id || null,
            image_url: validatedData.image_url || null,
            author_name: validatedData.author_name || null,
        }

        const { data, error } = await supabase
            .from('articles')
            .insert(insertData)
            .select()
            .single()

        if (error) {
            console.error('Error creating article:', error)
            return NextResponse.json({ error: 'Failed to create article' }, { status: 500 })
        }

        return NextResponse.json({ data }, { status: 201 })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
