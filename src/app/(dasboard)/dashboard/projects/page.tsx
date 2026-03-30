"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useProjects, useDeleteProject, useCreateProject } from '@/hooks/useProjects'
import { Button } from '@/components/ui/buttons/Button'
import { Plus, Edit, Trash2, Eye, RefreshCw, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UploadStatus } from '@/lib/schemas/project'

const statusConfig: Record<UploadStatus, { label: string; className: string }> = {
    draft: { label: 'Draft', className: 'bg-yellow-100 text-yellow-800' },
    published: { label: 'Published', className: 'bg-green-100 text-green-800' },
    archived: { label: 'Archived', className: 'bg-gray-100 text-gray-800' },
}

export default function ProjectsPage() {
    const [statusFilter, setStatusFilter] = useState<UploadStatus | 'all'>('all')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [newProject, setNewProject] = useState({ title: '', slug: '', description: '' })

    const { data: projects, isLoading, refetch } = useProjects(statusFilter)
    const deleteMutation = useDeleteProject()
    const createMutation = useCreateProject()

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}"?`)) return
        await deleteMutation.mutateAsync(id)
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await createMutation.mutateAsync(newProject)
            setShowCreateModal(false)
            setNewProject({ title: '', slug: '', description: '' })
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Failed to create project')
        }
    }

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
                    <p className="text-gray-500">Manage your projects and their content</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => refetch()}>
                        <RefreshCw className={cn("h-4 w-4 mr-1", isLoading && "animate-spin")} />
                        Refresh
                    </Button>
                    <Button size="sm" onClick={() => setShowCreateModal(true)}>
                        <Plus className="h-4 w-4 mr-1" />
                        New Project
                    </Button>
                </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap">
                {(['all', 'draft', 'published', 'archived'] as const).map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={cn(
                            'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                            statusFilter === status
                                ? 'bg-gray-900 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        )}
                    >
                        {status === 'all' ? 'All' : statusConfig[status].label}
                    </button>
                ))}
            </div>

            {/* Projects List */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                </div>
            ) : projects?.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <FolderOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No projects found</p>
                    <Button className="mt-4" onClick={() => setShowCreateModal(true)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Create your first project
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {projects?.map((project) => (
                        <div
                            key={project.id}
                            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-semibold text-lg text-gray-900">
                                            {project.title}
                                        </h3>
                                        <span className={cn(
                                            'px-2 py-0.5 rounded-full text-xs font-medium',
                                            statusConfig[project.status || 'draft'].className
                                        )}>
                                            {statusConfig[project.status || 'draft'].label}
                                        </span>
                                        {project.category && (
                                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {project.category.name}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 mb-2">/{project.slug}</p>
                                    {project.description && (
                                        <p className="text-gray-600 text-sm line-clamp-2">
                                            {project.description}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Link href={`/projects/${project.slug}`}>
                                        <Button variant="outline" size="sm">
                                            <Eye className="h-4 w-4 mr-1" />
                                            View
                                        </Button>
                                    </Link>
                                    <Link href={`/dashboard/projects/${project.id}`}>
                                        <Button variant="outline" size="sm">
                                            <Edit className="h-4 w-4 mr-1" />
                                            Edit
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(project.id, project.title)}
                                        disabled={deleteMutation.isPending}
                                        className="text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Create New Project</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={newProject.title}
                                    onChange={(e) => {
                                        setNewProject({
                                            ...newProject,
                                            title: e.target.value,
                                            slug: generateSlug(e.target.value),
                                        })
                                    }}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Slug
                                </label>
                                <input
                                    type="text"
                                    value={newProject.slug}
                                    onChange={(e) => setNewProject({ ...newProject, slug: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none"
                                    pattern="^[a-z0-9-]+$"
                                    title="Lowercase letters, numbers, and hyphens only"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={newProject.description}
                                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none"
                                    rows={3}
                                />
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={createMutation.isPending}>
                                    {createMutation.isPending ? 'Creating...' : 'Create'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
