import Image from 'next/image';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {Button} from '@/components/ui/buttons/Button';
import { createClient } from '@/lib/supabase/server';

export default async function ProjectArticlesPage({params} : {
    params: Promise < {
        id: string
    } >
}) {
    const {id} = await params;
    const supabase = await createClient();

    // Fetch project by slug
    const { data: project, error } = await supabase
        .from('projects')
        .select('id, title, slug')
        .eq('slug', id)
        .single();

    if (error || !project) {
        notFound();
    }

    // Fetch articles for this project with category
    const { data: articles } = await supabase
        .from('articles')
        .select(`
            *,
            category:article_categories(name)
        `)
        .eq('project_id', project.id)
        .eq('status', 'published')
        .order('published_at', { ascending: false });

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Hero Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-3xl ">
                        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                            Technical Articles
                        </h1>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            Explore in-depth technical documentation, research findings, and insights 
                            from the {project.title} project team.
                        </p>
                    </div>
                </div>
            </section>

            {/* Articles Grid Section */}
            <section className="bg-white flex-1">
                <div className="container mx-auto px-6 lg:px-12">
                    {articles && articles.length > 0 ? (
                        <div className="space-y-8">
                            {articles.map((article) => (
                                <Link
                                    key={article.id}
                                    href={`/projects/${project.slug}/articles/${article.slug}`}
                                    className="group block">
                                    <div
                                        className="grid grid-cols-1 lg:grid-cols-3 gap-8 border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-black transition-all duration-300 bg-white">
                                        {/* Image Section */}
                                        {article.image_url ? (
                                            <div className="relative h-64 lg:h-auto">
                                                <Image
                                                    src={article.image_url}
                                                    alt={article.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                        ) : (
                                            <div className="relative h-64 lg:h-auto bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                                <span className="text-6xl font-bold text-gray-300">
                                                    {article.title.charAt(0)}
                                                </span>
                                            </div>
                                        )}

                                        {/* Content Section */}
                                        <div className="lg:col-span-2 p-8 flex flex-col justify-center">
                                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                                {article.category?.name && (
                                                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                                        {article.category.name}
                                                    </span>
                                                )}
                                                {article.published_at && (
                                                    <span className="text-sm text-gray-500">
                                                        {new Date(article.published_at).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </span>
                                                )}
                                                {article.time_to_read && (
                                                    <>
                                                        <span className="text-sm text-gray-500">•</span>
                                                        <span className="text-sm text-gray-500">{article.time_to_read} min read</span>
                                                    </>
                                                )}
                                            </div>

                                            <h2
                                                className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 group-hover:text-gray-700 transition-colors">
                                                {article.title}
                                            </h2>

                                            {article.description && (
                                                <p className="text-gray-600 text-base leading-relaxed mb-6">
                                                    {article.description}
                                                </p>
                                            )}

                                            {/* Author */}
                                            {article.author_name && (
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                        <span className="text-sm font-bold text-gray-600">
                                                            {article.author_name.split(' ').map((n: string) => n[0]).join('')}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">{article.author_name}</p>
                                                        <p className="text-xs text-gray-500">Author</p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mt-auto">
                                                <span className="text-sm font-semibold text-black group-hover:underline inline-flex items-center gap-2">
                                                    Read Article
                                                    <svg
                                                        className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M9 5l7 7-7 7"/>
                                                    </svg>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-lg">
                            <p className="text-gray-500 text-lg">No articles published yet.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-6 lg:px-12 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Want to Learn More?
                    </h2>
                    <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                        Explore the project overview and meet our team.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href={`/projects/${project.slug}`}>
                            <Button variant="outline" size="lg" className="rounded-2xl">
                                Back to Project
                            </Button>
                        </Link>
                        <Link href={`/projects/${project.slug}/team`}>
                            <Button variant="black" size="lg" className="rounded-2xl">
                                Meet the Team
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
