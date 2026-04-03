"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { AmbientBackdrop } from "@/components/layout/ambient-backdrop"
import { MacroSection } from "@/components/patterns/macro-section"
import { StaggerContainer } from "@/components/patterns/stagger-container"
import { BrandLogo } from "@/components/ui/brand-logo"
import { Button } from "@/components/ui/button"
import {
  LANDING_FLOW_STEPS,
  LANDING_OUTCOMES,
  LANDING_TRUST_SIGNALS
} from "./data"
import { PUBLIC_FAQ_ITEMS } from "./public-support-content"
import { LandingHeroConsole } from "./components/landing-previews"
import { AppleFluidBackground, CinematicTextReveal } from "./components/motion-primitives"
import { LandingEditorialCardFrame } from "./components/landing-editorial-card-frame"
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
  { href: "#problema", label: "Problema" },
  { href: "#differenza", label: "Differenza" },
  { href: "#come-inizi", label: "Come inizi" },
  { href: "#brain-hero", label: "Brain" },
  { href: "#outcomes", label: "Esito" },
  { href: "#faq", label: "FAQ" }
] as const

const LANDING_FOOTER_PRODUCT_ITEMS = [
  "Import CSV",
  "Brain",
  "Financial Lab"
] as const

const LANDING_FOOTER_SUPPORT_ITEMS = [
  { label: "FAQ", href: "/faq" },
  { label: "Privacy", href: "/privacy" },
  { label: "Aggiornamenti", href: "/updates" }
] as const

const LANDING_FLOW_ACCENTS = [
  {
    border: "border-cyan-400/20 dark:border-cyan-400/10",
    panel: "from-cyan-500/[0.02] via-white to-cyan-50/50 dark:from-cyan-900/30 dark:via-black/80 dark:to-cyan-950/20",
    icon: "border-cyan-400/25 bg-cyan-500/10 text-cyan-600 dark:border-cyan-400/15 dark:bg-cyan-900/40 dark:text-cyan-400",
    number: "text-cyan-500/5 dark:text-cyan-400/[0.03]",
    orb: "bg-cyan-500/20 dark:bg-cyan-400/10"
  },
  {
    border: "border-emerald-400/20 dark:border-emerald-400/10",
    panel: "from-emerald-500/[0.02] via-white to-emerald-50/50 dark:from-emerald-900/30 dark:via-black/80 dark:to-emerald-950/20",
    icon: "border-emerald-400/25 bg-emerald-500/10 text-emerald-600 dark:border-emerald-400/15 dark:bg-emerald-900/40 dark:text-emerald-400",
    number: "text-emerald-500/5 dark:text-emerald-400/[0.03]",
    orb: "bg-emerald-500/20 dark:bg-emerald-400/10"
  },
  {
    border: "border-indigo-400/20 dark:border-indigo-400/10",
    panel: "from-indigo-500/[0.02] via-white to-indigo-50/50 dark:from-indigo-900/30 dark:via-black/80 dark:to-indigo-950/20",
    icon: "border-indigo-400/25 bg-indigo-500/10 text-indigo-600 dark:border-indigo-400/15 dark:bg-indigo-900/40 dark:text-indigo-400",
    number: "text-indigo-500/5 dark:text-indigo-400/[0.03]",
    orb: "bg-indigo-500/20 dark:bg-indigo-400/10"
  },
  {
    border: "border-amber-400/20 dark:border-amber-400/10",
    panel: "from-amber-500/[0.02] via-white to-amber-50/50 dark:from-amber-900/30 dark:via-black/80 dark:to-amber-950/20",
    icon: "border-amber-400/25 bg-amber-500/10 text-amber-600 dark:border-amber-400/15 dark:bg-amber-900/40 dark:text-amber-400",
    number: "text-amber-500/5 dark:text-amber-400/[0.03]",
    orb: "bg-amber-500/20 dark:bg-amber-400/10"
  }
] as const

const LANDING_OUTCOME_ACCENTS = [
  {
    border: "border-cyan-400/20 dark:border-cyan-400/10",
    panel: "from-cyan-500/[0.02] via-white to-cyan-50/50 dark:from-cyan-900/30 dark:via-black/80 dark:to-cyan-950/20",
    icon: "border-cyan-400/25 bg-cyan-500/10 text-cyan-600 dark:border-cyan-400/15 dark:bg-cyan-900/40 dark:text-cyan-400",
    orb: "bg-cyan-500/20 dark:bg-cyan-400/10"
  },
  {
    border: "border-emerald-400/20 dark:border-emerald-400/10",
    panel: "from-emerald-500/[0.02] via-white to-emerald-50/50 dark:from-emerald-900/30 dark:via-black/80 dark:to-emerald-950/20",
    icon: "border-emerald-400/25 bg-emerald-500/10 text-emerald-600 dark:border-emerald-400/15 dark:bg-emerald-900/40 dark:text-emerald-400",
    orb: "bg-emerald-500/20 dark:bg-emerald-400/10"
  },
  {
    border: "border-indigo-400/20 dark:border-indigo-400/10",
    panel: "from-indigo-500/[0.02] via-white to-indigo-50/50 dark:from-indigo-900/30 dark:via-black/80 dark:to-indigo-950/20",
    icon: "border-indigo-400/25 bg-indigo-500/10 text-indigo-600 dark:border-indigo-400/15 dark:bg-indigo-900/40 dark:text-indigo-400",
    orb: "bg-indigo-500/20 dark:bg-indigo-400/10"
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



            <div className={LANDING_HERO_FRAME_CLASS}>
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.26),transparent_42%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_44%)]" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent dark:via-white/18" />

              <div className="relative z-10 mt-4 flex w-full max-w-4xl flex-col items-center text-center sm:mt-0">
                <BrandLogo
                  variant="full"
                  height={92}
                  className="mb-14 sm:mb-16 lg:mb-20 w-auto max-w-[300px] sm:max-w-[380px] lg:max-w-[440px] drop-shadow-sm"
                />

                <div className="space-y-5">
                  <h1
                    id="landing-hero-title"
                    className="mx-auto max-w-4xl text-5xl font-black leading-[0.98] tracking-tight text-foreground sm:text-6xl lg:text-7xl drop-shadow-sm"
                  >
                    <CinematicTextReveal text="Il tuo saldo è il passato. Scopri il tuo futuro." />
                  </h1>

                  <p className="mx-auto max-w-[44rem] text-base font-normal leading-relaxed text-muted-foreground sm:text-lg lg:text-[1.2rem] drop-shadow-sm">
                    Prevedi il margine del mese in un istante. I tuoi dati restano sul tuo dispositivo, lontano dal cloud. Zero compromessi.
                  </p>
                </div>

                <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
                  <Button asChild size="lg" className="rounded-full px-8 shadow-lg shadow-primary/15 transition-shadow hover:shadow-primary/30">
                    <Link href="/dashboard">
                      Inizia gratis
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>

                  <Button asChild variant="outline" size="lg" className="rounded-full px-8">
                    <Link href="/transactions/import">
                      Esplora app demo
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 sm:mt-12 opacity-80 mix-blend-plus-lighter">
                  {LANDING_TRUST_SIGNALS.slice(0, 3).map((signal) => (
                    <div key={signal.title} className="flex items-center gap-2 text-muted-foreground/80">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground/5 border border-foreground/10">
                        <svg className="h-3 w-3 text-foreground/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-[13px] font-semibold tracking-wide text-foreground/70">{signal.title}</span>
                    </div>
                  ))}
                </div>

                <a
                  href="#come-inizi"
                  className="group mt-6 inline-flex items-center gap-2 rounded-full border border-transparent px-6 py-3 text-[13px] font-medium tracking-[0.04em] text-foreground/60 transition-all hover:bg-foreground/5 hover:text-foreground"
                >
                  Guarda il percorso in 4 passaggi
                  <ArrowRight className="h-[14px] w-[14px] rotate-90 transition-transform duration-300 group-hover:translate-y-1" />
                </a>
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
                    title="Smetti di indovinare le tue spese."
                    description="Sapere cosa hai speso non ti dice quanto margine hai oggi. Il punto è capire il mese prima di aggiungere una nuova spesa."
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
                    eyebrow="Come inizi"
                    title="Quattro passaggi, nessun rito."
                    description="Importi un CSV, leggi il mese, guardi la stima e capisci se una nuova spesa fissa è sostenibile."
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
                        orbClassName={accent.orb}
                        orbPositionClassName="-right-[15%] -top-[20%] h-[20rem] w-[20rem] sm:h-[28rem] sm:w-[28rem]"
                        decorativeText={step.stepLabel}
                        decorativeTextClassName={`-bottom-[12%] -right-[2%] text-8xl ${accent.number} sm:-bottom-[8%] sm:text-[13rem] lg:-right-[1%] lg:text-[18rem]`}
                        className="p-8 shadow-[0_40px_100px_-50px_rgba(0,0,0,0.5)] sm:rounded-[3rem] sm:p-10 lg:p-12"
                      >
                        <div className="relative flex flex-col items-start gap-6 sm:gap-8">
                          <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.4rem] border shadow-[0_20px_40px_-20px_rgba(0,0,0,0.4)] sm:h-20 sm:w-20 sm:rounded-[1.8rem] ${accent.icon}`}>
                            <step.icon className="h-7 w-7 sm:h-9 sm:w-9" />
                          </div>

                          <div className="min-w-0 flex-1 space-y-4 lg:space-y-5">
                            <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-foreground/50 sm:text-[13px] lg:text-[14px]">
                              {step.cue}
                            </span>
                            <div className="space-y-3 lg:space-y-4">
                              <h3 className="max-w-[20ch] text-3xl font-black leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                                {step.title}
                              </h3>
                              <p className="max-w-[48ch] text-[16px] font-medium leading-relaxed text-foreground/70 sm:text-[18px] lg:text-[20px]">
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
                    eyebrow="Cosa cambia"
                    title="Meno attrito. Più chiarezza."
                    description="Il beneficio non è controllare di più. È doverci pensare meno, con un quadro più stabile del mese."
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
                          <div className={cn("space-y-4", isHero ? "min-w-0 max-w-[48rem] pr-20 sm:pr-28 lg:pr-40" : "pr-14 sm:pr-20 lg:pr-28")}>
                            <h3 className={cn("font-black tracking-tight text-foreground", isHero ? "text-4xl leading-[1.05] sm:text-5xl lg:text-5xl max-w-[20ch]" : "text-3xl leading-[1.05] sm:text-4xl max-w-[16ch]")}>
                              {outcome.title}
                            </h3>
                            <p className={cn("font-medium leading-relaxed text-foreground/70", isHero ? "text-[16px] sm:text-[19px] lg:text-[21px] max-w-[48ch]" : "text-[16px] sm:text-[18px] max-w-[34ch]")}>
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

          <section id="faq" className="px-4 scroll-mt-24" aria-labelledby="landing-faq-title">
            <div className="mx-auto max-w-6xl">
              <MacroSection
                disableAnimation
                title={
                  <LandingSectionHeader
                    eyebrow="FAQ essenziali"
                    title="Le risposte che servono prima di fidarti."
                    description="Poche risposte, tutte legate a ciò che il prodotto fa davvero oggi: file supportati, prova demo, dati locali e continuità."
                    titleId="landing-faq-title"
                  />
                }
                contentClassName="pt-10"
              >
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                  <div className="rounded-[2rem] border border-black/6 bg-white/70 p-4 shadow-[0_28px_90px_-56px_rgba(15,23,42,0.28)] backdrop-blur-sm dark:border-white/8 dark:bg-white/[0.03] sm:p-6">
                    <Accordion type="single" collapsible className="w-full">
                      {PUBLIC_FAQ_ITEMS.map((item, index) => (
                        <AccordionItem
                          key={item.question}
                          value={`landing-faq-${index}`}
                          className="border-b border-black/6 last:border-b-0 dark:border-white/8"
                        >
                          <AccordionTrigger className="text-left text-base font-semibold tracking-tight text-foreground hover:no-underline sm:text-lg">
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent className="max-w-[58ch] text-sm font-medium leading-relaxed text-muted-foreground sm:text-[15px]">
                            {item.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>

                  <div className="rounded-[2rem] border border-primary/16 bg-gradient-to-br from-primary/[0.10] via-white/76 to-white/92 p-5 shadow-[0_28px_90px_-56px_rgba(15,23,42,0.28)] backdrop-blur-sm dark:border-primary/12 dark:from-primary/[0.12] dark:via-black/24 dark:to-black/18 sm:p-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                      Prova sicura
                    </p>
                    <h3 className="mt-4 max-w-[16ch] text-2xl font-extrabold tracking-tight text-foreground sm:text-[2rem]">
                      Vuoi capire Numa senza usare i tuoi dati?
                    </h3>
                    <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground sm:text-base">
                      Parti dal percorso di import e usa il dataset demo già integrato. Vedrai lo stesso flusso operativo, senza toccare il tuo estratto conto.
                    </p>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:flex-col">
                      <Button asChild className="rounded-full px-6 shadow-[0_18px_40px_-24px_rgba(14,165,168,0.55)]">
                        <Link href="/transactions/import">
                          Esplora app demo
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>

                      <Button asChild variant="ghost" className="rounded-full px-5 text-foreground/78 hover:text-foreground">
                        <Link href="/faq">Apri FAQ completa</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </MacroSection>
            </div>
          </section>

          <section id="open-app" className="relative overflow-hidden px-4 py-18 scroll-mt-24 sm:py-24" aria-labelledby="landing-cta-title">
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-[0.1]">
              <AppleFluidBackground />
            </div>
            <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
              <div className="absolute left-1/2 top-[36%] h-[22rem] w-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl sm:h-[28rem] sm:w-[28rem]" />
            </div>
            <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                Quando vuoi iniziare.
              </p>
              <h2
                id="landing-cta-title"
                className="mt-6 max-w-[18ch] text-4xl font-black leading-[0.94] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
              >
                Inizia gratis. Parti da ciò che hai già.
              </h2>
              <p className="mt-5 max-w-[34rem] text-base font-normal leading-relaxed text-muted-foreground sm:text-lg">
                Importa un file, esplora l&apos;app demo o apri direttamente l&apos;app: il punto è capire il mese con più chiarezza prima di aggiungere una nuova spesa.
              </p>

              <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="group rounded-full px-12 py-7 text-lg font-bold shadow-[0_0_40px_-10px] shadow-primary/30 transition-all hover:shadow-[0_0_60px_-10px] hover:shadow-primary/50">
                  <Link href="/dashboard">
                    Inizia gratis
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>

                <Button asChild variant="outline" size="lg" className="rounded-full px-10 py-7 text-lg font-semibold">
                  <Link href="/transactions/import">Esplora app demo</Link>
                </Button>
              </div>

              <p className="mt-6 text-sm font-medium text-foreground/54">
                Dati in locale · Nessun account obbligatorio · Prova demo disponibile
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
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="text-sm font-normal text-foreground/62 transition-colors duration-200 hover:text-foreground"
                      >
                        {item.label}
                      </Link>
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
