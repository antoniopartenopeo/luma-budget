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
        "group relative overflow-hidden rounded-[2.5rem] border backdrop-blur-3xl ring-1 ring-inset ring-white/10 dark:ring-white/5",
        borderClassName,
        panelClassName,
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_18%_14%,rgba(255,255,255,0.52),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.24),transparent_28%),linear-gradient(145deg,rgba(255,255,255,0.14),transparent_54%)] dark:bg-[radial-gradient(circle_at_18%_14%,rgba(255,255,255,0.07),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.045),transparent_28%),linear-gradient(145deg,rgba(255,255,255,0.03),transparent_54%)]" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_82%_86%,rgba(203,213,225,0.2),transparent_28%)] dark:bg-[radial-gradient(circle_at_82%_86%,rgba(255,255,255,0.04),transparent_28%)]" />
      <div className="relative z-10 h-full w-full [transform-style:preserve-3d]">
        {LeadingIcon || leadingText ? (
          <div
            className={cn(
              "pointer-events-none absolute left-8 top-8 z-20 flex h-16 w-16 items-center justify-center overflow-hidden rounded-[1.4rem] border shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] [transform:translateZ(60px)] sm:left-10 sm:top-10 sm:h-20 sm:w-20 sm:rounded-[1.8rem] lg:left-12 lg:top-12",
              leadingIconWrapperClassName
            )}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_26%_22%,rgba(255,255,255,0.74),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.22),transparent_44%)] dark:bg-[radial-gradient(circle_at_26%_22%,rgba(255,255,255,0.12),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent_44%)]" />
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
              "pointer-events-none absolute transition-transform duration-1000 [transform:translateZ(-60px)] group-hover:scale-110",
              orbPositionClassName,
            )}
          >
            <div className={cn("absolute inset-0 rounded-full blur-[84px] sm:blur-[120px]", orbClassName)} />
            <div className="absolute inset-[16%] rounded-full bg-[radial-gradient(circle_at_28%_24%,rgba(255,255,255,0.72),rgba(255,255,255,0.24)_30%,transparent_68%)] opacity-90 blur-[22px] dark:bg-[radial-gradient(circle_at_28%_24%,rgba(255,255,255,0.18),rgba(255,255,255,0.05)_30%,transparent_68%)] dark:opacity-70 sm:blur-[28px]" />
            <div className="absolute inset-[7%] rounded-full border border-white/26 opacity-60 blur-[1px] dark:border-white/10 dark:opacity-40" />
          </div>
        ) : null}

        {DecorativeIcon ? (
          <div
            className={cn(
              "pointer-events-none absolute text-foreground/[0.08] transition-transform duration-1000 [transform:translateZ(-100px)] group-hover:-translate-y-2 dark:text-white/[0.06]",
              decorativeIconPositionClassName
            )}
          >
            <DecorativeIcon className={cn("h-24 w-24 sm:h-32 sm:w-32 lg:h-40 lg:w-40", decorativeIconClassName)} strokeWidth={1.3} />
          </div>
        ) : null}

        {decorativeText ? (
          <div
            className={cn(
              "pointer-events-none absolute font-black italic tracking-tighter transition-transform duration-1000 [transform:translateZ(-140px)] group-hover:-translate-y-4",
              decorativeTextClassName
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
