'use client'

import Image from "next/image";
import { useTeam, usePastPresidents, type TeamMember } from "@/hooks/useTeam";

function MemberCard({ member }: { member: TeamMember }) {
  return (
    <div className="flex flex-col rounded-lg shadow-md overflow-hidden max-w-sm bg-white hover:shadow-xl transition-shadow duration-300 h-full">
      <div className="relative h-64 overflow-hidden bg-gray-200">
        <img
          src={member.image}
          alt={member.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-6 flex flex-col grow">
        <h3 className="text-2xl font-bold text-gray-900 mb-1 text-center">
          {member.name}
        </h3>
        <p className="text-indigo-600 font-semibold text-sm uppercase tracking-wide text-center">
          {member.position}
        </p>

        {/* Contact icons */}
        {(member.linkedin_url || member.email) && (
          <div className="flex items-center justify-center gap-3 mt-3">
            {member.linkedin_url && (
              <a
                href={member.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${member.name} LinkedIn`}
                className="text-gray-500 hover:text-[#0A66C2] transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            )}
            {member.email && (
              <a
                href={`mailto:${member.email}`}
                aria-label={`Email ${member.name}`}
                className="text-gray-500 hover:text-yellow-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TeamSection({ title, subtitle, members }: { title: string; subtitle: string; members: TeamMember[] }) {
  if (!members.length) return null;

  return (
    <div className="mb-16">
      <h2 className="text-4xl font-bold text-gray-800 mb-2">{title}</h2>
      <p className="text-lg text-gray-600 mb-10">{subtitle}</p>
      <div className={`grid gap-8 items-stretch ${
        members.length === 1
          ? 'grid-cols-1 max-w-sm mx-auto'
          : members.length === 2
            ? 'grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto'
            : 'grid-cols-1 md:grid-cols-3 lg:grid-cols-4'
      }`}>
        {members.map((member) => (
          <MemberCard key={member.name} member={member} />
        ))}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg shadow-md overflow-hidden bg-white animate-pulse">
          <div className="h-64 bg-gray-200" />
          <div className="p-6 space-y-3">
            <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TeamPage() {
  const { data: team, isLoading, error } = useTeam();
  const { data: pastPresidents, isLoading: pastLoading } = usePastPresidents();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/team.jpg"
            alt="Team Background"
            fill
            className="object-cover"
          />
          {/* Right gradient */}
          <div className="absolute inset-y-0 right-0 w-32 bg-linear-to-l from-white to-transparent"></div>
          {/* Bottom gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-gray-100 to-transparent"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 pt-20 pb-16">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="max-w-3xl">
              <p className="text-yellow-500 text-sm font-semibold tracking-wider uppercase mb-4 drop-shadow-lg">
                ARCADE AT PURDUE NORTHWEST
              </p>
              <h1 className="text-5xl lg:text-6xl font-bold text-black mb-6 drop-shadow-2xl">
                Building the{' '}
                <span className="text-yellow-500 drop-shadow-2xl">next generation</span>{' '}
                of engineers
              </h1>
              <div className="flex flex-wrap gap-4">
                <div className="bg-white/80 backdrop-blur-sm border border-white/40 rounded-lg px-6 py-3 shadow-lg">
                  <p className="text-yellow-500 font-bold text-2xl">50+</p>
                  <p className="text-gray-800 text-sm font-medium">Active Members</p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm border border-white/40 rounded-lg px-6 py-3 shadow-lg">
                  <p className="text-yellow-500 font-bold text-2xl">15+</p>
                  <p className="text-gray-800 text-sm font-medium">Projects Annually</p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm border border-white/40 rounded-lg px-6 py-3 shadow-lg">
                  <p className="text-yellow-500 font-bold text-2xl">10+</p>
                  <p className="text-gray-800 text-sm font-medium">Industry Partners</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Sections */}
      <div className="container mx-auto px-6 lg:px-12 py-16">
        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <p className="text-red-500 text-center py-8">
            Failed to load team members. Please try again later.
          </p>
        ) : team ? (
          <>
            <TeamSection
              title="Leadership"
              subtitle="From students to the leading engineers of tomorrow — pushing for an efficient future."
              members={team.leadership}
            />
            <TeamSection
              title="Officers"
              subtitle="The dedicated team members driving our day-to-day operations and initiatives."
              members={team.officers}
            />
            <TeamSection
              title="Mentors"
              subtitle="Experienced guides helping shape the next generation of engineers."
              members={team.mentors}
            />
            <TeamSection
              title="Advisors"
              subtitle="Faculty and industry professionals providing strategic guidance."
              members={team.advisors}
            />
          </>
        ) : null}

        {/* Former Presidents Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            Former Presidents
          </h2>
          <p className="text-center text-lg text-gray-600 mb-10">
            Honoring the leaders who shaped our organization&apos;s legacy.
          </p>

          {pastLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
            </div>
          ) : !pastPresidents?.length ? (
            <p className="text-gray-500 text-center py-8">
              No former presidents recorded yet.
            </p>
          ) : (
            <div className={`grid gap-8 ${
              pastPresidents.length === 1
                ? 'grid-cols-1 max-w-md mx-auto'
                : pastPresidents.length === 2
                  ? 'grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto'
                  : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}>
              {pastPresidents.map((president) => (
                <div
                  key={president.id}
                  className="rounded-lg shadow-md p-6 bg-white hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="flex items-center gap-4">
                    {president.photo_url ? (
                      <img
                        src={president.photo_url}
                        alt={`Former President ${president.name}`}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-2xl font-bold">
                          {president.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800">{president.name}</h3>
                      <p className="text-sm text-gray-600">Former President</p>
                      <p className="text-sm text-gray-500">{president.year}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
