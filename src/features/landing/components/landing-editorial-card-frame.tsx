import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { CinematicScrollCard } from "./motion-primitives"

interface LandingEditorialCardFrameProps {
  children: ReactNode
  className?: string
  contentClassName?: string
  borderClassName?: string
  panelClassName?: string
  leadingIcon?: LucideIcon
  leadingText?: string
  leadingIconWrapperClassName?: string
  leadingIconClassName?: string
  leadingTextClassName?: string
  orbClassName?: string
  orbPositionClassName?: string
  decorativeIcon?: LucideIcon
  decorativeIconClassName?: string
  decorativeIconPositionClassName?: string
  decorativeText?: string
  decorativeTextClassName?: string
}

export function LandingEditorialCardFrame({
  children,
  className,
  contentClassName,
  borderClassName,
  panelClassName,
  leadingIcon: LeadingIcon,
  leadingText,
  leadingIconWrapperClassName,
  leadingIconClassName,
  leadingTextClassName,
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
        "group relative overflow-hidden rounded-[2.5rem] border bg-gradient-to-br from-white/92 via-white/72 to-cyan-50/36 backdrop-blur-3xl ring-1 ring-inset ring-black/[0.035] shadow-[0_34px_110px_-66px_rgba(15,23,42,0.32),inset_0_1px_0_rgba(255,255,255,0.82)] transition-[border-color,box-shadow,background-color] duration-500 hover:border-cyan-500/36 hover:shadow-[0_48px_130px_-62px_rgba(15,23,42,0.46),0_0_42px_-28px_rgba(20,184,166,0.58),inset_0_1px_0_rgba(255,255,255,0.88)] dark:from-white/[0.085] dark:via-white/[0.045] dark:to-cyan-200/[0.06] dark:ring-white/[0.065] dark:shadow-[0_42px_128px_-68px_rgba(0,0,0,0.96),inset_0_1px_0_rgba(255,255,255,0.10)] dark:hover:border-cyan-200/34 dark:hover:shadow-[0_54px_150px_-68px_rgba(0,0,0,0.98),0_0_62px_-30px_rgba(45,212,191,0.62),inset_0_1px_0_rgba(255,255,255,0.13)]",
        borderClassName,
        panelClassName,
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(255,255,255,0.58),rgba(255,255,255,0.16)_30%,transparent_62%),linear-gradient(132deg,transparent_0%,rgba(20,184,166,0.075)_38%,rgba(255,255,255,0.20)_50%,transparent_64%)] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.088),rgba(255,255,255,0.028)_32%,transparent_66%),linear-gradient(132deg,transparent_0%,rgba(45,212,191,0.08)_38%,rgba(255,255,255,0.06)_50%,transparent_66%)]" />
      <div className="pointer-events-none absolute inset-0 z-[2] rounded-[inherit] border border-white/60 opacity-80 [mask-image:linear-gradient(180deg,black,transparent_48%)] dark:border-white/12 dark:opacity-90" />
      <div className="pointer-events-none absolute inset-px z-[2] rounded-[calc(2.5rem-1px)] shadow-[inset_0_1px_0_rgba(255,255,255,0.86),inset_0_-1px_0_rgba(15,23,42,0.035)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-1px_0_rgba(255,255,255,0.04)]" />
      <div className="relative z-10 h-full w-full [transform-style:preserve-3d]">
        {LeadingIcon || leadingText ? (
          <div
            className={cn(
              "pointer-events-none absolute left-8 top-8 z-20 flex h-16 w-16 items-center justify-center overflow-hidden rounded-[1.4rem] border shadow-[0_22px_50px_-30px_rgba(15,23,42,0.46),0_0_34px_-24px_rgba(20,184,166,0.42),inset_0_1px_0_rgba(255,255,255,0.72)] [transform:translateZ(60px)] sm:left-10 sm:top-10 sm:h-20 sm:w-20 sm:rounded-[1.8rem] lg:left-12 lg:top-12 dark:shadow-[0_24px_58px_-32px_rgba(0,0,0,0.92),0_0_38px_-24px_rgba(45,212,191,0.32),inset_0_1px_0_rgba(255,255,255,0.11)]",
              leadingIconWrapperClassName
            )}
          >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.5),transparent_50%)] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.09),transparent_54%)]" />
            {LeadingIcon ? (
              <LeadingIcon className={cn("relative z-10 h-7 w-7 sm:h-9 sm:w-9 drop-shadow-md", leadingIconClassName)} />
            ) : (
              <span
                className={cn(
                  "relative z-10 text-[13px] font-black tracking-[0.22em] sm:text-[16px] drop-shadow-md",
                  leadingTextClassName
                )}
              >
                {leadingText}
              </span>
            )}
          </div>
        ) : null}

        {orbClassName ? (
          <div
            className={cn(
              "pointer-events-none absolute opacity-24 transition-opacity duration-1000 [transform:translateZ(-60px)] group-hover:opacity-36 dark:opacity-18 dark:group-hover:opacity-28",
              orbPositionClassName,
            )}
          >
            <div className={cn("absolute inset-0 rounded-[44%] blur-[120px] sm:blur-[150px]", orbClassName)} />
            <div className="absolute inset-[20%] rotate-12 rounded-[44%] bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.28),transparent)] opacity-50 blur-[34px] dark:bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.08),transparent)] dark:opacity-46" />
          </div>
        ) : null}

        {DecorativeIcon ? (
          <div
            className={cn(
              "pointer-events-none absolute text-foreground/[0.105] transition-[color,filter,opacity,transform] duration-700 ease-out [transform:translate3d(0,0,-100px)_rotate(0deg)] group-hover:[transform:translate3d(0,-2.25rem,-100px)_rotate(-3deg)] group-hover:text-cyan-600/20 group-hover:drop-shadow-[0_0_18px_rgba(20,184,166,0.24)] dark:text-white/[0.095] dark:group-hover:text-cyan-100/[0.16] dark:group-hover:drop-shadow-[0_0_22px_rgba(45,212,191,0.26)]",
              decorativeIconPositionClassName
            )}
          >
            <DecorativeIcon className={cn("h-24 w-24 sm:h-32 sm:w-32 lg:h-40 lg:w-40", decorativeIconClassName)} strokeWidth={1.3} />
          </div>
        ) : null}

        {decorativeText ? (
          <div
            className={cn(
              "pointer-events-none absolute font-black italic transition-[color,filter,opacity,transform] duration-700 ease-out [transform:translate3d(0,0,-140px)_rotate(0deg)] group-hover:[transform:translate3d(0,-4.25rem,-140px)_rotate(-2deg)]",
              decorativeTextClassName,
              "group-hover:text-cyan-600/[0.12] group-hover:drop-shadow-[0_0_18px_rgba(20,184,166,0.20)] dark:group-hover:text-cyan-100/[0.10] dark:group-hover:drop-shadow-[0_0_22px_rgba(45,212,191,0.22)]"
            )}
          >
            {decorativeText}
          </div>
        ) : null}

        {/* Children Front Plane */}
        <div className={cn("relative z-30 h-full flex-1 [transform:translateZ(40px)]", contentClassName)}>
          {children}
        </div>
      </div>
    </CinematicScrollCard>
  )
}
