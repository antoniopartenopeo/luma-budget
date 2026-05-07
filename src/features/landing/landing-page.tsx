import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { LandingClientWrapper } from "./components/landing-client-wrapper"
import { PublicSiteFooter } from "@/components/layout/public-site-footer"
import { MacroSection } from "@/components/patterns/macro-section"
import { StaggerContainer } from "@/components/patterns/stagger-container"
import { BrandLogo } from "@/components/ui/brand-logo"
import { Button } from "@/components/ui/button"
import {
  LANDING_HERO_EDITORIAL,
  LANDING_CLOSING,
  LANDING_DIFFERENTIATORS,
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
import { LandingBrainHero } from "./components/landing-dynamic-sections"

const LANDING_FLOW_ACCENTS = [
  {
    border: "border-cyan-400/20 dark:border-white/10",
    panel: "from-cyan-500/[0.02] via-white to-cyan-50/50 dark:from-white/[0.06] dark:via-black/84 dark:to-zinc-900/62",
    icon: "border-cyan-400/25 bg-cyan-500/10 text-cyan-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-zinc-100",
    number: "text-cyan-500/[0.075] dark:text-white/[0.052]",
    orb: "bg-cyan-500/20 dark:bg-white/8"
  },
  {
    border: "border-slate-400/18 dark:border-white/9",
    panel: "from-slate-500/[0.03] via-white to-slate-50/60 dark:from-white/[0.05] dark:via-black/84 dark:to-zinc-950/68",
    icon: "border-slate-400/25 bg-slate-500/8 text-slate-700 dark:border-white/9 dark:bg-white/[0.045] dark:text-zinc-200",
    number: "text-slate-500/[0.08] dark:text-white/[0.046]",
    orb: "bg-slate-500/18 dark:bg-white/7"
  },
  {
    border: "border-teal-400/20 dark:border-white/10",
    panel: "from-teal-500/[0.02] via-white to-teal-50/50 dark:from-white/[0.055] dark:via-black/84 dark:to-stone-950/64",
    icon: "border-teal-400/25 bg-teal-500/10 text-teal-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-stone-200",
    number: "text-teal-500/[0.075] dark:text-white/[0.05]",
    orb: "bg-teal-500/18 dark:bg-white/8"
  },
  {
    border: "border-cyan-400/16 dark:border-white/9",
    panel: "from-cyan-500/[0.015] via-white to-cyan-50/45 dark:from-white/[0.05] dark:via-black/84 dark:to-zinc-900/60",
    icon: "border-cyan-400/22 bg-cyan-500/8 text-cyan-600 dark:border-white/9 dark:bg-white/[0.045] dark:text-zinc-200",
    number: "text-cyan-500/[0.07] dark:text-white/[0.046]",
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

const LANDING_FLOW_BENTO_LAYOUT = [
  {
    card: "col-span-full min-h-[27rem] lg:col-span-7 lg:row-span-2 lg:min-h-[34rem]",
    content: "p-8 sm:p-10 lg:p-12",
    copy: "max-w-[24ch]",
    description: "max-w-[40ch]",
    orb: "-right-[12%] -top-[24%] h-[24rem] w-[24rem] sm:h-[32rem] sm:w-[32rem]",
    number: "-bottom-[4%] -right-[2%] text-8xl sm:bottom-0 sm:text-[13rem] lg:-right-[3%] lg:text-[19rem]"
  },
  {
    card: "col-span-full min-h-[20rem] sm:col-span-1 lg:col-span-5 lg:min-h-[16rem]",
    content: "p-7 sm:p-8 lg:p-9",
    copy: "max-w-[16ch]",
    description: "max-w-[28ch]",
    orb: "-right-[26%] -top-[30%] h-[17rem] w-[17rem]",
    number: "-bottom-[6%] -right-[4%] text-7xl sm:text-[9rem] lg:text-[10rem]"
  },
  {
    card: "col-span-full min-h-[20rem] sm:col-span-1 lg:col-span-5 lg:min-h-[16rem]",
    content: "p-7 sm:p-8 lg:p-9",
    copy: "max-w-[16ch]",
    description: "max-w-[28ch]",
    orb: "-right-[26%] -top-[30%] h-[17rem] w-[17rem]",
    number: "-bottom-[6%] -right-[4%] text-7xl sm:text-[9rem] lg:text-[10rem]"
  },
  {
    card: "col-span-full min-h-[20rem] lg:col-span-12 lg:min-h-[18rem]",
    content: "p-8 sm:p-10 lg:p-12",
    copy: "max-w-[22ch]",
    description: "max-w-[42ch]",
    orb: "-right-[12%] -top-[38%] h-[22rem] w-[22rem]",
    number: "-bottom-[8%] -right-[2%] text-8xl sm:text-[11rem] lg:text-[14rem]"
  }
] as const

export function LandingPage() {
  return (
    <LandingClientWrapper>
      <div className="relative min-h-screen overflow-x-clip bg-background selection:bg-primary/20">
        <header className="absolute inset-x-0 top-0 z-50 px-4 pt-4 sm:pt-6">
          <div
            className={cn(
              "mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 overflow-hidden rounded-full border border-black/8 bg-white/72 px-4 py-3 text-foreground shadow-[0_24px_80px_-44px_rgba(15,23,42,0.32),inset_0_1px_0_rgba(255,255,255,0.74)] backdrop-blur-xl dark:border-white/12 dark:bg-[#05080d]/68 dark:text-white dark:shadow-[0_24px_80px_-44px_rgba(0,0,0,0.82),inset_0_1px_0_rgba(255,255,255,0.10)]"
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
                <a key={item.href} href={item.href} className={cn(LANDING_NAV_LINK_CLASS, "text-foreground/58 hover:bg-black/[0.035] hover:text-foreground dark:text-white/68 dark:hover:bg-white/[0.08] dark:hover:text-white")}>
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

          <section id="come-inizi" className="relative px-4 scroll-mt-24" aria-labelledby="landing-how-title">
            <div className="pointer-events-none absolute inset-x-0 top-[18%] z-0 h-[36rem] bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.10),transparent_62%)] blur-3xl dark:bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,0.10),transparent_64%)]" />
            <div className="relative z-10 mx-auto max-w-6xl">
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
                <div className="space-y-5 lg:space-y-6">
                  <div className="relative grid auto-rows-[minmax(16rem,auto)] grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-12 lg:gap-6">
                    {LANDING_FLOW_STEPS.map((step, index) => {
                      const accent = LANDING_FLOW_ACCENTS[index]
                      const layout = LANDING_FLOW_BENTO_LAYOUT[index]

                      return (
                        <LandingEditorialCardFrame
                          key={step.stepLabel}
                          borderClassName={accent.border}
                          panelClassName={accent.panel}
                          leadingIcon={step.icon}
                          leadingIconWrapperClassName={accent.icon}
                          orbClassName={accent.orb}
                          orbPositionClassName={layout.orb}
                          decorativeText={step.stepLabel}
                          decorativeTextClassName={`${layout.number} ${accent.number}`}
                          className={cn("shadow-[0_40px_100px_-50px_rgba(0,0,0,0.42)] sm:rounded-[2rem] lg:rounded-[2.35rem]", layout.card)}
                          contentClassName={layout.content}
                        >
                          <div className="relative flex h-full flex-col justify-end gap-6 pt-18 sm:gap-8 sm:pt-24 lg:pt-28">
                            <div className="min-w-0 flex-1 space-y-4 lg:space-y-5">
                              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/50 sm:text-[12px] lg:text-[13px]">
                                {step.cue}
                              </span>
                              <div className="space-y-3 lg:space-y-4">
                                <h3 className={cn(LANDING_EDITORIAL_CARD_TITLE_CLASS, layout.copy, index === 0 ? "lg:[font-size:clamp(2.6rem,5.6vw,5.7rem)]" : "[font-size:clamp(1.65rem,3.4vw,3.2rem)]")}>
                                  {step.title}
                                </h3>
                                <p className={cn("text-[15px] font-normal leading-relaxed text-foreground/68 sm:text-[16px] lg:text-[18px]", layout.description)}>
                                  {step.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        </LandingEditorialCardFrame>
                      )
                    })}
                  </div>

                  <div className="relative overflow-hidden rounded-[1.75rem] border border-black/[0.06] bg-white/58 p-3 shadow-[0_28px_90px_-60px_rgba(15,23,42,0.42),inset_0_1px_0_rgba(255,255,255,0.82)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[0_32px_110px_-66px_rgba(0,0,0,0.92),inset_0_1px_0_rgba(255,255,255,0.08)]">
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(20,184,166,0.08)_34%,rgba(255,255,255,0.26)_49%,transparent_68%)] dark:bg-[linear-gradient(120deg,transparent_0%,rgba(45,212,191,0.08)_36%,rgba(255,255,255,0.055)_50%,transparent_70%)]" />
                    <div className="relative grid gap-2 sm:grid-cols-3">
                      {LANDING_DIFFERENTIATORS.map((item, index) => {
                        const Icon = item.icon
                        const accent = LANDING_FLOW_ACCENTS[index]

                        return (
                          <div
                            key={item.title}
                            className="group/signal relative min-h-[9.5rem] overflow-hidden rounded-[1.25rem] border border-black/[0.045] bg-white/48 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.68)] transition-colors duration-500 hover:border-cyan-500/28 dark:border-white/[0.075] dark:bg-black/18 dark:hover:border-cyan-200/24"
                          >
                            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/signal:opacity-100 bg-[linear-gradient(125deg,transparent_0%,rgba(20,184,166,0.12)_42%,rgba(255,255,255,0.18)_52%,transparent_66%)] dark:bg-[linear-gradient(125deg,transparent_0%,rgba(45,212,191,0.10)_40%,rgba(255,255,255,0.05)_52%,transparent_68%)]" />
                            <div className="relative flex items-start gap-3">
                              <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] border shadow-[0_18px_40px_-28px_rgba(15,23,42,0.38),inset_0_1px_0_rgba(255,255,255,0.62)] dark:shadow-[0_18px_44px_-28px_rgba(0,0,0,0.88),inset_0_1px_0_rgba(255,255,255,0.09)]", accent.icon)}>
                                <Icon className="h-4 w-4" strokeWidth={1.8} />
                              </div>
                              <div className="min-w-0 space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-foreground/42">
                                  {item.kicker}
                                </p>
                                <h3 className="text-[17px] font-black leading-tight text-foreground sm:text-[18px]">
                                  {item.title}
                                </h3>
                                <p className="text-[14px] font-medium leading-relaxed text-foreground/62">
                                  {item.note}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </MacroSection>
            </div>
          </section>

          <section id="brain-hero" aria-labelledby="landing-brain-hero-title">
            <LandingBrainHero />
          </section>

          <section id="outcomes" className="relative px-4 scroll-mt-24" aria-labelledby="landing-outcomes-title">
            <div className="pointer-events-none absolute inset-x-0 top-[12%] z-0 h-[32rem] bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.08),transparent_64%)] blur-3xl dark:bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.09),transparent_66%)]" />
            <div className="relative z-10 mx-auto max-w-6xl">
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
                <div className="space-y-8 lg:space-y-10">
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
                          leadingText={String(index + 1)}
                          leadingTextClassName="text-current"
                          orbClassName={accent.orb}
                          orbPositionClassName={isHero ? "-right-[10%] -top-[30%] h-[30rem] w-[30rem] sm:blur-[140px]" : "-right-[20%] -top-[20%] h-[16rem] w-[16rem] sm:blur-[100px]"}
                          decorativeIcon={outcome.icon}
                          decorativeIconPositionClassName={isHero ? "bottom-3 right-[2%] sm:bottom-5" : "bottom-4 right-[3%]"}
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
                        <h3 id="landing-closing-title" className={cn(LANDING_EDITORIAL_CARD_HERO_TITLE_CLASS, "max-w-[16ch]")}>
                          {LANDING_CLOSING.title}
                        </h3>
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
              </MacroSection>
            </div>
          </section>


          </StaggerContainer>
        </main>

        <PublicSiteFooter />
      </div>
    </LandingClientWrapper>
  )
}
