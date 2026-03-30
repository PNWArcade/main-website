import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { createClient } from '@/lib/supabase/server';
import TiptapRenderer from '@/components/blog/TiptapRenderer';

export default async function SubProjectDetailPage({
    params
}: {
    params: Promise<{ id: string; slug: string }>
}) {
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

    // Fetch the sub-project by slug and project_id
    const { data: subProject } = await supabase
        .from('sub_projects')
        .select('*')
        .eq('project_id', project.id)
        .eq('slug', slug)
        .single();

    if (!subProject) {
        notFound();
    }

    // Parse the content if it's a string
    const content = typeof subProject.content === 'string'
        ? JSON.parse(subProject.content)
        : subProject.content;

    // Format the published date
    const formattedDate = subProject.published_at
        ? new Date(subProject.published_at).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        })
        : new Date(subProject.created_at).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });

    const authorName = subProject.author_name || 'Unknown Author';

    return (
        <div className="min-h-screen bg-white">
            {/* Back Navigation */}
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-6 lg:px-12 py-4">
                    <Link
                        href={`/projects/${id}/sub-projects`}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors">
                        <FontAwesomeIcon icon={faArrowLeft} />
                        <span className="font-medium">Back to Sub-Projects</span>
                    </Link>
                </div>
            </div>

            {/* Hero Section */}
            <section className="relative bg-black overflow-hidden">
                {subProject.image_url && (
                    <div className="absolute inset-0 z-0">
                        <Image
                            src={subProject.image_url}
                            alt={subProject.title}
                            fill
                            className="opacity-40 object-cover"
                        />
                    </div>
                )}

                <div className="relative z-10 py-20">
                    <div className="container mx-auto px-6 lg:px-12">
                        <div className="max-w-3xl">
                            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                                {subProject.title}
                            </h1>
                            {subProject.description && (
                                <p className="text-xl text-white/90 mb-6">
                                    {subProject.description}
                                </p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-white/70">
                                <span>{authorName}</span>
                                <span>•</span>
                                <span>{formattedDate}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-16">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-4xl mx-auto">
                        {content && <TiptapRenderer content={content} />}
                    </div>
                </div>
            </section>
        </div>
    );
}
