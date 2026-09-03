import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import TiptapRenderer from "@/components/blog/TiptapRenderer"
import { Button } from "@/components/ui/buttons/Button"
import { PageContainer } from "@/components/layout/PageContainer"

export default async function ArticlePage({
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

  const { data: article } = await supabase
    .from("articles")
    .select(`*, category:article_categories(name)`)
    .eq("project_id", project.id)
    .eq("slug", slug)
    .single()

  if (!article) notFound()

  const content = typeof article.content === "string" ? JSON.parse(article.content) : article.content

  const formattedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : new Date(article.created_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })

  const readTime = article.time_to_read ? `${article.time_to_read} min read` : "5 min read"
  const authorName = article.author_name || "Unknown Author"
  const categoryName = article.category?.name || "Article"

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <section className="relative overflow-hidden bg-muted">
        {article.image_url ? (
          <div className="absolute inset-0 z-0">
            <Image
              src={article.image_url}
              alt={article.title}
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-b from-white/25 via-white/45 to-white" />
          </div>
        ) : null}
        <div className="relative z-10 py-20">
          <PageContainer>
            <div className="mx-auto max-w-4xl">
              <Link href={`/projects/${id}/articles`} className="mb-4 inline-block text-muted-foreground hover:text-foreground">
                ← Back to Articles
              </Link>
              <div className="mb-6 flex flex-wrap items-center gap-4">
                <span className="rounded-full bg-purdue-gold/15 px-3 py-1 font-mono text-xs text-purdue-aged">
                  {categoryName}
                </span>
                <span className="text-sm text-muted-foreground">{formattedDate}</span>
                <span className="text-sm text-muted-foreground">{readTime}</span>
              </div>
              <h1 className="mb-6 text-4xl font-semibold text-foreground lg:text-5xl">{article.title}</h1>
              {article.description ? (
                <p className="mb-8 text-lg text-muted-foreground">{article.description}</p>
              ) : null}
              <p className="font-medium text-foreground">{authorName}</p>
            </div>
          </PageContainer>
        </div>
      </section>

      <section className="flex-1 py-16">
        <PageContainer>
          <article className="mx-auto max-w-4xl">
            <TiptapRenderer content={content} />
          </article>
        </PageContainer>
      </section>

      <section className="mt-auto border-t border-black/10 py-12">
        <PageContainer>
          <div className="mx-auto flex max-w-4xl flex-wrap justify-between gap-4">
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <Link href={`/projects/${id}/articles`}>← All Articles</Link>
            </Button>
            <Button asChild size="lg" className="rounded-full">
              <Link href={`/projects/${id}`}>Back to Project</Link>
            </Button>
          </div>
        </PageContainer>
      </section>
    </div>
  )
}
