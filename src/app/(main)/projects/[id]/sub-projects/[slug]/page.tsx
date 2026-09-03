import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import TiptapRenderer from "@/components/blog/TiptapRenderer"
import { PageContainer } from "@/components/layout/PageContainer"

export default async function SubProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>
}) {
  const { id, slug } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from("projects")
    .select("id, title")
    .eq("slug", id)
    .single()

  if (!project) notFound()

  const { data: subProject } = await supabase
    .from("sub_projects")
    .select("*")
    .eq("project_id", project.id)
    .eq("slug", slug)
    .single()

  if (!subProject) notFound()

  const content =
    typeof subProject.content === "string" ? JSON.parse(subProject.content) : subProject.content

  const formattedDate = subProject.published_at
    ? new Date(subProject.published_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : new Date(subProject.created_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })

  const authorName = subProject.author_name || "Unknown Author"

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-black/10">
        <PageContainer className="py-4">
          <Link
            href={`/projects/${id}/sub-projects`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sub-Projects
          </Link>
        </PageContainer>
      </div>

      <section className="relative overflow-hidden bg-muted">
        {subProject.image_url ? (
          <div className="absolute inset-0 z-0">
            <Image
              src={subProject.image_url}
              alt={subProject.title}
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-b from-white/25 via-white/45 to-white" />
          </div>
        ) : null}
        <div className="relative z-10 py-20">
          <PageContainer>
            <div className="max-w-3xl">
              <h1 className="mb-4 text-4xl font-semibold text-foreground lg:text-5xl">{subProject.title}</h1>
              {subProject.description ? (
                <p className="mb-6 text-xl text-muted-foreground">{subProject.description}</p>
              ) : null}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{authorName}</span>
                <span>•</span>
                <span>{formattedDate}</span>
              </div>
            </div>
          </PageContainer>
        </div>
      </section>

      <section className="py-16">
        <PageContainer>
          <div className="mx-auto max-w-4xl">
            {content ? <TiptapRenderer content={content} /> : null}
          </div>
        </PageContainer>
      </section>
    </div>
  )
}
