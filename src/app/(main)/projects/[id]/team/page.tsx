import Image from "next/image"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/buttons/Button"
import { createClient } from "@/lib/supabase/server"
import { PageContainer } from "@/components/layout/PageContainer"

export default async function ProjectTeamPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project, error } = await supabase
    .from("projects")
    .select("id, title, slug")
    .eq("slug", id)
    .single()

  if (error || !project) notFound()

  const { data: members } = await supabase
    .from("project_team")
    .select(`*, team:teams(id, name, description)`)
    .eq("project_id", project.id)
    .order("order_index", { ascending: true })

  type TeamMember = NonNullable<typeof members>[number]
  type TeamData = { description: string; members: TeamMember[] }

  const membersByTeam =
    members?.reduce<Record<string, TeamData>>((acc, member) => {
      const teamName = member.team?.name || "Team Members"
      if (!acc[teamName]) {
        acc[teamName] = { description: member.team?.description || "", members: [] }
      }
      acc[teamName].members.push(member)
      return acc
    }, {}) || {}

  return (
    <div className="min-h-screen bg-background pb-16">
      <section className="py-16">
        <PageContainer>
          <h1 className="text-4xl font-semibold text-foreground lg:text-5xl">Meet the Team</h1>
          <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
            The talented individuals behind the {project.title} project.
          </p>
        </PageContainer>
      </section>

      {Object.keys(membersByTeam).length > 0 ? (
        (Object.entries(membersByTeam) as [string, TeamData][]).map(([teamName, teamData]) => (
          <section key={teamName} className="py-12">
            <PageContainer>
              <h2 className="mb-3 text-3xl font-semibold text-foreground">{teamName}</h2>
              {teamData.description ? (
                <p className="mb-10 max-w-3xl text-muted-foreground">{teamData.description}</p>
              ) : null}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {teamData.members.map((member) => (
                  <div key={member.id} className="lab-plate rounded-2xl p-6">
                    {member.image_url ? (
                      <Image
                        src={member.image_url}
                        alt={member.name}
                        width={64}
                        height={64}
                        className="mb-4 h-16 w-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                        <span className="text-xl font-bold text-muted-foreground">
                          {member.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </span>
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-foreground">{member.name}</h3>
                    {member.title ? <p className="text-sm text-muted-foreground">{member.title}</p> : null}
                    {member.date ? <p className="mt-1 text-xs text-muted-foreground">{member.date}</p> : null}
                  </div>
                ))}
              </div>
            </PageContainer>
          </section>
        ))
      ) : (
        <section className="py-12">
          <PageContainer>
            <div className="rounded-2xl border border-dashed border-black/15 py-16 text-center text-muted-foreground">
              No team members added yet.
            </div>
          </PageContainer>
        </section>
      )}

      <section className="py-16">
        <PageContainer className="text-center">
          <h2 className="mb-4 text-3xl font-semibold text-foreground">Interested in Joining?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
            We&apos;re always looking for passionate students to join our team.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <Link href={`/projects/${project.slug}`}>Back to Project</Link>
            </Button>
            <Button asChild size="lg" className="rounded-full">
              <Link href="/join">Join Our Team</Link>
            </Button>
          </div>
        </PageContainer>
      </section>
    </div>
  )
}
