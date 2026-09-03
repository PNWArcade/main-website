from pathlib import Path

HEADERS = {
"OverviewTab.tsx": '''"use client"

import { useState } from 'react'
import {
    useProjectComponents,
    useCreateProjectComponent,
    useUpdateProjectComponent,
    useDeleteProjectComponent,
} from '@/hooks/useProjects'
import { Button } from '@/components/ui/buttons/Button'
import ImageUploader, { uploadImageToBucket } from '@/components/ui/ImageUploader'
import { cn } from '@/lib/utils'
import { Save, Plus, Trash2, GripVertical, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react'
import type { ProjectComponent } from '@/lib/schemas/project'
import { useConfirm } from '@/components/dashboard/ui/useConfirm'

''',
"TeamTab.tsx": '''"use client"

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
import ImageUploader, { uploadImageToBucket } from '@/components/ui/ImageUploader'
import type { ProjectTeamMemberWithTeam } from '@/lib/schemas/project'
import { useConfirm } from '@/components/dashboard/ui/useConfirm'
import { Plus, Trash2, RefreshCw } from 'lucide-react'

''',
"SubProjectsTab.tsx": '''"use client"

import { useState } from 'react'
import {
    useSubProjects,
    useCreateSubProject,
    useUpdateSubProject,
    useDeleteSubProject,
} from '@/hooks/useProjects'
import { Button } from '@/components/ui/buttons/Button'
import TiptapEditor from '@/components/editor/TiptapEditor'
import ImageUploader, { uploadImageToBucket } from '@/components/ui/ImageUploader'
import type { SubProject } from '@/lib/schemas/project'
import { useConfirm } from '@/components/dashboard/ui/useConfirm'
import { Plus, Trash2, RefreshCw } from 'lucide-react'

''',
"ArticlesTab.tsx": '''"use client"

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
import type { Article } from '@/lib/schemas/project'
import { useConfirm } from '@/components/dashboard/ui/useConfirm'
import { Plus, Trash2, RefreshCw } from 'lucide-react'

''',
"SponsorsTab.tsx": '''"use client"

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
import { Plus, Trash2, RefreshCw } from 'lucide-react'

''',
"SettingsTab.tsx": '''"use client"

import { useState } from 'react'
import { useUpdateProject } from '@/hooks/useProjects'
import { Button } from '@/components/ui/buttons/Button'
import ImageUploader from '@/components/ui/ImageUploader'
import type { UploadStatus } from '@/lib/schemas/project'
import { Save } from 'lucide-react'

''',
}

tab_dir = Path("src/components/dashboard/projects/tabs")
for name, header in HEADERS.items():
    p = tab_dir / name
    text = p.read_text(encoding="utf-8")
    idx = text.find("function ") if name != "OverviewTab.tsx" else text.find("function ComponentEditor")
    if name != "OverviewTab.tsx":
        # first exported or function
        for needle in ["export function", "function "]:
            i = text.find(needle)
            if i >= 0:
                idx = i
                break
    p.write_text(header + text[idx:], encoding="utf-8")
    print("header", name, idx)
