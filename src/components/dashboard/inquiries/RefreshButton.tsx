"use client"

import { Button } from '@/components/ui/buttons/Button'
import { cn } from '@/lib/utils'
import { RefreshCw } from 'lucide-react'

interface RefreshButtonProps {
    onClick: () => void
    loading?: boolean
}

export function RefreshButton({ onClick, loading = false }: RefreshButtonProps) {
    return (
        <Button
            onClick={onClick}
            variant="outline"
            className="flex items-center gap-2"
            disabled={loading}
        >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
        </Button>
    )
}
