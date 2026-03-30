"use client"

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    type ContactStatus,
    type ContactSubmission,
    inquiryListResponseSchema,
    inquiryResponseSchema,
    contactStatusSchema,
} from '@/lib/schemas/inquiry'

// API functions with Zod validation
async function fetchInquiries(status: ContactStatus | 'all'): Promise<ContactSubmission[]> {
    const url = status === 'all'
        ? '/api/dashboard/inquiries'
        : `/api/dashboard/inquiries?status=${status}`
    
    const response = await fetch(url)
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to fetch inquiries')
    }
    
    const result = await response.json()
    
    // Validate response with Zod
    const validated = inquiryListResponseSchema.safeParse(result)
    if (!validated.success) {
        console.error('Response validation error:', validated.error)
        throw new Error('Invalid response format')
    }
    
    return validated.data.data
}

async function updateInquiryStatus(id: string, status: ContactStatus): Promise<ContactSubmission> {
    // Validate status before sending
    const statusValidation = contactStatusSchema.safeParse(status)
    if (!statusValidation.success) {
        throw new Error('Invalid status value')
    }

    const response = await fetch(`/api/dashboard/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusValidation.data })
    })
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to update status')
    }
    
    const result = await response.json()
    
    // Validate response with Zod
    const validated = inquiryResponseSchema.safeParse(result)
    if (!validated.success) {
        console.error('Response validation error:', validated.error)
        throw new Error('Invalid response format')
    }
    
    return validated.data.data
}

async function deleteInquiry(id: string): Promise<void> {
    const response = await fetch(`/api/dashboard/inquiries/${id}`, {
        method: 'DELETE'
    })
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to delete inquiry')
    }
}

// Query keys factory for consistent cache management
export const inquiryKeys = {
    all: ['inquiries'] as const,
    list: (status: ContactStatus | 'all') => [...inquiryKeys.all, status] as const,
    detail: (id: string) => [...inquiryKeys.all, id] as const,
}

interface UseInquiriesResult {
    inquiries: ContactSubmission[]
    loading: boolean
    error: string | null
    currentStatus: ContactStatus | 'all'
    isUpdating: boolean
    isDeleting: boolean
    refetch: () => void
    handleStatusUpdate: (id: string, newStatus: ContactStatus) => Promise<void>
    handleDelete: (id: string) => Promise<void>
    handleStatusFilterChange: (status: ContactStatus | 'all') => void
}

export function useInquiries(): UseInquiriesResult {
    const queryClient = useQueryClient()
    const [currentStatus, setCurrentStatus] = useState<ContactStatus | 'all'>('all')

    // Query for fetching inquiries
    const {
        data: inquiries = [],
        isLoading: loading,
        error: queryError,
        refetch
    } = useQuery({
        queryKey: inquiryKeys.list(currentStatus),
        queryFn: () => fetchInquiries(currentStatus),
    })

    // Mutation for updating status
    const updateMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: ContactStatus }) =>
            updateInquiryStatus(id, status),
        // Optimistic update
        onMutate: async ({ id, status }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: inquiryKeys.list(currentStatus) })
            
            // Snapshot previous value
            const previousInquiries = queryClient.getQueryData<ContactSubmission[]>(
                inquiryKeys.list(currentStatus)
            )
            
            // Optimistically update
            queryClient.setQueryData<ContactSubmission[]>(
                inquiryKeys.list(currentStatus),
                (old) => old?.map(inquiry =>
                    inquiry.id === id ? { ...inquiry, status } : inquiry
                )
            )
            
            return { previousInquiries }
        },
        // Rollback on error
        onError: (_err, _variables, context) => {
            if (context?.previousInquiries) {
                queryClient.setQueryData(
                    inquiryKeys.list(currentStatus),
                    context.previousInquiries
                )
            }
        },
        // Refetch after success or error
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: inquiryKeys.all })
        },
    })

    // Mutation for deleting
    const deleteMutation = useMutation({
        mutationFn: deleteInquiry,
        // Optimistic update
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: inquiryKeys.list(currentStatus) })
            
            const previousInquiries = queryClient.getQueryData<ContactSubmission[]>(
                inquiryKeys.list(currentStatus)
            )
            
            queryClient.setQueryData<ContactSubmission[]>(
                inquiryKeys.list(currentStatus),
                (old) => old?.filter(inquiry => inquiry.id !== id)
            )
            
            return { previousInquiries }
        },
        onError: (_err, _id, context) => {
            if (context?.previousInquiries) {
                queryClient.setQueryData(
                    inquiryKeys.list(currentStatus),
                    context.previousInquiries
                )
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: inquiryKeys.all })
        },
    })

    const handleStatusUpdate = async (id: string, newStatus: ContactStatus) => {
        await updateMutation.mutateAsync({ id, status: newStatus })
    }

    const handleDelete = async (id: string) => {
        await deleteMutation.mutateAsync(id)
    }

    const handleStatusFilterChange = (status: ContactStatus | 'all') => {
        setCurrentStatus(status)
    }

    return {
        inquiries,
        loading,
        error: queryError?.message ?? null,
        currentStatus,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
        refetch,
        handleStatusUpdate,
        handleDelete,
        handleStatusFilterChange
    }
}
