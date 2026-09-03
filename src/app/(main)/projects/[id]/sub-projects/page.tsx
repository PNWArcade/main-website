import { notFound } from "next/navigation"
import SubProjectCard from "@/components/ui/cards/SubProjectCard"
import { createClient } from "@/lib/supabase/server"
import { PageContainer } from "@/components/layout/PageContainer"
import { FALLBACK_IMAGE } from "@/config/routes"

export default async function SubProjectsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project, error } = await supabase
    .from("projects")
    .select("id, title, slug")
    .eq("slug", id)
    .single()

  if (error || !project) notFound()

  const { data: subProjects } = await supabase
    .from("sub_projects")
    .select("*")
    .eq("project_id", project.id)
    .eq("status", "published")
    .order("order_index", { ascending: true })

  return (
    <div className="min-h-screen bg-background py-16">
      <PageContainer>
        <div className="mb-16 max-w-3xl">
          <h1 className="mb-6 text-4xl font-semibold text-foreground lg:text-5xl">
            {project.title} Sub-Projects
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Explore the individual components and iterations that make up the {project.title} project.
            Each sub-project represents a focused effort on specific aspects of the overall initiative.
          </p>
        </div>

        {subProjects && subProjects.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {subProjects.map((subProject) => (
              <SubProjectCard
                key={subProject.id}
                href={`/projects/${project.slug}/sub-projects/${subProject.slug}`}
                imageSrc={subProject.image_url || FALLBACK_IMAGE}
                title={subProject.title}
                description={subProject.description || ""}
                imageAlt={subProject.title}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-black/15 py-16 text-center text-muted-foreground">
            No sub-projects available yet.
          </div>
        )}
      </PageContainer>
    </div>
  )
}
