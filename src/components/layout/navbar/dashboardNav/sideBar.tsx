"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/buttons/Button"
import {
  Home,
  FolderKanban,
  MessageSquare,
  Heart,
  LogOut,
  Users,
  UserCog,
  UserPlus,
  Menu,
  X,
} from "lucide-react"
import { DASHBOARD_ROUTES } from "@/config/routes"
import { logout } from "@/components/actions/logout"

const navigation = [
  {
    group: "Overview",
    items: [{ name: "Overview", href: DASHBOARD_ROUTES.DASHBOARD, icon: Home }],
  },
  {
    group: "Content",
    items: [
      { name: "Projects", href: DASHBOARD_ROUTES.PROJECTS, icon: FolderKanban },
      { name: "Inquiries", href: DASHBOARD_ROUTES.INQUIRIES, icon: MessageSquare },
      { name: "Sponsors", href: DASHBOARD_ROUTES.SPONSORS, icon: Heart },
    ],
  },
  {
    group: "Public Team",
    items: [
      { name: "Roster", href: DASHBOARD_ROUTES.TEAM, icon: UserPlus },
      { name: "Photo overrides", href: DASHBOARD_ROUTES.TEAM_OVERRIDES, icon: UserCog },
    ],
  },
  {
    group: "Access",
    items: [{ name: "Dashboard users", href: DASHBOARD_ROUTES.MEMBERS, icon: Users }],
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isMobileOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileOpen(false)
        toggleRef.current?.focus()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [isMobileOpen])

  const renderNavItems = (onNavigate?: () => void) =>
    navigation.map((section) => (
      <div key={section.group} className="space-y-1">
        <p className="px-3 pt-3 font-mono text-[10px] tracking-[0.22em] text-purdue-gold uppercase">
          {section.group}
        </p>
        {section.items.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === DASHBOARD_ROUTES.DASHBOARD
              ? pathname === item.href
              : pathname.startsWith(item.href)

          return (
            <Button
              key={item.name}
              asChild
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "h-11 w-full justify-start",
                isActive
                  ? "bg-purdue-gold text-purdue-black hover:bg-purdue-gold/90"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Link href={item.href} onClick={onNavigate}>
                <Icon className="mr-3 h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            </Button>
          )
        })}
      </div>
    ))

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-sidebar-border bg-sidebar px-4 py-3 md:hidden">
        <div>
          <h2 className="text-base font-semibold text-sidebar-foreground">Admin</h2>
          <p className="text-xs text-muted-foreground">ARCADE control room</p>
        </div>
        <Button
          ref={toggleRef}
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Open dashboard menu"
          aria-expanded={isMobileOpen}
          aria-controls="dashboard-mobile-menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </header>

      {isMobileOpen ? (
        <div id="dashboard-mobile-menu" className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close dashboard menu"
          />
          <aside className="relative z-50 flex h-full w-72 max-w-[85vw] flex-col border-r border-sidebar-border bg-sidebar">
            <div className="flex items-center justify-between border-b border-sidebar-border p-4">
              <div>
                <h2 className="text-lg font-semibold text-sidebar-foreground">Admin</h2>
                <p className="text-sm text-muted-foreground">ARCADE control room</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileOpen(false)}
                aria-label="Close dashboard menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex-1 space-y-4 overflow-y-auto p-3">{renderNavItems(() => setIsMobileOpen(false))}</nav>
            <div className="border-t border-sidebar-border p-4">
              <form action={logout}>
                <Button type="submit" variant="ghost" className="h-11 w-full justify-start text-red-400">
                  <LogOut className="mr-3 h-5 w-5" />
                  Sign Out
                </Button>
              </form>
            </div>
          </aside>
        </div>
      ) : null}

      <aside className="hidden min-h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <div className="border-b border-sidebar-border p-6">
          <h2 className="text-lg font-semibold text-sidebar-foreground">Admin</h2>
          <p className="text-sm text-muted-foreground">ARCADE control room</p>
        </div>
        <nav className="flex-1 space-y-4 p-3">{renderNavItems()}</nav>
        <div className="border-t border-sidebar-border p-4">
          <form action={logout}>
            <Button type="submit" variant="ghost" className="w-full justify-start text-red-400">
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </Button>
          </form>
        </div>
      </aside>
    </>
  )
}
