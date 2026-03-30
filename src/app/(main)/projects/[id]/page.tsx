import Image from 'next/image';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import SubProjectCard from '@/components/ui/cards/SubProjectCard';
import {Button} from '@/components/ui/buttons/Button';
import { createClient } from '@/lib/supabase/server';

export default async function ProjectDetail({params} : {
    params: Promise < {
        id: string
    } >
}) {
    const {id} = await params;
    const supabase = await createClient();

    // Fetch project by slug
    const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', id)
        .eq('status', 'published')
        .single();

    if (error || !project) {
        notFound();
    }

    // Fetch project components for content blocks
    const { data: components } = await supabase
        .from('project_components')
        .select('*')
        .eq('project_id', project.id)
        .order('order_index', { ascending: true });

    // Fetch sub-projects
    const { data: subProjects } = await supabase
        .from('sub_projects')
        .select('*')
        .eq('project_id', project.id)
        .eq('status', 'published')
        .order('order_index', { ascending: true });

    // Fetch sponsors
    const { data: sponsors } = await supabase
        .from('project_sponsors')
        .select('*')
        .eq('project_id', project.id)
        .order('order_index', { ascending: true });

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative bg-black overflow-hidden">
                {/* Background Image */}
                {project.hero_image_url && (
                    <div className="absolute inset-0 z-0">
                        <Image
                            src={project.hero_image_url}
                            alt={project.title}
                            fill
                            className="opacity-40 object-cover"
                        />
                    </div>
                )}

                {/* Hero Content */}
                <div className="relative z-10 py-20">
                    <div className="container mx-auto px-6 lg:px-12">
                        <div className="max-w-2xl">
                            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                                {project.title}
                            </h1>
                            {project.description && (
                                <p className="text-white/90 text-base lg:text-lg mb-8 leading-relaxed">
                                    {project.description}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Blocks from Components */}
            {components && components.length > 0 && (
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-6 lg:px-12">
                        <div className="space-y-16">
                            {components.map((component, index) => {
                                // Odd blocks (1, 3, 5...) = index 0, 2, 4 -> image on RIGHT
                                // Even blocks (2, 4, 6...) = index 1, 3, 5 -> image on LEFT
                                const imageOnLeft = index % 2 === 1;
                                
                                return (
                                    <div 
                                        key={component.id} 
                                        className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
                                    >
                                        {/* Text Content */}
                                        <div className={`max-w-xl ${imageOnLeft ? 'lg:order-2' : 'lg:order-1'}`}>
                                            {component.title && (
                                                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                                                    {component.title}
                                                </h2>
                                            )}
                                            {component.description && (
                                                <p className="text-gray-600 text-base lg:text-lg leading-relaxed whitespace-pre-wrap">
                                                    {component.description}
                                                </p>
                                            )}
                                        </div>

                                        {/* Image */}
                                        {component.image_url && (
                                            <div className={`relative h-[400px] lg:h-[500px] w-full ${imageOnLeft ? 'lg:order-1' : 'lg:order-2'}`}>
                                                <Image
                                                    src={component.image_url}
                                                    alt={component.image_title || component.title || 'Project image'}
                                                    fill
                                                    className="object-cover rounded-2xl"
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* Sub-Projects Section */}
            {subProjects && subProjects.length > 0 && (
                <section className="py-20 bg-gray-50">
                    <div className="container mx-auto px-6 lg:px-12">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                                Sub-Projects & Components
                            </h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                Explore the individual sub-projects and technical components that make up this
                                larger initiative.
                            </p>
                        </div>

                        {/* Sub-Projects Grid - Max 3 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {subProjects.slice(0, 3).map((subProject) => (
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

                        {/* Explore Sub-Projects Button */}
                        <div className="text-center mt-10">
                            <Link href={`/projects/${project.slug}/sub-projects`}>
                                <Button variant="black" size="lg" className="rounded-2xl">
                                    Explore Sub-Projects
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Sponsors Section */}
            {sponsors && sponsors.length > 0 && (
                <section className="py-16 bg-white border-t border-gray-100">
                    <div className="container mx-auto px-6 lg:px-12">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                                Our Sponsors
                            </h2>
                            <p className="text-gray-600 max-w-xl mx-auto">
                                We are grateful for the support of our sponsors who make this project possible.
                            </p>
                        </div>

                        <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12">
                            {sponsors.map((sponsor) => (
                                <div key={sponsor.id} className="group">
                                    {sponsor.website_url ? (
                                        <a 
                                            href={sponsor.website_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="block transition-transform hover:scale-105"
                                        >
                                            {sponsor.logo_url ? (
                                                <Image
                                                    src={sponsor.logo_url}
                                                    alt={sponsor.name}
                                                    width={160}
                                                    height={80}
                                                    className="h-16 w-auto object-contain grayscale hover:grayscale-0 transition-all"
                                                />
                                            ) : (
                                                <span className="text-lg font-medium text-gray-700 hover:text-gray-900">
                                                    {sponsor.name}
                                                </span>
                                            )}
                                        </a>
                                    ) : (
                                        <div className="flex items-center justify-center">
                                            {sponsor.logo_url ? (
                                                <Image
                                                    src={sponsor.logo_url}
                                                    alt={sponsor.name}
                                                    width={160}
                                                    height={80}
                                                    className="h-16 w-auto object-contain grayscale"
                                                />
                                            ) : (
                                                <span className="text-lg font-medium text-gray-700">
                                                    {sponsor.name}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Call to Action */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6 lg:px-12 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Learn More About This Project
                    </h2>
                    <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                        Explore detailed technical documentation and meet the team behind the project.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href={`/projects/${project.slug}/articles`}>
                            <Button variant="black" size="lg" className="rounded-2xl">
                                Technical Articles
                            </Button>
                        </Link>
                        <Link href={`/projects/${project.slug}/team`}>
                            <Button variant="outline" size="lg" className="rounded-2xl">
                                Meet the Team
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
