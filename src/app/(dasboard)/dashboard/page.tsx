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

// Stat card component
interface StatCardProps {
    title: string
    value: number | undefined
    icon: React.ReactNode
    href: string
    loading?: boolean
    color: 'blue' | 'green' | 'purple' | 'amber'
}

const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
}

function StatCard({ title, value, icon, href, loading, color }: StatCardProps) {
    return (
        <Link 
            href={href}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                        {loading ? (
                            <span className="inline-block w-12 h-8 bg-gray-200 animate-pulse rounded" />
                        ) : (
                            value ?? 0
                        )}
                    </p>
                </div>
                <div className={cn('p-3 rounded-xl', colorClasses[color])}>
                    {icon}
                </div>
            </div>
        </Link>
    )
}

// Status badge component
const statusConfig: Record<ContactStatus, { label: string; className: string; icon: React.ReactNode }> = {
    new: { 
        label: 'New', 
        className: 'bg-blue-100 text-blue-700',
        icon: <AlertCircle className="h-3 w-3" />
    },
    in_progress: { 
        label: 'In Progress', 
        className: 'bg-yellow-100 text-yellow-700',
        icon: <Clock className="h-3 w-3" />
    },
    resolved: { 
        label: 'Resolved', 
        className: 'bg-green-100 text-green-700',
        icon: <CheckCircle className="h-3 w-3" />
    },
    archived: { 
        label: 'Archived', 
        className: 'bg-gray-100 text-gray-500',
        icon: <CheckCircle className="h-3 w-3" />
    },
}

function StatusBadge({ status }: { status: ContactStatus | null }) {
    if (!status) return null
    const config = statusConfig[status]
    return (
        <span className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
            config.className
        )}>
            {config.icon}
            {config.label}
        </span>
    )
}

// Format date helper
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

// Fetch functions
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
        refetchInterval: 30000, // Refresh every 30 seconds
    })

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500">Welcome back! Here&apos;s an overview of your site.</p>
                </div>
                <button 
                    onClick={() => refetch()}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Refresh"
                >
                    <RefreshCw className={cn("h-5 w-5", isLoading && "animate-spin")} />
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Projects"
                    value={stats?.projects.total}
                    icon={<FolderOpen className="h-6 w-6" />}
                    href="/dashboard/projects"
                    loading={isLoading}
                    color="blue"
                />
                <StatCard
                    title="Published Projects"
                    value={stats?.projects.published}
                    icon={<CheckCircle className="h-6 w-6" />}
                    href="/dashboard/projects"
                    loading={isLoading}
                    color="green"
                />
                <StatCard
                    title="New Inquiries"
                    value={stats?.inquiries.new}
                    icon={<MessageSquare className="h-6 w-6" />}
                    href="/dashboard/inquiries"
                    loading={isLoading}
                    color="purple"
                />
                <StatCard
                    title="Sponsors"
                    value={stats?.sponsors.total}
                    icon={<Heart className="h-6 w-6" />}
                    href="/dashboard/sponsors"
                    loading={isLoading}
                    color="amber"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Inquiries */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Inquiries</h2>
                        <Link 
                            href="/dashboard/inquiries" 
                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                            View all <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="animate-pulse flex gap-4 p-3 bg-gray-50 rounded-lg">
                                    <div className="h-10 w-10 bg-gray-200 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                                        <div className="h-3 bg-gray-200 rounded w-2/3" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : stats?.inquiries.recent.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p>No inquiries yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {stats?.inquiries.recent.map((inquiry) => (
                                <div 
                                    key={inquiry.id} 
                                    className="flex items-start gap-4 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <div className="h-10 w-10 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                                        {inquiry.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900 truncate">
                                                {inquiry.name}
                                            </span>
                                            <StatusBadge status={inquiry.status} />
                                        </div>
                                        <p className="text-sm text-gray-500 truncate">
                                            {inquiry.message}
                                        </p>
                                    </div>
                                    <span className="text-xs text-gray-400 whitespace-nowrap">
                                        {formatDate(inquiry.created_at)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="space-y-3">
                        <Link
                            href="/dashboard/projects"
                            className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 transition-colors"
                        >
                            <FolderOpen className="h-5 w-5" />
                            <span className="font-medium">Manage Projects</span>
                        </Link>
                        <Link
                            href="/dashboard/inquiries"
                            className="flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-700 transition-colors"
                        >
                            <MessageSquare className="h-5 w-5" />
                            <span className="font-medium">Review Inquiries</span>
                            {stats?.inquiries.new ? (
                                <span className="ml-auto bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
                                    {stats.inquiries.new}
                                </span>
                            ) : null}
                        </Link>
                        <Link
                            href="/dashboard/sponsors"
                            className="flex items-center gap-3 p-3 bg-amber-50 hover:bg-amber-100 rounded-lg text-amber-700 transition-colors"
                        >
                            <Heart className="h-5 w-5" />
                            <span className="font-medium">Manage Sponsors</span>
                        </Link>
                    </div>

                    {/* Stats Summary */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <h3 className="text-sm font-medium text-gray-500 mb-3">Inquiry Status</h3>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">New</span>
                                <span className="font-medium text-blue-600">{stats?.inquiries.new ?? 0}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">In Progress</span>
                                <span className="font-medium text-yellow-600">{stats?.inquiries.inProgress ?? 0}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Total</span>
                                <span className="font-medium text-gray-900">{stats?.inquiries.total ?? 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}