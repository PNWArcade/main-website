"use client"

import { useState } from 'react'
import {
    useProjectTeamMembers,
    useCreateProjectTeamMember,
    useUpdateProjectTeamMember,
    useDeleteProjectTeamMember,
    useTeams,
    useCreateTeam,
} from '@/hooks/useProjects'
import { Button } from '@/components/ui/buttons/Button'
import ImageUploader from '@/components/ui/ImageUploader'
import type { ProjectTeamMemberWithTeam } from '@/lib/schemas/project'
import { useConfirm } from '@/components/dashboard/ui/useConfirm'
import { Plus, Trash2, RefreshCw, Users, FileText } from 'lucide-react'

export function TeamTab({ projectId }: { projectId: string }) {
    const { confirm, dialog } = useConfirm()
    const { data: members, isLoading } = useProjectTeamMembers(projectId)
    const { data: teams } = useTeams()
    const createMemberMutation = useCreateProjectTeamMember()
    const updateMemberMutation = useUpdateProjectTeamMember()
    const deleteMemberMutation = useDeleteProjectTeamMember()
    const createTeamMutation = useCreateTeam()

    const [showAddMember, setShowAddMember] = useState(false)
    const [showAddTeam, setShowAddTeam] = useState(false)
    const [editingMember, setEditingMember] = useState<ProjectTeamMemberWithTeam | null>(null)
    const [newMember, setNewMember] = useState({ name: '', title: '', team_id: '', image_url: '' })
    const [editMember, setEditMember] = useState({ name: '', title: '', team_id: '', image_url: '' })
    const [newTeam, setNewTeam] = useState({ name: '', slug: '', description: '' })

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault()
        await createMemberMutation.mutateAsync({
            projectId,
            data: {
                ...newMember,
                team_id: newMember.team_id || null,
            },
        })
        setShowAddMember(false)
        setNewMember({ name: '', title: '', team_id: '', image_url: '' })
    }

    const handleAddTeam = async (e: React.FormEvent) => {
        e.preventDefault()
        await createTeamMutation.mutateAsync(newTeam)
        setShowAddTeam(false)
        setNewTeam({ name: '', slug: '', description: '' })
    }

    const handleDeleteMember = async (memberId: string) => {
        if (!(await confirm('Delete this team member?', 'This cannot be undone.'))) return
        await deleteMemberMutation.mutateAsync({ projectId, memberId })
    }

    const handleEditMember = (member: ProjectTeamMemberWithTeam) => {
        setEditingMember(member)
        setEditMember({
            name: member.name,
            title: member.title || '',
            team_id: member.team_id || '',
            image_url: member.image_url || '',
        })
    }

    const handleUpdateMember = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingMember) return
        await updateMemberMutation.mutateAsync({
            projectId,
            memberId: editingMember.id,
            data: {
                ...editMember,
                team_id: editMember.team_id || null,
            },
        })
        setEditingMember(null)
    }

    // Group members by team
    const membersByTeam = members?.reduce((acc, member) => {
        const teamName = member.team?.name || 'Uncategorized'
        if (!acc[teamName]) acc[teamName] = []
        acc[teamName].push(member)
        return acc
    }, {} as Record<string, ProjectTeamMemberWithTeam[]>) || {}

    if (isLoading) {
        return <div className="flex justify-center py-8"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
    }

    return (
        <div className="space-y-6">
            {dialog}
            {/* Actions */}
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowAddMember(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Member
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowAddTeam(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Team Category
                </Button>
            </div>

            {/* Teams & Members */}
            {Object.keys(membersByTeam).length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                    <p className="text-muted-foreground mb-4">No team members yet</p>
                    <Button onClick={() => setShowAddMember(true)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add first team member
                    </Button>
                </div>
            ) : (
                Object.entries(membersByTeam).map(([teamName, teamMembers]) => (
                    <div key={teamName} className="bg-card border border-border rounded-lg overflow-hidden">
                        <div className="px-4 py-3 bg-muted border-b font-medium">
                            {teamName}
                        </div>
                        <div className="divide-y">
                            {teamMembers.map((member) => (
                                <div key={member.id} className="flex items-center gap-4 p-4">
                                    {member.image_url ? (
                                        <img src={member.image_url} alt={member.name} className="w-12 h-12 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                                            <Users className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <p className="font-medium">{member.name}</p>
                                        {member.title && <p className="text-sm text-muted-foreground">{member.title}</p>}
                                    </div>
                                    <button
                                        onClick={() => handleEditMember(member)}
                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded"
                                    >
                                        <FileText className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteMember(member.id)}
                                        className="p-2 text-red-500 hover:bg-red-500/10 rounded"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}

            {/* Add Member Modal */}
            {showAddMember && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Add Team Member</h2>
                        <form onSubmit={handleAddMember} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Name</label>
                                <input
                                    type="text"
                                    value={newMember.name}
                                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                                    className="w-full border border-input rounded-lg px-3 py-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Title/Role</label>
                                <input
                                    type="text"
                                    value={newMember.title}
                                    onChange={(e) => setNewMember({ ...newMember, title: e.target.value })}
                                    className="w-full border border-input rounded-lg px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Team</label>
                                <select
                                    value={newMember.team_id}
                                    onChange={(e) => setNewMember({ ...newMember, team_id: e.target.value })}
                                    className="w-full border border-input rounded-lg px-3 py-2"
                                >
                                    <option value="">Select team...</option>
                                    {teams?.map((team) => (
                                        <option key={team.id} value={team.id}>{team.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Photo</label>
                                <ImageUploader
                                    value={newMember.image_url}
                                    onChange={(url) => setNewMember({ ...newMember, image_url: url })}
                                    folder="team"
                                    aspectRatio="square"
                                    maxHeight={150}
                                />
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button type="button" variant="outline" onClick={() => setShowAddMember(false)}>Cancel</Button>
                                <Button type="submit" disabled={createMemberMutation.isPending}>Add</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Member Modal */}
            {editingMember && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Edit Team Member</h2>
                        <form onSubmit={handleUpdateMember} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Name</label>
                                <input
                                    type="text"
                                    value={editMember.name}
                                    onChange={(e) => setEditMember({ ...editMember, name: e.target.value })}
                                    className="w-full border border-input rounded-lg px-3 py-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Title/Role</label>
                                <input
                                    type="text"
                                    value={editMember.title}
                                    onChange={(e) => setEditMember({ ...editMember, title: e.target.value })}
                                    className="w-full border border-input rounded-lg px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Team</label>
                                <select
                                    value={editMember.team_id}
                                    onChange={(e) => setEditMember({ ...editMember, team_id: e.target.value })}
                                    className="w-full border border-input rounded-lg px-3 py-2"
                                >
                                    <option value="">Select team...</option>
                                    {teams?.map((team) => (
                                        <option key={team.id} value={team.id}>{team.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Photo</label>
                                <ImageUploader
                                    value={editMember.image_url}
                                    onChange={(url) => setEditMember({ ...editMember, image_url: url })}
                                    folder="team"
                                    aspectRatio="square"
                                    maxHeight={150}
                                />
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button type="button" variant="outline" onClick={() => setEditingMember(null)}>Cancel</Button>
                                <Button type="submit" disabled={updateMemberMutation.isPending}>Save</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Team Modal */}
            {showAddTeam && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Add Team Category</h2>
                        <form onSubmit={handleAddTeam} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Name</label>
                                <input
                                    type="text"
                                    value={newTeam.name}
                                    onChange={(e) => setNewTeam({
                                        ...newTeam,
                                        name: e.target.value,
                                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                                    })}
                                    className="w-full border border-input rounded-lg px-3 py-2"
                                    placeholder="e.g., Mechanical, Electrical"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Slug</label>
                                <input
                                    type="text"
                                    value={newTeam.slug}
                                    onChange={(e) => setNewTeam({ ...newTeam, slug: e.target.value })}
                                    className="w-full border border-input rounded-lg px-3 py-2"
                                    pattern="^[a-z0-9-]+$"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
                                <textarea
                                    value={newTeam.description}
                                    onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                                    className="w-full border border-input rounded-lg px-3 py-2"
                                    rows={2}
                                />
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button type="button" variant="outline" onClick={() => setShowAddTeam(false)}>Cancel</Button>
                                <Button type="submit" disabled={createTeamMutation.isPending}>Add</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

// ========================
// Sub-Projects Tab
// ========================
