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
  highlightClassName?: string
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

const DEFAULT_HIGHLIGHT_CLASS =
  "pointer-events-none absolute inset-0 mix-blend-overlay opacity-40 dark:opacity-20 transition-opacity duration-500"

export function LandingEditorialCardFrame({
  children,
  className,
  contentClassName,
  borderClassName,
  panelClassName,
  highlightClassName,
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
      <div className="relative z-10 h-full w-full" style={{ transformStyle: "preserve-3d" }}>
        {LeadingIcon || leadingText ? (
          <div
            className={cn(
              "pointer-events-none absolute left-8 top-8 z-20 flex h-16 w-16 items-center justify-center rounded-[1.4rem] border shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] sm:left-10 sm:top-10 sm:h-20 sm:w-20 sm:rounded-[1.8rem] lg:left-12 lg:top-12",
              leadingIconWrapperClassName
            )}
            style={{ transform: "translateZ(60px)" }}
          >
            {LeadingIcon ? (
              <LeadingIcon className={cn("h-7 w-7 sm:h-9 sm:w-9 drop-shadow-md", leadingIconClassName)} />
            ) : (
              <span
                className={cn(
                  "text-[13px] font-black tracking-[0.22em] sm:text-[16px] drop-shadow-md",
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
              "pointer-events-none absolute rounded-full blur-[80px] transition-transform duration-1000 group-hover:scale-110 sm:blur-[120px]",
              orbPositionClassName,
              orbClassName
            )}
            style={{ transform: "translateZ(-60px)" }}
          />
        ) : null}

        {DecorativeIcon ? (
          <div
            className={cn(
              "pointer-events-none absolute text-foreground/[0.08] transition-transform duration-1000 group-hover:-translate-y-2 dark:text-white/[0.06]",
              decorativeIconPositionClassName
            )}
            style={{ transform: "translateZ(-100px)" }}
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
            style={{ transform: "translateZ(-140px)" }}
          >
            {decorativeText}
          </div>
        ) : null}

        {/* Children Front Plane */}
        <div 
          className={cn("relative flex-1 h-full z-30", contentClassName)}
          style={{ transform: "translateZ(40px)" }}
        >
          {children}
        </div>
      </div>
    </CinematicScrollCard>
  )
}
