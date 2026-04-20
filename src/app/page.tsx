import TitleCard from '@/components/home/titleCard';
import {Card, CardContent, CardTitle, CardDescription} from '@/components/ui/cards/card';
import Image from 'next/image';
import {CountingNumber} from '@/components/ui/shadcn-io/counting-number';
import {Button} from '@/components/ui/buttons/Button';
import Link from 'next/link';
import {faLink, faArrowUpRightFromSquare} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { createClient } from '@/lib/supabase/server';
import HomeEvents from '@/components/home/HomeEvents';

export default async function Home() {
    // Fetch sponsors from database
    const supabase = await createClient();
    const { data: rawSponsors } = await supabase
        .from('sponsors')
        .select('*')
        .order('order_index', { ascending: true, nullsFirst: false })
        .order('name', { ascending: true });

    // Fetch projects from database
    const { data: projects } = await supabase
        .from('projects')
        .select('id, title, created_at, slug')
        .eq('status', 'published')
        .order('order_index', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(6);

    // Transform 'Link' column to 'link' for consistency
    const allSponsors = rawSponsors?.map(s => ({
        ...s,
        link: s.Link ?? null,
    }));

    const sponsors = {
        platinum: allSponsors?.filter(s => s.tier === 'platinum') || [],
        gold: allSponsors?.filter(s => s.tier === 'gold') || [],
        silver: allSponsors?.filter(s => s.tier === 'silver') || [],
        bronze: allSponsors?.filter(s => s.tier === 'bronze') || [],
    };

    return (
        <div>

            <TitleCard/>

            <div id="mission" className="pt-30 px-[15%] ">
                <section className="space-y-4">
                    <h1 className="text-4xl font-bold text-purdue-black leading-tight">
                        Advancing aeronautical engineering<br/>
                        through student collaboration.
                    </h1>
                    <p className="text-4xl text-purdue-railway leading-tight">
                        Our mission is to inspire, connect, and
                        empower<br/> future engineers and astronauts at Purdue Northwest.
                    </p>

                </section>
            </div>

            {/* Feature Sections */}
            <div className="py-12 px-[15%]">
                {/* NASA Student Launch Initiative - Text Left, Image Right */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
                    <div>
                        <h2 className="text-3xl font-bold text-purdue-black mb-4">
                            NASA Student Launch Initiative
                        </h2>
                        <p className="text-2xl text-gray-600">
                            A prestigious annual competition where student teams design, build, and launch high-powered rockets. We develop innovative propulsion systems, aerodynamic designs, and advanced payload technologies to compete at the national level.
                        </p>
                    </div>
                    <div
                        className="relative rounded-3xl aspect-square flex items-center justify-center overflow-hidden">
                        <Image
                            src="/team.jpg"
                            alt="NASA Student Launch Initiative"
                            fill
                            className="object-cover"/>
                    </div>
                </div>

                {/* Rocketry Excellence - Image Left, Text Right */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
                    <div
                        className="relative rounded-3xl aspect-square flex items-center justify-center overflow-hidden order-2 md:order-1">
                        <Image src="/adrian.jpg" alt="Rocketry Excellence" fill className="object-cover"/>
                    </div>
                    <div className="order-1 md:order-2">
                        <h2 className="text-3xl font-bold text-purdue-black mb-4">
                            Advanced Rocketry & Propulsion
                        </h2>
                        <p className="text-2xl text-gray-600">
                            Hands-on experience in rocket design, propulsion systems, and structural analysis. Members develop skills in CAD modeling, materials science, flight dynamics, and engineering best practices essential in aerospace.
                        </p>
                    </div>
                </div>

                {/* Student-Driven Innovation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
                    <div>
                        <h2 className="text-3xl font-bold text-purdue-black mb-4">
                            Student-Driven Innovation & Leadership
                        </h2>
                        <p className="text-2xl text-gray-600">
                            Student engineers lead every aspect of the project—from technical teams to budgets and industry partnerships. This real-world experience in project management and aerospace engineering prepares members for careers in space exploration and aviation.
                        </p>
                    </div>
                    <div
                        className="relative rounded-3xl aspect-square flex items-center justify-center overflow-hidden">
                        <Image
                            src="/eric.jpg"
                            alt="Student Innovation"
                            fill
                            className="object-cover"/>
                    </div>
                </div>

            </div>

            {/* Projects List */}
            <div className="pb-30 px-[15%]">
                <div className="space-y-0">
                    {projects && projects.length > 0 ? (
                        projects.map((project) => (
                            <Link
                                key={project.id}
                                href={`/projects/${project.slug}`}
                                className="flex justify-between items-center py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                                <span className="text-lg font-medium text-gray-800">{project.title}</span>
                                <span className="text-lg text-gray-500">
                                    {project.created_at ? new Date(project.created_at).getFullYear() : ''}
                                </span>
                            </Link>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-4">No projects available</p>
                    )}
                </div>
            </div>

            <HomeEvents />

            <div className="py-30 px-[15%]">
                <section className="space-y-6">
                    <h2 className="text-3xl font-bold text-center">The Fastest Growing Club at Purdue</h2>
                    <p className="text-2xl text-justify">
                        Becoming a member of ARCADE PNW opens doors to numerous opportunities. Participate
                        in exciting projects, attend workshops, and connect with like-minded peers and
                        professionals in the field. We welcome students from all years and backgrounds
                        to join our community.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="text-center">
                            <div className="text-6xl font-bold text-purdue-black">
                                <CountingNumber
                                    number={30}
                                    inView={true}
                                    transition={{
                                    stiffness: 100,
                                    damping: 30
                                }}/>+
                            </div>
                            <p className="mt-2 text-xl text-purdue-railway">Members</p>
                        </div>
                        <div className="text-center">
                            <div className="text-6xl font-bold text-purdue-black">
                                <CountingNumber
                                    number={3}
                                    inView={true}
                                    transition={{
                                    stiffness: 100,
                                    damping: 30
                                }}/>
                            </div>
                            <p className="mt-2 text-xl text-purdue-railway">Years active</p>
                        </div>
                    </div>

                    <div className="flex justify-center mt-8">
                        <Link className="m" href='https://mypnwlife.pnw.edu/ARCADE/club_signup'>

                            <Button
                                className='hover:bg-gray-300 hover:text-black'
                                variant="default"
                                size="lg">
                                <FontAwesomeIcon icon={faLink}/>
                                Join ARCADE PNW Today!

                            </Button>
                        </Link>
                    </div>

                </section>
            </div>

            <div className="py-30 px-[15%] bg-gray-100">
                <section>
                    <div className="justify-center mb-8 text-center">
                        <h2 className="text-3xl font-bold">
                            Purdue Northwest ASME
                            <br/>works best with the best sponsors
                        </h2>
                    </div>

                    {/* Platinum Sponsors */}
                    {sponsors.platinum.length > 0 && (
                        <div className="mb-10">
                            <h3 className="text-2xl font-bold text-center mb-6 text-gray-700">
                                <span
                                    className="inline-block px-4 py-1 bg-linear-to-r from-gray-300 via-gray-100 to-gray-300 rounded-full">
                                    Platinum Sponsors
                                </span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-items-center">
                                {sponsors.platinum.map((sponsor) => {
                                    const cardContent = (
                                        <Card key={sponsor.id} className={`w-full max-w-md bg-white hover:shadow-lg transition-shadow relative ${sponsor.link ? 'cursor-pointer' : ''}`}>
                                            {sponsor.link && (
                                                <div className="absolute top-3 right-3 text-gray-400">
                                                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="h-4 w-4" />
                                                </div>
                                            )}
                                            <CardContent className="flex flex-col items-center p-6">
                                                {sponsor.logo_url ? (
                                                    <Image
                                                        src={sponsor.logo_url}
                                                        alt={sponsor.name}
                                                        width={200}
                                                        height={100}
                                                        className="object-contain mb-4"/>
                                                ) : (
                                                    <div className="w-[200px] h-[100px] bg-gray-100 rounded flex items-center justify-center mb-4">
                                                        <span className="text-gray-400">{sponsor.name}</span>
                                                    </div>
                                                )}
                                                <CardTitle className="text-lg">{sponsor.name}</CardTitle>
                                                {sponsor.description && (
                                                    <p className="text-sm text-gray-500 text-center mt-2">{sponsor.description}</p>
                                                )}
                                            </CardContent>
                                        </Card>
                                    );
                                    return sponsor.link ? (
                                        <a key={sponsor.id} href={sponsor.link} target="_blank" rel="noopener noreferrer" className="w-full max-w-md">
                                            {cardContent}
                                        </a>
                                    ) : (
                                        <div key={sponsor.id} className="w-full max-w-md">{cardContent}</div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Gold Sponsors */}
                    {sponsors.gold.length > 0 && (
                        <div className="mb-10">
                            <h3 className="text-2xl font-bold text-center mb-6 text-yellow-600">
                                <span
                                    className="inline-block px-4 py-1 bg-linear-to-r from-yellow-300 via-yellow-100 to-yellow-300 rounded-full">
                                    Gold Sponsors
                                </span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-items-center">
                                {sponsors.gold.map((sponsor) => {
                                    const cardContent = (
                                        <Card key={sponsor.id} className={`w-full max-w-sm bg-white hover:shadow-lg transition-shadow border-yellow-200 relative ${sponsor.link ? 'cursor-pointer' : ''}`}>
                                            {sponsor.link && (
                                                <div className="absolute top-3 right-3 text-gray-400">
                                                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="h-4 w-4" />
                                                </div>
                                            )}
                                            <CardContent className="flex flex-col items-center p-5">
                                                {sponsor.logo_url ? (
                                                    <Image
                                                        src={sponsor.logo_url}
                                                        alt={sponsor.name}
                                                        width={150}
                                                        height={75}
                                                        className="object-contain mb-3"/>
                                                ) : (
                                                    <div className="w-[150px] h-[75px] bg-gray-100 rounded flex items-center justify-center mb-3">
                                                        <span className="text-gray-400 text-sm">{sponsor.name}</span>
                                                    </div>
                                                )}
                                                <CardTitle className="text-base">{sponsor.name}</CardTitle>
                                                {sponsor.description && (
                                                    <p className="text-xs text-gray-500 text-center mt-1 line-clamp-2">{sponsor.description}</p>
                                                )}
                                            </CardContent>
                                        </Card>
                                    );
                                    return sponsor.link ? (
                                        <a key={sponsor.id} href={sponsor.link} target="_blank" rel="noopener noreferrer" className="w-full max-w-sm">
                                            {cardContent}
                                        </a>
                                    ) : (
                                        <div key={sponsor.id} className="w-full max-w-sm">{cardContent}</div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Silver Sponsors */}
                    {sponsors.silver.length > 0 && (
                        <div className="mb-10">
                            <h3 className="text-2xl font-bold text-center mb-6 text-gray-500">
                                <span
                                    className="inline-block px-4 py-1 bg-linear-to-r from-gray-400 via-gray-200 to-gray-400 rounded-full">
                                    Silver Sponsors
                                </span>
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 justify-items-center">
                                {sponsors.silver.map((sponsor) => {
                                    const cardContent = (
                                        <Card key={sponsor.id} className={`w-full bg-white hover:shadow-md transition-shadow relative ${sponsor.link ? 'cursor-pointer' : ''}`}>
                                            {sponsor.link && (
                                                <div className="absolute top-2 right-2 text-gray-400">
                                                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="h-3 w-3" />
                                                </div>
                                            )}
                                            <CardContent className="flex flex-col items-center p-4">
                                                {sponsor.logo_url ? (
                                                    <Image
                                                        src={sponsor.logo_url}
                                                        alt={sponsor.name}
                                                        width={120}
                                                        height={60}
                                                        className="object-contain mb-2"/>
                                                ) : (
                                                    <div className="w-[120px] h-[60px] bg-gray-100 rounded flex items-center justify-center mb-2">
                                                        <span className="text-gray-400 text-xs">{sponsor.name}</span>
                                                    </div>
                                                )}
                                                <CardTitle className="text-sm">{sponsor.name}</CardTitle>
                                            </CardContent>
                                        </Card>
                                    );
                                    return sponsor.link ? (
                                        <a key={sponsor.id} href={sponsor.link} target="_blank" rel="noopener noreferrer" className="w-full">
                                            {cardContent}
                                        </a>
                                    ) : (
                                        <div key={sponsor.id} className="w-full">{cardContent}</div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Bronze Sponsors */}
                    {sponsors.bronze.length > 0 && (
                        <div>
                            <h3 className="text-2xl font-bold text-center mb-6 text-amber-700">
                                <span
                                    className="inline-block px-4 py-1 bg-linear-to-r from-amber-400 via-amber-200 to-amber-400 rounded-full">
                                    Bronze Sponsors
                                </span>
                            </h3>
                            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 justify-items-center">
                                {sponsors.bronze.map((sponsor) => {
                                    const cardContent = (
                                        <Card key={sponsor.id} className={`w-full bg-white hover:shadow-md transition-shadow relative ${sponsor.link ? 'cursor-pointer' : ''}`}>
                                            {sponsor.link && (
                                                <div className="absolute top-2 right-2 text-gray-400">
                                                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="h-2.5 w-2.5" />
                                                </div>
                                            )}
                                            <CardContent className="flex flex-col items-center p-3">
                                                {sponsor.logo_url ? (
                                                    <Image
                                                        src={sponsor.logo_url}
                                                        alt={sponsor.name}
                                                        width={80}
                                                        height={40}
                                                        className="object-contain mb-1"/>
                                                ) : (
                                                    <div className="w-[80px] h-[40px] bg-gray-100 rounded flex items-center justify-center mb-1">
                                                        <span className="text-gray-400 text-[10px]">{sponsor.name}</span>
                                                    </div>
                                                )}
                                                <CardTitle className="text-xs">{sponsor.name}</CardTitle>
                                            </CardContent>
                                        </Card>
                                    );
                                    return sponsor.link ? (
                                        <a key={sponsor.id} href={sponsor.link} target="_blank" rel="noopener noreferrer" className="w-full">
                                            {cardContent}
                                        </a>
                                    ) : (
                                        <div key={sponsor.id} className="w-full">{cardContent}</div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* No sponsors message */}
                    {sponsors.platinum.length === 0 && sponsors.gold.length === 0 && sponsors.silver.length === 0 && sponsors.bronze.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <p>We are looking for sponsors! Contact us to learn more.</p>
                        </div>
                    )}
                </section>
            </div>

        </div>
    );
}