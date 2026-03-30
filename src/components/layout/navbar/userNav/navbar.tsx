// components/layout/Navbar.tsx
"use client"

import Link from "next/link"
import Image from "next/image"
import {useState} from "react"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faBars, faXmark} from "@fortawesome/free-solid-svg-icons"
import {Button} from '@/components/ui/buttons/Button'
import {NAV_LINKS} from "@/config/routes"
import ASMEPNWLogo from "../../../../../public/ASMEPNWLogo.png";

export function Navbar() {
    const [open,
        setOpen] = useState(false)

    const links = [
        {
            name: "Home",
            href: NAV_LINKS.HOME
        }, {
            name: "Projects",
            href: NAV_LINKS.PROJECTS
        }, {
            name: "Team",
            href: NAV_LINKS.TEAM
        }, {
            name: "Events",
            href: NAV_LINKS.EVENTS
        }, {
            name: "Contact",
            href: NAV_LINKS.CONTACT
        }
    ]
    return (
        <header
            className="w-full border-b bg-white top-0 sticky left-0 z-50 shadow-sm">
            <nav className="relative flex items-center justify-between px-4 sm:px-8 lg:px-[15%] py-4 gap-4">
                <Link href="/" className="flex items-center gap-3 shrink-0">
                    <Image
                        src={ASMEPNWLogo}
                        priority={true}
                        loading="eager"
                        alt="ASME Purdue Northwest"
                        className="w-auto h-12 sm:h-14 md:h-16"/>
                </Link>

                {/* Desktop links - Center */}
                <div className="hidden md:flex items-center gap-2 lg:gap-4 xl:gap-6 flex-1 justify-center">
                    {links.map((link) => (
                        <Link key={link.name} href={link.href} className="cursor-pointer">
                            <Button
                                variant="ghost"
                                size="md"
                                className="text-black text-lg lg:text-md hover:text-foreground whitespace-nowrap">
                                {link.name}
                            </Button>
                        </Link>
                    ))}
                </div>

                <div className="hidden md:block shrink-0">
                    <Link href="https://mypnwlife.pnw.edu/ASME/club_signup" className="cursor-pointer">
                        <Button className="hover:bg-gray-200 hover:text-black text-md " variant="default" size="sm">
                            Join Us
                        </Button>
                    </Link>
                </div>

                {/* Mobile toggle */}
                <Button
                    className="md:hidden shrink-0"
                    onClick={() => setOpen(!open)}
                    aria-label="Toggle menu">
                    <FontAwesomeIcon
                        icon={open
                        ? faXmark
                        : faBars}
                        className="w-6 h-6"/>
                </Button>
            </nav>

            {/* Mobile menu */}
            {open && (
                <div
                    className="md:hidden flex flex-col items-center gap-4 pb-6 bg-white border-t">
                    {links.map((link) => (
                        <Link key={link.name} href={link.href} className="cursor-pointer">
                            <Button
                                variant="ghost"
                                size="default"
                                onClick={() => setOpen(false)}>
                                {link.name}
                            </Button>
                        </Link>
                    ))}
                    <Link href={NAV_LINKS.JOIN} className="cursor-pointer">
                        <Button variant="default" size="default" onClick={() => setOpen(false)}>
                            Join Us
                        </Button>
                    </Link>
                </div>
            )}
        </header>
    )
}
