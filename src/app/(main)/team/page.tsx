import { getPublicTeam, type PublicTeamMember } from "@/lib/public-team"
import { getPublishedPastPresidents } from "@/lib/public-past-presidents"
import { TeamCard } from "@/components/ui/cards/TeamCard"
import FormerPresidentCard from "@/components/ui/cards/FormerPresidentCard"
import { PageHero } from "@/components/layout/PageHero"
import { PageContainer } from "@/components/layout/PageContainer"
import { Reveal } from "@/components/motion/Reveal"

function TeamSection({
  title,
  subtitle,
  members,
}: {
  title: string
  subtitle: string
  members: PublicTeamMember[]
}) {
  if (!members.length) return null

  return (
    <Reveal className="mb-16">
      <h2 className="text-3xl font-semibold text-foreground">{title}</h2>
      <p className="mt-2 mb-8 text-muted-foreground">{subtitle}</p>
      <div
        className={`grid items-stretch gap-6 ${
          members.length === 1
            ? "mx-auto max-w-sm grid-cols-1"
            : members.length === 2
              ? "mx-auto max-w-3xl grid-cols-1 md:grid-cols-2"
              : "grid-cols-1 md:grid-cols-3 lg:grid-cols-4"
        }`}
      >
        {members.map((member) => (
          <TeamCard
            key={member.name}
            image={member.image}
            name={member.name}
            role={member.position}
            socialLinks={{
              linkedIn: member.linkedin_url || undefined,
              email: member.email || undefined,
            }}
          />
        ))}
      </div>
    </Reveal>
  )
}

export default async function TeamPage() {
  const [{ data: team }, pastPresidents] = await Promise.all([
    getPublicTeam().catch(() => ({ data: null })),
    getPublishedPastPresidents().catch(() => []),
  ])

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHero
        eyebrow="ARCADE AT PURDUE NORTHWEST"
        title="Building the next generation of engineers"
        image="/team.jpg"
        imageAlt="ARCADE team"
      >
        <div className="flex flex-wrap gap-4">
          {[
            ["30+", "Active Members"],
            ["15+", "Projects Annually"],
            ["10+", "Industry Partners"],
          ].map(([value, label]) => (
            <div key={label} className="lab-plate rounded-xl px-6 py-3">
              <p className="text-2xl font-semibold text-purdue-gold">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </PageHero>

      <PageContainer className="py-16">
        {team ? (
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
        ) : (
          <p className="py-8 text-center text-red-400">
            Failed to load team members. Please try again later.
          </p>
        )}

        <Reveal className="mt-16">
          <h2 className="text-center text-3xl font-semibold text-foreground">Former Presidents</h2>
          <p className="mx-auto mt-2 mb-10 max-w-xl text-center text-muted-foreground">
            Honoring the leaders who shaped our organization&apos;s legacy.
          </p>
          {!pastPresidents.length ? (
            <p className="py-8 text-center text-muted-foreground">
              No former presidents recorded yet.
            </p>
          ) : (
            <div
              className={`grid gap-6 ${
                pastPresidents.length === 1
                  ? "mx-auto max-w-md grid-cols-1"
                  : pastPresidents.length === 2
                    ? "mx-auto max-w-3xl grid-cols-1 md:grid-cols-2"
                    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              }`}
            >
              {pastPresidents.map((president) => (
                <FormerPresidentCard
                  key={president.id}
                  image={president.photo_url || "/arcade.png"}
                  name={president.name}
                  tenure={president.year}
                />
              ))}
            </div>
          )}
        </Reveal>
      </PageContainer>
    </div>
  )
}
