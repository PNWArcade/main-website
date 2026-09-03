import { createClient } from "@/lib/supabase/server"
import { fetchPnwEvents } from "@/lib/pnw-events"
import HeroSequence from "@/components/home/HeroSequence"
import { HomeStory } from "@/components/home/HomeStory"

const missionPillars = [
  {
    n: "01",
    title: "Inspire",
    body: "Compete at NASA Student Launch. Design, build, and fly high-powered rockets on a national stage.",
    href: "#work-nasa",
  },
  {
    n: "02",
    title: "Connect",
    body: "Work in student-led teams with mentors, advisors, and partners across campus and industry.",
    href: "#work-leadership",
  },
  {
    n: "03",
    title: "Empower",
    body: "Learn rocketry by doing it: propulsion, CAD, structures, and flight dynamics on real hardware.",
    href: "#work-rocketry",
  },
] as const

export default async function Home() {
  const supabase = await createClient()
  const [{ data: rawSponsors }, { data: projects }, events] = await Promise.all([
    supabase
      .from("sponsors")
      .select("*")
      .order("order_index", { ascending: true, nullsFirst: false })
      .order("name", { ascending: true }),
    supabase
      .from("projects")
      .select("id, title, created_at, slug")
      .eq("status", "published")
      .order("order_index", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(6),
    fetchPnwEvents(3).catch(() => []),
  ])

  const sponsors = {
    platinum: rawSponsors?.filter((s) => s.tier === "platinum") || [],
    gold: rawSponsors?.filter((s) => s.tier === "gold") || [],
    silver: rawSponsors?.filter((s) => s.tier === "silver") || [],
    bronze: rawSponsors?.filter((s) => s.tier === "bronze") || [],
  }

  return (
    <div>
      <HeroSequence />
      <HomeStory
        pillars={missionPillars}
        projects={projects ?? []}
        events={events}
        sponsors={sponsors}
      />
    </div>
  )
}
