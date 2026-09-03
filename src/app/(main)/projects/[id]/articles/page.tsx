import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/buttons/Button"
import { createClient } from "@/lib/supabase/server"
import { PageContainer } from "@/components/layout/PageContainer"
import { ArrowRight } from "lucide-react"

export default async function ProjectArticlesPage({
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

  const { data: articles } = await supabase
    .from("articles")
    .select(`*, category:article_categories(name)`)
    .eq("project_id", project.id)
    .eq("status", "published")
    .order("published_at", { ascending: false })

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <section className="py-16">
        <PageContainer>
          <h1 className="mb-6 text-4xl font-semibold text-foreground lg:text-5xl">Technical Articles</h1>
          <p className="max-w-3xl text-lg text-muted-foreground">
            Explore in-depth technical documentation, research findings, and insights from the {project.title} project team.
          </p>
        </PageContainer>
      </section>

      <section className="flex-1 pb-8">
        <PageContainer>
          {articles && articles.length > 0 ? (
            <div className="space-y-6">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/projects/${project.slug}/articles/${article.slug}`}
                  className="group lab-plate grid grid-cols-1 overflow-hidden rounded-2xl lg:grid-cols-3"
                >
                  {article.image_url ? (
                    <div className="relative h-64 lg:h-auto">
                      <Image
                        src={article.image_url}
                        alt={article.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-64 items-center justify-center bg-muted lg:h-auto">
                      <span className="text-6xl font-bold text-black/10">{article.title.charAt(0)}</span>
                    </div>
                  )}
                  <div className="flex flex-col justify-center p-8 lg:col-span-2">
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                      {article.category?.name ? (
                        <span className="rounded-full bg-purdue-gold/15 px-3 py-1 font-mono text-xs text-purdue-gold">
                          {article.category.name}
                        </span>
                      ) : null}
                      {article.published_at ? (
                        <span className="text-sm text-muted-foreground">
                          {new Date(article.published_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      ) : null}
                      {article.time_to_read ? (
                        <span className="text-sm text-muted-foreground">{article.time_to_read} min read</span>
                      ) : null}
                    </div>
                    <h2 className="mb-4 text-2xl font-semibold text-foreground group-hover:text-purdue-gold">
                      {article.title}
                    </h2>
                    {article.description ? (
                      <p className="mb-6 text-muted-foreground">{article.description}</p>
                    ) : null}
                    {article.author_name ? (
                      <p className="mb-6 text-sm text-muted-foreground">{article.author_name}</p>
                    ) : null}
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-purdue-gold">
                      Read Article <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-black/15 py-16 text-center text-muted-foreground">
              No articles published yet.
            </div>
          )}
        </PageContainer>
      </section>

      <section className="py-16">
        <PageContainer className="text-center">
          <h2 className="mb-4 text-3xl font-semibold text-foreground">Want to Learn More?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
            Explore the project overview and meet our team.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <Link href={`/projects/${project.slug}`}>Back to Project</Link>
            </Button>
            <Button asChild size="lg" className="rounded-full">
              <Link href={`/projects/${project.slug}/team`}>Meet the Team</Link>
            </Button>
          </div>
        </PageContainer>
      </section>
    </div>
  )
}
