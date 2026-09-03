'use client'

import { useRef } from 'react'
import { motion, useScroll, useSpring, useTransform, useReducedMotion } from 'motion/react'
import { Button } from "@/components/ui/buttons/Button"
import Link from "next/link"
import TypingText from "@/components/ui/typing-text"
import { ScrollButton } from "@/components/ui/buttons/ScrollButton"
import Image from "next/image"
import { JOIN_URL } from "@/config/routes"

const PHRASES = [
  "IGNITE. ASCEND. TRANSCEND.",
  "MODEL. MACH. MANEUVER.",
  "PROPEL. PIONEER. PREVAIL.",
  "FUEL. FLIGHT. FUN.",
]

export default function HeroSequence() {
  const heroRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })
  const progress = useSpring(scrollYProgress, { stiffness: 52, damping: 26, restDelta: 0.001 })
  const rocketY = useTransform(progress, [0, 1], [0, prefersReducedMotion ? 0 : -165])
  const rocketX = useTransform(progress, [0, 1], [0, prefersReducedMotion ? 0 : 82])
  const cloudY = useTransform(progress, [0, 1], [0, prefersReducedMotion ? 0 : 68])
  const titleOpacity = useTransform(progress, [0, 0.55], [1, prefersReducedMotion ? 1 : 0])
  const titleY = useTransform(progress, [0, 0.55], [0, prefersReducedMotion ? 0 : -36])

  return (
    <div
      ref={heroRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-b from-blue-400 to-blue-100 px-8 text-center sm:px-0"
    >
      <motion.div
        style={{ top: "8%", left: "50%", y: rocketY, x: rocketX }}
        className="pointer-events-none absolute w-[100px] will-change-transform sm:w-[200px]"
        aria-hidden
      >
        <motion.div
          initial={prefersReducedMotion ? false : { x: "-80vh", y: "80vh" }}
          animate={{ x: 0, y: 0 }}
          transition={{ duration: 1.75, ease: [0.23, 1, 0.32, 1] }}
        >
          <Image
            src="/rocket.webp"
            alt=""
            width={120}
            height={200}
            unoptimized
            className="h-auto w-full rotate-45"
            style={{ width: "100%", height: "auto" }}
            priority
            sizes="(max-width: 640px) 100px, 200px"
          />
        </motion.div>
      </motion.div>

      <motion.div
        style={{ y: cloudY }}
        initial={prefersReducedMotion ? false : { x: "100vw" }}
        animate={{ x: 0 }}
        transition={{ duration: 1.75, ease: [0.23, 1, 0.32, 1] }}
        className="pointer-events-none absolute bottom-0 z-10 w-[300vw] will-change-transform sm:bottom-auto sm:top-[45%] md:w-[4000px]"
        aria-hidden
      >
        <Image
          src="/clouds.webp"
          alt=""
          width={4938}
          height={1000}
          unoptimized
          className="h-auto w-full object-contain"
          sizes="(max-width: 640px) 300vw, 140vw"
          priority
        />
      </motion.div>

      <div className="absolute bottom-0 z-20 h-50 w-full bg-linear-to-t from-white to-transparent" />
      <div className="absolute inset-0 bg-black/40" />

      <motion.section
        style={{ opacity: titleOpacity, y: titleY }}
        className="relative z-20 flex h-full w-full items-center justify-center"
      >
        <div className="max-w-3xl">
          <motion.p
            className="mb-4 font-mono text-xs tracking-[0.32em] text-purdue-gold uppercase"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.55, bounce: 0.12 }}
          >
            Purdue Northwest
          </motion.p>
          <motion.h1
            className="text-4xl font-semibold tracking-tight text-white sm:text-6xl"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.6, bounce: 0.12, delay: prefersReducedMotion ? 0 : 0.08 }}
          >
            Purdue Northwest ARCADE
          </motion.h1>
          <TypingText
            as="p"
            text={PHRASES}
            typingSpeed={70}
            pauseDuration={1600}
            showCursor
            cursorCharacter="|"
            className="mt-5 text-lg text-white/90 sm:text-2xl"
            variableSpeed={{ min: 40, max: 90 }}
          />

          <motion.div
            className="mt-10 flex flex-wrap justify-center gap-3"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.55, bounce: 0.12, delay: prefersReducedMotion ? 0 : 0.45 }}
          >
            <Button asChild size="lg" className="rounded-full px-7">
              <Link href={JOIN_URL} target="_blank" rel="noopener noreferrer">
                Join Us
              </Link>
            </Button>
            <ScrollButton
              variant="outline"
              className="rounded-full border-white/70 bg-transparent px-7 text-base text-white hover:bg-black hover:text-white"
              targetId="mission"
            >
              Learn More
            </ScrollButton>
          </motion.div>
        </div>
      </motion.section>
    </div>
  )
}
