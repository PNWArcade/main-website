"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/buttons/Button'
import { Mail, Clock, CheckCircle, Archive } from 'lucide-react'
import { type ContactStatus } from '@/lib/schemas/inquiry'

export type { ContactStatus } from '@/lib/schemas/inquiry'

export const statusConfig: Record<ContactStatus, { label: string; icon: typeof Mail; className: string }> = {
    new: {
        label: 'New',
        icon: Mail,
        className: 'bg-blue-100 text-blue-800'
    },
    in_progress: {
        label: 'In Progress',
        icon: Clock,
        className: 'bg-yellow-100 text-yellow-800'
    },
    resolved: {
        label: 'Resolved',
        icon: CheckCircle,
        className: 'bg-green-100 text-green-800'
    },
    archived: {
        label: 'Archived',
        icon: Archive,
        className: 'bg-gray-100 text-gray-800'
    }
}

interface StatusFilterProps {
    onStatusChange: (status: ContactStatus | 'all') => void
    defaultStatus?: ContactStatus | 'all'
}

export function StatusFilter({ onStatusChange, defaultStatus = 'all' }: StatusFilterProps) {
    const [selectedStatus, setSelectedStatus] = useState<ContactStatus | 'all'>(defaultStatus)

    const handleStatusChange = (status: ContactStatus | 'all') => {
        setSelectedStatus(status)
        onStatusChange(status)
    }

    return (
        <div className="flex flex-wrap gap-2">
            <Button
                variant={selectedStatus === 'all' ? 'default' : 'outline'}
                onClick={() => handleStatusChange('all')}
                size="sm"
            >
                All
            </Button>
            {(Object.keys(statusConfig) as ContactStatus[]).map((status) => {
                const config = statusConfig[status]
                const Icon = config.icon
                return (
                    <Button
                        key={status}
                        variant={selectedStatus === status ? 'default' : 'outline'}
                        onClick={() => handleStatusChange(status)}
                        size="sm"
                        className="flex items-center gap-1"
                    >
                        <Icon className="h-3 w-3" />
                        {config.label}
                    </Button>
                )
            })}
        </div>
    )
}
