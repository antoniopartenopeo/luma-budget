"use client"

import { useEffect } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { AmbientBackdrop } from "@/components/layout/ambient-backdrop"
import { PublicSiteFooter } from "@/components/layout/public-site-footer"
import { MacroSection } from "@/components/patterns/macro-section"
import { StaggerContainer } from "@/components/patterns/stagger-container"
import { LIQUID_CAPSULE_CLASS, LIQUID_REFRACTION_CLASS } from "@/components/ui/glass-tokens"
import { Button } from "@/components/ui/button"
import {
  LANDING_CLOSING,
  LANDING_FLOW_STEPS,
  LANDING_HOW_IT_WORKS_SECTION,
  LANDING_IMMERSIVE_FALLBACKS,
  LANDING_NAV_ITEMS,
  LANDING_OUTCOMES,
  LANDING_OUTCOMES_SECTION,
  LANDING_PROBLEM_SECTION
} from "./content"
import { LandingHeroEditorial } from "./components/landing-hero-editorial"
import { LandingHeroConsole } from "./components/landing-previews"
import { LandingEditorialCardFrame } from "./components/landing-editorial-card-frame"
import { LandingImmersiveFallback } from "./components/landing-immersive-fallback"
import { AppleFluidBackground } from "./components/motion-primitives"
import { LandingSectionHeader } from "./components/landing-section-header"
import {
  LANDING_FLOATING_NAV_CLASS,
  LANDING_NAV_LINK_CLASS,
  LANDING_EDITORIAL_CARD_HERO_TITLE_CLASS,
  LANDING_EDITORIAL_CARD_TITLE_CLASS
} from "./components/landing-tokens"

const LandingDifferentiatorCards = dynamic(
  () => import("./components/landing-differentiator-cards").then((module) => module.LandingDifferentiatorCards),
  {
    ssr: false,
    loading: () => (
      <LandingImmersiveFallback
        eyebrow={LANDING_IMMERSIVE_FALLBACKS.difference.eyebrow}
        title={LANDING_IMMERSIVE_FALLBACKS.difference.title}
        description={LANDING_IMMERSIVE_FALLBACKS.difference.description}
        heightClassName="h-[300vh]"
      />
    )
  }
)

const LandingBrainHero = dynamic(
  () => import("./components/landing-brain-hero").then((module) => module.LandingBrainHero),
  {
    ssr: false,
    loading: () => (
      <LandingImmersiveFallback
        eyebrow={LANDING_IMMERSIVE_FALLBACKS.brain.eyebrow}
        title={LANDING_IMMERSIVE_FALLBACKS.brain.title}
        description={LANDING_IMMERSIVE_FALLBACKS.brain.description}
        heightClassName="h-[440vh]"
      />
    )
  }
)

const LANDING_FLOW_ACCENTS = [
  {
    border: "border-cyan-400/20 dark:border-white/10",
    panel: "from-cyan-500/[0.02] via-white to-cyan-50/50 dark:from-white/[0.06] dark:via-black/84 dark:to-zinc-900/62",
    icon: "border-cyan-400/25 bg-cyan-500/10 text-cyan-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-zinc-100",
    number: "text-cyan-500/5 dark:text-white/[0.03]",
    orb: "bg-cyan-500/20 dark:bg-white/8"
  },
  {
    border: "border-slate-400/18 dark:border-white/9",
    panel: "from-slate-500/[0.03] via-white to-slate-50/60 dark:from-white/[0.05] dark:via-black/84 dark:to-zinc-950/68",
    icon: "border-slate-400/25 bg-slate-500/8 text-slate-700 dark:border-white/9 dark:bg-white/[0.045] dark:text-zinc-200",
    number: "text-slate-500/6 dark:text-white/[0.025]",
    orb: "bg-slate-500/18 dark:bg-white/7"
  },
  {
    border: "border-teal-400/20 dark:border-white/10",
    panel: "from-teal-500/[0.02] via-white to-teal-50/50 dark:from-white/[0.055] dark:via-black/84 dark:to-stone-950/64",
    icon: "border-teal-400/25 bg-teal-500/10 text-teal-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-stone-200",
    number: "text-teal-500/5 dark:text-white/[0.028]",
    orb: "bg-teal-500/18 dark:bg-white/8"
  },
  {
    border: "border-cyan-400/16 dark:border-white/9",
    panel: "from-cyan-500/[0.015] via-white to-cyan-50/45 dark:from-white/[0.05] dark:via-black/84 dark:to-zinc-900/60",
    icon: "border-cyan-400/22 bg-cyan-500/8 text-cyan-600 dark:border-white/9 dark:bg-white/[0.045] dark:text-zinc-200",
    number: "text-cyan-500/5 dark:text-white/[0.025]",
    orb: "bg-cyan-500/16 dark:bg-white/7"
  }
] as const

const LANDING_OUTCOME_ACCENTS = [
  {
    border: "border-cyan-400/20 dark:border-white/10",
    panel: "from-cyan-500/[0.02] via-white to-cyan-50/50 dark:from-white/[0.06] dark:via-black/84 dark:to-zinc-900/62",
    icon: "border-cyan-400/25 bg-cyan-500/10 text-cyan-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-zinc-100",
    orb: "bg-cyan-500/20 dark:bg-white/8"
  },
  {
    border: "border-teal-400/20 dark:border-white/10",
    panel: "from-teal-500/[0.02] via-white to-teal-50/50 dark:from-white/[0.055] dark:via-black/84 dark:to-stone-950/64",
    icon: "border-teal-400/25 bg-teal-500/10 text-teal-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-stone-200",
    orb: "bg-teal-500/18 dark:bg-white/8"
  },
  {
    border: "border-slate-400/18 dark:border-white/9",
    panel: "from-slate-500/[0.03] via-white to-slate-50/60 dark:from-white/[0.05] dark:via-black/84 dark:to-zinc-950/68",
    icon: "border-slate-400/25 bg-slate-500/8 text-slate-700 dark:border-white/9 dark:bg-white/[0.045] dark:text-zinc-200",
    orb: "bg-slate-500/18 dark:bg-white/7"
  }
] as const

export function LandingPage() {
  useEffect(() => {
    const scrollingElement = document.scrollingElement as HTMLElement | null

    if (!scrollingElement) {
      return
    }

    const previousPosition = scrollingElement.style.position

    if (window.getComputedStyle(scrollingElement).position === "static") {
      scrollingElement.style.position = "relative"
    }

    return () => {
      scrollingElement.style.position = previousPosition
    }
  }, [])

  return (
    <div className="relative min-h-screen overflow-x-clip bg-background selection:bg-primary/20">
      <AmbientBackdrop />

      <div className="sticky top-4 z-50 mx-auto hidden w-fit px-4 md:block">
        <nav className={LANDING_FLOATING_NAV_CLASS}>
          {LANDING_NAV_ITEMS.map((item) => (
            <a key={item.href} href={item.href} className={LANDING_NAV_LINK_CLASS}>
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      <main id="main-content" className="relative pb-32">
        <StaggerContainer className="space-y-36 sm:space-y-52">
          <LandingHeroEditorial />

          <section id="problema" className="px-4 scroll-mt-24" aria-labelledby="landing-problem-title">
            <div className="mx-auto max-w-6xl">
              <MacroSection
                disableAnimation
                title={
                  <LandingSectionHeader
                    eyebrow={LANDING_PROBLEM_SECTION.eyebrow}
                    title={LANDING_PROBLEM_SECTION.title}
                    description={LANDING_PROBLEM_SECTION.description}
                    titleId="landing-problem-title"
                  />
                }
                contentClassName="pt-8"
              >
                <LandingHeroConsole />
              </MacroSection>
            </div>
          </section>

          <section id="differenza" className="scroll-mt-24" aria-labelledby="landing-different-title">
            <LandingDifferentiatorCards />
          </section>

          <section id="come-inizi" className="px-4 scroll-mt-24" aria-labelledby="landing-how-title">
            <div className="mx-auto max-w-6xl">
              <MacroSection
                disableAnimation
                title={
                  <LandingSectionHeader
                    eyebrow={LANDING_HOW_IT_WORKS_SECTION.eyebrow}
                    title={LANDING_HOW_IT_WORKS_SECTION.title}
                    description={LANDING_HOW_IT_WORKS_SECTION.description}
                    titleId="landing-how-title"
                  />
                }
                contentClassName="pt-12"
              >
                <div className="relative space-y-8 sm:space-y-12">
                  {LANDING_FLOW_STEPS.map((step, index) => {
                    const accent = LANDING_FLOW_ACCENTS[index]

                    return (
                      <LandingEditorialCardFrame
                        key={step.stepLabel}
                        borderClassName={accent.border}
                        panelClassName={accent.panel}
                        leadingIcon={step.icon}
                        leadingIconWrapperClassName={accent.icon}
                        orbClassName={accent.orb}
                        orbPositionClassName="-right-[15%] -top-[20%] h-[20rem] w-[20rem] sm:h-[28rem] sm:w-[28rem]"
                        decorativeText={step.stepLabel}
                        decorativeTextClassName={`-bottom-[12%] -right-[2%] text-8xl ${accent.number} sm:-bottom-[8%] sm:text-[13rem] lg:-right-[1%] lg:text-[18rem]`}
                        className="p-8 shadow-[0_40px_100px_-50px_rgba(0,0,0,0.5)] sm:rounded-[3rem] sm:p-10 lg:p-12"
                      >
                        <div className="relative flex flex-col items-start gap-6 pt-18 sm:gap-8 sm:pt-24 lg:pt-28">
                          <div className="min-w-0 flex-1 space-y-4 lg:space-y-5">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/50 sm:text-[12px] lg:text-[13px]">
                              {step.cue}
                            </span>
                            <div className="space-y-3 lg:space-y-4">
                              <h3 className={cn(LANDING_EDITORIAL_CARD_TITLE_CLASS, "max-w-[20ch]")}>
                                {step.title}
                              </h3>
                              <p className="max-w-[48ch] text-[16px] font-normal leading-relaxed text-foreground/70 sm:text-[18px] lg:text-[20px]">
                                {step.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </LandingEditorialCardFrame>
                    )
                  })}
                </div>
              </MacroSection>
            </div>
          </section>

          <section id="brain-hero" aria-labelledby="landing-brain-hero-title">
            <LandingBrainHero />
          </section>

          <section id="outcomes" className="px-4 scroll-mt-24" aria-labelledby="landing-outcomes-title">
            <div className="mx-auto max-w-6xl">
              <MacroSection
                disableAnimation
                title={
                  <LandingSectionHeader
                    eyebrow={LANDING_OUTCOMES_SECTION.eyebrow}
                    title={LANDING_OUTCOMES_SECTION.title}
                    description={LANDING_OUTCOMES_SECTION.description}
                    titleId="landing-outcomes-title"
                  />
                }
                contentClassName="pt-12"
              >
                <div className="grid gap-6 sm:grid-cols-2 lg:gap-8">
                  {LANDING_OUTCOMES.map((outcome, index) => {
                    const accent = LANDING_OUTCOME_ACCENTS[index]
                    const isHero = index === 0

                    return (
                      <LandingEditorialCardFrame
                        key={outcome.title}
                        borderClassName={accent.border}
                        panelClassName={accent.panel}
                        leadingIconWrapperClassName={accent.icon}
                        leadingText={String(index + 1).padStart(2, "0")}
                        leadingTextClassName="text-current"
                        orbClassName={accent.orb}
                        orbPositionClassName={isHero ? "-right-[10%] -top-[30%] h-[30rem] w-[30rem] sm:blur-[140px]" : "-right-[20%] -top-[20%] h-[16rem] w-[16rem] sm:blur-[100px]"}
                        decorativeIcon={outcome.icon}
                        decorativeIconPositionClassName={isHero ? "-bottom-[10%] right-[2%]" : "-bottom-[8%] right-[3%]"}
                        decorativeIconClassName={isHero ? "h-36 w-36 sm:h-44 sm:w-44 lg:h-56 lg:w-56" : "h-24 w-24 sm:h-32 sm:w-32 lg:h-40 lg:w-40"}
                        className={cn(
                          "shadow-[0_40px_100px_-50px_rgba(0,0,0,0.5)] sm:rounded-[3rem]",
                          isHero ? "col-span-full p-8 sm:p-12 lg:p-16" : "col-span-1 p-8 sm:p-10"
                        )}
                      >
                        <div className={cn("relative flex h-full", isHero ? "flex-col gap-6 sm:gap-8" : "flex-col gap-6 sm:gap-8")}>
                          <div className={cn("space-y-4 pt-18 sm:pt-24 lg:pt-28", isHero ? "min-w-0 max-w-[48rem] pr-20 sm:pr-28 lg:pr-40" : "pr-14 sm:pr-20 lg:pr-28")}>
                            <h3
                              className={cn(
                                isHero ? LANDING_EDITORIAL_CARD_HERO_TITLE_CLASS : LANDING_EDITORIAL_CARD_TITLE_CLASS,
                                isHero ? "max-w-[20ch]" : "max-w-[16ch]"
                              )}
                            >
                              {outcome.title}
                            </h3>
                            <p className={cn("font-normal leading-relaxed text-foreground/70", isHero ? "text-[16px] sm:text-[19px] lg:text-[21px] max-w-[48ch]" : "text-[16px] sm:text-[18px] max-w-[34ch]")}>
                              {outcome.description}
                            </p>
                          </div>
                        </div>
                      </LandingEditorialCardFrame>
                    )
                  })}
                </div>
              </MacroSection>
            </div>
          </section>

          <section id="open-app" className="relative overflow-hidden px-4 py-18 scroll-mt-24 sm:py-24 lg:py-28" aria-labelledby="landing-cta-title">
            <div className="pointer-events-none absolute -inset-y-[24%] inset-x-[-12%] z-0 sm:-inset-y-[20%] sm:inset-x-[-8%] lg:-inset-y-[18%] lg:inset-x-[-6%]">
              <AppleFluidBackground className="scale-[1.08]" />
            </div>
            <div className="pointer-events-none absolute -inset-y-[24%] inset-x-[-12%] z-[1] bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(20,184,166,0.10),transparent_30%)] sm:-inset-y-[20%] sm:inset-x-[-8%] lg:-inset-y-[18%] lg:inset-x-[-6%] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.10),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.04),transparent_32%)]" />
            <div className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(to_bottom,rgba(255,255,255,1)_0%,rgba(255,255,255,0.78)_10%,rgba(255,255,255,0)_26%,rgba(255,255,255,0)_74%,rgba(255,255,255,0.78)_90%,rgba(255,255,255,1)_100%)] dark:bg-[linear-gradient(to_bottom,rgba(3,6,10,1)_0%,rgba(3,6,10,0.78)_10%,rgba(3,6,10,0)_26%,rgba(3,6,10,0)_74%,rgba(3,6,10,0.78)_90%,rgba(3,6,10,1)_100%)]" />
            <div className="relative z-10 mx-auto max-w-6xl">
              <h2 id="landing-cta-title" className="sr-only">
                {LANDING_CLOSING.title}
              </h2>

              <div className="flex items-center justify-center py-8 sm:py-12 lg:py-16">
                <Button
                  asChild
                  variant="ghost"
                  size="default"
                  className={cn(
                    "group relative min-h-[8rem] w-full max-w-[64rem] overflow-hidden rounded-[2.4rem] px-6 py-8 text-center shadow-[0_34px_90px_-58px_rgba(15,23,42,0.28)] hover:bg-white/18 dark:hover:bg-white/[0.06] dark:shadow-[0_44px_120px_-72px_rgba(0,0,0,0.42)] sm:min-h-[10rem] sm:rounded-[3rem] sm:px-10 sm:py-10 lg:min-h-[12rem] lg:px-14 lg:py-12",
                    LIQUID_CAPSULE_CLASS,
                    LIQUID_REFRACTION_CLASS
                  )}
                >
                  <Link
                    href="/dashboard"
                    aria-label={LANDING_CLOSING.primaryCtaLabel}
                    className="relative flex w-full items-center justify-center overflow-hidden"
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-[14%] top-1/2 h-[54%] -translate-y-1/2 rounded-full bg-white/52 blur-[34px] dark:bg-white/[0.1] dark:blur-[42px]"
                    />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(255,255,255,0.2),transparent_42%)] opacity-70 dark:bg-[radial-gradient(circle_at_50%_48%,rgba(255,255,255,0.12),transparent_42%)]"
                    />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute text-[2.35rem] font-black italic leading-none tracking-tight text-slate-950/16 blur-[14px] dark:text-white/38 sm:text-[4.1rem] lg:text-[6rem]"
                    >
                      {LANDING_CLOSING.primaryCtaLabel}
                    </span>
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute text-[2.35rem] font-black italic leading-none tracking-tight text-white/68 mix-blend-soft-light dark:text-white/32 dark:mix-blend-screen sm:text-[4.1rem] lg:text-[6rem]"
                    >
                      {LANDING_CLOSING.primaryCtaLabel}
                    </span>
                    <span className="relative block bg-gradient-to-b from-slate-950 via-slate-900/92 to-slate-700/78 bg-clip-text text-[2.35rem] font-black italic leading-none tracking-tight text-transparent dark:from-white dark:via-white/96 dark:to-white/84 sm:text-[4.1rem] lg:text-[6rem]">
                      {LANDING_CLOSING.primaryCtaLabel}
                    </span>
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        </StaggerContainer>
      </main>

      <PublicSiteFooter />
    </div>
  )
}
