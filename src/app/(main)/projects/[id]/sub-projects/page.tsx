import {notFound} from 'next/navigation';
import SubProjectCard from '@/components/ui/cards/SubProjectCard';
import { createClient } from '@/lib/supabase/server';

export default async function SubProjectsPage({params}: {
    params: Promise<{id: string}>
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

    // Fetch sub-projects
    const { data: subProjects } = await supabase
        .from('sub_projects')
        .select('*')
        .eq('project_id', project.id)
        .eq('status', 'published')
        .order('order_index', { ascending: true });

    return (
        <div className="min-h-screen bg-white py-20">
            <div className="container mx-auto px-6 lg:px-12">
                {/* Header */}
                <div className="max-w-3xl mb-16">
                    <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                        {project.title} Sub-Projects
                    </h1>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        Explore the individual components and iterations that make up the {project.title} project. 
                        Each sub-project represents a focused effort on specific aspects of the overall initiative.
                    </p>
                </div>

                {/* Sub-Projects Grid */}
                {subProjects && subProjects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {subProjects.map((subProject) => (
                            <SubProjectCard
                                key={subProject.id}
                                href={`/projects/${project.slug}/sub-projects/${subProject.slug}`}
                                imageSrc={subProject.image_url || '/square1.png'}
                                title={subProject.title}
                                description={subProject.description || ''}
                                imageAlt={subProject.title}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-lg">
                        <p className="text-gray-500 text-lg">No sub-projects available yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
