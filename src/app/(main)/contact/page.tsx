"use client"

import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3'
import { useContactForm } from '@/hooks/useContactForm'
import {
    FormField,
    TextAreaField,
    SubmitButton,
    FormError,
    FormSuccess
} from '@/components/forms/FormFields'

function ContactForm() {
    const { executeRecaptcha } = useGoogleReCaptcha()
    const {
        form,
        fieldErrors,
        isSubmitting,
        isSubmitted,
        error,
        handleChange,
        handleSubmit,
        reset
    } = useContactForm(executeRecaptcha)

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-md p-8">
                <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
                    Contact Us
                </h1>

                <FormError message={error} />

                {!isSubmitted ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <FormField
                            label="Name"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            error={fieldErrors.name?.[0]}
                            required
                        />

                        <FormField
                            label="Email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            error={fieldErrors.email?.[0]}
                            required
                        />

                        <TextAreaField
                            label="Message"
                            name="message"
                            value={form.message}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            error={fieldErrors.message?.[0]}
                            rows={4}
                            required
                        />

                        {fieldErrors.captcha && (
                            <p className="text-sm text-red-600 text-center">{fieldErrors.captcha[0]}</p>
                        )}

                        <SubmitButton isLoading={isSubmitting}>
                            Send Message
                        </SubmitButton>
                    </form>
                ) : (
                    <FormSuccess onReset={reset} />
                )}
            </div>
        </div>
    )
}

export default function ContactPage() {
    return (
        <GoogleReCaptchaProvider reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}>
            <ContactForm />
        </GoogleReCaptchaProvider>
    )
}
