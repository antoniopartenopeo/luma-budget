"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { AmbientBackdrop } from "@/components/layout/ambient-backdrop"
import { MacroSection, macroItemVariants } from "@/components/patterns/macro-section"
import { StaggerContainer } from "@/components/patterns/stagger-container"
import { Badge } from "@/components/ui/badge"
import { BrandLogo } from "@/components/ui/brand-logo"
import { Button } from "@/components/ui/button"
import {
  LANDING_DIFFERENTIATORS,
  LANDING_FLOW_STEPS,
  LANDING_HERO_POINTS,
  LANDING_OUTCOMES
} from "./data"
import { LandingHeroConsole } from "./components/landing-previews"
import { LandingProductDemo } from "./components/landing-product-demo"

function SectionEyebrow({ children }: { children: string }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
      {children}
    </p>
  )
}

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background selection:bg-primary/20">
      <AmbientBackdrop />

      <main id="main-content" className="relative pb-16 pt-8 sm:pt-10">
        <StaggerContainer className="space-y-10 sm:space-y-14">
          <motion.section variants={macroItemVariants} className="px-4" aria-labelledby="landing-hero-title">
            <div className="mx-auto max-w-5xl">
              <MacroSection contentClassName="space-y-8 pt-8 sm:pt-12">
                <div className="flex flex-col items-center text-center">
                  <BrandLogo
                    variant="full"
                    height={72}
                    className="w-auto max-w-[250px] sm:max-w-[320px] lg:max-w-[360px]"
                  />

                  <div className="mt-6 space-y-4">
                    <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                      App di finanza personale locale-first
                    </Badge>

                    <h1
                      id="landing-hero-title"
                      className="mx-auto max-w-[14ch] text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl"
                    >
                      L&apos;app che ti aiuta a capire il mese, non solo a registrare spese.
                    </h1>

                    <p className="mx-auto max-w-3xl text-base font-medium leading-relaxed text-muted-foreground sm:text-lg">
                      Numa ti fa vedere dove stanno andando i tuoi soldi, quanto potrebbe restarti a fine mese e se una nuova spesa fissa e davvero sostenibile.
                      Tutto con dati gestiti in locale.
                    </p>
                  </div>

                  <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
                    <Button asChild size="lg" className="rounded-full px-6 shadow-lg shadow-primary/15">
                      <Link href="/dashboard">
                        Apri l&apos;app
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>

                    <a
                      href="#different"
                      className="text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                    >
                      Scopri perche e diversa
                    </a>
                  </div>

                  <p className="mt-5 text-sm font-semibold leading-relaxed text-muted-foreground">
                    Dati locali per default. Stime future chiare. Quota sostenibile per nuove spese fisse.
                  </p>
                </div>
              </MacroSection>
            </div>
          </motion.section>

          <motion.section variants={macroItemVariants} id="why-numa" className="px-4 scroll-mt-24" aria-labelledby="landing-origin-title">
            <div className="mx-auto max-w-6xl">
              <MacroSection
                title={<span id="landing-origin-title">Perche nasce Numa</span>}
                description="Non per aggiungere altre schermate alla tua finanza personale, ma per renderla finalmente piu leggibile."
                contentClassName="space-y-5 pt-5"
              >
                <LandingHeroConsole />

                <div className="space-y-3">
                  <div className="space-y-2">
                    <SectionEyebrow>Tre cose che fai con Numa</SectionEyebrow>
                    <p className="max-w-3xl text-sm font-medium leading-relaxed text-muted-foreground sm:text-base">
                      Dentro lo stesso prodotto trovi una lettura del mese, una stima futura prudente e uno spazio per capire se una nuova spesa fissa e sostenibile.
                    </p>
                  </div>

                  {LANDING_HERO_POINTS.map((point) => (
                    <article key={point.title} className="surface-subtle p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] border border-primary/18 bg-primary/10 text-primary">
                          <point.icon className="h-5 w-5" />
                        </div>
                        <div className="space-y-1.5">
                          <h3 className="text-lg font-bold tracking-tight text-foreground">{point.title}</h3>
                          <p className="text-sm font-medium leading-relaxed text-muted-foreground">{point.description}</p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </MacroSection>
            </div>
          </motion.section>

          <motion.section variants={macroItemVariants} id="different" className="px-4 scroll-mt-24" aria-labelledby="landing-different-title">
            <div className="mx-auto max-w-6xl">
              <MacroSection
                title={<span id="landing-different-title">Perche e diversa da molti tracker</span>}
                description="La maggior parte delle app ti chiede prima cloud, metodo o automazioni promesse. Numa prova a fare il contrario: spiegarti il mese con piu chiarezza."
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
          </motion.section>

          <motion.section variants={macroItemVariants} id="product-demo" className="px-4 scroll-mt-24" aria-labelledby="landing-demo-title">
            <div className="mx-auto max-w-6xl">
              <MacroSection
                title={<span id="landing-demo-title">Guardala in 4 momenti</span>}
                description="Qui non stai vedendo un video o slide generiche. Stai vedendo una versione controllata del prodotto, resa piu semplice da capire mentre scorri."
                contentClassName="pt-5"
              >
                <LandingProductDemo />
              </MacroSection>
            </div>
          </motion.section>

          <motion.section variants={macroItemVariants} id="how-it-works" className="px-4 scroll-mt-24" aria-labelledby="landing-how-title">
            <div className="mx-auto max-w-6xl">
              <MacroSection
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
          </motion.section>

          <motion.section variants={macroItemVariants} className="px-4" aria-labelledby="landing-outcomes-title">
            <div className="mx-auto max-w-6xl">
              <MacroSection
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
          </motion.section>

          <motion.section variants={macroItemVariants} id="open-app" className="px-4 scroll-mt-24" aria-labelledby="landing-cta-title">
            <div className="mx-auto max-w-6xl">
              <div className="surface-strong overflow-hidden p-6 sm:p-8 lg:p-10">
                <div className="space-y-4">
                  <SectionEyebrow>Dati locali. Stime future. Quota sostenibile.</SectionEyebrow>
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
          </motion.section>
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
