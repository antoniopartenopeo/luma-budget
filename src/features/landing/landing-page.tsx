"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { AmbientBackdrop } from "@/components/layout/ambient-backdrop"
import { MacroSection } from "@/components/patterns/macro-section"
import { StaggerContainer } from "@/components/patterns/stagger-container"
import { Badge } from "@/components/ui/badge"
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
        <StaggerContainer className="space-y-32 sm:space-y-48">
          <section
            className="relative flex min-h-[90vh] w-full flex-col items-center justify-center overflow-hidden px-4 py-20"
            aria-labelledby="landing-hero-title"
          >
            <div className="absolute inset-0 z-0 pointer-events-none">
              <AppleFluidBackground />
            </div>

            <div className="relative z-10 mt-12 flex w-full max-w-4xl flex-col items-center text-center">
              <BrandLogo
                variant="full"
                height={92}
                className="mb-12 w-auto max-w-[300px] sm:max-w-[380px] lg:max-w-[440px] drop-shadow-sm"
              />

              <div className="space-y-5">
                <Badge variant="outline" className="border-primary/16 bg-background/65 text-primary backdrop-blur-md">
                  App di finanza personale locale-first
                </Badge>

                <h1
                  id="landing-hero-title"
                  className="mx-auto max-w-[14ch] text-5xl font-black tracking-tight text-foreground sm:text-6xl lg:text-7xl drop-shadow-sm"
                >
                  <CinematicTextReveal text="L'app che ti aiuta a capire il mese, non solo a registrare spese." />
                </h1>

                <p className="mx-auto max-w-[44rem] text-base font-medium leading-relaxed text-muted-foreground sm:text-lg lg:text-[1.3rem] drop-shadow-sm">
                  Numa ti mostra dove stanno andando i tuoi soldi, quanto potrebbe restarti a fine mese e se una nuova spesa fissa è davvero sostenibile.
                </p>
              </div>

              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
                <Button asChild size="lg" className="rounded-full px-8 shadow-lg shadow-primary/15 transition-shadow hover:shadow-primary/30">
                  <Link href="/dashboard">
                    Apri l&apos;app
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>

                <a
                  href="#problema"
                  className="text-sm font-semibold text-primary/75 transition-colors hover:text-primary"
                >
                  Guarda perché Numa è diversa
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
                    title="Il problema che nessuno risolve"
                    description="La maggior parte delle app di finanza personale si ferma al primo passo: registrare. Numa parte da lì dove le altre finiscono."
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
                <div className="relative flex flex-col gap-0 sm:flex-row sm:gap-0">
                  <div className="absolute left-7 top-0 bottom-0 w-px bg-primary/15 sm:left-0 sm:right-0 sm:top-7 sm:bottom-auto sm:h-px sm:w-full" />

                  {LANDING_FLOW_STEPS.map((step, index) => (
                    <div key={step.stepLabel} className="relative flex items-start gap-5 py-5 sm:flex-1 sm:flex-col sm:items-center sm:text-center sm:px-4 sm:py-0">
                      <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-background text-xl font-black tracking-tight text-primary shadow-[0_0_30px_rgba(var(--primary),0.15)]">
                        {step.stepLabel}
                      </div>
                      <div className="space-y-2 pt-1 sm:pt-4">
                        <h3 className="text-base font-bold tracking-tight text-foreground">{step.title}</h3>
                        <p className="text-sm font-medium leading-relaxed text-muted-foreground max-w-[30ch]">{step.description}</p>
                      </div>
                      {index < LANDING_FLOW_STEPS.length - 1 && (
                        <div className="hidden sm:block absolute right-0 top-7 translate-x-1/2 -translate-y-1/2 z-20">
                          <ArrowRight className="h-3.5 w-3.5 text-primary/40" />
                        </div>
                      )}
                    </div>
                  ))}
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
                    description="Non è una questione di funzionalità. È una questione di abitudine: cosa succede dopo la prima settimana d&apos;uso."
                    titleId="landing-outcomes-title"
                  />
                }
                contentClassName="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 pt-12"
              >
                {LANDING_OUTCOMES.map((outcome) => (
                  <article key={outcome.title} className="flex flex-col gap-5">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-[0_0_30px_rgba(var(--primary),0.15)]">
                      <outcome.icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold tracking-tight text-foreground">{outcome.title}</h3>
                      <p className="text-base font-medium leading-relaxed text-muted-foreground">{outcome.description}</p>
                    </div>
                  </article>
                ))}
              </MacroSection>
            </div>
          </section>

          <section id="open-app" className="relative px-4 scroll-mt-24 overflow-hidden" aria-labelledby="landing-cta-title">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.07]">
              <AppleFluidBackground />
            </div>
            <div className="relative z-10 mx-auto max-w-6xl">
              <div className="flex flex-col items-center justify-center text-center py-24 sm:py-40">
                <div className="flex flex-col items-center space-y-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                    Pronto quando lo sei tu.
                  </p>
                  <h2 id="landing-cta-title" className="max-w-[20ch] text-5xl font-black tracking-tighter text-foreground sm:text-6xl lg:text-7xl">
                    Il tuo mese merita più di un elenco di spese.
                  </h2>
                  <p className="max-w-xl text-base font-medium leading-relaxed text-muted-foreground sm:text-xl">
                    Apri Numa, importa un estratto conto e guarda cosa succede. Nessun account, nessun vincolo.
                  </p>
                </div>
                <div className="mt-12">
                  <Button asChild size="lg" className="rounded-full px-12 py-7 text-lg font-bold shadow-2xl shadow-primary/20">
                    <Link href="/dashboard">Inizia Ora</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </StaggerContainer>
      </main>

      <footer className="px-4 pb-8 pt-2">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-white/30 px-5 py-5 glass-chrome">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <BrandLogo variant="full" height={28} className="w-auto max-w-[140px]" />
              <p className="max-w-xl text-sm font-medium leading-relaxed text-muted-foreground">
                Finanza personale senza cloud, senza account, senza metodo obbligatorio. Solo i tuoi dati e una lettura più chiara.
              </p>
            </div>
            <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 shrink-0">
              <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                100% Local-First
              </Badge>
              <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                Zero Cloud
              </Badge>
              <Link href="/dashboard" className="text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground">
                Apri l&apos;app
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}
