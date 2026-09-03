"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { useReducedMotion } from "motion/react"

export type MotionMode = "full" | "reduced" | "static"

const MotionPreferencesContext = createContext<MotionMode>("full")

export function useMotionMode() {
  return useContext(MotionPreferencesContext)
}

export function MotionPreferences({ children }: { children: React.ReactNode }) {
  const prefersReduced = useReducedMotion()
  const [staticOverride, setStaticOverride] = useState(false)

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setStaticOverride(media.matches)
    sync()
    media.addEventListener("change", sync)
    return () => media.removeEventListener("change", sync)
  }, [])

  const mode = useMemo<MotionMode>(() => {
    if (prefersReduced || staticOverride) return "reduced"
    return "full"
  }, [prefersReduced, staticOverride])

  return (
    <MotionPreferencesContext.Provider value={mode}>
      {children}
    </MotionPreferencesContext.Provider>
  )
}
