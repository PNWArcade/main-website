"use client"

import { useState } from 'react'
import {
    useProjectSponsors,
    useCreateProjectSponsor,
    useUpdateProjectSponsor,
    useDeleteProjectSponsor,
} from '@/hooks/useProjects'
import { Button } from '@/components/ui/buttons/Button'
import ImageUploader, { uploadImageToBucket } from '@/components/ui/ImageUploader'
import type { ProjectSponsor } from '@/lib/schemas/project'
import { useConfirm } from '@/components/dashboard/ui/useConfirm'
import { Plus, Trash2, RefreshCw, Heart } from 'lucide-react'

export function SponsorsTab({ projectId }: { projectId: string }) {
    const { confirm, dialog } = useConfirm()
    const { data: sponsors, isLoading } = useProjectSponsors(projectId)
    const createMutation = useCreateProjectSponsor()
    const updateMutation = useUpdateProjectSponsor()
    const deleteMutation = useDeleteProjectSponsor()

    const [showCreate, setShowCreate] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [newSponsor, setNewSponsor] = useState({ name: '', logo_url: '', website_url: '', description: '' })
    const [editSponsor, setEditSponsor] = useState({ name: '', logo_url: '', website_url: '', description: '' })
    const [pendingLogo, setPendingLogo] = useState<File | null>(null)
    const [editPendingLogo, setEditPendingLogo] = useState<File | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            let logoUrl = newSponsor.logo_url
            if (pendingLogo) {
                logoUrl = await uploadImageToBucket(pendingLogo, 'sponsors')
            }
            await createMutation.mutateAsync({ 
                projectId, 
                data: { 
                    ...newSponsor, 
                    logo_url: logoUrl || undefined,
                } 
            })
            setShowCreate(false)
            setNewSponsor({ name: '', logo_url: '', website_url: '', description: '' })
            setPendingLogo(null)
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (sponsorId: string) => {
        if (!(await confirm('Delete this sponsor?', 'This cannot be undone.'))) return
        await deleteMutation.mutateAsync({ projectId, sponsorId })
    }

    const handleStartEditing = (sponsor: ProjectSponsor) => {
        setEditingId(sponsor.id)
        setEditSponsor({
            name: sponsor.name,
            logo_url: sponsor.logo_url || '',
            website_url: sponsor.website_url || '',
            description: sponsor.description || '',
        })
        setEditPendingLogo(null)
    }

    const handleStopEditing = () => {
        setEditingId(null)
        setEditSponsor({ name: '', logo_url: '', website_url: '', description: '' })
        setEditPendingLogo(null)
    }

    const handleUpdate = async (e: React.FormEvent, sponsorId: string) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            let logoUrl = editSponsor.logo_url
            if (editPendingLogo) {
                logoUrl = await uploadImageToBucket(editPendingLogo, 'sponsors')
            }
            await updateMutation.mutateAsync({
                projectId,
                sponsorId,
                data: {
                    ...editSponsor,
                    logo_url: logoUrl || undefined,
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
                    Add Sponsor
                </Button>
            </div>

            {/* Sponsors List */}
            {sponsors?.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                    <p className="text-muted-foreground mb-4">No sponsors yet</p>
                    <Button onClick={() => setShowCreate(true)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add first sponsor
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sponsors?.map((sponsor) => (
                        <div key={sponsor.id} className="bg-card border border-border rounded-lg overflow-hidden">
                            <div className="p-4">
                                {sponsor.logo_url ? (
                                    <img src={sponsor.logo_url} alt={sponsor.name} className="h-16 w-auto object-contain mb-3" />
                                ) : (
                                    <div className="h-16 w-16 bg-secondary rounded flex items-center justify-center mb-3">
                                        <Heart className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                )}
                                <h3 className="font-medium">{sponsor.name}</h3>
                                {sponsor.description && (
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{sponsor.description}</p>
                                )}
                                {sponsor.website_url && (
                                    <a href={sponsor.website_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline mt-2 block">
                                        Visit website
                                    </a>
                                )}
                            </div>
                            <div className="border-t border-border px-4 py-2 bg-muted flex justify-between">
                                <button
                                    onClick={() => handleStartEditing(sponsor)}
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(sponsor.id)}
                                    className="text-sm text-red-600 hover:underline"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Sponsor Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">Add Sponsor</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Name *</label>
                                <input
                                    type="text"
                                    value={newSponsor.name}
                                    onChange={(e) => setNewSponsor({ ...newSponsor, name: e.target.value })}
                                    className="w-full border border-input rounded-lg px-3 py-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Logo</label>
                                <ImageUploader
                                    value={newSponsor.logo_url}
                                    onChange={(url) => { setNewSponsor({ ...newSponsor, logo_url: url }); setPendingLogo(null) }}
                                    onFileSelect={(file) => setPendingLogo(file)}
                                    folder="sponsors"
                                    aspectRatio="auto"
                                    previewMode
                                    maxHeight={100}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Website URL</label>
                                <input
                                    type="url"
                                    value={newSponsor.website_url}
                                    onChange={(e) => setNewSponsor({ ...newSponsor, website_url: e.target.value })}
                                    className="w-full border border-input rounded-lg px-3 py-2"
                                    placeholder="https://example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
                                <textarea
                                    value={newSponsor.description}
                                    onChange={(e) => setNewSponsor({ ...newSponsor, description: e.target.value })}
                                    className="w-full border border-input rounded-lg px-3 py-2"
                                    rows={3}
                                    placeholder="Brief description of the sponsor..."
                                />
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button type="button" variant="outline" onClick={() => { setShowCreate(false); setNewSponsor({ name: '', logo_url: '', website_url: '', description: '' }); setPendingLogo(null) }}>Cancel</Button>
                                <Button type="submit" disabled={createMutation.isPending || isSaving}>
                                    {isSaving ? 'Adding...' : 'Add Sponsor'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Sponsor Modal */}
            {editingId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">Edit Sponsor</h2>
                        <form onSubmit={(e) => handleUpdate(e, editingId)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Name *</label>
                                <input
                                    type="text"
                                    value={editSponsor.name}
                                    onChange={(e) => setEditSponsor({ ...editSponsor, name: e.target.value })}
                                    className="w-full border border-input rounded-lg px-3 py-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Logo</label>
                                <ImageUploader
                                    value={editSponsor.logo_url}
                                    onChange={(url) => { setEditSponsor({ ...editSponsor, logo_url: url }); setEditPendingLogo(null) }}
                                    onFileSelect={(file) => setEditPendingLogo(file)}
                                    folder="sponsors"
                                    aspectRatio="auto"
                                    previewMode
                                    maxHeight={100}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Website URL</label>
                                <input
                                    type="url"
                                    value={editSponsor.website_url}
                                    onChange={(e) => setEditSponsor({ ...editSponsor, website_url: e.target.value })}
                                    className="w-full border border-input rounded-lg px-3 py-2"
                                    placeholder="https://example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
                                <textarea
                                    value={editSponsor.description}
                                    onChange={(e) => setEditSponsor({ ...editSponsor, description: e.target.value })}
                                    className="w-full border border-input rounded-lg px-3 py-2"
                                    rows={3}
                                />
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button type="button" variant="outline" onClick={handleStopEditing}>Cancel</Button>
                                <Button type="submit" disabled={updateMutation.isPending || isSaving}>
                                    {isSaving ? 'Saving...' : 'Save Changes'}
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
// Settings Tab
// ========================
