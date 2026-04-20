"use client"

import { useQuery } from '@tanstack/react-query'

export interface PnwEvent {
    eventId: string
    eventName: string
    eventDates: string
    eventLocation: string
    eventPicture: string
    eventUrl: string
}

interface EventsResponse {
    data: PnwEvent[]
}

async function fetchEvents(limit = 10, search = 'arcade'): Promise<PnwEvent[]> {
    const params = new URLSearchParams({ limit: String(limit), search })
    const response = await fetch(`/api/pnw-events?${params}`)

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to fetch events')
    }

    const result: EventsResponse = await response.json()
    return result.data
}

export function useEvents(limit = 10, search = 'arcade') {
    return useQuery<PnwEvent[]>({
        queryKey: ['pnw-events', limit, search],
        queryFn: () => fetchEvents(limit, search),
    })
}
