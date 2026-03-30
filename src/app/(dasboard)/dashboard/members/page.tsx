"use client"

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/buttons/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Toast, useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import { 
    RefreshCw, 
    UserPlus, 
    Users, 
    Mail, 
    Shield, 
    ShieldCheck,
    Trash2,
    X,
    Copy,
    Check
} from 'lucide-react'

type UserRole = 'admin' | 'officer'

interface Member {
    id: string
    email: string
    full_name: string | null
    role: UserRole | null
    avatar_url: string | null
    created_at: string | null
}

interface Invite {
    id: string
    email: string
    role: UserRole
    status: 'pending' | 'accepted' | 'expired'
    created_at: string
    expires_at: string
    invite_url?: string
}

// Fetch functions
async function fetchMembers(): Promise<Member[]> {
    const response = await fetch('/api/dashboard/members')
    if (!response.ok) throw new Error('Failed to fetch members')
    const { data } = await response.json()
    return data
}

async function fetchInvites(): Promise<Invite[]> {
    const response = await fetch('/api/dashboard/invites')
    if (!response.ok) throw new Error('Failed to fetch invites')
    const { data } = await response.json()
    return data
}

async function sendInvite(data: { email: string; role: UserRole }): Promise<Invite> {
    const response = await fetch('/api/dashboard/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send invite')
    }
    const { data: invite } = await response.json()
    return invite
}

async function deleteInvite(id: string): Promise<void> {
    const response = await fetch(`/api/dashboard/invites/${id}`, { method: 'DELETE' })
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete invite')
    }
}

async function updateMemberRole(id: string, role: UserRole): Promise<void> {
    const response = await fetch(`/api/dashboard/members/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
    })
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update role')
    }
}

async function deleteMember(id: string): Promise<void> {
    const response = await fetch(`/api/dashboard/members/${id}`, { method: 'DELETE' })
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to remove member')
    }
}

// Role badge component
function RoleBadge({ role }: { role: UserRole | null }) {
    const config = {
        admin: { 
            label: 'Admin', 
            className: 'bg-purple-100 text-purple-700',
            icon: <ShieldCheck className="h-3 w-3" />
        },
        officer: { 
            label: 'Officer', 
            className: 'bg-blue-100 text-blue-700',
            icon: <Shield className="h-3 w-3" />
        },
    }
    const { label, className, icon } = config[role || 'officer']
    
    return (
        <span className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
            className
        )}>
            {icon}
            {label}
        </span>
    )
}

// Status badge for invites
function StatusBadge({ status }: { status: Invite['status'] }) {
    const config = {
        pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700' },
        accepted: { label: 'Accepted', className: 'bg-green-100 text-green-700' },
        expired: { label: 'Expired', className: 'bg-gray-100 text-gray-500' },
    }
    const { label, className } = config[status]
    
    return (
        <span className={cn(
            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
            className
        )}>
            {label}
        </span>
    )
}

// Format date helper
function formatDate(dateString: string | null) {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}

export default function MembersPage() {
    const queryClient = useQueryClient()
    const { toast, showToast, hideToast } = useToast()
    const [showInviteModal, setShowInviteModal] = useState(false)
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviteRole, setInviteRole] = useState<UserRole>('officer')
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [createdInvite, setCreatedInvite] = useState<Invite | null>(null)
    const [linkCopied, setLinkCopied] = useState(false)

    // Queries
    const { data: members, isLoading: loadingMembers, refetch: refetchMembers } = useQuery({
        queryKey: ['members'],
        queryFn: fetchMembers,
    })

    const { data: invites, isLoading: loadingInvites, refetch: refetchInvites } = useQuery({
        queryKey: ['invites'],
        queryFn: fetchInvites,
    })

    // Mutations
    const sendInviteMutation = useMutation({
        mutationFn: sendInvite,
        onSuccess: (invite) => {
            queryClient.invalidateQueries({ queryKey: ['invites'] })
            setCreatedInvite(invite)
            setLinkCopied(false)
        },
        onError: (error: Error) => {
            showToast(error.message, 'error')
        },
    })

    const handleCloseInviteModal = () => {
        setShowInviteModal(false)
        setInviteEmail('')
        setInviteRole('officer')
        setCreatedInvite(null)
        setLinkCopied(false)
    }

    const handleCopyInviteLink = async () => {
        if (createdInvite?.invite_url) {
            await navigator.clipboard.writeText(createdInvite.invite_url)
            setLinkCopied(true)
            showToast('Invite link copied!', 'success')
        }
    }

    const deleteInviteMutation = useMutation({
        mutationFn: deleteInvite,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invites'] })
            showToast('Invite deleted', 'success')
        },
        onError: (error: Error) => {
            showToast(error.message, 'error')
        },
    })

    const updateRoleMutation = useMutation({
        mutationFn: ({ id, role }: { id: string; role: UserRole }) => updateMemberRole(id, role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members'] })
            showToast('Role updated', 'success')
        },
        onError: (error: Error) => {
            showToast(error.message, 'error')
        },
    })

    const deleteMemberMutation = useMutation({
        mutationFn: deleteMember,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members'] })
            showToast('Member removed', 'success')
        },
        onError: (error: Error) => {
            showToast(error.message, 'error')
        },
    })

    const handleSendInvite = (e: React.FormEvent) => {
        e.preventDefault()
        if (!inviteEmail.trim()) return
        sendInviteMutation.mutate({ email: inviteEmail.trim(), role: inviteRole })
    }

    const handleCopyLink = async (invite: Invite) => {
        if (invite.invite_url) {
            await navigator.clipboard.writeText(invite.invite_url)
            setCopiedId(invite.id)
            setTimeout(() => setCopiedId(null), 2000)
        }
    }

    const isLoading = loadingMembers || loadingInvites

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Members</h1>
                    <p className="text-gray-500">Manage team members and invitations</p>
                </div>
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => { refetchMembers(); refetchInvites() }}
                    >
                        <RefreshCw className={cn("h-4 w-4 mr-1", isLoading && "animate-spin")} />
                        Refresh
                    </Button>
                    <Button size="sm" onClick={() => setShowInviteModal(true)}>
                        <UserPlus className="h-4 w-4 mr-1" />
                        Invite Member
                    </Button>
                </div>
            </div>

            {/* Members List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-gray-500" />
                        <h2 className="font-semibold text-gray-900">Team Members</h2>
                        <span className="text-sm text-gray-500">({members?.length || 0})</span>
                    </div>
                </div>

                {loadingMembers ? (
                    <div className="p-8 flex justify-center">
                        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                    </div>
                ) : members?.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No members found
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {members?.map((member) => (
                            <div key={member.id} className="p-4 flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                                    {(member.full_name || member.email).charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate">
                                        {member.full_name || 'No name set'}
                                    </p>
                                    <p className="text-sm text-gray-500 truncate">{member.email}</p>
                                </div>
                                <RoleBadge role={member.role} />
                                <div className="flex items-center gap-2">
                                    <select
                                        value={member.role || 'officer'}
                                        onChange={(e) => updateRoleMutation.mutate({ 
                                            id: member.id, 
                                            role: e.target.value as UserRole 
                                        })}
                                        className="text-sm border border-gray-200 rounded-lg px-2 py-1"
                                    >
                                        <option value="officer">Officer</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    <button
                                        onClick={() => {
                                            if (confirm(`Remove ${member.email} from the team?`)) {
                                                deleteMemberMutation.mutate(member.id)
                                            }
                                        }}
                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                                        title="Remove member"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pending Invites */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-gray-500" />
                        <h2 className="font-semibold text-gray-900">Pending Invites</h2>
                        <span className="text-sm text-gray-500">
                            ({invites?.filter(i => i.status === 'pending').length || 0})
                        </span>
                    </div>
                </div>

                {loadingInvites ? (
                    <div className="p-8 flex justify-center">
                        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                    </div>
                ) : invites?.filter(i => i.status === 'pending').length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No pending invites
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {invites?.filter(i => i.status === 'pending').map((invite) => (
                            <div key={invite.id} className="p-4 flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate">{invite.email}</p>
                                    <p className="text-sm text-gray-500">
                                        Sent {formatDate(invite.created_at)} · Expires {formatDate(invite.expires_at)}
                                    </p>
                                </div>
                                <RoleBadge role={invite.role} />
                                <StatusBadge status={invite.status} />
                                <div className="flex items-center gap-1">
                                    {invite.invite_url && (
                                        <button
                                            onClick={() => handleCopyLink(invite)}
                                            className="p-1.5 text-gray-500 hover:bg-gray-50 rounded-lg"
                                            title="Copy invite link"
                                        >
                                            {copiedId === invite.id ? (
                                                <Check className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteInviteMutation.mutate(invite.id)}
                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                                        title="Delete invite"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900">
                                {createdInvite ? 'Invite Sent!' : 'Invite New Member'}
                            </h3>
                            <button
                                onClick={handleCloseInviteModal}
                                className="p-1 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>
                        
                        {createdInvite ? (
                            <div className="p-4 space-y-4">
                                <div className="text-center space-y-2">
                                    <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                        <Check className="h-6 w-6 text-green-600" />
                                    </div>
                                    <p className="text-gray-600">
                                        Invite created for <span className="font-medium">{createdInvite.email}</span>
                                    </p>
                                </div>
                                
                                {createdInvite.invite_url && (
                                    <div className="space-y-2">
                                        <Label>Invite Link</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                readOnly
                                                value={createdInvite.invite_url}
                                                className="flex-1 text-sm bg-gray-50"
                                            />
                                            <Button
                                                type="button"
                                                variant={linkCopied ? 'outline' : 'default'}
                                                onClick={handleCopyInviteLink}
                                                className="shrink-0"
                                            >
                                                {linkCopied ? (
                                                    <><Check className="h-4 w-4 mr-1" /> Copied</>
                                                ) : (
                                                    <><Copy className="h-4 w-4 mr-1" /> Copy</>
                                                )}
                                            </Button>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            Share this link with the invitee to let them join.
                                        </p>
                                    </div>
                                )}
                                
                                <Button
                                    type="button"
                                    className="w-full"
                                    onClick={handleCloseInviteModal}
                                >
                                    Done
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSendInvite} className="p-4 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="invite-email">Email Address</Label>
                                    <Input
                                        id="invite-email"
                                        type="email"
                                        placeholder="member@example.com"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="invite-role">Role</Label>
                                    <select
                                        id="invite-role"
                                        value={inviteRole}
                                        onChange={(e) => setInviteRole(e.target.value as UserRole)}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2"
                                    >
                                        <option value="officer">Officer</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    <p className="text-xs text-gray-500">
                                        Officers can manage content. Admins can also manage team members.
                                    </p>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={handleCloseInviteModal}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1"
                                        disabled={sendInviteMutation.isPending}
                                    >
                                        {sendInviteMutation.isPending ? 'Creating...' : 'Create Invite'}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={hideToast}
                    position="top"
                />
            )}
        </div>
    )
}
