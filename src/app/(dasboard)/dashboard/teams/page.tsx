"use client"

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/buttons/Button'
import { Toast, useToast } from '@/components/ui/toast'
import { uploadImageToBucket } from '@/components/ui/ImageUploader'
import type { TeamCategory } from '@/lib/pnw-team'
import type { ChapterTeamMember } from '@/lib/chapter-team'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faArrowsRotate,
    faPlus,
    faTrash,
    faPenToSquare,
    faXmark,
    faUserPlus,
} from '@fortawesome/free-solid-svg-icons'

import {
    CATEGORY_LABELS,
    EMPTY_MEMBER_FORM,
    MemberFormFields,
    type MemberFormData,
} from '@/components/dashboard/team/MemberFormFields'
import { useConfirm } from '@/components/dashboard/ui/useConfirm'

type MemberForm = MemberFormData
const EMPTY_FORM = EMPTY_MEMBER_FORM

const TEAM_URL = '/api/dashboard/chapter-team'
const PAST_PRESIDENTS_URL = '/api/dashboard/past-presidents'

interface PastPresidentRow {
    id: string
    name: string
    photo_url: string | null
    year: string
    status: string
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, options)
    if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error || `Request failed (${response.status})`)
    }
    return response.json()
}

export default function DashboardTeamPage() {
    const queryClient = useQueryClient()
    const { toast, showToast, hideToast } = useToast()
    const { confirm, dialog } = useConfirm()
    const [showCreate, setShowCreate] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [createForm, setCreateForm] = useState<MemberForm>(EMPTY_FORM)
    const [editForm, setEditForm] = useState<MemberForm>(EMPTY_FORM)
    const [isSaving, setIsSaving] = useState(false)

    const { data: members, isLoading, refetch } = useQuery({
        queryKey: ['chapter-team'],
        queryFn: async () => {
            const { data } = await apiFetch<{ data: ChapterTeamMember[] }>(TEAM_URL)
            return data
        },
    })

    const { data: pastPresidents, refetch: refetchPresidents } = useQuery({
        queryKey: ['dashboard-past-presidents'],
        queryFn: async () => {
            const { data } = await apiFetch<{ data: PastPresidentRow[] }>(PAST_PRESIDENTS_URL)
            return data
        },
    })

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['chapter-team'] })

    const createMutation = useMutation({
        mutationFn: (payload: Record<string, unknown>) =>
            apiFetch<{ data: ChapterTeamMember }>(TEAM_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            }),
        onSuccess: () => {
            invalidate()
            showToast('Team member added', 'success')
            setShowCreate(false)
            setCreateForm(EMPTY_FORM)
        },
        onError: (err: Error) => showToast(err.message, 'error'),
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
            apiFetch<{ data: ChapterTeamMember }>(`${TEAM_URL}/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            }),
        onSuccess: () => {
            invalidate()
            showToast('Team member updated', 'success')
            setEditingId(null)
        },
        onError: (err: Error) => showToast(err.message, 'error'),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiFetch(`${TEAM_URL}/${id}`, { method: 'DELETE' }),
        onSuccess: () => {
            invalidate()
            showToast('Team member removed', 'success')
        },
        onError: (err: Error) => showToast(err.message, 'error'),
    })

    const deletePresidentMutation = useMutation({
        mutationFn: (id: string) => apiFetch(`${PAST_PRESIDENTS_URL}/${id}`, { method: 'DELETE' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard-past-presidents'] })
            queryClient.invalidateQueries({ queryKey: ['past-presidents'] })
            showToast('Former president removed', 'success')
        },
        onError: (err: Error) => showToast(err.message, 'error'),
    })

    function updateCreate<K extends keyof MemberForm>(key: K, value: MemberForm[K]) {
        setCreateForm((prev) => ({ ...prev, [key]: value }))
    }

    function updateEdit<K extends keyof MemberForm>(key: K, value: MemberForm[K]) {
        setEditForm((prev) => ({ ...prev, [key]: value }))
    }

    async function resolveImage(form: MemberForm) {
        if (form.pendingImage) return uploadImageToBucket(form.pendingImage, 'team-members')
        return form.imageUrl || null
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault()
        if (!createForm.name.trim() || !createForm.position.trim()) {
            showToast('Name and role are required', 'warning')
            return
        }
        setIsSaving(true)
        try {
            const imageUrl = await resolveImage(createForm)
            await createMutation.mutateAsync({
                name: createForm.name.trim(),
                position: createForm.position.trim(),
                category: createForm.category,
                image_url: imageUrl,
                linkedin_url: createForm.linkedinUrl || null,
                email: createForm.email || null,
            })
        } finally {
            setIsSaving(false)
        }
    }

    function startEdit(member: ChapterTeamMember) {
        setEditingId(member.id)
        setEditForm({
            name: member.name,
            position: member.position,
            category: member.category,
            imageUrl: member.image_url || '',
            pendingImage: null,
            linkedinUrl: member.linkedin_url || '',
            email: member.email || '',
        })
    }

    async function handleUpdate(e: React.FormEvent) {
        e.preventDefault()
        if (!editingId) return
        setIsSaving(true)
        try {
            const imageUrl = await resolveImage(editForm)
            await updateMutation.mutateAsync({
                id: editingId,
                payload: {
                    name: editForm.name.trim(),
                    position: editForm.position.trim(),
                    category: editForm.category,
                    image_url: imageUrl,
                    linkedin_url: editForm.linkedinUrl || null,
                    email: editForm.email || null,
                },
            })
        } finally {
            setIsSaving(false)
        }
    }

    async function handleDelete(member: ChapterTeamMember) {
        if (!(await confirm(`Remove ${member.name} from the public team page?`))) return
        deleteMutation.mutate(member.id)
    }

    const grouped = (members || []).reduce<Record<TeamCategory, ChapterTeamMember[]>>((acc, member) => {
        acc[member.category].push(member)
        return acc
    }, { leadership: [], officers: [], mentors: [], advisors: [] })

    return (
        <div className="space-y-6">
            {dialog}
            {toast && <Toast message={toast.message} type={toast.type} duration={toast.duration} onClose={hideToast} />}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Team</h1>
                    <p className="text-muted-foreground">
                        Manually add people to the public team page and assign their roles.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { refetch(); refetchPresidents() }}>
                        <FontAwesomeIcon icon={faArrowsRotate} className="h-4 w-4 mr-1" />
                        Refresh
                    </Button>
                    <Button size="sm" onClick={() => setShowCreate(true)}>
                        <FontAwesomeIcon icon={faPlus} className="h-4 w-4 mr-1" />
                        Add Member
                    </Button>
                </div>
            </div>

            {showCreate && (
                <div className="border rounded-lg p-6 bg-card ">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">New team member</h2>
                        <Button variant="ghost" size="sm" onClick={() => { setShowCreate(false); setCreateForm(EMPTY_FORM) }}>
                            <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
                        </Button>
                    </div>
                    <form onSubmit={handleCreate} className="space-y-4 max-w-xl">
                        <MemberFormFields form={createForm} onChange={updateCreate} />
                        <div className="flex gap-2 justify-end">
                            <Button type="button" variant="outline" onClick={() => { setShowCreate(false); setCreateForm(EMPTY_FORM) }}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? 'Adding...' : 'Add member'}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {isLoading && (
                <div className="flex justify-center py-12">
                    <FontAwesomeIcon icon={faArrowsRotate} className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            )}

            {!isLoading && (members?.length ?? 0) === 0 && (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                    <FontAwesomeIcon icon={faUserPlus} className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-lg font-medium">No manual team members yet</p>
                    <p className="text-sm">
                        People scraped from the PNW Arcade site already appear on /team. Use this page to add anyone who is missing.
                    </p>
                </div>
            )}

            {!isLoading && (Object.keys(CATEGORY_LABELS) as TeamCategory[]).map((category) => (
                grouped[category].length > 0 ? (
                    <section key={category} className="space-y-3">
                        <h2 className="text-lg font-semibold text-foreground">{CATEGORY_LABELS[category]}</h2>
                        <div className="space-y-3">
                            {grouped[category].map((member) => (
                                <div key={member.id} className="border rounded-lg bg-card  overflow-hidden">
                                    {editingId === member.id ? (
                                        <form onSubmit={handleUpdate} className="p-6 space-y-4">
                                            <MemberFormFields form={editForm} onChange={updateEdit} />
                                            <div className="flex gap-2 justify-end">
                                                <Button type="button" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                                                <Button type="submit" disabled={isSaving}>
                                                    {isSaving ? 'Saving...' : 'Save changes'}
                                                </Button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="p-4 flex items-center gap-4">
                                            {member.image_url ? (
                                                <img src={member.image_url} alt={member.name} className="w-16 h-16 rounded-full object-cover border border-border" />
                                            ) : (
                                                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-muted-foreground font-semibold">
                                                    {member.name.charAt(0)}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-foreground truncate">{member.name}</h3>
                                                <p className="text-sm text-purdue-gold">{member.position}</p>
                                                {member.email && <p className="text-xs text-muted-foreground">{member.email}</p>}
                                            </div>
                                            <div className="flex gap-1 shrink-0">
                                                <Button variant="ghost" size="sm" onClick={() => startEdit(member)}>
                                                    <FontAwesomeIcon icon={faPenToSquare} className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-500/10"
                                                    onClick={() => handleDelete(member)}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                ) : null
            ))}

            <section className="space-y-3 pt-4">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">Former presidents</h2>
                    <p className="text-sm text-muted-foreground">
                        Remove anyone who was published by mistake (for example a treasurer). Change their photo under Team Overrides.
                    </p>
                </div>
                {(pastPresidents?.length ?? 0) === 0 ? (
                    <p className="text-sm text-muted-foreground border border-dashed border-border rounded-lg p-4">
                        No former president records yet.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {pastPresidents?.map((president) => (
                            <div key={president.id} className="border rounded-lg bg-card  p-4 flex items-center gap-4">
                                {president.photo_url ? (
                                    <img src={president.photo_url} alt={president.name} className="w-14 h-14 rounded-full object-cover border border-border" />
                                ) : (
                                    <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-muted-foreground font-semibold">
                                        {president.name.charAt(0)}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-foreground truncate">{president.name}</h3>
                                    <p className="text-sm text-muted-foreground">{president.year} · {president.status}</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-500/10"
                                    onClick={() => {
                                        confirm(`Remove ${president.name} from former presidents?`).then((ok) => { if (ok) deletePresidentMutation.mutate(president.id) })
                                    }}
                                >
                                    <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}
