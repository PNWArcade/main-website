"use client"

import { useState } from 'react'
import {
    useProjectArticles,
    useCreateProjectArticle,
    useUpdateProjectArticle,
    useDeleteProjectArticle,
    useArticleCategories,
    useCreateArticleCategory,
} from '@/hooks/useProjects'
import { Button } from '@/components/ui/buttons/Button'
import TiptapEditor from '@/components/editor/TiptapEditor'
import ImageUploader, { uploadImageToBucket } from '@/components/ui/ImageUploader'
import type { Article, UploadStatus } from '@/lib/schemas/project'
import { useConfirm } from '@/components/dashboard/ui/useConfirm'
import { Plus, Trash2, RefreshCw, Save } from 'lucide-react'
import { statusOptions } from '@/components/dashboard/projects/statusOptions'

export function ArticlesTab({ projectId }: { projectId: string }) {
    const { confirm, dialog } = useConfirm()
    const { data: articles, isLoading } = useProjectArticles(projectId)
    const { data: categories } = useArticleCategories()
    const createMutation = useCreateProjectArticle()
    const updateMutation = useUpdateProjectArticle()
    const deleteMutation = useDeleteProjectArticle()
    const createCategoryMutation = useCreateArticleCategory()

    const [showCreate, setShowCreate] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [showCreateCategory, setShowCreateCategory] = useState(false)
    const [newCategoryName, setNewCategoryName] = useState('')
    const [newArticle, setNewArticle] = useState<{ 
        title: string; 
        slug: string; 
        description: string; 
        status: 'draft' | 'published' | 'archived';
        category_id: string;
        author_name: string;
        time_to_read: number | undefined;
    }>({ title: '', slug: '', description: '', status: 'published', category_id: '', author_name: '', time_to_read: undefined })
    // Local state for editing article with previewMode
    const [editingArticle, setEditingArticle] = useState<{ 
        content: string; 
        image_url: string; 
        pendingImage: File | null;
        category_id: string;
        author_name: string;
        time_to_read: number | undefined;
    } | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        await createMutation.mutateAsync({ projectId, data: {
            ...newArticle,
            category_id: newArticle.category_id || undefined,
            author_name: newArticle.author_name || undefined,
        } })
        setShowCreate(false)
        setNewArticle({ title: '', slug: '', description: '', status: 'published', category_id: '', author_name: '', time_to_read: undefined })
    }

    const handleDelete = async (articleId: string) => {
        if (!(await confirm('Delete this article?', 'This cannot be undone.'))) return
        await deleteMutation.mutateAsync({ projectId, articleId })
    }

    const handleStartEditing = (article: Article) => {
        setEditingId(article.id)
        setEditingArticle({
            content: article.content || '',
            image_url: article.image_url || '',
            pendingImage: null,
            category_id: article.category_id || '',
            author_name: article.author_name || '',
            time_to_read: article.time_to_read ?? undefined,
        })
    }

    const handleStopEditing = () => {
        setEditingId(null)
        setEditingArticle(null)
    }

    const handleSaveArticle = async (articleId: string) => {
        if (!editingArticle) return
        setIsSaving(true)
        try {
            let finalImageUrl = editingArticle.image_url
            // Upload pending image if exists
            if (editingArticle.pendingImage) {
                finalImageUrl = await uploadImageToBucket(editingArticle.pendingImage, 'articles')
            }
            await updateMutation.mutateAsync({
                projectId,
                articleId,
                data: {
                    content: editingArticle.content,
                    image_url: finalImageUrl,
                    category_id: editingArticle.category_id || undefined,
                    author_name: editingArticle.author_name || undefined,
                    time_to_read: editingArticle.time_to_read,
                },
            })
            handleStopEditing()
        } finally {
            setIsSaving(false)
        }
    }

    const handleUpdateStatus = async (articleId: string, status: UploadStatus) => {
        await updateMutation.mutateAsync({ projectId, articleId, data: { status } })
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
                    Add Article
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowCreateCategory(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Category
                </Button>
            </div>

            {/* Articles List */}
            {articles?.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                    <p className="text-muted-foreground mb-4">No articles yet</p>
                    <Button onClick={() => setShowCreate(true)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Create first article
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {articles?.map((article) => (
                        <div key={article.id} className="bg-card border border-border rounded-lg overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 bg-muted border-b">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <h3 className="font-medium">{article.title}</h3>
                                        <p className="text-sm text-muted-foreground">/{article.slug}</p>
                                    </div>
                                    <select
                                        value={article.status || 'draft'}
                                        onChange={(e) => handleUpdateStatus(article.id, e.target.value as UploadStatus)}
                                        className="text-xs border border-border rounded px-2 py-1"
                                    >
                                        {statusOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => editingId === article.id ? handleStopEditing() : handleStartEditing(article)}
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        {editingId === article.id ? 'Collapse' : 'Edit Content'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(article.id)}
                                        className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            {editingId === article.id && editingArticle && (
                                <div className="p-4 space-y-4">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-muted-foreground mb-1">Category</label>
                                            <select
                                                value={editingArticle.category_id}
                                                onChange={(e) => setEditingArticle({ ...editingArticle, category_id: e.target.value })}
                                                className="w-full border border-input rounded-lg px-3 py-2 text-sm"
                                            >
                                                <option value="">Select category...</option>
                                                {categories?.map((cat) => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-muted-foreground mb-1">Author Name</label>
                                            <input
                                                type="text"
                                                value={editingArticle.author_name}
                                                onChange={(e) => setEditingArticle({ ...editingArticle, author_name: e.target.value })}
                                                className="w-full border border-input rounded-lg px-3 py-2 text-sm"
                                                placeholder="e.g. John Doe"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-muted-foreground mb-1">Time to Read (min)</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={editingArticle.time_to_read ?? ''}
                                                onChange={(e) => setEditingArticle({ ...editingArticle, time_to_read: e.target.value ? parseInt(e.target.value) : undefined })}
                                                className="w-full border border-input rounded-lg px-3 py-2 text-sm"
                                                placeholder="5"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-2">Featured Image</label>
                                        <ImageUploader
                                            value={editingArticle.image_url}
                                            onChange={(url) => setEditingArticle({ ...editingArticle, image_url: url, pendingImage: null })}
                                            onFileSelect={(file) => setEditingArticle({ ...editingArticle, pendingImage: file })}
                                            folder="articles"
                                            aspectRatio="auto"
                                            previewMode
                                            maxHeight={120}
                                            className="max-w-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-2">Article Content</label>
                                        <TiptapEditor
                                            content={editingArticle.content}
                                            onChange={(content) => setEditingArticle({ ...editingArticle, content })}
                                            placeholder="Write your article content..."
                                            minHeight={500}
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <Button onClick={() => handleSaveArticle(article.id)} disabled={isSaving}>
                                            <Save className="h-4 w-4 mr-1" />
                                            {isSaving ? 'Saving...' : 'Save Article'}
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
                        <h2 className="text-xl font-bold mb-4">Create Article</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Title</label>
                                <input
                                    type="text"
                                    value={newArticle.title}
                                    onChange={(e) => setNewArticle({
                                        ...newArticle,
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
                                    value={newArticle.slug}
                                    onChange={(e) => setNewArticle({ ...newArticle, slug: e.target.value })}
                                    className="w-full border border-input rounded-lg px-3 py-2"
                                    pattern="^[a-z0-9-]+$"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
                                <textarea
                                    value={newArticle.description}
                                    onChange={(e) => setNewArticle({ ...newArticle, description: e.target.value })}
                                    className="w-full border border-input rounded-lg px-3 py-2"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Status</label>
                                <select
                                    value={newArticle.status}
                                    onChange={(e) => setNewArticle({ ...newArticle, status: e.target.value as 'draft' | 'published' | 'archived' })}
                                    className="w-full border border-input rounded-lg px-3 py-2"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Category</label>
                                <select
                                    value={newArticle.category_id}
                                    onChange={(e) => setNewArticle({ ...newArticle, category_id: e.target.value })}
                                    className="w-full border border-input rounded-lg px-3 py-2"
                                >
                                    <option value="">Select category...</option>
                                    {categories?.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Author Name</label>
                                <input
                                    type="text"
                                    value={newArticle.author_name}
                                    onChange={(e) => setNewArticle({ ...newArticle, author_name: e.target.value })}
                                    className="w-full border border-input rounded-lg px-3 py-2"
                                    placeholder="e.g. John Doe"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">Time to Read (min)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={newArticle.time_to_read ?? ''}
                                        onChange={(e) => setNewArticle({ ...newArticle, time_to_read: e.target.value ? parseInt(e.target.value) : undefined })}
                                        className="w-full border border-input rounded-lg px-3 py-2"
                                        placeholder="5"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                                <Button type="submit" disabled={createMutation.isPending}>Create</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Category Modal */}
            {showCreateCategory && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-lg p-6 w-full max-w-sm">
                        <h2 className="text-lg font-bold mb-4">Create Category</h2>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault()
                                if (!newCategoryName.trim()) return
                                const slug = newCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                                await createCategoryMutation.mutateAsync({ name: newCategoryName, slug })
                                setNewCategoryName('')
                                setShowCreateCategory(false)
                            }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Category Name</label>
                                <input
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    className="w-full border border-input rounded-lg px-3 py-2"
                                    placeholder="e.g. Technology, Research"
                                    autoFocus
                                    required
                                />
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button type="button" variant="outline" onClick={() => { setShowCreateCategory(false); setNewCategoryName('') }}>Cancel</Button>
                                <Button type="submit" disabled={createCategoryMutation.isPending}>
                                    {createCategoryMutation.isPending ? 'Creating...' : 'Create'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

// ========================
// Sponsors Tab
// ========================
