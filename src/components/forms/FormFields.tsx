"use client"

import { cn } from "@/lib/utils"

interface FormFieldProps {
  label: string
  name: string
  type?: "text" | "email"
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
  error?: string
  required?: boolean
  placeholder?: string
}

export function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  disabled = false,
  error,
  required = false,
  placeholder,
}: FormFieldProps) {
  const errorId = `${name}-error`

  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-muted-foreground">
        {label}
      </label>
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "w-full rounded-lg border bg-input/30 px-3 py-2 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-purdue-gold disabled:opacity-50",
          error ? "border-destructive" : "border-input"
        )}
      />
      {error ? (
        <p id={errorId} className="mt-1 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

interface TextAreaFieldProps {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  disabled?: boolean
  error?: string
  required?: boolean
  rows?: number
  placeholder?: string
}

export function TextAreaField({
  label,
  name,
  value,
  onChange,
  disabled = false,
  error,
  required = false,
  rows = 4,
  placeholder,
}: TextAreaFieldProps) {
  const errorId = `${name}-error`

  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-muted-foreground">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "w-full rounded-lg border bg-input/30 px-3 py-2 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-purdue-gold disabled:opacity-50",
          error ? "border-destructive" : "border-input"
        )}
      />
      {error ? (
        <p id={errorId} className="mt-1 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

interface SubmitButtonProps {
  isLoading?: boolean
  loadingText?: string
  children: React.ReactNode
}

export function SubmitButton({
  isLoading = false,
  loadingText = "Sending...",
  children,
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="w-full rounded-lg bg-purdue-gold py-2 font-medium text-purdue-black transition-colors hover:bg-purdue-dust disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isLoading ? loadingText : children}
    </button>
  )
}

interface FormErrorProps {
  message: string | null
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null

  return (
    <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
      {message}
    </div>
  )
}

interface FormSuccessProps {
  title?: string
  message?: string
  onReset?: () => void
  resetButtonText?: string
}

export function FormSuccess({
  title = "Thank you!",
  message = "Your message has been sent. We'll get back to you soon.",
  onReset,
  resetButtonText = "Send another message",
}: FormSuccessProps) {
  return (
    <div className="text-center">
      <h2 className="mb-2 text-xl font-semibold text-purdue-gold">{title}</h2>
      <p className="pb-5 text-muted-foreground">{message}</p>
      {onReset ? (
        <button
          onClick={onReset}
          className="w-full rounded-lg bg-purdue-gold py-2 font-medium text-purdue-black hover:bg-purdue-dust"
        >
          {resetButtonText}
        </button>
      ) : null}
    </div>
  )
}
