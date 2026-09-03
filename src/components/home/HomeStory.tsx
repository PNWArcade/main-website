"use client"

import Link from "next/link"
import { Button } from "@/components/ui/buttons/Button"
import { JOIN_URL } from "@/config/routes"
import { PageContainer } from "@/components/layout/PageContainer"
import { SectionHeading } from "@/components/layout/SectionHeading"
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal"
import { MissionPin, type MissionPillar } from "@/components/home/MissionPin"
import { WorkBeat } from "@/components/home/WorkBeat"
import { SponsorTierGrid, type SponsorRecord } from "@/components/home/SponsorTierGrid"
import { EventCard } from "@/components/ui/cards/EventCard"
import { CountingNumber } from "@/components/ui/shadcn-io/counting-number"
import type { PnwEvent } from "@/lib/pnw-events"

export type HomeProject = {
  id: string
  title: string
  created_at: string | null
  slug: string
}

export function HomeStory({
  pillars,
  projects,
  events,
  sponsors,
}: {
  pillars: readonly MissionPillar[]
  projects: HomeProject[]
  events: PnwEvent[]
  sponsors: {
    platinum: SponsorRecord[]
    gold: SponsorRecord[]
    silver: SponsorRecord[]
    bronze: SponsorRecord[]
  }
}) {
  return (
    <>
      <MissionPin pillars={pillars} />

      <PageContainer className="space-y-32 py-20 sm:space-y-40 sm:py-28">
        <WorkBeat
          id="work-nasa"
          title="NASA Student Launch Initiative"
          body="A prestigious annual competition where student teams design, build, and launch high-powered rockets. We develop innovative propulsion systems, aerodynamic designs, and advanced payload technologies to compete at the national level."
          image="/team.jpg"
          imageAlt="NASA Student Launch Initiative"
        />
        <WorkBeat
          id="work-rocketry"
          title="Advanced Rocketry & Propulsion"
          body="Hands-on experience in rocket design, propulsion systems, and structural analysis. Members develop skills in CAD modeling, materials science, flight dynamics, and engineering best practices essential in aerospace."
          image="/adrian.jpg"
          imageAlt="Rocketry Excellence"
          reverse
        />
        <WorkBeat
          id="work-leadership"
          title="Student-Driven Innovation & Leadership"
          body="Student engineers lead every aspect of the project—from technical teams to budgets and industry partnerships. This real-world experience in project management and aerospace engineering prepares members for careers in space exploration and aviation."
          image="/eric.jpg"
          imageAlt="Student Innovation"
        />
      </PageContainer>

      <PageContainer className="pb-20">
        <Reveal>
          <SectionHeading eyebrow="Proof" title="Recent work" className="mb-8" />
        </Reveal>
        {projects.length > 0 ? (
          <Stagger className="divide-y divide-black/10 border-y border-black/10" stagger={0.06}>
            {projects.map((project) => (
              <StaggerItem key={project.id}>
                <Link
                  href={`/projects/${project.slug}`}
                  className="flex items-center justify-between py-4 transition-colors duration-200 hover:text-purdue-gold"
                >
                  <span className="text-lg font-medium">{project.title}</span>
                  <span className="font-mono text-sm text-muted-foreground">
                    {project.created_at ? new Date(project.created_at).getFullYear() : ""}
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <p className="py-6 text-center text-muted-foreground">No projects available</p>
        )}
      </PageContainer>

      <section className="bg-muted/70 py-20">
        <PageContainer>
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="Calendar"
              title="Upcoming Events"
              className="mb-10"
            />
          </Reveal>
          {!events.length ? (
            <p className="py-8 text-center text-muted-foreground">
              No upcoming events at this time.
            </p>
          ) : (
            <Stagger
              className={`grid gap-6 ${
                events.length === 1
                  ? "mx-auto max-w-md grid-cols-1"
                  : events.length === 2
                    ? "mx-auto max-w-3xl grid-cols-1 md:grid-cols-2"
                    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              }`}
              stagger={0.08}
            >
              {events.map((event) => (
                <StaggerItem key={event.eventId}>
                  <EventCard event={event} />
                </StaggerItem>
              ))}
            </Stagger>
          )}
          <Reveal delay={0.12}>
            <div className="mt-10 flex justify-center">
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <Link href="/events">View All Events</Link>
              </Button>
            </div>
          </Reveal>
        </PageContainer>
      </section>

      <PageContainer className="py-24">
        <Reveal>
          <SectionHeading
            align="center"
            title="The Fastest Growing Club at Purdue"
            description="Becoming a member of ARCADE PNW opens doors to numerous opportunities. Participate in exciting projects, attend workshops, and connect with like-minded peers and professionals in the field. We welcome students from all years and backgrounds to join our community."
          />
          <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-2">
            <div className="text-center">
              <div className="text-6xl font-semibold text-purdue-gold">
                <CountingNumber number={30} inView transition={{ stiffness: 100, damping: 30 }} />
                +
              </div>
              <p className="mt-2 text-xl text-muted-foreground">Members</p>
            </div>
            <div className="text-center">
              <div className="text-6xl font-semibold text-purdue-gold">
                <CountingNumber number={3} inView transition={{ stiffness: 100, damping: 30 }} />
              </div>
              <p className="mt-2 text-xl text-muted-foreground">Years active</p>
            </div>
          </div>
          <div className="mt-10 flex justify-center">
            <Button asChild size="lg" className="rounded-full">
              <Link href={JOIN_URL} target="_blank" rel="noopener noreferrer">
                Join ARCADE PNW Today
              </Link>
            </Button>
          </div>
        </Reveal>
      </PageContainer>

      <section className="border-t border-black/8 py-24">
        <PageContainer>
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="Alliance"
              title="Purdue Northwest ARCADE works best with the best sponsors"
              className="mb-12"
            />
            <SponsorTierGrid sponsors={sponsors} />
          </Reveal>
        </PageContainer>
      </section>
    </>
  )
}
