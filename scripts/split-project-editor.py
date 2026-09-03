from pathlib import Path

src = Path("src/app/(dasboard)/dashboard/projects/[id]/page.tsx")
text = src.read_text(encoding="utf-8")
lines = text.splitlines(True)

def slice_lines(start, end):
    return "".join(lines[start-1:end])

out = Path("src/components/dashboard/projects")
out.mkdir(parents=True, exist_ok=True)
(out / "tabs").mkdir(exist_ok=True)

header = '''"use client"

import { useState } from 'react'
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
    Save,
    Plus,
    Trash2,
    GripVertical,
    RefreshCw,
    ChevronUp,
    ChevronDown,
} from 'lucide-react'
import type { UploadStatus, ProjectComponent, ProjectTeamMemberWithTeam, SubProject, Article, ProjectSponsor } from '@/lib/schemas/project'
import { ConfirmDialog } from '@/components/dashboard/ui/ConfirmDialog'
import { FormModal } from '@/components/dashboard/ui/FormModal'

'''

# Original ranges are 1-indexed inclusive
# ComponentEditor 152-349
# OverviewTab 351-441
# TeamTab 443-750
# SubProjectsTab 752-1003
# ArticlesTab 1005-1376
# SponsorsTab 1378-1645
# SettingsTab 1647-end

(out / "tabs" / "OverviewTab.tsx").write_text(header + slice_lines(152, 441), encoding="utf-8")
(out / "tabs" / "TeamTab.tsx").write_text(header + slice_lines(443, 750), encoding="utf-8")
(out / "tabs" / "SubProjectsTab.tsx").write_text(header + slice_lines(752, 1003), encoding="utf-8")
(out / "tabs" / "ArticlesTab.tsx").write_text(header + slice_lines(1005, 1376), encoding="utf-8")
(out / "tabs" / "SponsorsTab.tsx").write_text(header + slice_lines(1378, 1645), encoding="utf-8")
(out / "tabs" / "SettingsTab.tsx").write_text(header + slice_lines(1647, len(lines)), encoding="utf-8")
print("split ok", [p.name for p in (out/"tabs").iterdir()])
