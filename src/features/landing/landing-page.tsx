import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { LandingClientWrapper } from "./components/landing-client-wrapper"
import { AmbientBackdrop } from "@/components/layout/ambient-backdrop"
import { PublicSiteFooter } from "@/components/layout/public-site-footer"
import { MacroSection } from "@/components/patterns/macro-section"
import { StaggerContainer } from "@/components/patterns/stagger-container"
import { LIQUID_CAPSULE_CLASS, LIQUID_REFRACTION_CLASS } from "@/components/ui/glass-tokens"
import { BrandLogo } from "@/components/ui/brand-logo"
import { Button } from "@/components/ui/button"
import {
  LANDING_HERO_EDITORIAL,
  LANDING_CLOSING,
  LANDING_FLOW_STEPS,
  LANDING_HOW_IT_WORKS_SECTION,
  LANDING_NAV_ITEMS,
  LANDING_OUTCOMES,
  LANDING_OUTCOMES_SECTION,
  LANDING_PROBLEM_SECTION
} from "./content"
import { LandingHeroEditorial } from "./components/landing-hero-editorial"
import { LandingHeroConsole } from "./components/landing-previews"
import { LandingEditorialCardFrame } from "./components/landing-editorial-card-frame"
import { LandingSectionHeader } from "./components/landing-section-header"
import {
  LANDING_EDITORIAL_CARD_HERO_TITLE_CLASS,
  LANDING_EDITORIAL_CARD_TITLE_CLASS,
  LANDING_NAV_LINK_CLASS,
  LANDING_PRIMARY_CTA_CLASS
} from "./components/landing-tokens"

import { LandingDifferentiatorCards, LandingBrainHero } from "./components/landing-dynamic-sections"

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
  return (
    <LandingClientWrapper>
      <div className="relative min-h-screen overflow-x-clip bg-background selection:bg-primary/20">
        <AmbientBackdrop />


      <header className="absolute inset-x-0 top-0 z-50 px-4 pt-4 sm:pt-6">
        <div
          className={cn(
            "mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 rounded-full border border-white/28 bg-white/48 px-4 py-3 shadow-[0_24px_80px_-44px_rgba(15,23,42,0.48)] backdrop-blur-xl dark:border-white/12 dark:bg-black/24 dark:shadow-[0_32px_88px_-48px_rgba(0,0,0,0.72)]",
            LIQUID_CAPSULE_CLASS,
            LIQUID_REFRACTION_CLASS
          )}
        >
          <Link
            href="/"
            aria-label="Torna alla landing"
            className="transition-opacity hover:opacity-100"
          >
            <BrandLogo variant="full" height={26} priority sizes="132px" className="w-auto max-w-[132px] opacity-100" />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {LANDING_NAV_ITEMS.map((item) => (
              <a key={item.href} href={item.href} className={LANDING_NAV_LINK_CLASS}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="rounded-full px-4 shadow-[0_18px_40px_-24px_rgba(14,165,168,0.55)]">
              <Link href={LANDING_HERO_EDITORIAL.primaryCtaHref}>
                {LANDING_HERO_EDITORIAL.primaryCtaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

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
                        className="shadow-[0_40px_100px_-50px_rgba(0,0,0,0.5)] sm:rounded-[3rem]"
                        contentClassName="p-8 sm:p-10 lg:p-12"
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
                          isHero ? "col-span-full" : "col-span-1"
                        )}
                        contentClassName={isHero ? "p-8 sm:p-12 lg:p-16" : "p-8 sm:p-10"}
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

          <section className="px-4" aria-labelledby="landing-closing-title">
            <div className="mx-auto max-w-6xl">
              <LandingEditorialCardFrame
                borderClassName="border-cyan-400/16 dark:border-white/10"
                panelClassName="from-cyan-500/[0.018] via-white to-cyan-50/40 dark:from-white/[0.06] dark:via-black/84 dark:to-zinc-950/[0.62]"
                leadingText={LANDING_CLOSING.railLabel}
                leadingTextClassName="whitespace-nowrap text-[11px] font-bold tracking-[0.08em] text-cyan-900 dark:text-cyan-100"
                leadingIconWrapperClassName="h-auto w-auto px-5 py-2.5 sm:h-auto sm:w-auto sm:px-6 sm:py-3 rounded-full bg-white/90 dark:bg-zinc-900/90 shadow-sm backdrop-blur-md"
                orbClassName="bg-cyan-500/14 dark:bg-white/8"
                orbPositionClassName="-right-[10%] -top-[20%] h-[24rem] w-[24rem] sm:h-[28rem] sm:w-[28rem]"
                className="shadow-[0_40px_110px_-56px_rgba(15,23,42,0.38)]"
                contentClassName="p-8 sm:p-12 lg:p-16"
              >
                <div className="relative flex flex-col gap-8 pt-18 sm:pt-24 lg:flex-row lg:items-center lg:justify-between lg:pt-28">
                  <div className="max-w-[42rem] space-y-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/48">
                      {LANDING_CLOSING.eyebrow}
                    </p>
                    <h2 id="landing-closing-title" className={cn(LANDING_EDITORIAL_CARD_HERO_TITLE_CLASS, "max-w-[16ch]")}>
                      {LANDING_CLOSING.title}
                    </h2>
                    <p className="max-w-[48ch] text-[16px] font-medium leading-relaxed text-foreground/68 sm:text-[18px] lg:text-[20px]">
                      {LANDING_CLOSING.description}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-3 lg:pr-8">
                    <Button asChild size="lg" className={cn("rounded-full", LANDING_PRIMARY_CTA_CLASS)}>
                      <Link href={LANDING_HERO_EDITORIAL.primaryCtaHref}>
                        {LANDING_CLOSING.primaryCtaLabel}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </LandingEditorialCardFrame>
            </div>
          </section>


        </StaggerContainer>
      </main>

      <PublicSiteFooter />
    </div>
    </LandingClientWrapper>
  )
}
