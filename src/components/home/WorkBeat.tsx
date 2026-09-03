"use client"

import Image from "next/image"
import { useRef } from "react"
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react"
import { cn } from "@/lib/utils"

const EASE = [0.23, 1, 0.32, 1] as const

export function WorkBeat({
  id,
  title,
  body,
  image,
  imageAlt,
  reverse = false,
}: {
  id: string
  title: string
  body: string
  image: string
  imageAlt: string
  reverse?: boolean
}) {
  const imageWrapRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: imageWrapRef,
    offset: ["start end", "end start"],
  })
  const progress = useSpring(scrollYProgress, { stiffness: 70, damping: 24, restDelta: 0.001 })
  const imageY = useTransform(progress, [0, 1], [reduced ? 0 : 48, reduced ? 0 : -48])
  const imageScale = useTransform(progress, [0, 1], [reduced ? 1 : 1.12, 1])

  return (
    <section id={id} className="scroll-mt-28">
      <div className="grid items-center gap-10 md:grid-cols-12 md:gap-x-14 lg:gap-x-20">
        <motion.div
          className={cn(
            "md:col-span-6",
            reverse ? "md:order-2 md:pl-2 lg:pl-6" : "md:order-1 md:pr-2 lg:pr-6"
          )}
          initial={reduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ type: "spring", duration: 0.55, bounce: 0.12 }}
        >
          <h2 className="max-w-lg text-pretty text-3xl font-semibold text-foreground">{title}</h2>
          <p className="mt-4 max-w-lg text-lg leading-relaxed text-muted-foreground">{body}</p>
        </motion.div>

        <motion.div
          ref={imageWrapRef}
          className={cn(
            "relative aspect-[4/5] overflow-hidden rounded-3xl md:col-span-6 md:aspect-[5/6]",
            reverse ? "md:order-1" : "md:order-2"
          )}
          initial={reduced ? false : { opacity: 0, clipPath: "inset(14% 14% 14% 14%)" }}
          whileInView={{ opacity: 1, clipPath: "inset(0% 0% 0% 0%)" }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <motion.div style={{ y: imageY, scale: imageScale }} className="absolute inset-[-16%]">
            <Image
              src={image}
              alt={imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
