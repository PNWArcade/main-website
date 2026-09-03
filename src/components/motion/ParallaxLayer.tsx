"use client"

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react"
import { useRef } from "react"
import { cn } from "@/lib/utils"

type ParallaxLayerProps = {
  children: React.ReactNode
  className?: string
  speed?: number
  style?: React.CSSProperties
}

export function ParallaxLayer({
  children,
  className,
  speed = -80,
  style,
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const y = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : speed])

  return (
    <motion.div
      ref={ref}
      style={{ y: y as MotionValue<number>, ...style }}
      className={cn("will-change-transform", reduced && "will-change-auto", className)}
      aria-hidden
    >
      {children}
    </motion.div>
  )
}
