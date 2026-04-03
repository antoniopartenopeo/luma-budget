"use client"

import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { CinematicScrollCard } from "./motion-primitives"

interface LandingEditorialCardFrameProps {
  children: ReactNode
  className?: string
  borderClassName?: string
  panelClassName?: string
  highlightClassName?: string
  orbClassName?: string
  orbPositionClassName?: string
  decorativeIcon?: LucideIcon
  decorativeIconClassName?: string
  decorativeIconPositionClassName?: string
  decorativeText?: string
  decorativeTextClassName?: string
}

const DEFAULT_HIGHLIGHT_CLASS =
  "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.4),transparent_42%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.06),transparent_46%)]"

export function LandingEditorialCardFrame({
  children,
  className,
  borderClassName,
  panelClassName,
  highlightClassName,
  orbClassName,
  orbPositionClassName,
  decorativeIcon: DecorativeIcon,
  decorativeIconClassName,
  decorativeIconPositionClassName,
  decorativeText,
  decorativeTextClassName
}: LandingEditorialCardFrameProps) {
  return (
    <CinematicScrollCard
      className={cn(
        "group relative overflow-hidden rounded-[2.5rem] border backdrop-blur-3xl",
        borderClassName,
        panelClassName,
        className
      )}
    >
      <div className={cn(DEFAULT_HIGHLIGHT_CLASS, highlightClassName)} />

      {orbClassName ? (
        <div
          className={cn(
            "pointer-events-none absolute rounded-full blur-[80px] transition-transform duration-1000 group-hover:scale-110 sm:blur-[120px]",
            orbPositionClassName,
            orbClassName
          )}
        />
      ) : null}

      {DecorativeIcon ? (
        <div
          className={cn(
            "pointer-events-none absolute text-foreground/[0.08] transition-transform duration-1000 group-hover:-translate-y-2 dark:text-white/[0.06]",
            decorativeIconPositionClassName
          )}
        >
          <DecorativeIcon className={cn("h-24 w-24 sm:h-32 sm:w-32 lg:h-40 lg:w-40", decorativeIconClassName)} strokeWidth={1.3} />
        </div>
      ) : null}

      {decorativeText ? (
        <div
          className={cn(
            "pointer-events-none absolute font-black italic tracking-tighter transition-transform duration-1000 group-hover:-translate-y-4",
            decorativeTextClassName
          )}
        >
          {decorativeText}
        </div>
      ) : null}

      <div className="relative">{children}</div>
    </CinematicScrollCard>
  )
}
