"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { AmbientBackdrop } from "@/components/layout/ambient-backdrop"
import { MacroSection } from "@/components/patterns/macro-section"
import { StaggerContainer } from "@/components/patterns/stagger-container"
import { BrandLogo } from "@/components/ui/brand-logo"
import { Button } from "@/components/ui/button"
import {
  LANDING_FLOW_STEPS,
  LANDING_OUTCOMES
} from "./data"
import { LandingHeroConsole } from "./components/landing-previews"
import { AppleFluidBackground, CinematicTextReveal } from "./components/motion-primitives"
import { LandingSectionHeader } from "./components/landing-section-header"
import {
  LANDING_FLOATING_NAV_CLASS,
  LANDING_HERO_FRAME_CLASS,
  LANDING_NAV_LINK_CLASS
} from "./components/landing-tokens"

const LandingDifferentiatorCards = dynamic(
  () => import("./components/landing-differentiator-cards").then((module) => module.LandingDifferentiatorCards),
  {
    ssr: false,
    loading: () => <div className="h-[340vh] w-full" aria-hidden="true" />
  }
)

const LandingBrainHero = dynamic(
  () => import("./components/landing-brain-hero").then((module) => module.LandingBrainHero),
  {
    ssr: false,
    loading: () => <div className="h-[600vh] w-full" aria-hidden="true" />
  }
)

const LANDING_NAV_ITEMS = [
  { href: "#problema", label: "Il Problema" },
  { href: "#differenza", label: "Differenza" },
  { href: "#come-inizi", label: "Come inizi" },
  { href: "#brain-hero", label: "Brain" },
  { href: "#outcomes", label: "Vantaggi" }
] as const

const LANDING_HERO_PILLS = [
  "Tutto in locale",
  "Zero cloud obbligatorio",
  "Nessun account per iniziare"
] as const

const LANDING_FOOTER_PRODUCT_ITEMS = [
  "Import CSV",
  "Brain",
  "Financial Lab"
] as const

const LANDING_FOOTER_SUPPORT_ITEMS = [
  "FAQ",
  "Contatti",
  "Privacy",
  "Aggiornamenti"
] as const

const LANDING_FLOW_ACCENTS = [
  {
    border: "border-cyan-500/18 dark:border-cyan-400/14",
    panel: "from-cyan-500/[0.10] via-white/72 to-white/88 dark:from-cyan-500/[0.12] dark:via-black/28 dark:to-black/22",
    icon: "border-cyan-500/18 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
    line: "from-cyan-500/35 via-cyan-500/12 to-transparent"
  },
  {
    border: "border-emerald-500/18 dark:border-emerald-400/14",
    panel: "from-emerald-500/[0.10] via-white/72 to-white/88 dark:from-emerald-500/[0.12] dark:via-black/28 dark:to-black/22",
    icon: "border-emerald-500/18 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    line: "from-emerald-500/35 via-emerald-500/12 to-transparent"
  },
  {
    border: "border-violet-500/18 dark:border-violet-400/14",
    panel: "from-violet-500/[0.10] via-white/72 to-white/88 dark:from-violet-500/[0.12] dark:via-black/28 dark:to-black/22",
    icon: "border-violet-500/18 bg-violet-500/10 text-violet-700 dark:text-violet-300",
    line: "from-violet-500/35 via-violet-500/12 to-transparent"
  },
  {
    border: "border-amber-500/18 dark:border-amber-400/14",
    panel: "from-amber-500/[0.10] via-white/72 to-white/88 dark:from-amber-500/[0.12] dark:via-black/28 dark:to-black/22",
    icon: "border-amber-500/18 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    line: "from-amber-500/35 via-amber-500/12 to-transparent"
  }
] as const

const LANDING_OUTCOME_ACCENTS = [
  {
    border: "border-rose-500/18 dark:border-rose-400/14",
    panel: "from-rose-500/[0.09] via-white/74 to-white/90 dark:from-rose-500/[0.12] dark:via-black/28 dark:to-black/22",
    icon: "border-rose-500/18 bg-rose-500/10 text-rose-700 dark:text-rose-300"
  },
  {
    border: "border-sky-500/18 dark:border-sky-400/14",
    panel: "from-sky-500/[0.09] via-white/74 to-white/90 dark:from-sky-500/[0.12] dark:via-black/28 dark:to-black/22",
    icon: "border-sky-500/18 bg-sky-500/10 text-sky-700 dark:text-sky-300"
  },
  {
    border: "border-amber-500/18 dark:border-amber-400/14",
    panel: "from-amber-500/[0.09] via-white/74 to-white/90 dark:from-amber-500/[0.12] dark:via-black/28 dark:to-black/22",
    icon: "border-amber-500/18 bg-amber-500/10 text-amber-700 dark:text-amber-300"
  }
] as const

export function LandingPage() {
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
          <section
            className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-4 py-20"
            aria-labelledby="landing-hero-title"
          >
            <div className="absolute inset-0 z-0 pointer-events-none">
              <AppleFluidBackground />
            </div>

            <div className="pointer-events-none absolute inset-0 z-[1]">
              <div className="absolute left-1/2 top-[48%] h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-white/[0.05] shadow-[0_0_120px_-70px_rgba(255,255,255,0.9)] backdrop-blur-[2px] sm:h-[32rem] sm:w-[32rem] dark:border-white/12 dark:bg-white/[0.03]" />
              <div className="absolute left-1/2 top-[48%] h-[16rem] w-[16rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/22 bg-white/[0.04] sm:h-[21rem] sm:w-[21rem] dark:border-white/10 dark:bg-white/[0.02]" />
            </div>

            <div className={LANDING_HERO_FRAME_CLASS}>
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.26),transparent_42%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_44%)]" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent dark:via-white/18" />

              <div className="relative z-10 mt-4 flex w-full max-w-4xl flex-col items-center text-center sm:mt-0">
                <BrandLogo
                  variant="full"
                  height={92}
                  className="mb-12 w-auto max-w-[300px] sm:max-w-[380px] lg:max-w-[440px] drop-shadow-sm"
                />

                <div className="space-y-5">
                  <h1
                    id="landing-hero-title"
                    className="mx-auto max-w-[11ch] text-5xl font-black leading-[0.92] tracking-tight text-foreground sm:text-6xl lg:text-7xl drop-shadow-sm"
                  >
                    <CinematicTextReveal text="Capisci il mese prima che ti travolga." />
                  </h1>

                  <p className="mx-auto max-w-[44rem] text-base font-normal leading-relaxed text-muted-foreground sm:text-lg lg:text-[1.2rem] drop-shadow-sm">
                    Numa legge i tuoi movimenti, stima cosa potrebbe restarti e ti dice se una nuova spesa fissa è sostenibile. Tutto in locale.
                  </p>
                </div>

                <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
                  <Button asChild size="lg" className="rounded-full px-8 shadow-lg shadow-primary/15 transition-shadow hover:shadow-primary/30">
                    <Link href="/dashboard">
                      Apri Numa
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>

                  <a
                    href="#problema"
                    className="text-sm font-semibold text-primary/72 transition-colors hover:text-primary"
                  >
                    Perché è diversa
                  </a>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                  {LANDING_HERO_PILLS.map((pill) => (
                    <span
                      key={pill}
                      className="rounded-full border border-white/18 bg-background/45 px-3 py-1.5 text-[11px] font-medium tracking-[0.03em] text-foreground/75 backdrop-blur-md dark:border-white/10"
                    >
                      {pill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="problema" className="px-4 scroll-mt-24" aria-labelledby="landing-problem-title">
            <div className="mx-auto max-w-6xl">
              <MacroSection
                disableAnimation
                title={
                  <LandingSectionHeader
                    eyebrow="Il problema"
                    title="Il problema che nessuno risolve"
                    description="Ti mostrano cosa hai speso. Quasi nessuna ti aiuta a capire cosa sta succedendo adesso."
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
                    eyebrow="Percorso"
                    title="Come inizi"
                    description="Quattro passaggi semplici: fai entrare i dati, leggi il mese, guardi la stima e poi valuti una nuova spesa fissa."
                    titleId="landing-how-title"
                  />
                }
                contentClassName="pt-12"
              >
                <div className="relative space-y-4 sm:space-y-5">
                  <div className="pointer-events-none absolute left-7 top-0 bottom-0 w-px bg-gradient-to-b from-primary/20 via-primary/8 to-transparent" />

                  {LANDING_FLOW_STEPS.map((step, index) => {
                    const accent = LANDING_FLOW_ACCENTS[index]

                    return (
                      <article
                        key={step.stepLabel}
                        className={`group relative overflow-hidden rounded-[2rem] border ${accent.border} bg-gradient-to-br ${accent.panel} p-5 shadow-[0_28px_90px_-56px_rgba(15,23,42,0.38)] backdrop-blur-sm sm:p-6 lg:p-7`}
                      >
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.72),transparent_42%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_46%)]" />
                        <div className="relative flex items-start gap-4 sm:gap-5">
                          <div className="relative flex shrink-0 flex-col items-center">
                            <div className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-[1.2rem] border shadow-[0_18px_36px_-24px_rgba(15,23,42,0.35)] ${accent.icon}`}>
                              <step.icon className="h-5 w-5" />
                            </div>
                            {index < LANDING_FLOW_STEPS.length - 1 && (
                              <div className={`mt-3 h-14 w-px bg-gradient-to-b ${accent.line} sm:h-16`} />
                            )}
                          </div>

                          <div className="min-w-0 flex-1 space-y-3 pt-0.5">
                            <div className="flex flex-wrap items-center gap-2.5">
                              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/82">
                                {step.cue}
                              </span>
                            </div>
                            <div className="space-y-2">
                              <h3 className="max-w-[24ch] text-xl font-extrabold leading-tight tracking-tight text-foreground sm:text-[1.45rem]">
                                {step.title}
                              </h3>
                              <p className="max-w-[58ch] text-[15px] font-normal leading-relaxed text-muted-foreground">
                                {step.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </article>
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
                    eyebrow="Outcome"
                    title="Cosa cambia davvero"
                    description="Dopo la prima settimana non stai solo registrando spese: stai decidendo con più calma."
                    titleId="landing-outcomes-title"
                  />
                }
                contentClassName="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 pt-12"
              >
                {LANDING_OUTCOMES.map((outcome, index) => {
                  const accent = LANDING_OUTCOME_ACCENTS[index]

                  return (
                    <article
                      key={outcome.title}
                      className={`group relative overflow-hidden rounded-[2rem] border ${accent.border} bg-gradient-to-br ${accent.panel} p-6 shadow-[0_28px_90px_-56px_rgba(15,23,42,0.38)] backdrop-blur-sm sm:p-7`}
                    >
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.72),transparent_42%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_46%)]" />
                      <div className="relative flex h-full flex-col gap-5">
                        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.2rem] border shadow-[0_18px_36px_-24px_rgba(15,23,42,0.35)] ${accent.icon}`}>
                          <outcome.icon className="h-6 w-6" />
                        </div>
                        <div className="space-y-2.5">
                          <h3 className="max-w-[18ch] text-xl font-extrabold tracking-tight text-foreground sm:text-[1.45rem]">
                            {outcome.title}
                          </h3>
                          <p className="max-w-[34ch] text-base font-normal leading-relaxed text-muted-foreground">
                            {outcome.description}
                          </p>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </MacroSection>
            </div>
          </section>

          <section id="open-app" className="relative overflow-hidden px-4 py-18 scroll-mt-24 sm:py-24" aria-labelledby="landing-cta-title">
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-[0.1]">
              <AppleFluidBackground />
            </div>
            <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
              <div className="absolute left-1/2 top-[36%] h-[22rem] w-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl sm:h-[28rem] sm:w-[28rem]" />
              <div className="absolute left-1/2 top-[42%] h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 dark:border-white/8" />
              <div className="absolute left-1/2 top-[42%] h-[22rem] w-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/18 dark:border-white/7" />
            </div>
            <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                Pronto quando lo sei tu.
              </p>
              <h2
                id="landing-cta-title"
                className="mt-6 max-w-[12ch] text-4xl font-black leading-[0.94] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
              >
                Apri Numa. Vedi il mese per intero.
              </h2>
              <p className="mt-5 max-w-[34rem] text-base font-normal leading-relaxed text-muted-foreground sm:text-lg">
                Importa un estratto conto. Leggi presente, stima e quota sostenibile nello stesso quadro.
              </p>

              <div className="mt-10">
                <Button asChild size="lg" className="rounded-full px-12 py-7 text-lg font-bold shadow-2xl shadow-primary/20">
                  <Link href="/dashboard">
                    Apri Numa
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <p className="mt-6 text-sm font-medium text-foreground/54">
                Tutto in locale · Nessun account per iniziare · Zero cloud obbligatorio
              </p>
            </div>
          </section>
        </StaggerContainer>
      </main>

      <footer className="px-4 pb-10 pt-6">
        <div className="mx-auto max-w-6xl border-t border-black/6 pt-6 dark:border-white/8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-[26rem] space-y-3">
              <BrandLogo variant="full" height={24} className="w-auto max-w-[132px] opacity-90" />
              <p className="text-sm font-normal leading-relaxed text-muted-foreground">
                Finanza personale local-first per leggere il mese con più calma.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:min-w-[26rem] lg:gap-12">
              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/46">
                  Prodotto
                </p>
                <ul className="space-y-2">
                  {LANDING_FOOTER_PRODUCT_ITEMS.map((item) => (
                    <li key={`footer-${item}`} className="text-sm font-normal text-foreground/72">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/46">
                  Supporto
                </p>
                <ul className="space-y-2">
                  {LANDING_FOOTER_SUPPORT_ITEMS.map((item) => (
                    <li key={item} className="text-sm font-normal text-foreground/62">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
