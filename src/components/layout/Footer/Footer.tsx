import Link from "next/link"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faInstagram } from "@fortawesome/free-brands-svg-icons"
import Image from "next/image"
import { Button } from "@/components/ui/buttons/Button"
import { createClient } from "@/lib/supabase/server"
import { CONTACT_EMAIL, INSTAGRAM_URL, NAV_LINKS } from "@/config/routes"
import { PageContainer } from "@/components/layout/PageContainer"

export async function Footer() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const year = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-white/10 bg-[#0A0A0E]">
      <PageContainer className="flex flex-col gap-10 py-12 lg:flex-row lg:items-start lg:justify-between">
        <div className="shrink-0">
          <Image
            src="/arcade.png"
            alt="Arcade PNW"
            width={180}
            height={56}
            className="h-14 w-auto"
            style={{ width: "auto", height: "auto" }}
          />
          <p className="mt-4 max-w-xs text-sm text-white/60">
            Student-built aerospace at Purdue Northwest.
          </p>
        </div>

        <div className="flex flex-wrap gap-10 sm:gap-16">
          <div>
            <h3 className="mb-3 font-mono text-xs tracking-[0.22em] text-purdue-gold uppercase">
              Contact
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-white/60 transition-colors hover:text-white"
                >
                  {CONTACT_EMAIL}
                </Link>
              </li>
              <li>
                <Link
                  href="https://maps.app.goo.gl/k14gbXdnBNMe43Hq7"
                  className="text-white/60 transition-colors hover:text-white"
                >
                  Location
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-mono text-xs tracking-[0.22em] text-purdue-gold uppercase">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              {Object.entries({
                Home: NAV_LINKS.HOME,
                Projects: NAV_LINKS.PROJECTS,
                Team: NAV_LINKS.TEAM,
                Events: NAV_LINKS.EVENTS,
                Contact: NAV_LINKS.CONTACT,
                Join: NAV_LINKS.JOIN,
              }).map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-white/60 transition-colors hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-mono text-xs tracking-[0.22em] text-purdue-gold uppercase">
              Connect
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 transition-colors hover:text-white"
                >
                  Instagram
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-4 lg:items-end">
          <Link
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-white/60 transition-colors hover:text-purdue-gold"
          >
            <FontAwesomeIcon icon={faInstagram} className="h-5 w-5" />
          </Link>
          <Button asChild variant="outline" className="rounded-full">
            <Link href={user ? "/dashboard" : "/login"}>
              {user ? "Dashboard" : "Admin Login"}
            </Link>
          </Button>
        </div>
      </PageContainer>

      <div className="border-t border-white/8 py-4 text-center font-mono text-xs text-white/55">
        <p>© {year} Purdue Northwest ARCADE. Built with ❤ by Jih</p>
      </div>
    </footer>
  )
}
