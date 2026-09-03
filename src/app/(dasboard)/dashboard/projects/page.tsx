"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useProjects, useDeleteProject, useCreateProject } from '@/hooks/useProjects'
import { Button } from '@/components/ui/buttons/Button'
import { Plus, Edit, Trash2, Eye, RefreshCw, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UploadStatus } from '@/lib/schemas/project'
import { PageHeader } from '@/components/dashboard/ui/PageHeader'
import { EmptyState } from '@/components/dashboard/ui/EmptyState'
import { LoadingState } from '@/components/dashboard/ui/LoadingState'
import { StatusBadge } from '@/components/dashboard/ui/StatusBadge'
import { FormModal } from '@/components/dashboard/ui/FormModal'
import { ConfirmDialog } from '@/components/dashboard/ui/ConfirmDialog'
import { Toast, useToast } from '@/components/ui/toast'

export default function ProjectsPage() {
    const [statusFilter, setStatusFilter] = useState<UploadStatus | 'all'>('all')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [newProject, setNewProject] = useState({ title: '', slug: '', description: '' })
    const [pendingDelete, setPendingDelete] = useState<{ id: string; title: string } | null>(null)
    const { toast, showToast, hideToast } = useToast()

    const { data: projects, isLoading, refetch } = useProjects(statusFilter)
    const deleteMutation = useDeleteProject()
    const createMutation = useCreateProject()

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await createMutation.mutateAsync(newProject)
            setShowCreateModal(false)
            setNewProject({ title: '', slug: '', description: '' })
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Failed to create project', 'error')
        }
    }

    const generateSlug = (title: string) =>
        title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

    return (
        <div className="space-y-6">
            {toast && <Toast message={toast.message} type={toast.type} duration={toast.duration} onClose={hideToast} />}
            <PageHeader
                title="Projects"
                description="Manage your projects and their content"
                actions={
                    <>
                        <Button variant="outline" size="sm" onClick={() => refetch()}>
                            <RefreshCw className={cn("mr-1 h-4 w-4", isLoading && "animate-spin")} />
                            Refresh
                        </Button>
                        <Button size="sm" onClick={() => setShowCreateModal(true)}>
                            <Plus className="mr-1 h-4 w-4" />
                            New Project
                        </Button>
                    </>
                }
            />

            <div className="flex flex-wrap gap-2">
                {(['all', 'draft', 'published', 'archived'] as const).map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={cn(
                            'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                            statusFilter === status
                                ? 'bg-purdue-gold text-purdue-black'
                                : 'bg-muted text-muted-foreground hover:text-foreground'
                        )}
                    >
                        {status === 'all' ? 'All' : status}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <LoadingState />
            ) : projects?.length === 0 ? (
                <EmptyState
                    title="No projects found"
                    icon={<FolderOpen className="mx-auto h-10 w-10" />}
                    action={
                        <Button onClick={() => setShowCreateModal(true)}>
                            <Plus className="mr-1 h-4 w-4" />
                            Create your first project
                        </Button>
                    }
                />
            ) : (
                <div className="grid gap-4">
                    {projects?.map((project) => (
                        <div key={project.id} className="lab-plate rounded-2xl p-6">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex-1">
                                    <div className="mb-2 flex flex-wrap items-center gap-3">
                                        <h3 className="text-lg font-semibold">{project.title}</h3>
                                        <StatusBadge status={project.status || 'draft'} />
                                        {project.category ? (
                                            <span className="rounded-full bg-purdue-gold/15 px-2 py-0.5 text-xs text-purdue-gold">
                                                {project.category.name}
                                            </span>
                                        ) : null}
                                    </div>
                                    <p className="mb-2 font-mono text-sm text-muted-foreground">/{project.slug}</p>
                                    {project.description ? (
                                        <p className="line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
                                    ) : null}
                                </div>
                                <div className="flex gap-2">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/projects/${project.slug}`}>
                                            <Eye className="mr-1 h-4 w-4" />
                                            View
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/dashboard/projects/${project.id}`}>
                                            <Edit className="mr-1 h-4 w-4" />
                                            Edit
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPendingDelete({ id: project.id, title: project.title })}
                                        disabled={deleteMutation.isPending}
                                        aria-label={`Delete ${project.title}`}
                                        className="text-red-400"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <FormModal
                open={showCreateModal}
                title="Create New Project"
                onClose={() => setShowCreateModal(false)}
            >
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label htmlFor="project-title" className="mb-1 block text-sm font-medium">Title</label>
                        <input
                            id="project-title"
                            type="text"
                            value={newProject.title}
                            onChange={(e) => setNewProject({
                                ...newProject,
                                title: e.target.value,
                                slug: generateSlug(e.target.value),
                            })}
                            className="w-full rounded-lg border border-input bg-input/30 px-3 py-2 outline-none focus:ring-2 focus:ring-purdue-gold"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="project-slug" className="mb-1 block text-sm font-medium">Slug</label>
                        <input
                            id="project-slug"
                            type="text"
                            value={newProject.slug}
                            onChange={(e) => setNewProject({ ...newProject, slug: e.target.value })}
                            className="w-full rounded-lg border border-input bg-input/30 px-3 py-2 outline-none focus:ring-2 focus:ring-purdue-gold"
                            pattern="^[a-z0-9-]+$"
                            title="Lowercase letters, numbers, and hyphens only"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="project-description" className="mb-1 block text-sm font-medium">Description</label>
                        <textarea
                            id="project-description"
                            value={newProject.description}
                            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                            className="w-full rounded-lg border border-input bg-input/30 px-3 py-2 outline-none focus:ring-2 focus:ring-purdue-gold"
                            rows={3}
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                        <Button type="submit" disabled={createMutation.isPending}>
                            {createMutation.isPending ? 'Creating...' : 'Create'}
                        </Button>
                    </div>
                </form>
            </FormModal>

            <ConfirmDialog
                open={Boolean(pendingDelete)}
                title="Delete project"
                description={pendingDelete ? `Are you sure you want to delete "${pendingDelete.title}"?` : ''}
                confirmLabel="Delete"
                destructive
                onClose={() => setPendingDelete(null)}
                onConfirm={() => {
                    if (pendingDelete) deleteMutation.mutate(pendingDelete.id)
                    setPendingDelete(null)
                }}
            />
        </div>
    )
}
