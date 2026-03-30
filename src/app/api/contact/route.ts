import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { contactFormSchema } from '@/lib/schemas/inquiry'

async function verifyCaptcha(token: string): Promise<boolean> {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`
    })
    const data = await response.json()
    return data.success === true
}

// POST - Submit a new contact form (public, no auth required)
export async function POST(request: NextRequest) {
    try {
        // Parse and validate request body
        const body = await request.json()
        const { captchaToken, ...formData } = body

        // Verify captcha first
        if (!captchaToken || !(await verifyCaptcha(captchaToken))) {
            return NextResponse.json(
                { error: 'Captcha verification failed' },
                { status: 400 }
            )
        }

        const validationResult = contactFormSchema.safeParse(formData)

        if (!validationResult.success) {
            return NextResponse.json(
                { 
                    error: 'Validation failed',
                    details: validationResult.error.flatten()
                },
                { status: 400 }
            )
        }

        const { name, email, message } = validationResult.data

        const supabase = await createClient()

        // Insert into database
        const { data, error } = await supabase
            .from('contact_submissions')
            .insert({
                name,
                email,
                message,
                status: 'new'
            })
            .select()
            .single()

        if (error) {
            console.error('Error inserting contact submission:', error)
            return NextResponse.json(
                { error: 'Failed to submit contact form' },
                { status: 500 }
            )
        }

        return NextResponse.json(
            { 
                success: true,
                message: 'Thank you for your message. We will get back to you soon.'
            },
            { status: 201 }
        )
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
