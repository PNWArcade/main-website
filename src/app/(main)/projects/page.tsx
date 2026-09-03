import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import ProjectCard from "@/components/ui/cards/ProjectCard"
import DetailedProjectCard from "@/components/ui/cards/DetailedProjectCard"
import { PageHero } from "@/components/layout/PageHero"
import { PageContainer } from "@/components/layout/PageContainer"
import { Button } from "@/components/ui/buttons/Button"
import { FALLBACK_IMAGE } from "@/config/routes"
import { Reveal } from "@/components/motion/Reveal"

export default async function ProjectsPage() {
  const supabase = await createClient()

  const [{ data: projects }, { data: featuredProjects }] = await Promise.all([
    supabase
      .from("projects")
      .select("*, category:project_categories(*)")
      .eq("status", "published")
      .order("order_index", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("projects")
      .select("*, category:project_categories(*)")
      .eq("status", "published")
      .eq("featured", true)
      .order("order_index", { ascending: true, nullsFirst: false }),
  ])

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHero
        eyebrow="STUDENT INNOVATIONS"
        title="Innovation is designed and built"
        description="Discover cutting-edge student projects pushing boundaries and creating solutions for tomorrow's challenges."
        image="/goblin.jpeg"
        imageAlt="ARCADE projects"
      >
        <Button asChild className="rounded-full">
          <Link href="#featured">Explore Projects</Link>
        </Button>
      </PageHero>

      <PageContainer className="py-12">
        <h2 className="mb-8 text-3xl font-semibold text-foreground">Featured Projects</h2>
        {!featuredProjects?.length ? (
          <p className="py-8 text-center text-muted-foreground">No featured projects yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                title={project.title}
                image={project.hero_image_url || FALLBACK_IMAGE}
                link={`/projects/${project.slug}`}
              />
            ))}
          </div>
        )}
      </PageContainer>

      <PageContainer id="featured" className="py-16">
        <h2 className="mb-8 text-3xl font-semibold text-foreground">All Projects</h2>
        {!projects?.length ? (
          <p className="py-8 text-center text-muted-foreground">No projects available yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <Reveal key={project.id} delay={index * 0.04}>
                <DetailedProjectCard
                  id={project.id}
                  title={project.title}
                  category={project.category?.name?.toUpperCase() ?? "PROJECT"}
                  description={project.description ?? ""}
                  image={project.hero_image_url || FALLBACK_IMAGE}
                  link={`/projects/${project.slug}`}
                />
              </Reveal>
            ))}
          </div>
        )}
      </PageContainer>
    </div>
  )
}
