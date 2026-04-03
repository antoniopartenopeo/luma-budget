import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PublicSupportSurfaceProps {
  children: ReactNode
  className?: string
  tone?: "default" | "accent" | "warm"
}

const TONE_CLASS_MAP = {
  default: "glass-panel border-none",
  accent: "glass-panel border border-primary/14 bg-gradient-to-br from-primary/[0.08] via-white/76 to-white/92 dark:from-primary/[0.10] dark:via-black/24 dark:to-black/18",
  warm: "glass-panel border border-amber-500/18 bg-amber-500/7 dark:border-amber-400/14 dark:bg-amber-500/[0.08]",
} as const

export function PublicSupportSurface({
  children,
  className,
  tone = "default",
}: PublicSupportSurfaceProps) {
  return (
    <section
      className={cn(
        "rounded-[2.5rem] p-6 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.34)] sm:p-8",
        TONE_CLASS_MAP[tone],
        className
      )}
    >
      {children}
    </section>
  )
}

interface PublicSupportIntroProps {
  eyebrow: string
  title: string
  description: string
  titleId?: string
  className?: string
}

export function PublicSupportIntro({
  eyebrow,
  title,
  description,
  titleId,
  className,
}: PublicSupportIntroProps) {
  return (
    <PublicSupportSurface className={className}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
        {eyebrow}
      </p>
      <h1
        id={titleId}
        className="mt-4 max-w-[15ch] text-4xl font-extrabold leading-[0.96] tracking-tight text-foreground sm:text-5xl"
      >
        {title}
      </h1>
      <p className="mt-4 max-w-[44rem] text-base font-normal leading-relaxed text-muted-foreground sm:text-lg">
        {description}
      </p>
    </PublicSupportSurface>
  )
}
