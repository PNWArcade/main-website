import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import SubProjectCard from "@/components/ui/cards/SubProjectCard"
import { Button } from "@/components/ui/buttons/Button"
import { createClient } from "@/lib/supabase/server"
import { PageContainer } from "@/components/layout/PageContainer"
import { FALLBACK_IMAGE } from "@/config/routes"

export default async function ProjectDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", id)
    .eq("status", "published")
    .single()

  if (error || !project) notFound()

  const [{ data: components }, { data: subProjects }, { data: sponsors }] = await Promise.all([
    supabase
      .from("project_components")
      .select("*")
      .eq("project_id", project.id)
      .order("order_index", { ascending: true }),
    supabase
      .from("sub_projects")
      .select("*")
      .eq("project_id", project.id)
      .eq("status", "published")
      .order("order_index", { ascending: true }),
    supabase
      .from("project_sponsors")
      .select("*")
      .eq("project_id", project.id)
      .order("order_index", { ascending: true }),
  ])

  return (
    <div className="min-h-screen bg-background pb-16">
      <section className="relative overflow-hidden bg-muted">
        {project.hero_image_url ? (
          <div className="absolute inset-0 z-0">
            <Image
              src={project.hero_image_url}
              alt={project.title}
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-b from-white/25 via-white/45 to-white" />
          </div>
        ) : null}
        <div className="relative z-10 py-20">
          <PageContainer>
            <div className="max-w-2xl">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground lg:text-5xl">
                {project.title}
              </h1>
              {project.description ? (
                <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{project.description}</p>
              ) : null}
            </div>
          </PageContainer>
        </div>
      </section>

      {components && components.length > 0 ? (
        <section className="py-20">
          <PageContainer className="space-y-16">
            {components.map((component, index) => {
              const imageOnLeft = index % 2 === 1
              return (
                <div key={component.id} className="grid items-center gap-12 lg:grid-cols-2">
                  <div className={imageOnLeft ? "lg:order-2" : "lg:order-1"}>
                    {component.title ? (
                      <h2 className="mb-6 text-3xl font-semibold text-foreground lg:text-4xl">
                        {component.title}
                      </h2>
                    ) : null}
                    {component.description ? (
                      <p className="whitespace-pre-wrap text-lg leading-relaxed text-muted-foreground">
                        {component.description}
                      </p>
                    ) : null}
                  </div>
                  {component.image_url ? (
                    <div
                      className={`relative h-[400px] w-full lg:h-[500px] ${imageOnLeft ? "lg:order-1" : "lg:order-2"}`}
                    >
                      <Image
                        src={component.image_url}
                        alt={component.image_title || component.title || "Project image"}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="rounded-2xl object-cover"
                      />
                    </div>
                  ) : null}
                </div>
              )
            })}
          </PageContainer>
        </section>
      ) : null}

      {subProjects && subProjects.length > 0 ? (
        <section className="py-20">
          <PageContainer>
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-semibold text-foreground">Sub-Projects & Components</h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Explore the individual sub-projects and technical components that make up this larger initiative.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {subProjects.slice(0, 3).map((subProject) => (
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
            <div className="mt-10 text-center">
              <Button asChild size="lg" className="rounded-full">
                <Link href={`/projects/${project.slug}/sub-projects`}>Explore Sub-Projects</Link>
              </Button>
            </div>
          </PageContainer>
        </section>
      ) : null}

      {sponsors && sponsors.length > 0 ? (
        <section className="border-t border-black/10 py-16">
          <PageContainer>
            <div className="mb-10 text-center">
              <h2 className="mb-3 text-2xl font-semibold text-foreground">Our Sponsors</h2>
              <p className="mx-auto max-w-xl text-muted-foreground">
                We are grateful for the support of our sponsors who make this project possible.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-10">
              {sponsors.map((sponsor) =>
                sponsor.website_url ? (
                  <a
                    key={sponsor.id}
                    href={sponsor.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {sponsor.logo_url ? (
                      <Image
                        src={sponsor.logo_url}
                        alt={sponsor.name}
                        width={160}
                        height={80}
                        className="h-16 w-auto object-contain grayscale hover:grayscale-0"
                        style={{ width: "auto", height: "auto" }}
                      />
                    ) : (
                      <span className="text-lg font-medium text-muted-foreground hover:text-foreground">
                        {sponsor.name}
                      </span>
                    )}
                  </a>
                ) : (
                  <div key={sponsor.id}>
                    {sponsor.logo_url ? (
                      <Image
                        src={sponsor.logo_url}
                        alt={sponsor.name}
                        width={160}
                        height={80}
                        className="h-16 w-auto object-contain grayscale"
                        style={{ width: "auto", height: "auto" }}
                      />
                    ) : (
                      <span className="text-lg font-medium text-muted-foreground">{sponsor.name}</span>
                    )}
                  </div>
                )
              )}
            </div>
          </PageContainer>
        </section>
      ) : null}

      <section className="py-20">
        <PageContainer className="text-center">
          <h2 className="mb-4 text-3xl font-semibold text-foreground">Learn More About This Project</h2>
          <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
            Explore detailed technical documentation and meet the team behind the project.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="rounded-full">
              <Link href={`/projects/${project.slug}/articles`}>Technical Articles</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <Link href={`/projects/${project.slug}/team`}>Meet the Team</Link>
            </Button>
          </div>
        </PageContainer>
      </section>
    </div>
  )
}
