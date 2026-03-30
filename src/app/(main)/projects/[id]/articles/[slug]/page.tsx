import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import TiptapRenderer from '@/components/blog/TiptapRenderer';
import { Button } from '@/components/ui/buttons/Button';

export default async function ArticlePage({ params }: { params: Promise<{ id: string; slug: string }> }) {
    const { id, slug } = await params;
    const supabase = await createClient();

    // Fetch the project by slug
    const { data: project } = await supabase
        .from('projects')
        .select('id, title')
        .eq('slug', id)
        .single();

    if (!project) {
        notFound();
    }

    // Fetch the article by slug and project_id, with category info
    const { data: article } = await supabase
        .from('articles')
        .select(`
            *,
            category:article_categories(name)
        `)
        .eq('project_id', project.id)
        .eq('slug', slug)
        .single();

    if (!article) {
        notFound();
    }

    // Parse the content if it's a string
    const content = typeof article.content === 'string' 
        ? JSON.parse(article.content) 
        : article.content;

    // Format dates and reading time
    const formattedDate = article.published_at 
        ? new Date(article.published_at).toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
        })
        : new Date(article.created_at).toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
        });

    const readTime = article.time_to_read 
        ? `${article.time_to_read} min read` 
        : '5 min read';

    const authorName = article.author_name || 'Unknown Author';
    const categoryName = article.category?.name || 'Article';

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Hero Section */}
            <section className="relative bg-black overflow-hidden">
                {article.image_url && (
                    <div className="absolute inset-0 z-0">
                        <Image
                            src={article.image_url}
                            alt={article.title}
                            fill
                            className="opacity-30 object-cover"
                        />
                    </div>
                )}

                <div className="relative z-10 py-20">
                    <div className="container mx-auto px-6 lg:px-12">
                        <div className="max-w-4xl mx-auto">
                            <Link href={`/projects/${id}/articles`} className="text-white/70 hover:text-white mb-4 inline-block">
                                ← Back to Articles
                            </Link>
                            
                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-xs font-semibold text-white bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                                    {categoryName}
                                </span>
                                <span className="text-sm text-white/70">{formattedDate}</span>
                                <span className="text-sm text-white/70">•</span>
                                <span className="text-sm text-white/70">{readTime}</span>
                            </div>

                            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                                {article.title}
                            </h1>
                            
                            {article.description && (
                                <p className="text-white/90 text-lg leading-relaxed mb-8">
                                    {article.description}
                                </p>
                            )}

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                    <span className="text-lg font-bold text-white">
                                        {authorName.split(' ').map((n: string) => n[0]).join('')}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-base font-semibold text-white">{authorName}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Article Content */}
            <section className="py-20 bg-white flex-1">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-4xl mx-auto">
                        <article className="prose prose-lg max-w-none">
                            <TiptapRenderer content={content} />
                        </article>
                    </div>
                </div>
            </section>

            {/* Navigation */}
            <section className="py-12 bg-gray-50 border-t border-gray-200 mt-auto">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-4xl mx-auto flex flex-wrap justify-between gap-4">
                        <Link href={`/projects/${id}/articles`}>
                            <Button variant="outline" size="lg" className="rounded-2xl">
                                ← All Articles
                            </Button>
                        </Link>
                        <Link href={`/projects/${id}`}>
                            <Button variant="black" size="lg" className="rounded-2xl">
                                Back to Project
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
