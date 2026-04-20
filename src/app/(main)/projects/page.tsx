'use client'

import Link from 'next/link';
import Image from 'next/image';
import ProjectCard from '@/components/ui/cards/ProjectCard';
import DetailedProjectCard from '@/components/ui/cards/DetailedProjectCard';
import { useProjects, useFeaturedProjects } from '@/hooks/useProjects';

export default function ProjectsPage() {
    const { data: projects, isLoading, error } = useProjects('published');
    const { data: featuredProjects, isLoading: featuredLoading } = useFeaturedProjects();

    return (
        <div className="min-h-screen bg-gray-100 ">
            {/* Combined Hero and Category Section with Extended Background */}
            <section className="relative overflow-hidden">
                {/* Background Image - extends to category section */}
                <div className="absolute inset-0 z-0 bg-black">
                    <Image
                        src="/goblin.jpeg"
                        alt="Hero Background"
                        fill
                        className="opacity-30 object-cover "/>
                    {/* Left side gradient - small */}
                 
                    {/* Bottom gradient */}
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-gray-100 to-transparent"></div>
                </div>

                {/* Hero Content */}
                <div className="relative z-10 pt-20 pb-12">
                    <div className="container mx-auto px-6 lg:px-12">
                        <div className="max-w-3xl">
                            <p className="text-yellow-400 text-sm font-semibold tracking-wider uppercase mb-4 drop-shadow-lg">
                                STUDENT INNOVATIONS
                            </p>
                            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-4 drop-shadow-2xl">
                                Innovation is{' '}
                                <span className="text-yellow-400 drop-shadow-2xl">designed and built</span>
                            </h1>
                            <p className="text-white text-lg mb-8 max-w-2xl drop-shadow-lg">
                                Discover cutting-edge student projects pushing boundaries and creating solutions
                                for tomorrow's challenges.
                            </p>
                            <Link
                                href="#featured"
                                className="inline-block bg-white text-purdue-black px-8 py-3 rounded font-semibold hover:bg-purdue-gold hover:text-white transition-colors duration-300 shadow-xl">
                                Explore Projects
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Explore Projects by Category - inside the same section */}
                <div className="relative z-10 py-16 px-6 lg:px-12">
                    <div className="container mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-bold text-white">
                                Featured Projects
                            </h2>
                        </div>

                        {featuredLoading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                            </div>
                        ) : !featuredProjects?.length ? (
                            <p className="text-white/70 text-center py-8">No featured projects yet.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                                {featuredProjects.map((project) => (
                                    <ProjectCard
                                        key={project.id}
                                        variant="default"
                                        title={project.title}
                                        image={project.hero_image_url || '/square1.png'}
                                        link={`/projects/${project.slug}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Featured Projects */}
            <section id="featured" className="py-16 px-6 lg:px-12 bg-gray-100">
                <div className="container mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold text-purdue-black">
                            All Projects
                        </h2>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purdue-gold"></div>
                        </div>
                    ) : error ? (
                        <p className="text-red-500 text-center py-8">Failed to load projects.</p>
                    ) : projects?.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No projects available yet.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects?.map((project) => (
                                <DetailedProjectCard
                                    key={project.id}
                                    variant="default"
                                    id={project.id}
                                    title={project.title}
                                    category={project.category?.name?.toUpperCase() ?? 'PROJECT'}
                                    description={project.description ?? ''}
                                    image={project.hero_image_url || '/square1.png'}
                                    link={`/projects/${project.slug}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
