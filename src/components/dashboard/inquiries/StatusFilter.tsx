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
        className: 'bg-purdue-gold/15 text-purdue-gold'
    },
    in_progress: {
        label: 'In Progress',
        icon: Clock,
        className: 'bg-purdue-gold/15 text-purdue-gold'
    },
    resolved: {
        label: 'Resolved',
        icon: CheckCircle,
        className: 'bg-emerald-500/15 text-emerald-300'
    },
    archived: {
        label: 'Archived',
        icon: Archive,
        className: 'bg-secondary text-foreground'
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
