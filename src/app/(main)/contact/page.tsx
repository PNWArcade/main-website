"use client"

import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3"
import { useContactForm } from "@/hooks/useContactForm"
import {
  FormField,
  TextAreaField,
  SubmitButton,
  FormError,
  FormSuccess,
} from "@/components/forms/FormFields"
import { PageHero } from "@/components/layout/PageHero"
import { PageContainer } from "@/components/layout/PageContainer"

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
    reset,
  } = useContactForm(executeRecaptcha)

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHero
        eyebrow="Signal"
        title="Contact Us"
        description="Questions about projects, sponsorship, or joining a team? Send a note and an officer will follow up."
      />
      <PageContainer className="flex justify-center pb-16">
        <div className="lab-plate w-full max-w-md rounded-3xl p-8">
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
              {fieldErrors.captcha ? (
                <p className="text-center text-sm text-destructive">{fieldErrors.captcha[0]}</p>
              ) : null}
              <SubmitButton isLoading={isSubmitting}>Send Message</SubmitButton>
            </form>
          ) : (
            <FormSuccess onReset={reset} />
          )}
        </div>
      </PageContainer>
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
