"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { LANDING_HERO_FRAME_CLASS } from "./landing-tokens"

interface LandingHeroSurfaceProps {
  children: ReactNode
  className?: string
  contentClassName?: string
}

export function LandingHeroSurface({
  children,
  className,
  contentClassName,
}: LandingHeroSurfaceProps) {
  return (
    <div className={cn(LANDING_HERO_FRAME_CLASS, className)}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.26),transparent_42%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_44%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent dark:via-white/18" />
      <div className={cn("relative z-10", contentClassName)}>{children}</div>
    </div>
  )
}
