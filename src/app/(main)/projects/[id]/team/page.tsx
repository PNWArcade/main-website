import Image from 'next/image';
import {notFound} from 'next/navigation';
import Link from 'next/link';
import {Button} from '@/components/ui/buttons/Button';
import { createClient } from '@/lib/supabase/server';

export default async function ProjectTeamPage({params} : {
    params: Promise<{ id: string }>
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

    // Fetch team members with their team info
    const { data: members } = await supabase
        .from('project_team')
        .select(`
            *,
            team:teams(id, name, description)
        `)
        .eq('project_id', project.id)
        .order('order_index', { ascending: true });

    // Define member type based on query result
    type TeamMember = NonNullable<typeof members>[number];
    type TeamData = { description: string; members: TeamMember[] };

    // Group members by team
    const membersByTeam = members?.reduce<Record<string, TeamData>>((acc, member) => {
        const teamName = member.team?.name || 'Team Members';
        if (!acc[teamName]) {
            acc[teamName] = { description: member.team?.description || '', members: [] };
        }
        acc[teamName].members.push(member);
        return acc;
    }, {}) || {};

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                            Meet the Team
                        </h1>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            The talented individuals behind the {project.title} project.
                        </p>
                    </div>
                </div>
            </section>

            {/* Teams Section */}
            {Object.keys(membersByTeam).length > 0 ? (
                (Object.entries(membersByTeam) as [string, TeamData][]).map(([teamName, teamData], teamIndex) => (
                    <section
                        key={teamName}
                        className={`py-20 ${teamIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                    >
                        <div className="container mx-auto px-6 lg:px-12">
                            <div className="mb-12">
                                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                                    {teamName}
                                </h2>
                                {teamData.description && (
                                    <p className="text-lg text-gray-600 max-w-3xl">
                                        {teamData.description}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {teamData.members.map((member) => (
                                    <div
                                        key={member.id}
                                        className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                                    >
                                        {member.image_url ? (
                                            <Image
                                                src={member.image_url}
                                                alt={member.name}
                                                width={64}
                                                height={64}
                                                className="w-16 h-16 rounded-full mb-4 object-cover"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 bg-gray-200 rounded-full mb-4 flex items-center justify-center">
                                                <span className="text-xl font-bold text-gray-400">
                                                    {member.name.split(' ').map((n: string) => n[0]).join('')}
                                                </span>
                                            </div>
                                        )}
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                                            {member.name}
                                        </h3>
                                        {member.title && (
                                            <p className="text-sm text-gray-600">{member.title}</p>
                                        )}
                                        {member.date && (
                                            <p className="text-xs text-gray-500 mt-1">{member.date}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                ))
            ) : (
                <section className="py-20 bg-gray-50">
                    <div className="container mx-auto px-6 lg:px-12">
                        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-lg">
                            <p className="text-gray-500 text-lg">No team members added yet.</p>
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6 lg:px-12 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Interested in Joining?
                    </h2>
                    <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                        We're always looking for passionate students to join our team.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href={`/projects/${project.slug}`}>
                            <Button variant="outline" size="lg" className="rounded-2xl">
                                Back to Project
                            </Button>
                        </Link>
                        <Link href="/join">
                            <Button variant="black" size="lg" className="rounded-2xl">
                                Join Our Team
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
