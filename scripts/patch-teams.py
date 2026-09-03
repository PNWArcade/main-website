from pathlib import Path

p = Path("src/app/(dasboard)/dashboard/teams/page.tsx")
text = p.read_text(encoding="utf-8")
start = text.index("const CATEGORY_LABELS")
end = text.index("const TEAM_URL")
text = (
    text[:start]
    + """import {
    CATEGORY_LABELS,
    EMPTY_MEMBER_FORM,
    MemberFormFields,
    type MemberFormData,
} from '@/components/dashboard/team/MemberFormFields'
import { useConfirm } from '@/components/dashboard/ui/useConfirm'

type MemberForm = MemberFormData
const EMPTY_FORM = EMPTY_MEMBER_FORM

"""
    + text[end:]
)
start = text.index("function MemberFormFields(")
end = text.index("export default function DashboardTeamPage()")
text = text[:start] + text[end:]
text = text.replace(
    "export default function DashboardTeamPage() {\n    const queryClient = useQueryClient()\n    const { toast, showToast, hideToast } = useToast()",
    "export default function DashboardTeamPage() {\n    const queryClient = useQueryClient()\n    const { toast, showToast, hideToast } = useToast()\n    const { confirm, dialog } = useConfirm()",
)
text = text.replace(
    "function handleDelete(member: ChapterTeamMember) {\n        if (!confirm(`Remove ${member.name} from the public team page?`)) return\n        deleteMutation.mutate(member.id)\n    }",
    "async function handleDelete(member: ChapterTeamMember) {\n        if (!(await confirm(`Remove ${member.name} from the public team page?`))) return\n        deleteMutation.mutate(member.id)\n    }",
)
old = '{toast && <Toast message={toast.message} type={toast.type} duration={toast.duration} onClose={hideToast} />}'
if old in text and "{dialog}" not in text:
    text = text.replace(old, "{dialog}\n            " + old, 1)
# former president confirm
text = text.replace(
    "if (!confirm(`Remove ${president.name} from former presidents?`)) return\n                                        deletePresidentMutation.mutate(president.id)",
    "confirm(`Remove ${president.name} from former presidents?`).then((ok) => { if (ok) deletePresidentMutation.mutate(president.id) })",
)
p.write_text(text, encoding="utf-8")
print("teams ok")
