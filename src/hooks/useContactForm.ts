"use client"

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { contactFormSchema, type ContactForm } from '@/lib/schemas/inquiry'

type ExecuteRecaptcha = ((action?: string) => Promise<string>) | undefined

interface ContactFormResponse {
    success: boolean
    message: string
}

interface ContactFormError {
    error: string
    details?: {
        fieldErrors: Record<string, string[]>
    }
}

async function submitContactForm(data: ContactForm & { captchaToken: string }): Promise<ContactFormResponse> {
    const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })

    const result = await response.json()

    if (!response.ok) {
        const error = result as ContactFormError
        throw error
    }

    return result as ContactFormResponse
}

interface UseContactFormResult {
    form: ContactForm
    fieldErrors: Record<string, string[]>
    isSubmitting: boolean
    isSubmitted: boolean
    error: string | null
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
    handleSubmit: (e: React.FormEvent) => Promise<void>
    reset: () => void
}

const initialFormState: ContactForm = {
    name: '',
    email: '',
    message: ''
}

export function useContactForm(executeRecaptcha: ExecuteRecaptcha): UseContactFormResult {
    const [form, setForm] = useState<ContactForm>(initialFormState)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
    const [isSubmitted, setIsSubmitted] = useState(false)

    const mutation = useMutation({
        mutationFn: submitContactForm,
        onSuccess: () => {
            setIsSubmitted(true)
            setForm(initialFormState)
            setFieldErrors({})
        },
        onError: (error: ContactFormError) => {
            if (error.details?.fieldErrors) {
                setFieldErrors(error.details.fieldErrors)
            }
        }
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
        
        // Clear field error when user starts typing
        if (fieldErrors[name]) {
            setFieldErrors(prev => {
                const updated = { ...prev }
                delete updated[name]
                return updated
            })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFieldErrors({})

        // Client-side validation with Zod
        const validation = contactFormSchema.safeParse(form)
        if (!validation.success) {
            const errors = validation.error.flatten().fieldErrors
            setFieldErrors(errors as Record<string, string[]>)
            return
        }

        // Get captcha token (v3 is invisible, executed automatically)
        if (!executeRecaptcha) {
            setFieldErrors({ captcha: ['reCAPTCHA not ready. Please try again.'] })
            return
        }

        try {
            const captchaToken = await executeRecaptcha('contact_form')
            mutation.mutate({ ...validation.data, captchaToken })
        } catch {
            setFieldErrors({ captcha: ['Failed to verify reCAPTCHA. Please try again.'] })
        }
    }

    const reset = () => {
        setIsSubmitted(false)
        setForm(initialFormState)
        setFieldErrors({})
        mutation.reset()
    }

    return {
        form,
        fieldErrors,
        isSubmitting: mutation.isPending,
        isSubmitted,
        error: mutation.error?.error ?? null,
        handleChange,
        handleSubmit,
        reset
    }
}
