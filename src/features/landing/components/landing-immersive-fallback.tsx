"use client"

import { cn } from "@/lib/utils"
import { LandingHeroSurface } from "./landing-hero-surface"

interface LandingImmersiveFallbackProps {
  eyebrow: string
  title: string
  description: string
  heightClassName: string
}

export function LandingImmersiveFallback({
  eyebrow,
  title,
  description,
  heightClassName,
}: LandingImmersiveFallbackProps) {
  return (
    <div className={cn("relative w-full", heightClassName)} aria-hidden="true">
      <div className="sticky top-0 flex min-h-screen w-full items-center justify-center overflow-hidden bg-background px-4 py-10 sm:px-6">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.08] via-background to-background dark:from-white/[0.04] dark:via-background/88 dark:to-background" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),transparent_38%)] dark:bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),transparent_40%)]" />

        <div className="mx-auto flex w-full max-w-6xl flex-col items-center">
          <div className="relative z-10 mb-8 max-w-2xl text-center sm:mb-12 lg:mb-14 xl:max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/84 dark:text-foreground/58 sm:text-[12px]">
              {eyebrow}
            </p>
            <h2 className="mt-5 text-4xl font-extrabold leading-[0.94] text-foreground sm:text-5xl lg:text-6xl">
              {title}
            </h2>
            <p className="mx-auto mt-5 max-w-[52ch] text-[15px] font-normal leading-relaxed text-muted-foreground sm:text-lg">
              {description}
            </p>
          </div>

          <LandingHeroSurface className="mx-auto w-full max-w-5xl px-6 py-8 sm:px-10 sm:py-12">
            <div className="space-y-5">
              <div className="mx-auto h-4 w-40 rounded-full bg-foreground/8 dark:bg-white/8" />
              <div className="mx-auto h-14 max-w-2xl rounded-[2rem] bg-foreground/6 dark:bg-white/6 sm:h-16" />
              <div className="mx-auto h-5 max-w-xl rounded-full bg-foreground/6 dark:bg-white/6" />
              <div className="mx-auto grid gap-4 pt-4 sm:grid-cols-2">
                <div className="h-32 rounded-[2rem] border border-black/6 bg-white/44 dark:border-white/8 dark:bg-white/[0.04]" />
                <div className="h-32 rounded-[2rem] border border-black/6 bg-white/44 dark:border-white/8 dark:bg-white/[0.04]" />
              </div>
            </div>
          </LandingHeroSurface>
        </div>
      </div>
    </div>
  )
}
