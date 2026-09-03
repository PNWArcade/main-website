"use client"

import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

const SPRING = { type: "spring" as const, duration: 0.55, bounce: 0.12 }

type RevealProps = {
  children: React.ReactNode
  className?: string
  delay?: number
  y?: number
}

export function Reveal({
  children,
  className,
  delay = 0,
  y = 20,
}: RevealProps) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      className={cn(className)}
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={reduced ? { duration: 0 } : { ...SPRING, delay }}
    >
      {children}
    </motion.div>
  )
}

export function Stagger({
  children,
  className,
  stagger = 0.07,
}: {
  children: React.ReactNode
  className?: string
  stagger?: number
}) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: reduced ? 0 : stagger,
            delayChildren: reduced ? 0 : 0.05,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      className={className}
      variants={{
        hidden: reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 },
        visible: {
          opacity: 1,
          y: 0,
          transition: reduced ? { duration: 0 } : SPRING,
        },
      }}
    >
      {children}
    </motion.div>
  )
}
