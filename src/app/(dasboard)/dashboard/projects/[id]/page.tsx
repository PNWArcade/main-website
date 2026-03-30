"use client"

import { useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
    useProject, 
    useUpdateProject,
    useProjectComponents,
    useCreateProjectComponent,
    useUpdateProjectComponent,
    useDeleteProjectComponent,
    useProjectTeamMembers,
    useCreateProjectTeamMember,
    useUpdateProjectTeamMember,
    useDeleteProjectTeamMember,
    useTeams,
    useCreateTeam,
    useSubProjects,
    useCreateSubProject,
    useUpdateSubProject,
    useDeleteSubProject,
    useProjectArticles,
    useCreateProjectArticle,
    useUpdateProjectArticle,
    useDeleteProjectArticle,
    useArticleCategories,
    useCreateArticleCategory,
    useProjectSponsors,
    useCreateProjectSponsor,
    useUpdateProjectSponsor,
    useDeleteProjectSponsor,
} from '@/hooks/useProjects'
import { Button } from '@/components/ui/buttons/Button'
import TiptapEditor from '@/components/editor/TiptapEditor'
import ImageUploader, { uploadImageToBucket } from '@/components/ui/ImageUploader'
import { cn } from '@/lib/utils'
import { 
    ArrowLeft, 
    Save, 
    Plus, 
    Trash2, 
    GripVertical, 
    RefreshCw,
    FileText,
    Users,
    Layers,
    Settings,
    ChevronUp,
    ChevronDown,
    Heart,
} from 'lucide-react'
import type { UploadStatus, ProjectComponent, ProjectTeamMemberWithTeam, SubProject, Article, ProjectSponsor } from '@/lib/schemas/project'

type Tab = 'overview' | 'team' | 'sub-projects' | 'articles' | 'sponsors' | 'settings'

const statusOptions: { value: UploadStatus; label: string }[] = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' },
]

export default function ProjectEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<Tab>('overview')

    const { data: project, isLoading } = useProject(id)
    const updateProjectMutation = useUpdateProject()

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        )
    }

    if (!project) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Project not found</p>
                <Link href="/dashboard/projects">
                    <Button className="mt-4">Back to Projects</Button>
                </Link>
            </div>
        )
    }

    const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
        { id: 'overview', label: 'Overview', icon: <FileText className="h-4 w-4" /> },
        { id: 'team', label: 'Team', icon: <Users className="h-4 w-4" /> },
        { id: 'sub-projects', label: 'Sub-Projects', icon: <Layers className="h-4 w-4" /> },
        { id: 'articles', label: 'Articles', icon: <FileText className="h-4 w-4" /> },
        { id: 'sponsors', label: 'Sponsors', icon: <Heart className="h-4 w-4" /> },
        { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/projects">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
                    <p className="text-sm text-gray-500">/{project.slug}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <div className="flex gap-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                                activeTab === tab.id
                                    ? 'border-gray-900 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            )}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && <OverviewTab projectId={id} />}
            {activeTab === 'team' && <TeamTab projectId={id} />}
            {activeTab === 'sub-projects' && <SubProjectsTab projectId={id} />}
            {activeTab === 'articles' && <ArticlesTab projectId={id} />}
            {activeTab === 'sponsors' && <SponsorsTab projectId={id} />}
            {activeTab === 'settings' && <SettingsTab project={project} />}
        </div>
    )
}

// ========================
// Overview Tab - Text/Image Components
// ========================

// Component Editor with local state and save button
function ComponentEditor({
    component,
    projectId,
    onMove,
    onDelete,
    canMoveUp,
    canMoveDown,
}: {
    component: ProjectComponent
    projectId: string
    onMove: (direction: 'up' | 'down') => void
    onDelete: () => void
    canMoveUp: boolean
    canMoveDown: boolean
}) {
    const updateMutation = useUpdateProjectComponent()
    const [isExpanded, setIsExpanded] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    
    // Local state for editing
    const [localData, setLocalData] = useState({
        title: component.title || '',
        description: component.description || '',
        image_url: component.image_url || '',
        image_title: component.image_title || '',
    })
    const [pendingImageFile, setPendingImageFile] = useState<File | null>(null)
    
    // Track if there are unsaved changes
    const hasChanges = 
        localData.title !== (component.title || '') ||
        localData.description !== (component.description || '') ||
        localData.image_url !== (component.image_url || '') ||
        localData.image_title !== (component.image_title || '') ||
        pendingImageFile !== null

    const handleSave = async () => {
        if (!localData.title.trim()) {
            alert('Title is required')
            return
        }
        setIsSaving(true)
        try {
            let imageUrl = localData.image_url
            
            // Upload image if there's a pending file
            if (pendingImageFile) {
                imageUrl = await uploadImageToBucket(pendingImageFile, 'projects')
                setPendingImageFile(null)
            }
            
            await updateMutation.mutateAsync({
                projectId,
                componentId: component.id,
                data: {
                    title: localData.title,
                    description: localData.description || undefined,
                    image_url: imageUrl || undefined,
                    image_title: localData.image_title || undefined,
                },
            })
            
            // Update local state with the saved image URL
            setLocalData(prev => ({ ...prev, image_url: imageUrl }))
        } catch (error) {
            console.error('Failed to save component:', error)
        } finally {
            setIsSaving(false)
        }
    }

    const displayTitle = localData.title.trim() || 'Untitled Block'

    return (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Component Header - Title is read-only display */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b">
                <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                <div className="flex gap-1">
                    <button
                        onClick={() => onMove('up')}
                        disabled={!canMoveUp}
                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                    >
                        <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => onMove('down')}
                        disabled={!canMoveDown}
                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                    >
                        <ChevronDown className="h-4 w-4" />
                    </button>
                </div>
                <span className="flex-1 font-medium text-gray-900 truncate">
                    {displayTitle}
                </span>
                {hasChanges && (
                    <span className="text-xs text-yellow-600 font-medium">Unsaved</span>
                )}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-sm text-blue-600 hover:underline"
                >
                    {isExpanded ? 'Collapse' : 'Edit'}
                </button>
                <button
                    onClick={onDelete}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>

            {/* Component Content - Side by side layout */}
            {isExpanded && (
                <div className="p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left side - Title and Paragraph */}
                        <div className="space-y-4">
                            {/* Title Input (Required) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={localData.title}
                                    onChange={(e) => setLocalData({ ...localData, title: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none"
                                    placeholder="Enter block title"
                                    required
                                />
                            </div>

                            {/* Paragraph Textarea */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Paragraph
                                </label>
                                <textarea
                                    value={localData.description}
                                    onChange={(e) => setLocalData({ ...localData, description: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none min-h-[200px] resize-y"
                                    placeholder="Enter paragraph text..."
                                />
                            </div>
                        </div>

                        {/* Right side - Image Upload */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Image
                                </label>
                                <ImageUploader
                                    value={localData.image_url}
                                    onChange={(url) => {
                                        setLocalData({ ...localData, image_url: url })
                                        setPendingImageFile(null)
                                    }}
                                    onFileSelect={(file) => setPendingImageFile(file)}
                                    folder="projects"
                                    aspectRatio="video"
                                    previewMode
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Image Caption
                                </label>
                                <input
                                    type="text"
                                    value={localData.image_title}
                                    onChange={(e) => setLocalData({ ...localData, image_title: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none"
                                    placeholder="Image caption"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4 mt-4 border-t">
                        <Button 
                            onClick={handleSave} 
                            disabled={isSaving || !hasChanges || !localData.title.trim()}
                            size="sm"
                        >
                            <Save className="h-4 w-4 mr-1" />
                            {isSaving ? 'Saving...' : 'Save Block'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

function OverviewTab({ projectId }: { projectId: string }) {
    const { data: components, isLoading } = useProjectComponents(projectId)
    const createMutation = useCreateProjectComponent()
    const updateMutation = useUpdateProjectComponent()
    const deleteMutation = useDeleteProjectComponent()

    const handleAddComponent = async () => {
        const maxOrder = components?.reduce((max, c) => Math.max(max, c.order_index), -1) ?? -1
        const newComponent = {
            title: '',
            description: '',
            image_url: '',
            order_index: maxOrder + 1,
        }
        await createMutation.mutateAsync({ projectId, data: newComponent })
    }

    const handleDeleteComponent = async (componentId: string) => {
        if (!confirm('Delete this component?')) return
        await deleteMutation.mutateAsync({ projectId, componentId })
    }

    const moveComponent = async (index: number, direction: 'up' | 'down') => {
        if (!components) return
        const newIndex = direction === 'up' ? index - 1 : index + 1
        if (newIndex < 0 || newIndex >= components.length) return

        const component = components[index]
        const otherComponent = components[newIndex]

        await Promise.all([
            updateMutation.mutateAsync({
                projectId,
                componentId: component.id,
                data: { order_index: otherComponent.order_index },
            }),
            updateMutation.mutateAsync({
                projectId,
                componentId: otherComponent.id,
                data: { order_index: component.order_index },
            }),
        ])
    }

    if (isLoading) {
        return <div className="flex justify-center py-8"><RefreshCw className="h-6 w-6 animate-spin text-gray-400" /></div>
    }

    return (
        <div className="space-y-6">
            {/* Add Component Button */}
            <div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddComponent()}
                    disabled={createMutation.isPending}
                >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Title + Text Block
                </Button>
            </div>

            {/* Components List */}
            {components?.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                    <p className="text-gray-500 mb-4">No blocks yet</p>
                    <p className="text-sm text-gray-400">Each block has a title, paragraph, and optional image</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {components?.map((component, index) => (
                        <ComponentEditor
                            key={component.id}
                            component={component}
                            projectId={projectId}
                            onMove={(direction) => moveComponent(index, direction)}
                            onDelete={() => handleDeleteComponent(component.id)}
                            canMoveUp={index > 0}
                            canMoveDown={index < (components?.length ?? 0) - 1}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

// ========================
// Team Tab
// ========================

function TeamTab({ projectId }: { projectId: string }) {
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
        if (!confirm('Delete this team member?')) return
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
        return <div className="flex justify-center py-8"><RefreshCw className="h-6 w-6 animate-spin text-gray-400" /></div>
    }

    return (
        <div className="space-y-6">
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
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                    <p className="text-gray-500 mb-4">No team members yet</p>
                    <Button onClick={() => setShowAddMember(true)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add first team member
                    </Button>
                </div>
            ) : (
                Object.entries(membersByTeam).map(([teamName, teamMembers]) => (
                    <div key={teamName} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="px-4 py-3 bg-gray-50 border-b font-medium">
                            {teamName}
                        </div>
                        <div className="divide-y">
                            {teamMembers.map((member) => (
                                <div key={member.id} className="flex items-center gap-4 p-4">
                                    {member.image_url ? (
                                        <img src={member.image_url} alt={member.name} className="w-12 h-12 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                            <Users className="h-6 w-6 text-gray-400" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <p className="font-medium">{member.name}</p>
                                        {member.title && <p className="text-sm text-gray-500">{member.title}</p>}
                                    </div>
                                    <button
                                        onClick={() => handleEditMember(member)}
                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded"
                                    >
                                        <FileText className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteMember(member.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded"
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
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Add Team Member</h2>
                        <form onSubmit={handleAddMember} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={newMember.name}
                                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title/Role</label>
                                <input
                                    type="text"
                                    value={newMember.title}
                                    onChange={(e) => setNewMember({ ...newMember, title: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
                                <select
                                    value={newMember.team_id}
                                    onChange={(e) => setNewMember({ ...newMember, team_id: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                >
                                    <option value="">Select team...</option>
                                    {teams?.map((team) => (
                                        <option key={team.id} value={team.id}>{team.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
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
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Edit Team Member</h2>
                        <form onSubmit={handleUpdateMember} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={editMember.name}
                                    onChange={(e) => setEditMember({ ...editMember, name: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title/Role</label>
                                <input
                                    type="text"
                                    value={editMember.title}
                                    onChange={(e) => setEditMember({ ...editMember, title: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
                                <select
                                    value={editMember.team_id}
                                    onChange={(e) => setEditMember({ ...editMember, team_id: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                >
                                    <option value="">Select team...</option>
                                    {teams?.map((team) => (
                                        <option key={team.id} value={team.id}>{team.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
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
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Add Team Category</h2>
                        <form onSubmit={handleAddTeam} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={newTeam.name}
                                    onChange={(e) => setNewTeam({
                                        ...newTeam,
                                        name: e.target.value,
                                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                                    })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    placeholder="e.g., Mechanical, Electrical"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                                <input
                                    type="text"
                                    value={newTeam.slug}
                                    onChange={(e) => setNewTeam({ ...newTeam, slug: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    pattern="^[a-z0-9-]+$"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={newTeam.description}
                                    onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
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

function SubProjectsTab({ projectId }: { projectId: string }) {
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
        if (!confirm('Delete this sub-project?')) return
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
        return <div className="flex justify-center py-8"><RefreshCw className="h-6 w-6 animate-spin text-gray-400" /></div>
    }

    return (
        <div className="space-y-6">
            {/* Actions */}
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowCreate(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Sub-Project
                </Button>
            </div>

            {/* Sub-Projects List */}
            {subProjects?.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                    <p className="text-gray-500 mb-4">No sub-projects yet</p>
                    <Button onClick={() => setShowCreate(true)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Create first sub-project
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {subProjects?.map((subProject) => (
                        <div key={subProject.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <h3 className="font-medium">{subProject.title}</h3>
                                        <p className="text-sm text-gray-500">/{subProject.slug}</p>
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
                                        className="text-xs border border-gray-200 rounded px-2 py-1"
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
                                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            {editingId === subProject.id && editingSubProject && (
                                <div className="p-4 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Author Name</label>
                                        <input
                                            type="text"
                                            value={editingSubProject.author_name}
                                            onChange={(e) => setEditingSubProject({ ...editingSubProject, author_name: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                            placeholder="e.g. John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Hero Image</label>
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
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
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
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Create Sub-Project</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={newSubProject.title}
                                    onChange={(e) => setNewSubProject({
                                        ...newSubProject,
                                        title: e.target.value,
                                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                                    })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                                <input
                                    type="text"
                                    value={newSubProject.slug}
                                    onChange={(e) => setNewSubProject({ ...newSubProject, slug: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    pattern="^[a-z0-9-]+$"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={newSubProject.description}
                                    onChange={(e) => setNewSubProject({ ...newSubProject, description: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={newSubProject.status}
                                    onChange={(e) => setNewSubProject({ ...newSubProject, status: e.target.value as 'draft' | 'published' | 'archived' })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Author Name</label>
                                <input
                                    type="text"
                                    value={newSubProject.author_name}
                                    onChange={(e) => setNewSubProject({ ...newSubProject, author_name: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
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

function ArticlesTab({ projectId }: { projectId: string }) {
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
        if (!confirm('Delete this article?')) return
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
        return <div className="flex justify-center py-8"><RefreshCw className="h-6 w-6 animate-spin text-gray-400" /></div>
    }

    return (
        <div className="space-y-6">
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
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                    <p className="text-gray-500 mb-4">No articles yet</p>
                    <Button onClick={() => setShowCreate(true)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Create first article
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {articles?.map((article) => (
                        <div key={article.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <h3 className="font-medium">{article.title}</h3>
                                        <p className="text-sm text-gray-500">/{article.slug}</p>
                                    </div>
                                    <select
                                        value={article.status || 'draft'}
                                        onChange={(e) => handleUpdateStatus(article.id, e.target.value as UploadStatus)}
                                        className="text-xs border border-gray-200 rounded px-2 py-1"
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
                                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            {editingId === article.id && editingArticle && (
                                <div className="p-4 space-y-4">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                            <select
                                                value={editingArticle.category_id}
                                                onChange={(e) => setEditingArticle({ ...editingArticle, category_id: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                            >
                                                <option value="">Select category...</option>
                                                {categories?.map((cat) => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Author Name</label>
                                            <input
                                                type="text"
                                                value={editingArticle.author_name}
                                                onChange={(e) => setEditingArticle({ ...editingArticle, author_name: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                                placeholder="e.g. John Doe"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Time to Read (min)</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={editingArticle.time_to_read ?? ''}
                                                onChange={(e) => setEditingArticle({ ...editingArticle, time_to_read: e.target.value ? parseInt(e.target.value) : undefined })}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                                placeholder="5"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image</label>
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
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Article Content</label>
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
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Create Article</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={newArticle.title}
                                    onChange={(e) => setNewArticle({
                                        ...newArticle,
                                        title: e.target.value,
                                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                                    })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                                <input
                                    type="text"
                                    value={newArticle.slug}
                                    onChange={(e) => setNewArticle({ ...newArticle, slug: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    pattern="^[a-z0-9-]+$"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={newArticle.description}
                                    onChange={(e) => setNewArticle({ ...newArticle, description: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={newArticle.status}
                                    onChange={(e) => setNewArticle({ ...newArticle, status: e.target.value as 'draft' | 'published' | 'archived' })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    value={newArticle.category_id}
                                    onChange={(e) => setNewArticle({ ...newArticle, category_id: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                >
                                    <option value="">Select category...</option>
                                    {categories?.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Author Name</label>
                                <input
                                    type="text"
                                    value={newArticle.author_name}
                                    onChange={(e) => setNewArticle({ ...newArticle, author_name: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    placeholder="e.g. John Doe"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Time to Read (min)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={newArticle.time_to_read ?? ''}
                                        onChange={(e) => setNewArticle({ ...newArticle, time_to_read: e.target.value ? parseInt(e.target.value) : undefined })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
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
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm">
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                                <input
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
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

function SponsorsTab({ projectId }: { projectId: string }) {
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
        if (!confirm('Delete this sponsor?')) return
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
        return <div className="flex justify-center py-8"><RefreshCw className="h-6 w-6 animate-spin text-gray-400" /></div>
    }

    return (
        <div className="space-y-6">
            {/* Actions */}
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowCreate(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Sponsor
                </Button>
            </div>

            {/* Sponsors List */}
            {sponsors?.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                    <p className="text-gray-500 mb-4">No sponsors yet</p>
                    <Button onClick={() => setShowCreate(true)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add first sponsor
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sponsors?.map((sponsor) => (
                        <div key={sponsor.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <div className="p-4">
                                {sponsor.logo_url ? (
                                    <img src={sponsor.logo_url} alt={sponsor.name} className="h-16 w-auto object-contain mb-3" />
                                ) : (
                                    <div className="h-16 w-16 bg-gray-100 rounded flex items-center justify-center mb-3">
                                        <Heart className="h-8 w-8 text-gray-400" />
                                    </div>
                                )}
                                <h3 className="font-medium">{sponsor.name}</h3>
                                {sponsor.description && (
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{sponsor.description}</p>
                                )}
                                {sponsor.website_url && (
                                    <a href={sponsor.website_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline mt-2 block">
                                        Visit website
                                    </a>
                                )}
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                                <input
                                    type="url"
                                    value={newSponsor.website_url}
                                    onChange={(e) => setNewSponsor({ ...newSponsor, website_url: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    placeholder="https://example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={newSponsor.description}
                                    onChange={(e) => setNewSponsor({ ...newSponsor, description: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                                <input
                                    type="url"
                                    value={editSponsor.website_url}
                                    onChange={(e) => setEditSponsor({ ...editSponsor, website_url: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    placeholder="https://example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={editSponsor.description}
                                    onChange={(e) => setEditSponsor({ ...editSponsor, description: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
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

function SettingsTab({ project }: { project: any }) {
    const updateMutation = useUpdateProject()
    const [formData, setFormData] = useState({
        title: project.title,
        slug: project.slug,
        description: project.description || '',
        hero_image_url: project.hero_image_url || '',
        status: project.status || 'draft',
        featured: project.featured || false,
    })

    const handleSave = async () => {
        await updateMutation.mutateAsync({ id: project.id, data: formData })
    }

    return (
        <div className="max-w-2xl space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none"
                    pattern="^[a-z0-9-]+$"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none"
                    rows={4}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hero Image</label>
                <ImageUploader
                    value={formData.hero_image_url}
                    onChange={(url) => setFormData({ ...formData, hero_image_url: url })}
                    folder="projects"
                    aspectRatio="video"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as UploadStatus })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none"
                >
                    {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            </div>
            <div className="flex items-center gap-3">
                <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                />
                <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                    Featured Project
                    <span className="block text-xs text-gray-500">Show in the featured section on the projects page</span>
                </label>
            </div>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
                <Save className="h-4 w-4 mr-1" />
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
        </div>
    )
}
