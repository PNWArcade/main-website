"use client"

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/buttons/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Toast, useToast } from '@/components/ui/toast'
import ImageUploader, { uploadImageToBucket } from '@/components/ui/ImageUploader'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faArrowsRotate,
    faPlus,
    faTrash,
    faPenToSquare,
    faXmark,
    faFloppyDisk,
    faEnvelope,
    faImage,
    faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons'
import { faLinkedin } from '@fortawesome/free-brands-svg-icons'

// ============ Types ============

interface TeamMemberOverride {
    id: string
    member_name: string
    custom_image_url: string | null
    linkedin_url: string | null
    email: string | null
    created_at: string | null
    updated_at: string | null
}

interface ScrapedMember {
    name: string
    position: string
    image: string
    original_image?: string
}

interface OverrideFormData {
    imageUrl: string
    pendingImage: File | null
    linkedinUrl: string
    email: string
}

type OverridePayload = {
    custom_image_url?: string | null
    linkedin_url?: string | null
    email?: string | null
}

// ============ API Helpers ============

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, options)
    if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error || `Request failed (${response.status})`)
    }
    return response.json()
}

const OVERRIDES_URL = '/api/dashboard/team-overrides'

async function fetchOverrides(): Promise<TeamMemberOverride[]> {
    const { data } = await apiFetch<{ data: TeamMemberOverride[] }>(OVERRIDES_URL)
    return data
}

async function fetchScrapedMembers(): Promise<ScrapedMember[]> {
    const { data } = await apiFetch<{ data: { leadership: ScrapedMember[]; officers: ScrapedMember[]; mentors: ScrapedMember[]; advisors: ScrapedMember[] } }>('/api/pnw-team')
    return [...data.leadership, ...data.officers, ...data.mentors, ...data.advisors]
}

async function createOverride(payload: { member_name: string } & OverridePayload): Promise<TeamMemberOverride> {
    const { data } = await apiFetch<{ data: TeamMemberOverride }>(OVERRIDES_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })
    return data
}

async function updateOverride(id: string, payload: OverridePayload): Promise<TeamMemberOverride> {
    const { data } = await apiFetch<{ data: TeamMemberOverride }>(`${OVERRIDES_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })
    return data
}

async function deleteOverride(id: string): Promise<void> {
    await apiFetch(`${OVERRIDES_URL}/${id}`, { method: 'DELETE' })
}

/** Upload pending file or fall back to the existing URL (or null). */
async function resolveImageUrl(pendingFile: File | null, existingUrl: string): Promise<string | null> {
    if (pendingFile) return uploadImageToBucket(pendingFile, 'team-overrides')
    return existingUrl || null
}

// ============ Shared Sub-Components ============

const EMPTY_FORM: OverrideFormData = { imageUrl: '', pendingImage: null, linkedinUrl: '', email: '' }

function OverrideFormFields({
    form,
    onChange,
}: {
    form: OverrideFormData
    onChange: <K extends keyof OverrideFormData>(key: K, value: OverrideFormData[K]) => void
}) {
    return (
        <>
            <div>
                <Label>Custom Image</Label>
                <ImageUploader
                    value={form.imageUrl}
                    onChange={(v) => onChange('imageUrl', v)}
                    onFileSelect={(f) => onChange('pendingImage', f)}
                    folder="team-overrides"
                    previewMode
                    aspectRatio="square"
                    maxHeight={120}
                    className="mt-1 max-w-40"
                />
            </div>

            <div>
                <Label>LinkedIn URL</Label>
                <div className="relative mt-1">
                    <FontAwesomeIcon icon={faLinkedin} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        type="url"
                        placeholder="https://linkedin.com/in/..."
                        value={form.linkedinUrl}
                        onChange={(e) => onChange('linkedinUrl', e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            <div>
                <Label>Email</Label>
                <div className="relative mt-1">
                    <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        type="email"
                        placeholder="member@example.com"
                        value={form.email}
                        onChange={(e) => onChange('email', e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>
        </>
    )
}

function SaveButton({ isSaving, disabled, label = 'Save' }: { isSaving: boolean; disabled?: boolean; label?: string }) {
    return (
        <Button type="submit" disabled={isSaving || disabled}>
            <FontAwesomeIcon
                icon={isSaving ? faArrowsRotate : faFloppyDisk}
                className={`h-4 w-4 mr-1 ${isSaving ? 'animate-spin' : ''}`}
            />
            {label}
        </Button>
    )
}

function ThumbnailImage({ src, alt, label, highlight }: { src: string; alt: string; label: string; highlight?: boolean }) {
    return (
        <div className="text-center">
            <img
                src={src}
                alt={alt}
                className={`w-16 h-16 rounded-full object-cover ${highlight ? 'border-2 border-yellow-400' : 'border border-gray-200'}`}
            />
            <span className={`text-[10px] block mt-1 ${highlight ? 'text-yellow-600' : 'text-gray-400'}`}>{label}</span>
        </div>
    )
}

// ============ Section Components ============

function PageHeader({ onRefresh, onAdd }: { onRefresh: () => void; onAdd: () => void }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-purdue-black">Team Member Overrides</h1>
                <p className="text-gray-500">
                    Customize images, LinkedIn, and email for web-scraped team members
                </p>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onRefresh}>
                    <FontAwesomeIcon icon={faArrowsRotate} className="h-4 w-4 mr-1" />
                    Refresh
                </Button>
                <Button size="sm" onClick={onAdd}>
                    <FontAwesomeIcon icon={faPlus} className="h-4 w-4 mr-1" />
                    Add Override
                </Button>
            </div>
        </div>
    )
}

function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <div className="relative max-w-sm">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
                placeholder="Search by name..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="pl-9"
            />
        </div>
    )
}

function LoadingSpinner() {
    return (
        <div className="flex justify-center py-12">
            <FontAwesomeIcon icon={faArrowsRotate} className="h-8 w-8 animate-spin text-gray-400" />
        </div>
    )
}

function EmptyState() {
    return (
        <div className="text-center py-12 text-gray-500">
            <FontAwesomeIcon icon={faImage} className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">No overrides yet</p>
            <p className="text-sm">
                Click &quot;Add Override&quot; to customize a team member&apos;s image, LinkedIn, or email.
            </p>
        </div>
    )
}

function CreateOverrideForm({
    availableMembers,
    membersLoading,
    isSaving,
    onSubmit,
    onCancel,
}: {
    availableMembers: ScrapedMember[]
    membersLoading: boolean
    isSaving: boolean
    onSubmit: (memberName: string, form: OverrideFormData) => Promise<void>
    onCancel: () => void
}) {
    const [selectedMember, setSelectedMember] = useState('')
    const [form, setForm] = useState<OverrideFormData>(EMPTY_FORM)

    const updateField = <K extends keyof OverrideFormData>(key: K, value: OverrideFormData[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await onSubmit(selectedMember, form)
    }

    return (
        <div className="border rounded-lg p-6 bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">New Override</h2>
                <Button variant="ghost" size="sm" onClick={onCancel}>
                    <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label>Team Member</Label>
                    {membersLoading ? (
                        <p className="text-sm text-gray-400 mt-1">Loading members...</p>
                    ) : availableMembers.length === 0 ? (
                        <p className="text-sm text-gray-500 mt-1">All scraped members already have overrides.</p>
                    ) : (
                        <select
                            value={selectedMember}
                            onChange={(e) => setSelectedMember(e.target.value)}
                            className="w-full mt-1 border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        >
                            <option value="">Select a member...</option>
                            {availableMembers.map((m) => (
                                <option key={m.name} value={m.name}>
                                    {m.name} — {m.position}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <OverrideFormFields form={form} onChange={updateField} />

                <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                    <SaveButton isSaving={isSaving} disabled={!selectedMember} label="Save Override" />
                </div>
            </form>
        </div>
    )
}

function OverrideViewMode({
    override,
    scraped,
    onEdit,
    onDelete,
}: {
    override: TeamMemberOverride
    scraped?: ScrapedMember
    onEdit: () => void
    onDelete: () => void
}) {
    return (
        <div className="p-4 flex items-center gap-4">
            {/* Thumbnails */}
            <div className="flex gap-2 shrink-0">
                {scraped && <ThumbnailImage src={scraped.original_image || scraped.image} alt="Original" label="Original" />}
                {override.custom_image_url && (
                    <ThumbnailImage src={override.custom_image_url} alt="Override" label="Override" highlight />
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{override.member_name}</h3>
                {scraped && <p className="text-xs text-gray-500">{scraped.position}</p>}
                <div className="flex items-center gap-3 mt-1">
                    {override.linkedin_url && (
                        <a
                            href={override.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#0A66C2] hover:underline text-xs flex items-center gap-1"
                        >
                            <FontAwesomeIcon icon={faLinkedin} className="h-3 w-3" />
                            LinkedIn
                        </a>
                    )}
                    {override.email && (
                        <span className="text-gray-500 text-xs flex items-center gap-1">
                            <FontAwesomeIcon icon={faEnvelope} className="h-3 w-3" />
                            {override.email}
                        </span>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="sm" onClick={onEdit}>
                    <FontAwesomeIcon icon={faPenToSquare} className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={onDelete}
                >
                    <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

function OverrideEditMode({
    override,
    isSaving,
    onSave,
    onCancel,
}: {
    override: TeamMemberOverride
    isSaving: boolean
    onSave: (form: OverrideFormData) => Promise<void>
    onCancel: () => void
}) {
    const [form, setForm] = useState<OverrideFormData>({
        imageUrl: override.custom_image_url || '',
        pendingImage: null,
        linkedinUrl: override.linkedin_url || '',
        email: override.email || '',
    })

    const updateField = <K extends keyof OverrideFormData>(key: K, value: OverrideFormData[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await onSave(form)
    }

    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{override.member_name}</h3>
                <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
                    <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
                </Button>
            </div>

            <OverrideFormFields form={form} onChange={updateField} />

            <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <SaveButton isSaving={isSaving} />
            </div>
        </form>
    )
}

function OverrideCard({
    override,
    scraped,
    isEditing,
    isSaving,
    onEdit,
    onDelete,
    onSave,
    onCancelEdit,
}: {
    override: TeamMemberOverride
    scraped?: ScrapedMember
    isEditing: boolean
    isSaving: boolean
    onEdit: () => void
    onDelete: () => void
    onSave: (form: OverrideFormData) => Promise<void>
    onCancelEdit: () => void
}) {
    return (
        <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
            {isEditing ? (
                <OverrideEditMode override={override} isSaving={isSaving} onSave={onSave} onCancel={onCancelEdit} />
            ) : (
                <OverrideViewMode override={override} scraped={scraped} onEdit={onEdit} onDelete={onDelete} />
            )}
        </div>
    )
}

// ============ Page Component ============

export default function TeamOverridesPage() {
    const queryClient = useQueryClient()
    const { toast, showToast, hideToast } = useToast()
    const [showCreate, setShowCreate] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    const { data: overrides, isLoading: overridesLoading, refetch } = useQuery({
        queryKey: ['team-overrides'],
        queryFn: fetchOverrides,
    })

    const { data: scrapedMembers, isLoading: membersLoading } = useQuery({
        queryKey: ['scraped-members'],
        queryFn: fetchScrapedMembers,
    })

    const invalidateOverrides = () => queryClient.invalidateQueries({ queryKey: ['team-overrides'] })

    const createMutation = useMutation({
        mutationFn: createOverride,
        onSuccess: () => { invalidateOverrides(); showToast('Override saved successfully', 'success'); setShowCreate(false) },
        onError: (err: Error) => showToast(err.message, 'error'),
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: OverridePayload }) => updateOverride(id, data),
        onSuccess: () => { invalidateOverrides(); showToast('Override updated successfully', 'success'); setEditingId(null) },
        onError: (err: Error) => showToast(err.message, 'error'),
    })

    const deleteMutation = useMutation({
        mutationFn: deleteOverride,
        onSuccess: () => { invalidateOverrides(); showToast('Override removed', 'success') },
        onError: (err: Error) => showToast(err.message, 'error'),
    })

    // Derived data
    const existingNames = new Set((overrides || []).map((o) => o.member_name.toLowerCase()))
    const availableMembers = (scrapedMembers || []).filter((m) => !existingNames.has(m.name.toLowerCase()))
    const filteredOverrides = (overrides || []).filter((o) =>
        o.member_name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    function findScrapedByName(name: string) {
        return scrapedMembers?.find((m) => m.name.toLowerCase() === name.toLowerCase())
    }

    async function handleCreate(memberName: string, form: OverrideFormData) {
        if (!memberName) { showToast('Select a team member first', 'warning'); return }
        setIsSaving(true)
        try {
            const imageUrl = await resolveImageUrl(form.pendingImage, form.imageUrl)
            await createMutation.mutateAsync({
                member_name: memberName,
                custom_image_url: imageUrl,
                linkedin_url: form.linkedinUrl || null,
                email: form.email || null,
            })
        } finally { setIsSaving(false) }
    }

    async function handleUpdate(overrideId: string, form: OverrideFormData) {
        setIsSaving(true)
        try {
            const imageUrl = await resolveImageUrl(form.pendingImage, form.imageUrl)
            await updateMutation.mutateAsync({
                id: overrideId,
                data: {
                    custom_image_url: imageUrl,
                    linkedin_url: form.linkedinUrl || null,
                    email: form.email || null,
                },
            })
        } finally { setIsSaving(false) }
    }

    function handleDelete(id: string) {
        if (!confirm('Remove this override? The member will revert to their scraped image.')) return
        deleteMutation.mutate(id)
    }

    return (
        <div className="space-y-6">
            {toast && <Toast message={toast.message} type={toast.type} duration={toast.duration} onClose={hideToast} />}

            <PageHeader onRefresh={() => refetch()} onAdd={() => setShowCreate(true)} />
            <SearchBar value={searchQuery} onChange={setSearchQuery} />

            {showCreate && (
                <CreateOverrideForm
                    availableMembers={availableMembers}
                    membersLoading={membersLoading}
                    isSaving={isSaving}
                    onSubmit={handleCreate}
                    onCancel={() => setShowCreate(false)}
                />
            )}

            {overridesLoading && <LoadingSpinner />}

            {!overridesLoading && filteredOverrides.length === 0 && <EmptyState />}

            {!overridesLoading && filteredOverrides.length > 0 && (
                <div className="space-y-4">
                    {filteredOverrides.map((override) => (
                        <OverrideCard
                            key={override.id}
                            override={override}
                            scraped={findScrapedByName(override.member_name)}
                            isEditing={editingId === override.id}
                            isSaving={isSaving}
                            onEdit={() => setEditingId(override.id)}
                            onDelete={() => handleDelete(override.id)}
                            onSave={(form) => handleUpdate(override.id, form)}
                            onCancelEdit={() => setEditingId(null)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
