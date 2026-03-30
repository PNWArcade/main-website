"use client"

import { cn } from '@/lib/utils'

interface FormFieldProps {
    label: string
    name: string
    type?: 'text' | 'email'
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
    type = 'text',
    value,
    onChange,
    disabled = false,
    error,
    required = false,
    placeholder
}: FormFieldProps) {
    return (
        <div>
            <label 
                htmlFor={name}
                className="block text-sm font-medium text-gray-600 mb-1 "
            >
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
                className={cn(
                    "w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 transition-colors cursor-pointer",
                    error ? 'border-red-500' : 'border-gray-300'
                )}
            />
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
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
    placeholder
}: TextAreaFieldProps) {
    return (
        <div>
            <label 
                htmlFor={name}
                className="block text-sm font-medium text-gray-600 mb-1"
            >
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
                className={cn(
                    "w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 transition-colors hover:cursor-pointer",
                    error ? 'border-red-500' : 'border-gray-300'
                )}
            />
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
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
    loadingText = 'Sending...',
    children
}: SubmitButtonProps) {
    return (
        <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black hover:bg-gray-300 cursor-pointer hover:text-black text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm cursor-pointer">
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
    title = 'Thank you!',
    message = "Your message has been sent. We'll get back to you soon.",
    onReset,
    resetButtonText = 'Send another message'
}: FormSuccessProps) {
    return (
        <div className="text-center">
            <h2 className="text-xl font-semibold text-green-600 mb-2">
                {title}
            </h2>
            <p className="text-gray-700 pb-5">
                {message}
            </p>
            {onReset && (
                <button
                    onClick={onReset}
                    className="w-full bg-black hover:bg-gray-300 cursor-pointer hover:text-black text-white font-medium py-2 rounded-lg transition-colors"
                >
                    {resetButtonText}
                </button>
            )}
        </div>
    )
}
