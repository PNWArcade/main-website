"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/buttons/Button"
import { Home, FolderKanban, MessageSquare, Heart, LogOut, Users, UserCog } from "lucide-react"
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

    return (
        <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200 min-h-screen">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-purdue-black">Admin Panel</h2>
                <p className="text-sm text-gray-500">Manage your content</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {navigation.map((item) => {
                    const Icon = item.icon
                    const isActive = item.href === DASHBOARD_ROUTES.DASHBOARD
                        ? pathname === item.href
                        : pathname.startsWith(item.href)

                    return (
                        <Link key={item.name} href={item.href}>
                            <Button
                                variant={isActive ? "default" : "ghost"}
                                className={cn(
                                    "w-full justify-start",
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
    )
}
