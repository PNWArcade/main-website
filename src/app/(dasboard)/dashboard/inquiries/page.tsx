"use client"

import { RefreshCw } from 'lucide-react'
import {
    StatusFilter,
    InquiryCard,
    RefreshButton
} from '@/components/dashboard/inquiries'
import { useInquiries } from '@/hooks/useInquiries'

export default function InquiriesPage() {
    const {
        inquiries,
        loading,
        error,
        refetch,
        handleStatusUpdate,
        handleDelete,
        handleStatusFilterChange
    } = useInquiries()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-purdue-black">Inquiries</h1>
                    <p className="text-gray-500">Manage contact form submissions</p>
                </div>
                <RefreshButton onClick={() => refetch()} loading={loading} />
            </div>

            {/* Status Filter */}
            <StatusFilter onStatusChange={handleStatusFilterChange} />

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                </div>
            )}

            {/* Inquiries List */}
            {!loading && inquiries.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    No inquiries found
                </div>
            )}

            {!loading && inquiries.length > 0 && (
                <div className="space-y-4">
                    {inquiries.map((inquiry) => (
                        <InquiryCard
                            key={inquiry.id}
                            inquiry={inquiry}
                            onStatusUpdate={handleStatusUpdate}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
