"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
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
import { AppleFluidBackground, CinematicTextReveal, CinematicScrollCard } from "./components/motion-primitives"
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
                    className="mx-auto max-w-4xl text-5xl font-black leading-[0.98] tracking-tight text-foreground sm:text-6xl lg:text-7xl drop-shadow-sm"
                  >
                    <CinematicTextReveal text="Capisci il mese prima di prendere una decisione." />
                  </h1>

                  <p className="mx-auto max-w-[44rem] text-base font-normal leading-relaxed text-muted-foreground sm:text-lg lg:text-[1.2rem] drop-shadow-sm">
                    Importi i movimenti, Numa legge il presente, stima il margine del mese e ti aiuta a valutare una nuova spesa fissa senza spostare il quadro finanziario nel cloud.
                  </p>
                </div>

                <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
                  <Button asChild size="lg" className="rounded-full px-8 shadow-lg shadow-primary/15 transition-shadow hover:shadow-primary/30">
                    <Link href="/dashboard">
                      Apri Numa
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>

                  <Button asChild variant="outline" size="lg" className="rounded-full px-8">
                    <Link href="/transactions/import">
                      Prova con dati demo
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                <div className="mt-8 grid w-full max-w-5xl gap-3 text-left sm:grid-cols-2 xl:grid-cols-4">
                  {LANDING_TRUST_SIGNALS.map((signal) => (
                    <div
                      key={signal.title}
                      className="rounded-[1.4rem] border border-white/16 bg-background/52 px-4 py-4 backdrop-blur-md shadow-[0_24px_70px_-48px_rgba(15,23,42,0.45)] dark:border-white/10"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/82">
                        Fiducia
                      </p>
                      <p className="mt-2 text-sm font-bold leading-tight text-foreground">
                        {signal.title}
                      </p>
                      <p className="mt-2 text-[13px] font-medium leading-relaxed text-muted-foreground">
                        {signal.description}
                      </p>
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
                    title="Il saldo non basta."
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
                <div className="relative space-y-4 sm:space-y-5">
                  <div className="pointer-events-none absolute left-7 top-0 bottom-0 w-px bg-gradient-to-b from-primary/20 via-primary/8 to-transparent" />

                  {LANDING_FLOW_STEPS.map((step, index) => {
                    const accent = LANDING_FLOW_ACCENTS[index]

                    return (
                      <CinematicScrollCard
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
                      </CinematicScrollCard>
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
                contentClassName="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 pt-12"
              >
                {LANDING_OUTCOMES.map((outcome, index) => {
                  const accent = LANDING_OUTCOME_ACCENTS[index]

                  return (
                    <CinematicScrollCard
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
                    </CinematicScrollCard>
                  )
                })}
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
                          Prova con dati demo
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
                Apri Numa. Parti da ciò che hai già.
              </h2>
              <p className="mt-5 max-w-[34rem] text-base font-normal leading-relaxed text-muted-foreground sm:text-lg">
                Importa un file, prova il dataset demo o apri direttamente l&apos;app: il punto è capire il mese con più chiarezza prima di aggiungere una nuova spesa.
              </p>

              <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="group rounded-full px-12 py-7 text-lg font-bold shadow-[0_0_40px_-10px] shadow-primary/30 transition-all hover:shadow-[0_0_60px_-10px] hover:shadow-primary/50">
                  <Link href="/dashboard">
                    Apri Numa
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>

                <Button asChild variant="outline" size="lg" className="rounded-full px-10 py-7 text-lg font-semibold">
                  <Link href="/transactions/import">Prova con dati demo</Link>
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
