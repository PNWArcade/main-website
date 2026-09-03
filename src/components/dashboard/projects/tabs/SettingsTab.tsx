"use client"

import { useState } from 'react'
import { useUpdateProject } from '@/hooks/useProjects'
import { Button } from '@/components/ui/buttons/Button'
import ImageUploader from '@/components/ui/ImageUploader'
import type { UploadStatus } from '@/lib/schemas/project'
import { Save } from 'lucide-react'

import { statusOptions } from '@/components/dashboard/projects/statusOptions'

export function SettingsTab({ project }: { project: any }) {
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
                <label className="block text-sm font-medium text-muted-foreground mb-1">Title</label>
                <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border border-input rounded-lg px-3 py-2 focus:ring-2 focus:ring-purdue-gold focus:outline-none"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Slug</label>
                <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full border border-input rounded-lg px-3 py-2 focus:ring-2 focus:ring-purdue-gold focus:outline-none"
                    pattern="^[a-z0-9-]+$"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-input rounded-lg px-3 py-2 focus:ring-2 focus:ring-purdue-gold focus:outline-none"
                    rows={4}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Hero Image</label>
                <ImageUploader
                    value={formData.hero_image_url}
                    onChange={(url) => setFormData({ ...formData, hero_image_url: url })}
                    folder="projects"
                    aspectRatio="video"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Status</label>
                <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as UploadStatus })}
                    className="w-full border border-input rounded-lg px-3 py-2 focus:ring-2 focus:ring-purdue-gold focus:outline-none"
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
                    className="h-4 w-4 text-black focus:ring-purdue-gold border-input rounded"
                />
                <label htmlFor="featured" className="text-sm font-medium text-muted-foreground">
                    Featured Project
                    <span className="block text-xs text-muted-foreground">Show in the featured section on the projects page</span>
                </label>
            </div>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
                <Save className="h-4 w-4 mr-1" />
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
        </div>
    )
}
