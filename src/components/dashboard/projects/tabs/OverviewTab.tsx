"use client"

import { useState } from 'react'
import {
    useProjectComponents,
    useCreateProjectComponent,
    useUpdateProjectComponent,
    useDeleteProjectComponent,
} from '@/hooks/useProjects'
import { Button } from '@/components/ui/buttons/Button'
import ImageUploader, { uploadImageToBucket } from '@/components/ui/ImageUploader'
import { Save, Plus, Trash2, GripVertical, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react'
import type { ProjectComponent } from '@/lib/schemas/project'
import { useConfirm } from '@/components/dashboard/ui/useConfirm'

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
    const [saveError, setSaveError] = useState('')
    
    // Track if there are unsaved changes
    const hasChanges = 
        localData.title !== (component.title || '') ||
        localData.description !== (component.description || '') ||
        localData.image_url !== (component.image_url || '') ||
        localData.image_title !== (component.image_title || '') ||
        pendingImageFile !== null

    const handleSave = async () => {
        if (!localData.title.trim()) {
            setSaveError('Title is required')
            return
        }
        setSaveError('')
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
        <div className="bg-card border border-border rounded-lg overflow-hidden">
            {/* Component Header - Title is read-only display */}
            <div className="flex items-center gap-2 px-4 py-3 bg-muted border-b">
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                <div className="flex gap-1">
                    <button
                        onClick={() => onMove('up')}
                        disabled={!canMoveUp}
                        className="p-1 hover:bg-secondary rounded disabled:opacity-30"
                    >
                        <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => onMove('down')}
                        disabled={!canMoveDown}
                        className="p-1 hover:bg-secondary rounded disabled:opacity-30"
                    >
                        <ChevronDown className="h-4 w-4" />
                    </button>
                </div>
                <span className="flex-1 font-medium text-foreground truncate">
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
                    className="p-1 text-red-500 hover:bg-red-500/10 rounded"
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
                                <label className="block text-sm font-medium text-muted-foreground mb-1">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={localData.title}
                                    onChange={(e) => setLocalData({ ...localData, title: e.target.value })}
                                    className="w-full border border-input rounded-lg px-3 py-2 focus:ring-2 focus:ring-purdue-gold focus:outline-none"
                                    placeholder="Enter block title"
                                    required
                                />
                                {saveError ? <p className="mt-1 text-sm text-destructive">{saveError}</p> : null}
                            </div>

                            {/* Paragraph Textarea */}
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">
                                    Paragraph
                                </label>
                                <textarea
                                    value={localData.description}
                                    onChange={(e) => setLocalData({ ...localData, description: e.target.value })}
                                    className="w-full border border-input rounded-lg px-3 py-2 focus:ring-2 focus:ring-purdue-gold focus:outline-none min-h-[200px] resize-y"
                                    placeholder="Enter paragraph text..."
                                />
                            </div>
                        </div>

                        {/* Right side - Image Upload */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">
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
                                <label className="block text-sm font-medium text-muted-foreground mb-1">
                                    Image Caption
                                </label>
                                <input
                                    type="text"
                                    value={localData.image_title}
                                    onChange={(e) => setLocalData({ ...localData, image_title: e.target.value })}
                                    className="w-full border border-input rounded-lg px-3 py-2 focus:ring-2 focus:ring-purdue-gold focus:outline-none"
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

export function OverviewTab({ projectId }: { projectId: string }) {
    const { data: components, isLoading } = useProjectComponents(projectId)
    const createMutation = useCreateProjectComponent()
    const updateMutation = useUpdateProjectComponent()
    const deleteMutation = useDeleteProjectComponent()
    const { confirm, dialog } = useConfirm()

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
        if (!(await confirm('Delete this component?', 'This cannot be undone.'))) return
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
        return <div className="flex justify-center py-8"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
    }

    return (
        <div className="space-y-6">
            {dialog}
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
                <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                    <p className="text-muted-foreground mb-4">No blocks yet</p>
                    <p className="text-sm text-muted-foreground">Each block has a title, paragraph, and optional image</p>
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
