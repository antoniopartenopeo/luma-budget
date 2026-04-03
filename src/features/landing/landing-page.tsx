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
import { LandingHeroEditorial } from "./components/landing-hero-editorial"
import { LandingHeroConsole } from "./components/landing-previews"
import { AppleFluidBackground } from "./components/motion-primitives"
import { LandingEditorialCardFrame } from "./components/landing-editorial-card-frame"
import { LandingImmersiveFallback } from "./components/landing-immersive-fallback"
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
        eyebrow="La differenza di Numa"
        title="I tuoi dati restano dove li stai leggendo."
        description="La sezione si sta preparando con lo stesso ritmo della landing: locale, leggibile e senza scorciatoie cloud."
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
        eyebrow="Il Brain di Numa"
        title="Una stima prudente prima di una scelta."
        description="Il Brain arriva come prova del percorso: meno spettacolo, più affidabilità su margine e impatto del mese."
        heightClassName="h-[440vh]"
      />
    )
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
    border: "border-slate-400/18 dark:border-slate-400/10",
    panel: "from-slate-500/[0.03] via-white to-slate-50/60 dark:from-slate-800/28 dark:via-black/80 dark:to-slate-950/24",
    icon: "border-slate-400/25 bg-slate-500/8 text-slate-700 dark:border-slate-400/15 dark:bg-slate-800/35 dark:text-slate-300",
    number: "text-slate-500/6 dark:text-slate-300/[0.03]",
    orb: "bg-slate-500/18 dark:bg-slate-300/10"
  },
  {
    border: "border-teal-400/20 dark:border-teal-400/10",
    panel: "from-teal-500/[0.02] via-white to-teal-50/50 dark:from-teal-900/30 dark:via-black/80 dark:to-teal-950/20",
    icon: "border-teal-400/25 bg-teal-500/10 text-teal-700 dark:border-teal-400/15 dark:bg-teal-900/40 dark:text-teal-300",
    number: "text-teal-500/5 dark:text-teal-300/[0.03]",
    orb: "bg-teal-500/18 dark:bg-teal-300/10"
  },
  {
    border: "border-cyan-400/16 dark:border-cyan-400/10",
    panel: "from-cyan-500/[0.015] via-white to-cyan-50/45 dark:from-cyan-900/24 dark:via-black/80 dark:to-cyan-950/18",
    icon: "border-cyan-400/22 bg-cyan-500/8 text-cyan-600 dark:border-cyan-400/15 dark:bg-cyan-900/34 dark:text-cyan-300",
    number: "text-cyan-500/5 dark:text-cyan-300/[0.03]",
    orb: "bg-cyan-500/16 dark:bg-cyan-300/10"
  }
] as const

const LANDING_OUTCOME_ACCENTS = [
  {
    border: "border-cyan-400/20 dark:border-cyan-400/10",
    panel: "from-cyan-500/[0.02] via-white to-cyan-50/50 dark:from-cyan-900/30 dark:via-black/80 dark:to-cyan-950/20",
    icon: "border-cyan-400/25 bg-cyan-500/10 text-cyan-600 dark:border-cyan-400/15 dark:bg-cyan-900/40 dark:text-cyan-300",
    orb: "bg-cyan-500/20 dark:bg-cyan-400/10"
  },
  {
    border: "border-teal-400/20 dark:border-teal-400/10",
    panel: "from-teal-500/[0.02] via-white to-teal-50/50 dark:from-teal-900/30 dark:via-black/80 dark:to-teal-950/20",
    icon: "border-teal-400/25 bg-teal-500/10 text-teal-700 dark:border-teal-400/15 dark:bg-teal-900/40 dark:text-teal-300",
    orb: "bg-teal-500/18 dark:bg-teal-300/10"
  },
  {
    border: "border-slate-400/18 dark:border-slate-400/10",
    panel: "from-slate-500/[0.03] via-white to-slate-50/60 dark:from-slate-800/28 dark:via-black/80 dark:to-slate-950/24",
    icon: "border-slate-400/25 bg-slate-500/8 text-slate-700 dark:border-slate-400/15 dark:bg-slate-800/35 dark:text-slate-300",
    orb: "bg-slate-500/18 dark:bg-slate-300/10"
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
          <LandingHeroEditorial />

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
                          <AccordionContent className="max-w-[58ch] text-sm font-normal leading-relaxed text-muted-foreground sm:text-[15px]">
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
                    <p className="mt-3 text-sm font-normal leading-relaxed text-muted-foreground sm:text-base">
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
                <Button asChild size="lg" className="group rounded-full px-12 py-7 text-lg font-bold shadow-[0_0_40px_-10px] shadow-primary/30 transition-[transform,box-shadow] duration-300 hover:shadow-[0_0_60px_-10px] hover:shadow-primary/50">
                  <Link href="/dashboard">
                    Apri Numa
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>

                <Button asChild variant="outline" size="lg" className="rounded-full px-10 py-7 text-lg font-semibold">
                  <Link href="/transactions/import">Prova app demo</Link>
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
