"use client"

import { useState } from 'react'
import { RefreshCw, Plus, Trash2, Heart, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/buttons/Button'
import ImageUploader, { uploadImageToBucket } from '@/components/ui/ImageUploader'
import { useSponsors, useCreateSponsor, useUpdateSponsor, useDeleteSponsor } from '@/hooks/useProjects'
import type { Sponsor, SponsorTier } from '@/lib/schemas/project'

const tierOptions: { value: SponsorTier; label: string; color: string }[] = [
    { value: 'platinum', label: 'Platinum', color: 'bg-gray-100 text-gray-800' },
    { value: 'gold', label: 'Gold', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'silver', label: 'Silver', color: 'bg-gray-200 text-gray-700' },
    { value: 'bronze', label: 'Bronze', color: 'bg-amber-100 text-amber-800' },
]

export default function SponsorsPage() {
    const { data: sponsors, isLoading, refetch } = useSponsors()
    const createMutation = useCreateSponsor()
    const updateMutation = useUpdateSponsor()
    const deleteMutation = useDeleteSponsor()

    const [showCreate, setShowCreate] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [newSponsor, setNewSponsor] = useState({ name: '', logo_url: '', tier: 'gold' as SponsorTier, description: '', order_index: '', link: '' })
    const [editSponsor, setEditSponsor] = useState({ name: '', logo_url: '', tier: 'gold' as SponsorTier, description: '', order_index: '', link: '' })
    const [pendingLogo, setPendingLogo] = useState<File | null>(null)
    const [editPendingLogo, setEditPendingLogo] = useState<File | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    // Group sponsors by tier
    const sponsorsByTier = {
        platinum: sponsors?.filter(s => s.tier === 'platinum') || [],
        gold: sponsors?.filter(s => s.tier === 'gold') || [],
        silver: sponsors?.filter(s => s.tier === 'silver') || [],
        bronze: sponsors?.filter(s => s.tier === 'bronze') || [],
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            let logoUrl = newSponsor.logo_url
            if (pendingLogo) {
                logoUrl = await uploadImageToBucket(pendingLogo, 'sponsors')
            }
            await createMutation.mutateAsync({
                name: newSponsor.name,
                tier: newSponsor.tier,
                logo_url: logoUrl || undefined,
                link: newSponsor.link || undefined,
                description: newSponsor.description || undefined,
                order_index: newSponsor.order_index ? parseInt(newSponsor.order_index) : undefined,
            })
            setShowCreate(false)
            setNewSponsor({ name: '', logo_url: '', tier: 'gold', description: '', order_index: '', link: '' })
            setPendingLogo(null)
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this sponsor?')) return
        await deleteMutation.mutateAsync(id)
    }

    const handleStartEditing = (sponsor: Sponsor) => {
        setEditingId(sponsor.id)
        setEditSponsor({
            name: sponsor.name,
            logo_url: sponsor.logo_url || '',
            tier: sponsor.tier,
            description: sponsor.description || '',
            order_index: sponsor.order_index?.toString() || '',
            link: sponsor.link || '',
        })
        setEditPendingLogo(null)
    }

    const handleStopEditing = () => {
        setEditingId(null)
        setEditSponsor({ name: '', logo_url: '', tier: 'gold', description: '', order_index: '', link: '' })
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
                id: sponsorId,
                data: {
                    name: editSponsor.name,
                    tier: editSponsor.tier,
                    logo_url: logoUrl || undefined,
                    link: editSponsor.link || undefined,
                    description: editSponsor.description || undefined,
                    order_index: editSponsor.order_index ? parseInt(editSponsor.order_index) : undefined,
                },
            })
            handleStopEditing()
        } finally {
            setIsSaving(false)
        }
    }

    const getTierBadge = (tier: SponsorTier) => {
        const option = tierOptions.find(t => t.value === tier)
        return (
            <span className={`text-xs px-2 py-1 rounded-full ${option?.color}`}>
                {option?.label}
            </span>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-purdue-black">Sponsors</h1>
                    <p className="text-gray-500">Manage organization sponsors displayed on the home page</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => refetch()}>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Refresh
                    </Button>
                    <Button size="sm" onClick={() => setShowCreate(true)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Sponsor
                    </Button>
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex justify-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                </div>
            )}

            {/* Sponsors by Tier */}
            {!isLoading && (
                <div className="space-y-8">
                    {tierOptions.map(tier => (
                        <div key={tier.value}>
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full ${tier.color}`}>{tier.label} Sponsors</span>
                                <span className="text-gray-400 text-sm font-normal">
                                    ({sponsorsByTier[tier.value].length})
                                </span>
                            </h2>
                            
                            {sponsorsByTier[tier.value].length === 0 ? (
                                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                                    <p className="text-gray-400">No {tier.label.toLowerCase()} sponsors</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {sponsorsByTier[tier.value].map((sponsor) => (
                                        <div key={sponsor.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                            <div className="p-4">
                                                {sponsor.logo_url ? (
                                                    <img src={sponsor.logo_url} alt={sponsor.name} className="h-16 w-auto object-contain mb-3 mx-auto" />
                                                ) : (
                                                    <div className="h-16 w-16 bg-gray-100 rounded flex items-center justify-center mb-3 mx-auto">
                                                        <Heart className="h-8 w-8 text-gray-400" />
                                                    </div>
                                                )}
                                                <h3 className="font-medium text-center">{sponsor.name}</h3>
                                                {sponsor.description && (
                                                    <p className="text-xs text-gray-500 text-center mt-1 line-clamp-2">{sponsor.description}</p>
                                                )}
                                                <div className="flex justify-center items-center gap-2 mt-2">
                                                    {getTierBadge(sponsor.tier)}
                                                    {sponsor.order_index !== null && (
                                                        <span className="text-xs text-gray-400">#{sponsor.order_index}</span>
                                                    )}
                                                    {sponsor.link && (
                                                        <a href={sponsor.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                                                            <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="border-t border-gray-100 px-4 py-2 bg-gray-50 flex justify-between">
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
                        </div>
                    ))}
                </div>
            )}

            {/* Create Sponsor Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">Add Sponsor</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                <input
                                    type="text"
                                    value={newSponsor.name}
                                    onChange={(e) => setNewSponsor({ ...newSponsor, name: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tier *</label>
                                <select
                                    value={newSponsor.tier}
                                    onChange={(e) => setNewSponsor({ ...newSponsor, tier: e.target.value as SponsorTier })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                >
                                    {tierOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={newSponsor.description}
                                    onChange={(e) => setNewSponsor({ ...newSponsor, description: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    rows={3}
                                    placeholder="Optional description"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
                                <input
                                    type="url"
                                    value={newSponsor.link}
                                    onChange={(e) => setNewSponsor({ ...newSponsor, link: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    placeholder="https://sponsor-website.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Order Index</label>
                                <input
                                    type="number"
                                    value={newSponsor.order_index}
                                    onChange={(e) => setNewSponsor({ ...newSponsor, order_index: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    placeholder="Lower numbers appear first"
                                />
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button type="button" variant="outline" onClick={() => { setShowCreate(false); setNewSponsor({ name: '', logo_url: '', tier: 'gold', description: '', order_index: '', link: '' }); setPendingLogo(null) }}>Cancel</Button>
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
                    <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">Edit Sponsor</h2>
                        <form onSubmit={(e) => handleUpdate(e, editingId)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                <input
                                    type="text"
                                    value={editSponsor.name}
                                    onChange={(e) => setEditSponsor({ ...editSponsor, name: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tier *</label>
                                <select
                                    value={editSponsor.tier}
                                    onChange={(e) => setEditSponsor({ ...editSponsor, tier: e.target.value as SponsorTier })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                >
                                    {tierOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={editSponsor.description}
                                    onChange={(e) => setEditSponsor({ ...editSponsor, description: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    rows={3}
                                    placeholder="Optional description"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
                                <input
                                    type="url"
                                    value={editSponsor.link}
                                    onChange={(e) => setEditSponsor({ ...editSponsor, link: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    placeholder="https://sponsor-website.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Order Index</label>
                                <input
                                    type="number"
                                    value={editSponsor.order_index}
                                    onChange={(e) => setEditSponsor({ ...editSponsor, order_index: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    placeholder="Lower numbers appear first"
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
