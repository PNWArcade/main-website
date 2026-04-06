// components/layout/Navbar.tsx
"use client"

import Link from "next/link"
import Image from "next/image"
import {useState, useEffect} from "react"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faBars, faXmark} from "@fortawesome/free-solid-svg-icons"
import {Button} from '@/components/ui/buttons/Button'
import {NAV_LINKS} from "@/config/routes"
import ArcadePNW from "../../../../../public/arcade.png";

export function Navbar() {
    const [open,
        setOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

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
            className="w-full bg-transparent top-0 fixed left-0 z-50">
            <nav className={`relative mx-auto mt-3 w-[min(1200px,calc(100%-2rem))] rounded-[28px] px-4 py-3 sm:px-6 lg:px-8 transition-all duration-300 ${isScrolled ? 'bg-black/30 backdrop-blur-md' : ''}`}>
                <div className="flex items-center justify-between gap-4">
                <Link href="/" className="flex items-center gap-3 shrink-0">
                    <Image
                        src={ArcadePNW}
                        priority={true}
                        loading="eager"
                        alt="Arcade PNW"
                        className="w-auto h-9 sm:h-10 md:h-11"/>
                </Link>

                {/* Desktop links - Center */}
                <div className="hidden md:flex items-center gap-1 lg:gap-2 xl:gap-3 flex-1 justify-center">
                    {links.map((link) => (
                        <Link key={link.name} href={link.href} className="cursor-pointer">
                            <Button
                                variant="ghost"
                                size="md"
                                className="text-white/95 text-sm lg:text-base hover:bg-white/20 whitespace-nowrap rounded-full px-4 py-2 font-medium">
                                {link.name}
                            </Button>
                        </Link>
                    ))}
                </div>

                <div className="hidden md:flex items-center gap-2 shrink-0">
                    <Link href="https://mypnwlife.pnw.edu/ASME/club_signup" className="cursor-pointer">
                        <Button className="border border-white/35 bg-white/25 text-white hover:bg-white/35 text-sm rounded-2xl px-5 py-2 font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]" variant="default" size="sm">
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
                </div>
            </nav>

            {/* Mobile menu */}
            {open && (
                <div
                    className="md:hidden mx-4 mt-2 rounded-2xl bg-black/30 p-4 flex flex-col items-center gap-2 backdrop-blur-md">
                    {links.map((link) => (
                        <Link key={link.name} href={link.href} className="cursor-pointer">
                            <Button
                                variant="ghost"
                                size="default"
                                className="text-white/95 hover:bg-white/20"
                                onClick={() => setOpen(false)}>
                                {link.name}
                            </Button>
                        </Link>
                    ))}
                    <Link href="https://mypnwlife.pnw.edu/ASME/club_signup" className="cursor-pointer">
                        <Button variant="default" size="default" className="border border-white/35 bg-white/25 text-white hover:bg-white/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]" onClick={() => setOpen(false)}>
                            Get Started
                        </Button>
                    </Link>
                </div>
            )}
        </header>
    )
}
