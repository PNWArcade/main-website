"use client"

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import {
    FolderOpen,
    MessageSquare,
    Heart,
    ArrowRight,
    Clock,
    CheckCircle,
    AlertCircle,
    RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ContactSubmission, ContactStatus } from '@/lib/schemas/inquiry'
import type { ProjectWithRelations, Sponsor } from '@/lib/schemas/project'
import { PageHeader } from '@/components/dashboard/ui/PageHeader'
import { StatusBadge } from '@/components/dashboard/ui/StatusBadge'
import { EmptyState } from '@/components/dashboard/ui/EmptyState'
import { Button } from '@/components/ui/buttons/Button'

interface StatCardProps {
    title: string
    value: number | undefined
    icon: React.ReactNode
    href: string
    loading?: boolean
}

function StatCard({ title, value, icon, href, loading }: StatCardProps) {
    return (
        <Link
            href={href}
            className="lab-plate rounded-2xl p-6 transition-colors hover:border-purdue-gold/40"
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <p className="mt-1 text-3xl font-semibold text-foreground">
                        {loading ? (
                            <span className="inline-block h-8 w-12 animate-pulse rounded bg-muted" />
                        ) : (
                            value ?? 0
                        )}
                    </p>
                </div>
                <div className="rounded-xl bg-purdue-gold/15 p-3 text-purdue-gold">
                    {icon}
                </div>
            </div>
        </Link>
    )
}

function formatDate(dateString: string | null) {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
}

async function fetchDashboardStats() {
    const [projectsRes, inquiriesRes, sponsorsRes] = await Promise.all([
        fetch('/api/dashboard/projects'),
        fetch('/api/dashboard/inquiries'),
        fetch('/api/sponsors')
    ])

    const [projectsData, inquiriesData, sponsorsData] = await Promise.all([
        projectsRes.ok ? projectsRes.json() : { data: [] },
        inquiriesRes.ok ? inquiriesRes.json() : { data: [] },
        sponsorsRes.ok ? sponsorsRes.json() : { data: [] }
    ])

    const projects = projectsData.data as ProjectWithRelations[]
    const inquiries = inquiriesData.data as ContactSubmission[]
    const sponsors = sponsorsData.data as Sponsor[]

    return {
        projects: {
            total: projects.length,
            published: projects.filter(p => p.status === 'published').length,
            draft: projects.filter(p => p.status === 'draft').length,
        },
        inquiries: {
            total: inquiries.length,
            new: inquiries.filter(i => i.status === 'new').length,
            inProgress: inquiries.filter(i => i.status === 'in_progress').length,
            recent: inquiries.slice(0, 5),
        },
        sponsors: {
            total: sponsors.length,
        }
    }
}

export default function DashboardPage() {
    const { data: stats, isLoading, refetch } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: fetchDashboardStats,
        refetchInterval: 30000,
    })

    return (
        <div className="space-y-8">
            <PageHeader
                title="Overview"
                description="Welcome back. Here's an overview of the site."
                actions={
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => refetch()}
                        aria-label="Refresh dashboard"
                    >
                        <RefreshCw className={cn("h-5 w-5", isLoading && "animate-spin")} />
                    </Button>
                }
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Projects" value={stats?.projects.total} icon={<FolderOpen className="h-6 w-6" />} href="/dashboard/projects" loading={isLoading} />
                <StatCard title="Published Projects" value={stats?.projects.published} icon={<CheckCircle className="h-6 w-6" />} href="/dashboard/projects" loading={isLoading} />
                <StatCard title="New Inquiries" value={stats?.inquiries.new} icon={<MessageSquare className="h-6 w-6" />} href="/dashboard/inquiries" loading={isLoading} />
                <StatCard title="Sponsors" value={stats?.sponsors.total} icon={<Heart className="h-6 w-6" />} href="/dashboard/sponsors" loading={isLoading} />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lab-plate rounded-2xl p-6 lg:col-span-2">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Recent Inquiries</h2>
                        <Link href="/dashboard/inquiries" className="flex items-center gap-1 text-sm text-purdue-gold">
                            View all <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                    {isLoading ? (
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex gap-4 rounded-lg bg-muted p-3">
                                    <div className="lab-shimmer h-10 w-10 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <div className="lab-shimmer h-4 w-1/3 rounded" />
                                        <div className="lab-shimmer h-3 w-2/3 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : stats?.inquiries.recent.length === 0 ? (
                        <EmptyState title="No inquiries yet" icon={<MessageSquare className="mx-auto h-10 w-10" />} />
                    ) : (
                        <div className="space-y-3">
                            {stats?.inquiries.recent.map((inquiry) => (
                                <div key={inquiry.id} className="flex items-start gap-4 rounded-lg bg-muted/60 p-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purdue-gold/20 text-sm font-semibold text-purdue-gold">
                                        {inquiry.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="truncate font-medium">{inquiry.name}</span>
                                            <StatusBadge status={inquiry.status || 'new'} />
                                        </div>
                                        <p className="truncate text-sm text-muted-foreground">{inquiry.message}</p>
                                    </div>
                                    <span className="whitespace-nowrap text-xs text-muted-foreground">
                                        {formatDate(inquiry.created_at)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="lab-plate rounded-2xl p-6">
                    <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
                    <div className="space-y-3">
                        <Link href="/dashboard/projects" className="flex items-center gap-3 rounded-lg bg-purdue-gold/10 p-3 text-purdue-gold">
                            <FolderOpen className="h-5 w-5" />
                            <span className="font-medium">Manage Projects</span>
                        </Link>
                        <Link href="/dashboard/inquiries" className="flex items-center gap-3 rounded-lg bg-muted p-3">
                            <MessageSquare className="h-5 w-5" />
                            <span className="font-medium">Review Inquiries</span>
                            {stats?.inquiries.new ? (
                                <span className="ml-auto rounded-full bg-purdue-gold px-2 py-0.5 text-xs text-purdue-black">
                                    {stats.inquiries.new}
                                </span>
                            ) : null}
                        </Link>
                        <Link href="/dashboard/sponsors" className="flex items-center gap-3 rounded-lg bg-muted p-3">
                            <Heart className="h-5 w-5" />
                            <span className="font-medium">Manage Sponsors</span>
                        </Link>
                    </div>
                    <div className="mt-6 border-t border-border pt-6">
                        <h3 className="mb-3 text-sm font-medium text-muted-foreground">Inquiry Status</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">New</span>
                                <span className="font-medium">{stats?.inquiries.new ?? 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">In Progress</span>
                                <span className="font-medium">{stats?.inquiries.inProgress ?? 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Total</span>
                                <span className="font-medium">{stats?.inquiries.total ?? 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
