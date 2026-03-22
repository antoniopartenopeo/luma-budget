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

      <main id="main-content" className="relative pb-16">
        <StaggerContainer className="space-y-16 sm:space-y-24">
          
          {/* SECTION 1: HERO IMMERSIVE */}
          <section
            className="relative flex min-h-[90vh] w-full flex-col items-center justify-center overflow-hidden px-4 py-20"
            aria-labelledby="landing-hero-title"
          >
            {/* Immersive background layer */}
            <div className="absolute inset-0 z-0 bg-background pointer-events-none" />
            <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />

            <div className="relative z-10 flex w-full max-w-4xl flex-col items-center text-center">
              <BrandLogo
                variant="full"
                height={84}
                className="mb-10 w-auto max-w-[280px] sm:max-w-[360px] lg:max-w-[420px]"
              />

              <div className="space-y-6">
                <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                  App di finanza personale locale-first
                </Badge>

                <h1
                  id="landing-hero-title"
                  className="mx-auto max-w-[15ch] text-5xl font-black tracking-tight text-foreground sm:text-6xl lg:text-7xl"
                >
                  <CinematicTextReveal text="L'app che ti aiuta a capire il mese, non solo a registrare spese." />
                </h1>

                <p className="mx-auto max-w-2xl text-base font-medium leading-relaxed text-muted-foreground sm:text-lg lg:text-xl">
                  Numa ti fa vedere dove stanno andando i tuoi soldi, quanto potrebbe restarti a fine mese e se una nuova spesa fissa e davvero sostenibile.
                </p>
              </div>

              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
                <Button asChild size="lg" className="rounded-full px-8 shadow-lg shadow-primary/15">
                  <Link href="/dashboard">
                    Apri l&apos;app
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>

                <a
                  href="#problema"
                  className="text-sm font-semibold text-primary transition-colors hover:text-primary/80"
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
                contentClassName="space-y-3 pt-5"
              >
                {LANDING_DIFFERENTIATORS.map((item) => (
                  <article key={item.title} className="surface-subtle p-5">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] border border-primary/18 bg-primary/10 text-primary">
                          <item.icon className="h-5 w-5" />
                        </div>
                        <div className="space-y-1.5">
                          <h3 className="text-lg font-bold tracking-tight text-foreground">{item.title}</h3>
                          <p className="text-sm font-medium leading-relaxed text-muted-foreground">{item.marketLabel}</p>
                        </div>
                      </div>

                      <div className="rounded-[1.4rem] border border-primary/14 bg-primary/10 px-4 py-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Con Numa</p>
                        <p className="mt-2 text-sm font-medium leading-relaxed text-foreground">{item.numaLabel}</p>
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

          {/* SECTION 5: COME FUNZIONA */}
          <section id="come-funziona" className="px-4 scroll-mt-24" aria-labelledby="landing-how-title">
            <div className="mx-auto max-w-6xl">
              <MacroSection
                disableAnimation
                title={<span id="landing-how-title">Come inizi</span>}
                description="Il percorso e lineare: dai dati che hai gia a una decisione piu chiara su come spendere."
                contentClassName="space-y-3 pt-5"
              >
                {LANDING_FLOW_STEPS.map((step) => (
                  <article key={step.stepLabel} className="surface-subtle p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/18 bg-primary/10 text-sm font-black tracking-tight text-primary">
                        {step.stepLabel}
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="text-lg font-bold tracking-tight text-foreground">{step.title}</h3>
                        <p className="text-sm font-medium leading-relaxed text-muted-foreground">{step.description}</p>
                      </div>
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
                contentClassName="space-y-3 pt-5"
              >
                {LANDING_OUTCOMES.map((outcome) => (
                  <article key={outcome.title} className="surface-subtle p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] border border-primary/18 bg-primary/10 text-primary">
                        <outcome.icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="text-lg font-bold tracking-tight text-foreground">{outcome.title}</h3>
                        <p className="text-sm font-medium leading-relaxed text-muted-foreground">{outcome.description}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </MacroSection>
            </div>
          </section>

          {/* SECTION 7: CTA FINALE */}
          <section id="open-app" className="px-4 scroll-mt-24" aria-labelledby="landing-cta-title">
            <div className="mx-auto max-w-6xl">
              <div className="surface-strong overflow-hidden p-6 sm:p-8 lg:p-10">
                <div className="space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Dati locali. Stime future. Quota sostenibile.</p>
                  <h2 id="landing-cta-title" className="max-w-[16ch] text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                    Se vuoi una lettura piu chiara dei tuoi soldi, entra in Numa.
                  </h2>
                  <p className="max-w-3xl text-sm font-medium leading-relaxed text-muted-foreground sm:text-base">
                    Nessuna promessa gonfiata. Solo un prodotto che ti aiuta a capire il mese, vedere il possibile dopo e valutare una nuova spesa fissa con piu prudenza.
                  </p>

                  <Button asChild size="lg" className="rounded-full px-6 shadow-lg shadow-primary/15">
                    <Link href="/dashboard">
                      Apri l&apos;app
                      <ArrowRight className="h-4 w-4" />
                    </Link>
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
