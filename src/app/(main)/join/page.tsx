import Link from "next/link"
import { JOIN_URL } from "@/config/routes"
import { PageHero } from "@/components/layout/PageHero"
import { PageContainer } from "@/components/layout/PageContainer"
import { Button } from "@/components/ui/buttons/Button"

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHero
        eyebrow="Join the lab"
        title="Join ARCADE PNW"
        description="Official membership runs through myPNW Life. Complete the club signup there, then come to a meeting and pick a technical team."
      />
      <PageContainer className="max-w-2xl py-8">
        <div className="lab-plate rounded-3xl p-8">
          <p className="text-muted-foreground">
            We welcome students from all years and majors. Mechanical, electrical, software, and outreach roles are all open.
          </p>
          <ol className="mt-6 space-y-3 text-sm text-foreground">
            <li>1. Open the official myPNW Life signup.</li>
            <li>2. Complete the ARCADE club registration.</li>
            <li>3. Meet the team at the next event and get assigned to a project.</li>
          </ol>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full">
              <Link href={JOIN_URL} target="_blank" rel="noopener noreferrer">
                Join on myPNW Life
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link href="/contact">Questions? Contact us</Link>
            </Button>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}
