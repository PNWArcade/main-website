import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Validate an invite token (public)
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { searchParams } = new URL(request.url)
        const token = searchParams.get('token')

        if (!token) {
            return NextResponse.json(
                { error: 'Token is required' },
                { status: 400 }
            )
        }

        // Find the invite
        const { data: invite, error } = await supabase
            .from('invites')
            .select('*')
            .eq('token', token)
            .single()

        if (error || !invite) {
            return NextResponse.json(
                { error: 'Invalid or expired invite' },
                { status: 404 }
            )
        }

        // Check if expired
        if (new Date(invite.expires_at) < new Date()) {
            // Update status to expired
            await supabase
                .from('invites')
                .update({ status: 'expired' })
                .eq('id', invite.id)

            return NextResponse.json(
                { error: 'This invite has expired' },
                { status: 400 }
            )
        }

        // Check if already accepted
        if (invite.status === 'accepted') {
            return NextResponse.json(
                { error: 'This invite has already been used' },
                { status: 400 }
            )
        }

        return NextResponse.json({
            data: {
                email: invite.email,
                role: invite.role,
            }
        })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// POST - Accept an invite and create account
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const body = await request.json()
        const { token, password, full_name } = body

        if (!token || !password) {
            return NextResponse.json(
                { error: 'Token and password are required' },
                { status: 400 }
            )
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters' },
                { status: 400 }
            )
        }

        // Find the invite
        const { data: invite, error: inviteError } = await supabase
            .from('invites')
            .select('*')
            .eq('token', token)
            .single()

        if (inviteError || !invite) {
            return NextResponse.json(
                { error: 'Invalid or expired invite' },
                { status: 404 }
            )
        }

        // Check if expired
        if (new Date(invite.expires_at) < new Date()) {
            await supabase
                .from('invites')
                .update({ status: 'expired' })
                .eq('id', invite.id)

            return NextResponse.json(
                { error: 'This invite has expired' },
                { status: 400 }
            )
        }

        // Check if already accepted
        if (invite.status !== 'pending') {
            return NextResponse.json(
                { error: 'This invite has already been used' },
                { status: 400 }
            )
        }

        // Create the user account
        const { data: authData, error: signupError } = await supabase.auth.signUp({
            email: invite.email,
            password,
            options: {
                data: {
                    full_name: full_name || null,
                },
            },
        })

        if (signupError) {
            console.error('Signup error:', signupError)
            return NextResponse.json(
                { error: signupError.message },
                { status: 400 }
            )
        }

        if (!authData.user) {
            return NextResponse.json(
                { error: 'Failed to create account' },
                { status: 500 }
            )
        }

        // Update the profile with the role from the invite
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ 
                role: invite.role,
                full_name: full_name || null,
            })
            .eq('id', authData.user.id)

        if (profileError) {
            console.error('Profile update error:', profileError)
            // Continue anyway - the user is created
        }

        // Mark invite as accepted
        await supabase
            .from('invites')
            .update({ status: 'accepted' })
            .eq('id', invite.id)

        return NextResponse.json({
            success: true,
            message: 'Account created successfully',
        })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
