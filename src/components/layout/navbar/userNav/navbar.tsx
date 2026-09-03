"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/buttons/Button"
import { JOIN_URL, NAV_LINKS } from "@/config/routes"

interface NavbarProps {
  isHomePage?: boolean
}

const links = [
  { name: "Home", href: NAV_LINKS.HOME },
  { name: "Projects", href: NAV_LINKS.PROJECTS },
  { name: "Team", href: NAV_LINKS.TEAM },
  { name: "Events", href: NAV_LINKS.EVENTS },
  { name: "Contact", href: NAV_LINKS.CONTACT },
]

export function Navbar({ isHomePage = false }: NavbarProps) {
  const [open, setOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const menuId = "site-mobile-menu"
  const overHero = isHomePage && !isScrolled

  useEffect(() => {
    const update = () => {
      if (!isHomePage) {
        setIsScrolled(true)
        return
      }
      setIsScrolled(window.scrollY > window.innerHeight * 0.72)
    }

    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [isHomePage])

  useEffect(() => {
    if (!open) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }

    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  return (
    <header className="fixed top-0 left-0 z-50 w-full">
      <nav
        className={`relative mx-auto mt-3 w-[min(1200px,calc(100%-1.5rem))] rounded-full border px-4 py-2.5 transition-colors duration-200 sm:px-6 ${
          overHero
            ? "border-white/20 bg-white/10 backdrop-blur-md"
            : "border-black/10 bg-white shadow-sm backdrop-blur-xl"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <Image
              src="/arcade.png"
              alt="Arcade PNW"
              width={160}
              height={44}
              priority
              className="h-9 w-auto sm:h-10"
              style={{ width: "auto", height: "auto" }}
            />
          </Link>

          <div className="hidden flex-1 items-center justify-center gap-1 md:flex">
            {links.map((link) => (
              <Button
                key={link.name}
                asChild
                variant="ghost"
                size="md"
                className={`rounded-full px-4 text-sm ${
                  overHero
                    ? "text-white/90 hover:bg-white/15 hover:text-white"
                    : "text-foreground hover:bg-black/5 hover:text-foreground"
                }`}
              >
                <Link href={link.href}>{link.name}</Link>
              </Button>
            ))}
          </div>

          <div className="hidden shrink-0 md:flex">
            <Button
              asChild
              size="sm"
              className="rounded-full bg-purdue-gold px-5 text-purdue-black hover:bg-purdue-dust"
            >
              <Link href={JOIN_URL} target="_blank" rel="noopener noreferrer">
                Join Us
              </Link>
            </Button>
          </div>

          <Button
            ref={toggleRef}
            className={`shrink-0 md:hidden ${overHero ? "text-white hover:bg-white/15" : "text-foreground hover:bg-black/5"}`}
            variant="ghost"
            size="icon"
            onClick={() => setOpen((current) => !current)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls={menuId}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {open ? (
        <div
          id={menuId}
          className="mx-3 mt-2 rounded-3xl border border-black/10 bg-white p-4 shadow-lg md:hidden"
        >
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Button
                key={link.name}
                asChild
                variant="ghost"
                className="justify-start text-foreground hover:bg-black/5"
              >
                <Link href={link.href} onClick={() => setOpen(false)}>
                  {link.name}
                </Link>
              </Button>
            ))}
            <Button asChild className="mt-2 rounded-full">
              <Link
                href={JOIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
              >
                Get Started
              </Link>
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  )
}
