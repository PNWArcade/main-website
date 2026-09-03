from pathlib import Path

def patch(path, marker, confirm_line, new_confirm_line, insert_dialog_after=None):
    p = Path(path)
    text = p.read_text(encoding="utf-8")
    if "useConfirm" not in text:
        text = text.replace(marker, marker + "\nimport { useConfirm } from '@/components/dashboard/ui/useConfirm'")
    text = text.replace(confirm_line, new_confirm_line)
    p.write_text(text, encoding="utf-8")
    print("patched", path)

# sponsors
p = Path("src/app/(dasboard)/dashboard/sponsors/page.tsx")
text = p.read_text(encoding="utf-8")
if "useConfirm" not in text:
    text = text.replace(
        "import type { Sponsor, SponsorTier } from '@/lib/schemas/project'",
        "import type { Sponsor, SponsorTier } from '@/lib/schemas/project'\nimport { useConfirm } from '@/components/dashboard/ui/useConfirm'",
    )
text = text.replace(
    "export default function SponsorsPage() {\n    const { data: sponsors, isLoading, refetch } = useSponsors()",
    "export default function SponsorsPage() {\n    const { confirm, dialog } = useConfirm()\n    const { data: sponsors, isLoading, refetch } = useSponsors()",
)
text = text.replace(
    "if (!confirm('Delete this sponsor?')) return",
    "if (!(await confirm('Delete this sponsor?', 'This cannot be undone.'))) return",
)
if "{dialog}" not in text:
    text = text.replace("return (\n        <div className=\"space-y-6\">", "return (\n        <div className=\"space-y-6\">\n            {dialog}", 1)
p.write_text(text, encoding="utf-8")
print("sponsors")

# members
p = Path("src/app/(dasboard)/dashboard/members/page.tsx")
text = p.read_text(encoding="utf-8")
if "useConfirm" not in text:
    text = text.replace(
        "from 'lucide-react'",
        "from 'lucide-react'\nimport { useConfirm } from '@/components/dashboard/ui/useConfirm'",
    )
text = text.replace(
    "export default function MembersPage() {",
    "export default function MembersPage() {\n    const { confirm, dialog } = useConfirm()",
)
text = text.replace(
    "if (confirm(`Remove ${member.email} from the team?`)) {\n                                                deleteMemberMutation.mutate(member.id)\n                                            }",
    "confirm(`Remove ${member.email} from the team?`).then((ok) => { if (ok) deleteMemberMutation.mutate(member.id) })",
)
if "{dialog}" not in text:
    idx = text.find("return (")
    # insert after first return in MembersPage is hard; insert before last return's first div
    text = text.replace(
        "return (\n        <div className=\"space-y-8\">",
        "return (\n        <div className=\"space-y-8\">\n            {dialog}",
        1,
    )
p.write_text(text, encoding="utf-8")
print("members")

# team-overrides
p = Path("src/app/(dasboard)/dashboard/team-overrides/page.tsx")
text = p.read_text(encoding="utf-8")
if "useConfirm" not in text:
    text = text.replace(
        "from '@fortawesome/free-brands-svg-icons'",
        "from '@fortawesome/free-brands-svg-icons'\nimport { useConfirm } from '@/components/dashboard/ui/useConfirm'",
    )
text = text.replace(
    "export default function TeamOverridesPage() {",
    "export default function TeamOverridesPage() {\n    const { confirm, dialog } = useConfirm()",
)
text = text.replace(
    "if (!confirm('Remove this override? The member will revert to their scraped image.')) return",
    "if (!(await confirm('Remove this override? The member will revert to their scraped photo.'))) return",
)
if "{dialog}" not in text:
    text = text.replace(
        "    return (",
        "    return (\n        <>\n        {dialog}\n        <div className=\"__wrap_dialog\">",
        1,
    )
p.write_text(text, encoding="utf-8")
print("overrides")
