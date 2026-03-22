"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { AmbientBackdrop } from "@/components/layout/ambient-backdrop"
import { MacroSection } from "@/components/patterns/macro-section"
import { StaggerContainer } from "@/components/patterns/stagger-container"
import { Badge } from "@/components/ui/badge"
import { BrandLogo } from "@/components/ui/brand-logo"
import { Button } from "@/components/ui/button"
import {
  LANDING_DIFFERENTIATORS,
  LANDING_FLOW_STEPS,
  LANDING_OUTCOMES
} from "./data"
import { LandingHeroConsole } from "./components/landing-previews"
import { LandingProductDemo } from "./components/landing-product-demo"
import { HeroFluidVeils } from "./components/hero-fluid-veils"
import { LandingBrainHero } from "./components/landing-brain-hero"
import { CinematicTextReveal } from "./components/motion-primitives"

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-background selection:bg-primary/20">
      <AmbientBackdrop />

      <div className="sticky top-4 z-50 mx-auto hidden w-fit px-4 md:block">
        <nav className="flex items-center gap-1 rounded-full border border-white/20 bg-white/60 px-2 py-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md dark:border-white/10 dark:bg-black/40">
          <a href="#problema" className="rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10">Il Problema</a>
          <a href="#differenza" className="rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10">Differenza</a>
          <a href="#demo" className="rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10">Demo</a>
          <a href="#come-funziona" className="rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10">Come funziona</a>
        </nav>
      </div>

      <main id="main-content" className="relative pb-32">
        <StaggerContainer className="space-y-32 sm:space-y-48">
          
          {/* SECTION 1: HERO IMMERSIVE */}
          <section
            className="relative flex min-h-[90vh] w-full flex-col items-center justify-center overflow-hidden px-4 py-20"
            aria-labelledby="landing-hero-title"
          >
            {/* Soft pristine Apple-Premium animated SVG background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
               <HeroFluidVeils />
               <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/40 to-background dark:from-background/20 dark:via-background/60" />
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_30%,_var(--tw-gradient-stops))] from-transparent via-background/60 to-background" />
            </div>

            <div className="relative z-10 flex w-full max-w-4xl flex-col items-center text-center mt-10">
              <BrandLogo
                variant="full"
                height={84}
                className="mb-10 w-auto max-w-[280px] sm:max-w-[360px] lg:max-w-[420px] drop-shadow-sm"
              />

              <div className="space-y-6">
                <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary backdrop-blur-md">
                  App di finanza personale locale-first
                </Badge>

                <h1
                  id="landing-hero-title"
                  className="mx-auto max-w-[15ch] text-5xl font-black tracking-tight text-foreground sm:text-6xl lg:text-7xl drop-shadow-sm"
                >
                  <CinematicTextReveal text="L'app che ti aiuta a capire il mese, non solo a registrare spese." />
                </h1>

                <p className="mx-auto max-w-2xl text-base font-medium leading-relaxed text-muted-foreground sm:text-lg lg:text-xl drop-shadow-sm">
                  Numa ti fa vedere dove stanno andando i tuoi soldi, quanto potrebbe restarti a fine mese e se una nuova spesa fissa e davvero sostenibile.
                </p>
              </div>

              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
                <Button asChild size="lg" className="rounded-full px-8 shadow-lg shadow-primary/15 hover:shadow-primary/30 transition-shadow">
                  <Link href="/dashboard">
                    Apri l&apos;app
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>

                <a
                  href="#problema"
                  className="text-sm font-semibold text-primary/90 transition-colors hover:text-primary drop-shadow-sm"
                >
                  Scopri perche Numa e diversa
                </a>
              </div>
            </div>
          </section>

          {/* SECTION 2: PROBLEMA */}
          <section id="problema" className="px-4 scroll-mt-24" aria-labelledby="landing-problem-title">
            <div className="mx-auto max-w-6xl">
              <MacroSection disableAnimation contentClassName="pt-5">
                <LandingHeroConsole />
              </MacroSection>
            </div>
          </section>

          {/* SECTION 3: DIFFERENZA */}
          <section id="differenza" className="px-4 scroll-mt-24" aria-labelledby="landing-different-title">
            <div className="mx-auto max-w-6xl">
              <MacroSection
                disableAnimation
                title={<span id="landing-different-title">La differenza con Numa</span>}
                description="La maggior parte delle app ti chiede prima cloud, metodo o automazioni. Numa prova a fare il contrario: spiegarti il mese con piu chiarezza."
                contentClassName="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 pt-12"
              >
                {LANDING_DIFFERENTIATORS.map((item) => (
                  <article key={item.title} className="flex flex-col gap-6">
                    <div className="space-y-5">
                      <div className="flex flex-col gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-[0_0_30px_rgba(var(--primary),0.15)]">
                          <item.icon className="h-6 w-6" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-bold tracking-tight text-foreground">{item.title}</h3>
                          <p className="text-base font-medium leading-relaxed text-muted-foreground">{item.marketLabel}</p>
                        </div>
                      </div>

                      <div className="mt-2 border-l-2 border-primary/30 pl-5 py-1">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Con Numa</p>
                        <p className="mt-1 text-sm font-semibold leading-relaxed text-foreground">{item.numaLabel}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </MacroSection>
            </div>
          </section>

          {/* SECTION 4: DEMO NARRATIVA (STICKY SCROLLYTELLING) */}
          <section id="demo" aria-labelledby="landing-demo-title">
             <LandingProductDemo />
          </section>

          {/* SECTION 4.5: TEMPORAL CORE (BRAIN AI HERO) */}
          <section id="brain-hero" aria-labelledby="landing-brain-hero-title">
             <LandingBrainHero />
          </section>

          {/* SECTION 5: COME FUNZIONA */}
          <section id="come-funziona" className="px-4 scroll-mt-24" aria-labelledby="landing-how-title">
            <div className="mx-auto max-w-6xl">
              <MacroSection
                disableAnimation
                title={<span id="landing-how-title">Come inizi</span>}
                description="Il percorso e lineare: dai dati che hai gia a una decisione piu chiara su come spendere."
                contentClassName="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-4 pt-12"
              >
                {LANDING_FLOW_STEPS.map((step) => (
                  <article key={step.stepLabel} className="flex flex-col gap-5">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-xl font-black tracking-tight text-primary shadow-[0_0_30px_rgba(var(--primary),0.15)]">
                      {step.stepLabel}
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold tracking-tight text-foreground">{step.title}</h3>
                      <p className="text-base font-medium leading-relaxed text-muted-foreground">{step.description}</p>
                    </div>
                  </article>
                ))}
              </MacroSection>
            </div>
          </section>

          {/* SECTION 6: OUTCOME */}
          <section className="px-4" aria-labelledby="landing-outcomes-title">
            <div className="mx-auto max-w-6xl">
              <MacroSection
                disableAnimation
                title={<span id="landing-outcomes-title">Cosa cambia davvero</span>}
                description="L'obiettivo non e impressionarti per cinque minuti. E aiutarti a prendere decisioni migliori sul tuo denaro mese dopo mese."
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

          {/* SECTION 7: CTA FINALE */}
          <section id="open-app" className="px-4 scroll-mt-24" aria-labelledby="landing-cta-title">
            <div className="mx-auto max-w-6xl">
              <div className="flex flex-col items-center justify-center text-center py-24 sm:py-40">
                <div className="flex flex-col items-center space-y-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                    Dati locali. Stime future. Quota sostenibile.
                  </p>
                  <h2 id="landing-cta-title" className="max-w-[20ch] text-5xl font-black tracking-tighter text-foreground sm:text-7xl">
                    Se vuoi una lettura piu chiara dei tuoi soldi, entra in Numa.
                  </h2>
                  <p className="max-w-xl text-base font-medium leading-relaxed text-muted-foreground sm:text-xl">
                    Inizia calcolando il tuo budget di base. Zero cloud, nessun account richiesto per la prima scansione.
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
          <div className="space-y-3">
            <BrandLogo variant="full" height={28} className="w-auto max-w-[140px]" />
            <p className="max-w-3xl text-sm font-medium leading-relaxed text-muted-foreground">
              Numa e una homepage pubblica per entrare nel prodotto dal punto giusto: prima capire il mese, poi guardare la stima, poi decidere con piu calma.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
