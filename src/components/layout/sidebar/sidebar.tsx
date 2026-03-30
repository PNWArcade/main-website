"use client"

import Link from "next/link"
import {usePathname} from "next/navigation"
import {cn} from "@/lib/utils"
import {Button} from "@/components/ui/buttons/Button"
import {Home, FolderKanban, Users, Calendar, UserCog} from "lucide-react"
import {DASHBOARD_ROUTES} from "@/config/routes"

const navigation = [
    {
        name: "Dashboard",
        href: DASHBOARD_ROUTES.DASHBOARD,
        icon: Home
    }, {
        name: "Project",
        href: DASHBOARD_ROUTES.PROJECTS,
        icon: FolderKanban
    }, {
        name: "Team",
        href: DASHBOARD_ROUTES.TEAM,
        icon: Users
    }, {
        name: "Team Overrides",
        href: DASHBOARD_ROUTES.TEAM_OVERRIDES,
        icon: UserCog
    }, {
        name: "Events",
        href: DASHBOARD_ROUTES.EVENTS,
        icon: Calendar
    }

]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="hidden md:block w-64 bg-card border-r">
            <nav className="flex flex-col h-full space-y-1 p-4">
                {navigation.map((item) => {
                    const Icon = item.icon
                    const isActive = item.href === DASHBOARD_ROUTES.DASHBOARD
                        ? pathname === item.href
                        : pathname.startsWith(item.href)

                    return (
                        <Link key={item.name} href={item.href}>
                            <Button
                                variant={isActive
                                ? "default"
                                : "ghost"}
                                className={cn("w-full justify-start", isActive
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent")}>
                                <Icon className="mr-3 h-4 w-4"/> {item.name}
                            </Button>
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}