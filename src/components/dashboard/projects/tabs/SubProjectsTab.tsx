"use client"

import { useState } from 'react'
import {
    useSubProjects,
    useCreateSubProject,
    useUpdateSubProject,
    useDeleteSubProject,
} from '@/hooks/useProjects'
import { Button } from '@/components/ui/buttons/Button'
import TiptapEditor from '@/components/editor/TiptapEditor'
import ImageUploader, { uploadImageToBucket } from '@/components/ui/ImageUploader'
import type { SubProject } from '@/lib/schemas/project'
import { useConfirm } from '@/components/dashboard/ui/useConfirm'
import { Plus, Trash2, RefreshCw, Save } from 'lucide-react'
import { statusOptions } from '@/components/dashboard/projects/statusOptions'

export function SubProjectsTab({ projectId }: { projectId: string }) {
    const { confirm, dialog } = useConfirm()
    const { data: subProjects, isLoading } = useSubProjects(projectId)
    const createMutation = useCreateSubProject()
    const updateMutation = useUpdateSubProject()
    const deleteMutation = useDeleteSubProject()

    const [showCreate, setShowCreate] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [newSubProject, setNewSubProject] = useState<{ title: string; slug: string; description: string; status: 'draft' | 'published' | 'archived'; author_name: string }>({ title: '', slug: '', description: '', status: 'published', author_name: '' })
    // Local state for editing sub-project with previewMode
    const [editingSubProject, setEditingSubProject] = useState<{ content: string; image_url: string; pendingImage: File | null; author_name: string } | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        await createMutation.mutateAsync({ projectId, data: newSubProject })
        setShowCreate(false)
        setNewSubProject({ title: '', slug: '', description: '', status: 'published', author_name: '' })
    }

    const handleDelete = async (subProjectId: string) => {
        if (!(await confirm('Delete this sub-project?', 'This cannot be undone.'))) return
        await deleteMutation.mutateAsync({ projectId, subProjectId })
    }

    const handleStartEditing = (subProject: SubProject) => {
        setEditingId(subProject.id)
        setEditingSubProject({
            content: subProject.content || '',
            image_url: subProject.image_url || '',
            pendingImage: null,
            author_name: subProject.author_name || '',
        })
    }

    const handleStopEditing = () => {
        setEditingId(null)
        setEditingSubProject(null)
    }

    const handleSaveSubProject = async (subProjectId: string) => {
        if (!editingSubProject) return
        setIsSaving(true)
        try {
            let finalImageUrl = editingSubProject.image_url
            // Upload pending image if exists
            if (editingSubProject.pendingImage) {
                finalImageUrl = await uploadImageToBucket(editingSubProject.pendingImage, 'sub-projects')
            }
            await updateMutation.mutateAsync({
                projectId,
                subProjectId,
                data: {
                    content: editingSubProject.content,
                    image_url: finalImageUrl,
                    author_name: editingSubProject.author_name || undefined,
                },
            })
            handleStopEditing()
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return <div className="flex justify-center py-8"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
    }

    return (
        <div className="space-y-6">
            {dialog}
            {/* Actions */}
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowCreate(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Sub-Project
                </Button>
            </div>

            {/* Sub-Projects List */}
            {subProjects?.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                    <p className="text-muted-foreground mb-4">No sub-projects yet</p>
                    <Button onClick={() => setShowCreate(true)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Create first sub-project
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {subProjects?.map((subProject) => (
                        <div key={subProject.id} className="bg-card border border-border rounded-lg overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 bg-muted border-b">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <h3 className="font-medium">{subProject.title}</h3>
                                        <p className="text-sm text-muted-foreground">/{subProject.slug}</p>
                                    </div>
                                    <select
                                        value={subProject.status || 'draft'}
                                        onChange={async (e) => {
                                            await updateMutation.mutateAsync({
                                                projectId,
                                                subProjectId: subProject.id,
                                                data: { status: e.target.value as 'draft' | 'published' | 'archived' }
                                            })
                                        }}
                                        className="text-xs border border-border rounded px-2 py-1"
                                    >
                                        {statusOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => editingId === subProject.id ? handleStopEditing() : handleStartEditing(subProject)}
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        {editingId === subProject.id ? 'Collapse' : 'Edit Content'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(subProject.id)}
                                        className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            {editingId === subProject.id && editingSubProject && (
                                <div className="p-4 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-1">Author Name</label>
                                        <input
                                            type="text"
                                            value={editingSubProject.author_name}
                                            onChange={(e) => setEditingSubProject({ ...editingSubProject, author_name: e.target.value })}
                                            className="w-full border border-input rounded-lg px-3 py-2 text-sm"
                                            placeholder="e.g. John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-2">Hero Image</label>
                                        <ImageUploader
                                            value={editingSubProject.image_url}
                                            onChange={(url) => setEditingSubProject({ ...editingSubProject, image_url: url, pendingImage: null })}
                                            onFileSelect={(file) => setEditingSubProject({ ...editingSubProject, pendingImage: file })}
                                            folder="sub-projects"
                                            aspectRatio="auto"
                                            previewMode
                                            maxHeight={120}
                                            className="max-w-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-2">Content</label>
                                        <TiptapEditor
                                            content={editingSubProject.content}
                                            onChange={(content) => setEditingSubProject({ ...editingSubProject, content })}
                                            placeholder="Write your sub-project content..."
                                            minHeight={500}
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <Button onClick={() => handleSaveSubProject(subProject.id)} disabled={isSaving}>
                                            <Save className="h-4 w-4 mr-1" />
                                            {isSaving ? 'Saving...' : 'Save Sub-Project'}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Create Sub-Project</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Title</label>
                                <input
                                    type="text"
                                    value={newSubProject.title}
                                    onChange={(e) => setNewSubProject({
                                        ...newSubProject,
                                        title: e.target.value,
                                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                                    })}
                                    className="w-full border border-input rounded-lg px-3 py-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Slug</label>
                                <input
                                    type="text"
                                    value={newSubProject.slug}
                                    onChange={(e) => setNewSubProject({ ...newSubProject, slug: e.target.value })}
                                    className="w-full border border-input rounded-lg px-3 py-2"
                                    pattern="^[a-z0-9-]+$"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
                                <textarea
                                    value={newSubProject.description}
                                    onChange={(e) => setNewSubProject({ ...newSubProject, description: e.target.value })}
                                    className="w-full border border-input rounded-lg px-3 py-2"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Status</label>
                                <select
                                    value={newSubProject.status}
                                    onChange={(e) => setNewSubProject({ ...newSubProject, status: e.target.value as 'draft' | 'published' | 'archived' })}
                                    className="w-full border border-input rounded-lg px-3 py-2"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Author Name</label>
                                <input
                                    type="text"
                                    value={newSubProject.author_name}
                                    onChange={(e) => setNewSubProject({ ...newSubProject, author_name: e.target.value })}
                                    className="w-full border border-input rounded-lg px-3 py-2"
                                    placeholder="e.g. John Doe"
                                />
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                                <Button type="submit" disabled={createMutation.isPending}>Create</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

// ========================
// Articles Tab
// ========================
