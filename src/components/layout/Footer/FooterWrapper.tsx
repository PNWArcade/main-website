"use client"

import { usePathname } from "next/navigation"

export function FooterWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/invites")
  ) {
    return null
  }

  return <>{children}</>
}
