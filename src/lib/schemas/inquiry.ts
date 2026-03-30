import { z } from 'zod'

// Contact status enum
export const contactStatusSchema = z.enum(['new', 'in_progress', 'resolved', 'archived'])
export type ContactStatus = z.infer<typeof contactStatusSchema>

// Contact form submission (for public form)
export const contactFormSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
    email: z.email('Invalid email address'),
    message: z.string().min(10, 'Message must be at least 10 characters').max(5000, 'Message is too long'),
})
export type ContactForm = z.infer<typeof contactFormSchema>

// Contact submission schema (full record from DB)
export const contactSubmissionSchema = z.object({
    id: z.uuid(),
    name: z.string().min(1),
    email: z.email(),
    message: z.string().min(1),
    status: contactStatusSchema.nullable(),
    created_at: z.string().nullable(),
    updated_at: z.string().nullable(),
})
export type ContactSubmission = z.infer<typeof contactSubmissionSchema>

// API request schemas
export const updateStatusRequestSchema = z.object({
    status: contactStatusSchema,
})
export type UpdateStatusRequest = z.infer<typeof updateStatusRequestSchema>

// Query params schema
export const inquiryQueryParamsSchema = z.object({
    status: contactStatusSchema.optional(),
    limit: z.coerce.number().min(1).max(100).default(50),
    offset: z.coerce.number().min(0).default(0),
})
export type InquiryQueryParams = z.infer<typeof inquiryQueryParamsSchema>

// API response schemas
export const inquiryListResponseSchema = z.object({
    data: z.array(contactSubmissionSchema),
    count: z.number().nullable(),
    limit: z.number(),
    offset: z.number(),
})
export type InquiryListResponse = z.infer<typeof inquiryListResponseSchema>

export const inquiryResponseSchema = z.object({
    data: contactSubmissionSchema,
})
export type InquiryResponse = z.infer<typeof inquiryResponseSchema>

export const deleteResponseSchema = z.object({
    success: z.boolean(),
})
export type DeleteResponse = z.infer<typeof deleteResponseSchema>

export const errorResponseSchema = z.object({
    error: z.string(),
})
export type ErrorResponse = z.infer<typeof errorResponseSchema>

// UUID validation helper
export const uuidSchema = z.uuid()
