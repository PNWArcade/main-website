from pathlib import Path

ROOT = Path("src")

REPLACEMENTS = [
    ("bg-white ", "bg-card "),
    ("bg-white\"", "bg-card\""),
    ("bg-white'", "bg-card'"),
    ("text-gray-900", "text-foreground"),
    ("text-purdue-black", "text-foreground"),
    ("text-gray-800", "text-foreground"),
    ("text-gray-700", "text-muted-foreground"),
    ("text-gray-600", "text-muted-foreground"),
    ("text-gray-500", "text-muted-foreground"),
    ("text-gray-400", "text-muted-foreground"),
    ("text-gray-300", "text-muted-foreground"),
    ("border-gray-200", "border-border"),
    ("border-gray-100", "border-border"),
    ("border-gray-300", "border-input"),
    ("bg-gray-50", "bg-muted"),
    ("bg-gray-100", "bg-secondary"),
    ("bg-gray-200", "bg-secondary"),
    ("hover:bg-gray-100", "hover:bg-white/5"),
    ("hover:bg-gray-50", "hover:bg-white/5"),
    ("hover:bg-red-50", "hover:bg-red-500/10"),
    ("hover:bg-green-50", "hover:bg-emerald-500/10"),
    ("hover:bg-yellow-50", "hover:bg-purdue-gold/10"),
    ("bg-white/80", "bg-card/80"),
    ("shadow-sm", ""),
    ("bg-blue-100 text-blue-800", "bg-purdue-gold/15 text-purdue-gold"),
    ("bg-blue-100 text-blue-700", "bg-purdue-gold/15 text-purdue-gold"),
    ("bg-yellow-100 text-yellow-800", "bg-purdue-gold/15 text-purdue-gold"),
    ("bg-green-100 text-green-800", "bg-emerald-500/15 text-emerald-300"),
    ("bg-gray-100 text-gray-800", "bg-white/8 text-muted-foreground"),
    ("focus:ring-yellow-500", "focus:ring-purdue-gold"),
    ("focus:ring-black", "focus:ring-purdue-gold"),
    ("text-indigo-600", "text-purdue-gold"),
]

FILES = [
    "src/app/(dasboard)/dashboard/inquiries/page.tsx",
    "src/app/(dasboard)/dashboard/sponsors/page.tsx",
    "src/app/(dasboard)/dashboard/members/page.tsx",
    "src/app/(dasboard)/dashboard/teams/page.tsx",
    "src/app/(dasboard)/dashboard/team-overrides/page.tsx",
    "src/components/dashboard/inquiries/InquiryCard.tsx",
    "src/components/dashboard/inquiries/StatusFilter.tsx",
    "src/components/dashboard/inquiries/RefreshButton.tsx",
    "src/components/dashboard/projects/tabs/OverviewTab.tsx",
    "src/components/dashboard/projects/tabs/TeamTab.tsx",
    "src/components/dashboard/projects/tabs/SubProjectsTab.tsx",
    "src/components/dashboard/projects/tabs/ArticlesTab.tsx",
    "src/components/dashboard/projects/tabs/SponsorsTab.tsx",
    "src/components/dashboard/projects/tabs/SettingsTab.tsx",
]

for path in FILES:
    p = Path(path)
    text = p.read_text(encoding="utf-8")
    for old, new in REPLACEMENTS:
        text = text.replace(old, new)
    p.write_text(text, encoding="utf-8")
    print("restyled", path)

tabs = {
    "OverviewTab": "export function OverviewTab",
    "TeamTab": "export function TeamTab",
    "SubProjectsTab": "export function SubProjectsTab",
    "ArticlesTab": "export function ArticlesTab",
    "SponsorsTab": "export function SponsorsTab",
    "SettingsTab": "export function SettingsTab",
}
for name, exported in tabs.items():
    p = Path(f"src/components/dashboard/projects/tabs/{name}.tsx")
    text = p.read_text(encoding="utf-8")
    text = text.replace(f"function {name}", exported)
    p.write_text(text, encoding="utf-8")
    print("exported", name)
