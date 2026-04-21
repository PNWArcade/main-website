"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/buttons/Button"
import { Home, FolderKanban, MessageSquare, Heart, LogOut, Users, UserCog, Menu, X } from "lucide-react"
import { DASHBOARD_ROUTES } from "@/config/routes"
import { logout } from "@/components/actions/logout"

const navigation = [
    {
        name: "Dashboard",
        href: DASHBOARD_ROUTES.DASHBOARD,
        icon: Home,
        description: "Overview"
    },
    {
        name: "Projects",
        href: DASHBOARD_ROUTES.PROJECTS,
        icon: FolderKanban,
        description: "Manage projects"
    },
    {
        name: "Inquiries",
        href: DASHBOARD_ROUTES.INQUIRIES,
        icon: MessageSquare,
        description: "Contact form submissions"
    },
    {
        name: "Sponsors",
        href: DASHBOARD_ROUTES.SPONSORS,
        icon: Heart,
        description: "Manage sponsors"
    },
    {
        name: "Members",
        href: DASHBOARD_ROUTES.MEMBERS,
        icon: Users,
        description: "Team members & invites"
    },
    {
        name: "Team Overrides",
        href: DASHBOARD_ROUTES.TEAM_OVERRIDES,
        icon: UserCog,
        description: "Customize team member profiles"
    }
]

export function DashboardSidebar() {
    const pathname = usePathname()
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    const renderNavItems = (onNavigate?: () => void) => (
        <>
            {navigation.map((item) => {
                const Icon = item.icon
                const isActive = item.href === DASHBOARD_ROUTES.DASHBOARD
                    ? pathname === item.href
                    : pathname.startsWith(item.href)

                return (
                    <Link key={item.name} href={item.href} onClick={onNavigate}>
                        <Button
                            variant={isActive ? "default" : "ghost"}
                            className={cn(
                                "h-11 w-full justify-start",
                                isActive
                                    ? "bg-purdue-gold text-purdue-black hover:bg-purdue-gold/90"
                                    : "text-gray-600 hover:text-purdue-black hover:bg-gray-100"
                            )}
                        >
                            <Icon className="mr-3 h-5 w-5" />
                            <span>{item.name}</span>
                        </Button>
                    </Link>
                )
            })}
        </>
    )

    return (
        <>
            <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:hidden">
                <div>
                    <h2 className="text-base font-semibold text-purdue-black">Admin Panel</h2>
                    <p className="text-xs text-gray-500">Manage your content</p>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    className="h-10 w-10 p-0"
                    onClick={() => setIsMobileOpen(true)}
                    aria-label="Open dashboard menu"
                >
                    <Menu className="h-5 w-5" />
                </Button>
            </header>

            {isMobileOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <button
                        type="button"
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setIsMobileOpen(false)}
                        aria-label="Close dashboard menu"
                    />
                    <aside className="relative z-50 flex h-full w-72 max-w-[85vw] flex-col bg-white border-r border-gray-200">
                        <div className="flex items-center justify-between border-b border-gray-200 p-4">
                            <div>
                                <h2 className="text-lg font-semibold text-purdue-black">Admin Panel</h2>
                                <p className="text-sm text-gray-500">Manage your content</p>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                className="h-10 w-10 p-0"
                                onClick={() => setIsMobileOpen(false)}
                                aria-label="Close dashboard menu"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <nav className="flex-1 space-y-1 p-4">
                            {renderNavItems(() => setIsMobileOpen(false))}
                        </nav>

                        <div className="border-t border-gray-200 p-4">
                            <form action={logout}>
                                <Button
                                    type="submit"
                                    variant="ghost"
                                    className="h-11 w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <LogOut className="mr-3 h-5 w-5" />
                                    <span>Sign Out</span>
                                </Button>
                            </form>
                        </div>
                    </aside>
                </div>
            )}

            <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200 min-h-screen">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-purdue-black">Admin Panel</h2>
                    <p className="text-sm text-gray-500">Manage your content</p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {renderNavItems()}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200">
                    <form action={logout}>
                        <Button
                            type="submit"
                            variant="ghost"
                            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            <LogOut className="mr-3 h-5 w-5" />
                            <span>Sign Out</span>
                        </Button>
                    </form>
                </div>
            </aside>
        </>
    )
}
