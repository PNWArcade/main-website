"use client"

import {
    StatusFilter,
    InquiryCard,
    RefreshButton
} from '@/components/dashboard/inquiries'
import { useInquiries } from '@/hooks/useInquiries'
import { PageHeader } from '@/components/dashboard/ui/PageHeader'
import { EmptyState } from '@/components/dashboard/ui/EmptyState'
import { LoadingState } from '@/components/dashboard/ui/LoadingState'

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
            <PageHeader
                title="Inquiries"
                description="Manage contact form submissions"
                actions={<RefreshButton onClick={() => refetch()} loading={loading} />}
            />

            <StatusFilter onStatusChange={handleStatusFilterChange} />

            {error && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-destructive">
                    {error}
                </div>
            )}

            {loading && <LoadingState />}

            {!loading && inquiries.length === 0 && (
                <EmptyState title="No inquiries found" />
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
