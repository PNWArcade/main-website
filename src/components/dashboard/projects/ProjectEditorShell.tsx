"use client"

import { useState } from "react"
import Link from "next/link"
import { useProject } from "@/hooks/useProjects"
import { Button } from "@/components/ui/buttons/Button"
import { cn } from "@/lib/utils"
import { ArrowLeft, FileText, Users, Layers, Settings, Heart } from "lucide-react"
import { OverviewTab } from "@/components/dashboard/projects/tabs/OverviewTab"
import { TeamTab } from "@/components/dashboard/projects/tabs/TeamTab"
import { SubProjectsTab } from "@/components/dashboard/projects/tabs/SubProjectsTab"
import { ArticlesTab } from "@/components/dashboard/projects/tabs/ArticlesTab"
import { SponsorsTab } from "@/components/dashboard/projects/tabs/SponsorsTab"
import { SettingsTab } from "@/components/dashboard/projects/tabs/SettingsTab"
import { LoadingState } from "@/components/dashboard/ui/LoadingState"

type Tab = "overview" | "team" | "sub-projects" | "articles" | "sponsors" | "settings"

export function ProjectEditorShell({ id }: { id: string }) {
  const [activeTab, setActiveTab] = useState<Tab>("overview")
  const { data: project, isLoading } = useProject(id)

  if (isLoading) return <LoadingState />

  if (!project) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Project not found</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/projects">Back to Projects</Link>
        </Button>
      </div>
    )
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <FileText className="h-4 w-4" /> },
    { id: "team", label: "Team", icon: <Users className="h-4 w-4" /> },
    { id: "sub-projects", label: "Sub-Projects", icon: <Layers className="h-4 w-4" /> },
    { id: "articles", label: "Articles", icon: <FileText className="h-4 w-4" /> },
    { id: "sponsors", label: "Sponsors", icon: <Heart className="h-4 w-4" /> },
    { id: "settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/projects">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-foreground">{project.title}</h1>
          <p className="font-mono text-sm text-muted-foreground">/{project.slug}</p>
        </div>
      </div>

      <div className="border-b border-border">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors",
                activeTab === tab.id
                  ? "border-purdue-gold text-purdue-gold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "overview" && <OverviewTab projectId={id} />}
      {activeTab === "team" && <TeamTab projectId={id} />}
      {activeTab === "sub-projects" && <SubProjectsTab projectId={id} />}
      {activeTab === "articles" && <ArticlesTab projectId={id} />}
      {activeTab === "sponsors" && <SponsorsTab projectId={id} />}
      {activeTab === "settings" && <SettingsTab project={project} />}
    </div>
  )
}
