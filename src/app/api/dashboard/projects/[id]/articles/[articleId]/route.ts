import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateArticleSchema } from '@/lib/schemas/project'

// GET - Get a single article
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; articleId: string }> }
) {
    try {
        const { id: projectId, articleId } = await params
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .eq('id', articleId)
            .eq('project_id', projectId)
            .single()

        if (error) {
            console.error('Error fetching article:', error)
            return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 })
        }

        return NextResponse.json({ data })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PATCH - Update an article
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; articleId: string }> }
) {
    try {
        const { id: projectId, articleId } = await params
        const supabase = await createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const validatedData = updateArticleSchema.parse(body)

        // Transform empty strings to null for optional fields
        const updateData = {
            ...validatedData,
            category_id: validatedData.category_id === '' ? null : validatedData.category_id,
            image_url: validatedData.image_url === '' ? null : validatedData.image_url,
            author_name: validatedData.author_name === '' ? null : validatedData.author_name,
        }

        const { data, error } = await supabase
            .from('articles')
            .update(updateData)
            .eq('id', articleId)
            .eq('project_id', projectId)
            .select()
            .single()

        if (error) {
            console.error('Error updating article:', error)
            return NextResponse.json({ error: 'Failed to update article' }, { status: 500 })
        }

        return NextResponse.json({ data })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE - Delete an article
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; articleId: string }> }
) {
    try {
        const { id: projectId, articleId } = await params
        const supabase = await createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { error } = await supabase
            .from('articles')
            .delete()
            .eq('id', articleId)
            .eq('project_id', projectId)

        if (error) {
            console.error('Error deleting article:', error)
            return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
