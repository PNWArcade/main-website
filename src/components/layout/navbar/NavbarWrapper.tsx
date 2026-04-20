"use client"

import { usePathname } from "next/navigation"
import { Navbar } from "./userNav/navbar"

export function NavbarWrapper() {
  const pathname = usePathname()

  // Don't show navbar on dashboard/admin routes or auth routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/login") || pathname.startsWith("/invites")) {
    return null
  }

  // Home page shows transparent navbar
  const isHome = pathname === "/"

  return <Navbar isHomePage={isHome} />
}
