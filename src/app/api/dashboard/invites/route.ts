import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createInviteSchema = z.object({
    email: z.string().email(),
    role: z.enum(['admin', 'officer']),
})

// GET all invites
export async function GET() {
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

        // Check if user is admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'admin') {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            )
        }

        // Fetch all invites
        const { data, error } = await supabase
            .from('invites')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            // Table might not exist yet
            if (error.code === '42P01') {
                return NextResponse.json({ data: [] })
            }
            console.error('Error fetching invites:', error)
            return NextResponse.json(
                { error: 'Failed to fetch invites' },
                { status: 500 }
            )
        }

        // Add invite URLs
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000' || 'https://asmepnw.com'
        const invitesWithUrls = data.map(invite => ({
            ...invite,
            invite_url: `${baseUrl}/invites?token=${invite.token}`,
        }))

        return NextResponse.json({ data: invitesWithUrls })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// POST - Create a new invite
export async function POST(request: NextRequest) {
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

        // Check if user is admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'admin') {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            )
        }

        // Parse and validate request body
        const body = await request.json()
        const validation = createInviteSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid data', details: validation.error.flatten() },
                { status: 400 }
            )
        }

        const { email, role } = validation.data

        // Check if email already has an account
        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single()

        if (existingProfile) {
            return NextResponse.json(
                { error: 'This email already has an account' },
                { status: 400 }
            )
        }

        // Check if there's already a pending invite for this email
        const { data: existingInvite } = await supabase
            .from('invites')
            .select('id')
            .eq('email', email)
            .eq('status', 'pending')
            .single()

        if (existingInvite) {
            return NextResponse.json(
                { error: 'An invite is already pending for this email' },
                { status: 400 }
            )
        }

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000' || 'https://asmepnw.com'

        // Generate a token for the invite link
        const token = crypto.randomUUID()
        
        // Set expiry to 7 days from now
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7)

        // Create the invite record
        const { data: invite, error } = await supabase
            .from('invites')
            .insert({
                email,
                role,
                token,
                status: 'pending',
                invited_by: user.id,
                expires_at: expiresAt.toISOString(),
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating invite record:', error)
            return NextResponse.json(
                { error: 'Failed to create invite' },
                { status: 500 }
            )
        }

        // Include invite URL in response
        const inviteWithUrl = {
            ...invite,
            invite_url: `${baseUrl}/invites?token=${token}`,
        }

        return NextResponse.json({ 
            data: inviteWithUrl,
            message: 'Invite created successfully'
        }, { status: 201 })
    } catch (error) {
        console.error('Unexpected error in POST /api/dashboard/invites:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        )
    }
}
