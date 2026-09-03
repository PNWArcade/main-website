"use client"

import { use } from "react"
import { ProjectEditorShell } from "@/components/dashboard/projects/ProjectEditorShell"

export default function ProjectEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <ProjectEditorShell id={id} />
}
