"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react"
import { PageContainer } from "@/components/layout/PageContainer"
import { cn } from "@/lib/utils"

export type MissionPillar = {
  n: string
  title: string
  body: string
  href: string
}

const SPRING = { stiffness: 90, damping: 26, restDelta: 0.001 }

export function MissionPin({ pillars }: { pillars: readonly MissionPillar[] }) {
  const sectionRef = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const [desktop, setDesktop] = useState(false)

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)")
    const sync = () => setDesktop(media.matches)
    sync()
    media.addEventListener("change", sync)
    return () => media.removeEventListener("change", sync)
  }, [])

  const pin = desktop && !reduced
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  })
  const progress = useSpring(scrollYProgress, SPRING)

  const p2o = useTransform(progress, [0.22, 0.48], [0, 1])
  const p2y = useTransform(progress, [0.22, 0.48], [32, 0])
  const p3o = useTransform(progress, [0.5, 0.78], [0, 1])
  const p3y = useTransform(progress, [0.5, 0.78], [32, 0])

  const pillarMotion = [
    undefined,
    { opacity: p2o, y: p2y },
    { opacity: p3o, y: p3y },
  ] as const

  return (
    <section
      ref={sectionRef}
      id="mission"
      className="relative scroll-mt-28 bg-background lg:min-h-[175vh] motion-reduce:lg:min-h-0"
    >
      <div className="lg:sticky lg:top-24 lg:flex lg:min-h-[calc(100vh-6rem)] lg:items-center motion-reduce:lg:static">
        <PageContainer className="py-20 sm:py-28 lg:py-16">
          <p className="mb-3 font-mono text-xs tracking-[0.28em] text-purdue-gold uppercase">
            Mission
          </p>
          <h2 className="max-w-3xl text-pretty text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Advancing aeronautical engineering through student collaboration.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            We exist to inspire, connect, and empower future engineers and astronauts at Purdue Northwest. The chapter does that in three ways:
          </p>
          <ol className="mt-12 grid gap-4 md:grid-cols-3">
            {pillars.map((pillar, index) => (
              <motion.li
                key={pillar.n}
                className={cn(
                  "min-w-0",
                  index > 0 && "lg:opacity-0 motion-reduce:lg:opacity-100"
                )}
                style={pin && index > 0 ? pillarMotion[index] : undefined}
              >
                <Link
                  href={pillar.href}
                  className="lab-plate lift group flex h-full min-h-44 flex-col rounded-2xl p-6 hover:border-purdue-gold/40 focus-visible:ring-2 focus-visible:ring-purdue-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <span className="font-mono text-xs tracking-[0.22em] text-purdue-gold">
                    {pillar.n}
                  </span>
                  <h3 className="mt-4 text-xl font-semibold tracking-tight text-foreground">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {pillar.body}
                  </p>
                  <span className="mt-6 font-mono text-xs tracking-[0.18em] text-purdue-gold uppercase group-hover:underline">
                    See the work
                  </span>
                </Link>
              </motion.li>
            ))}
          </ol>
        </PageContainer>
      </div>
    </section>
  )
}
