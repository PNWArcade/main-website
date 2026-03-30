"use client"

import { useQuery } from '@tanstack/react-query'

export interface TeamMember {
    name: string
    position: string
    image: string
    linkedin_url?: string | null
    email?: string | null
}

export interface CategorizedTeam {
    leadership: TeamMember[]
    mentors: TeamMember[]
    officers: TeamMember[]
    advisors: TeamMember[]
}

export interface PastPresident {
    id: string
    name: string
    photo_url: string | null
    year: string
}

interface TeamResponse {
    source: string
    count: number
    data: CategorizedTeam
}

interface PastPresidentsResponse {
    data: PastPresident[]
}

async function fetchTeam(): Promise<CategorizedTeam> {
    const response = await fetch('/api/pnw-team')

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to fetch team')
    }

    const result: TeamResponse = await response.json()
    return result.data
}

async function fetchPastPresidents(): Promise<PastPresident[]> {
    const response = await fetch('/api/past-presidents')

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to fetch past presidents')
    }

    const result: PastPresidentsResponse = await response.json()
    return result.data
}

export function useTeam() {
    return useQuery<CategorizedTeam>({
        queryKey: ['pnw-team'],
        queryFn: fetchTeam,
        staleTime: 5 * 60 * 1000, // 5 minutes — team data changes rarely
    })
}

export function usePastPresidents() {
    return useQuery<PastPresident[]>({
        queryKey: ['past-presidents'],
        queryFn: fetchPastPresidents,
        staleTime: 10 * 60 * 1000, // 10 minutes — changes very rarely
    })
}
