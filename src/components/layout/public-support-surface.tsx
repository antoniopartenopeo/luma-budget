import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PublicSupportSurfaceProps {
  children: ReactNode
  className?: string
  tone?: "default" | "accent" | "warm"
}

const TONE_CLASS_MAP = {
  default: "border border-slate-950/10 bg-white/72 shadow-[0_28px_86px_-58px_rgba(15,23,42,0.34),inset_0_1px_0_rgba(255,255,255,0.86)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[0_34px_104px_-70px_rgba(0,0,0,0.92),inset_0_1px_0_rgba(255,255,255,0.08)]",
  accent: "border border-primary/18 bg-gradient-to-br from-primary/[0.08] via-white/78 to-cyan-50/54 shadow-[0_30px_92px_-62px_rgba(15,23,42,0.36),0_0_38px_-30px_rgba(14,165,168,0.42),inset_0_1px_0_rgba(255,255,255,0.86)] backdrop-blur-2xl dark:border-white/10 dark:from-white/[0.07] dark:via-black/84 dark:to-cyan-950/[0.22]",
  warm: "border border-amber-500/18 bg-amber-500/7 shadow-[0_28px_86px_-58px_rgba(15,23,42,0.30),inset_0_1px_0_rgba(255,255,255,0.82)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.045]",
} as const

export function PublicSupportSurface({
  children,
  className,
  tone = "default",
}: PublicSupportSurfaceProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[2.5rem] p-6 sm:p-8",
        TONE_CLASS_MAP[tone],
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.52),rgba(255,255,255,0.12)_30%,transparent_64%),linear-gradient(132deg,transparent_0%,rgba(14,165,168,0.055)_38%,rgba(255,255,255,0.16)_50%,transparent_64%)] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.024)_32%,transparent_66%),linear-gradient(132deg,transparent_0%,rgba(161,222,235,0.06)_38%,rgba(255,255,255,0.045)_50%,transparent_66%)]" />
      <div className="relative z-10">
      {children}
      </div>
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
      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-primary dark:text-cyan-100/62">
        {eyebrow}
      </p>
      <h1
        id={titleId}
        className="mt-4 max-w-[15ch] text-5xl font-black leading-[0.94] tracking-tight text-slate-950 sm:text-6xl dark:text-white"
      >
        {title}
      </h1>
      <p className="mt-5 max-w-[44rem] text-base font-medium leading-relaxed text-slate-600 sm:text-lg dark:text-white/58">
        {description}
      </p>
    </PublicSupportSurface>
  )
}
