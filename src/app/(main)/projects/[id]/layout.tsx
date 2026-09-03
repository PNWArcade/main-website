"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()
  const projectId = pathname?.split("/")[2]

  useEffect(() => {
    if (!mobileMenuOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false)
        toggleRef.current?.focus()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [mobileMenuOpen])

  const navItems = [
    { label: "Overview", href: `/projects/${projectId}` },
    { label: "Sub-Projects", href: `/projects/${projectId}/sub-projects` },
    { label: "Our Team", href: `/projects/${projectId}/team` },
    { label: "Technical Articles", href: `/projects/${projectId}/articles` },
  ]

  const isActive = (href: string) => {
    if (href === `/projects/${projectId}`) return pathname === href
    return pathname?.startsWith(href)
  }

  return (
    <>
      <nav className="sticky top-[4.5rem] z-40 border-b border-black/10 bg-white/95 backdrop-blur-xl sm:top-[5.25rem]">
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-10">
          <div className="hidden h-14 items-center gap-6 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "border-b-2 py-4 text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "border-purdue-gold text-purdue-gold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex h-14 items-center justify-between md:hidden">
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="flex items-center gap-2 text-sm text-foreground"
              aria-label="Toggle project menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="project-subnav"
            >
              Project sections
              {mobileMenuOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          {mobileMenuOpen ? (
            <div id="project-subnav" className="space-y-1 border-t border-black/10 py-3 md:hidden">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block py-2 text-sm font-medium",
                    isActive(item.href) ? "text-purdue-gold" : "text-muted-foreground"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </nav>
      {children}
    </>
  )
}
