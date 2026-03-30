"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/buttons/Button'
import { cn } from '@/lib/utils'
import { Clock, CheckCircle, Archive, Trash2 } from 'lucide-react'
import { statusConfig } from './StatusFilter'
import { type ContactStatus, type ContactSubmission } from '@/lib/schemas/inquiry'

export type { ContactSubmission } from '@/lib/schemas/inquiry'

interface InquiryCardProps {
    inquiry: ContactSubmission
    onStatusUpdate: (id: string, status: ContactStatus) => Promise<void>
    onDelete: (id: string) => Promise<void>
}

export function InquiryCard({ inquiry, onStatusUpdate, onDelete }: InquiryCardProps) {
    const [isUpdating, setIsUpdating] = useState(false)

    const status = inquiry.status || 'new'
    const config = statusConfig[status]
    const StatusIcon = config.icon

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const handleStatusUpdate = async (newStatus: ContactStatus) => {
        setIsUpdating(true)
        try {
            await onStatusUpdate(inquiry.id, newStatus)
        } finally {
            setIsUpdating(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this inquiry?')) return
        setIsUpdating(true)
        try {
            await onDelete(inquiry.id)
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <div
            className={cn(
                "bg-white border border-gray-200 rounded-lg p-6 transition-opacity",
                isUpdating && "opacity-50"
            )}
        >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* Content */}
                <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg text-purdue-black">
                            {inquiry.name}
                        </h3>
                        <span className={cn(
                            "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                            config.className
                        )}>
                            <StatusIcon className="h-3 w-3" />
                            {config.label}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500">
                        <a href={`mailto:${inquiry.email}`} className="hover:underline">
                            {inquiry.email}
                        </a>
                    </p>
                    <p className="text-gray-700 whitespace-pre-wrap">
                        {inquiry.message}
                    </p>
                    <p className="text-xs text-gray-400">
                        Received: {formatDate(inquiry.created_at)}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap lg:flex-col gap-2">
                    {status !== 'in_progress' && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate('in_progress')}
                            disabled={isUpdating}
                            className="text-yellow-700 hover:bg-yellow-50"
                        >
                            <Clock className="h-4 w-4 mr-1" />
                            In Progress
                        </Button>
                    )}
                    {status !== 'resolved' && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate('resolved')}
                            disabled={isUpdating}
                            className="text-green-700 hover:bg-green-50"
                        >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Resolved
                        </Button>
                    )}
                    {status !== 'archived' && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate('archived')}
                            disabled={isUpdating}
                            className="text-gray-700 hover:bg-gray-50"
                        >
                            <Archive className="h-4 w-4 mr-1" />
                            Archive
                        </Button>
                    )}
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleDelete}
                        disabled={isUpdating}
                        className="text-red-600 hover:bg-red-50"
                    >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                    </Button>
                </div>
            </div>
        </div>
    )
}
