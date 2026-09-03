import { fetchPnwEvents } from "@/lib/pnw-events"
import { EventCard } from "@/components/ui/cards/EventCard"
import { PageHero } from "@/components/layout/PageHero"
import { PageContainer } from "@/components/layout/PageContainer"
import { Reveal } from "@/components/motion/Reveal"

export default async function EventsPage() {
  let events: Awaited<ReturnType<typeof fetchPnwEvents>> = []
  let failed = false

  try {
    events = await fetchPnwEvents()
  } catch {
    failed = true
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHero
        title="Events"
        description="Join workshops, competitions, and networking sessions designed to enhance your engineering skills and connect you with industry professionals."
        image="/events2.jpg"
        imageAlt="ARCADE events"
      />

      <PageContainer className="py-16">
        <h2 className="text-3xl font-semibold text-foreground">Upcoming Events</h2>
        <p className="mt-2 mb-10 text-muted-foreground">
          Join us for workshops, competitions, and networking opportunities.
        </p>

        {failed ? (
          <p className="py-8 text-center text-red-700">
            Failed to load events. Please try again later.
          </p>
        ) : !events.length ? (
          <p className="py-8 text-center text-muted-foreground">
            No upcoming events at this time.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event, index) => (
              <Reveal key={event.eventId} delay={index * 0.05}>
                <EventCard event={event} />
              </Reveal>
            ))}
          </div>
        )}
      </PageContainer>
    </div>
  )
}
