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

      <header className="sticky top-0 z-40 px-4 pt-4">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 rounded-[2rem] border border-white/35 px-4 py-3 glass-chrome sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-center gap-3">
            <BrandLogo variant="full" height={28} />
            <span className="rounded-full border border-primary/18 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
              Local-first
            </span>
          </div>

          <Button asChild className="rounded-full px-5 shadow-lg shadow-primary/15">
            <Link href="/dashboard">
              Apri l&apos;app
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      <main id="main-content" className="relative pb-16 pt-8 sm:pt-10">
        <StaggerContainer className="space-y-8 sm:space-y-10">
          <motion.section variants={macroItemVariants} className="px-4" aria-labelledby="landing-hero-title">
            <div className="mx-auto max-w-6xl">
              <MacroSection contentClassName="space-y-6 pt-6 sm:pt-8">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                      Dati locali per default
                    </Badge>
                    <Badge variant="outline" className="border-white/35 bg-white/50 dark:border-white/12 dark:bg-white/[0.05]">
                      Brain interno
                    </Badge>
                    <Badge variant="outline" className="border-white/35 bg-white/50 dark:border-white/12 dark:bg-white/[0.05]">
                      Nessuna promessa gonfiata
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <SectionEyebrow>Finanza personale semplice</SectionEyebrow>
                    <h1
                      id="landing-hero-title"
                      className="max-w-[12ch] text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl"
                    >
                      Capisci il tuo mese prima che ti sfugga.
                    </h1>
                    <p className="max-w-3xl text-base font-medium leading-relaxed text-muted-foreground sm:text-lg">
                      Numa ti fa vedere dove stanno andando i tuoi soldi, cosa sta comprimendo il margine e cosa puoi correggere subito.
                      Lo fa con dati gestiti in locale, un Brain che stima fine mese e mese successivo, e un Financial Lab che ti dice quale nuova quota fissa puoi davvero sostenere.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button asChild size="lg" className="rounded-full px-6 shadow-lg shadow-primary/15">
                      <Link href="/dashboard">
                        Apri l&apos;app
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="rounded-full border-white/30 bg-white/60 px-6 dark:border-white/12 dark:bg-white/[0.06]">
                      <a href="#product-demo">Guarda come funziona</a>
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {LANDING_HERO_POINTS.map((point) => (
                    <div key={point.title} className="surface-subtle p-4 sm:p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] border border-primary/18 bg-primary/10 text-primary">
                          <point.icon className="h-5 w-5" />
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-base font-bold text-foreground">{point.title}</p>
                          <p className="text-sm font-medium leading-relaxed text-muted-foreground">{point.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <LandingHeroConsole />
              </MacroSection>
            </div>
          </motion.section>

          <motion.section variants={macroItemVariants} id="different" className="px-4 scroll-mt-24" aria-labelledby="landing-different-title">
            <div className="mx-auto max-w-6xl">
              <MacroSection
                title={<span id="landing-different-title">Perche Numa convince piu di un tracker classico</span>}
                description="Le app piu note oggi puntano soprattutto su cloud sync, rituali rigidi, automazioni genericamente intelligenti o promesse troppo facili. Numa sceglie un'altra strada."
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
                          <h3 className="text-xl font-bold tracking-tight text-foreground">{item.title}</h3>
                          <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                            {item.marketLabel}
                          </p>
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
                title={<span id="landing-demo-title">Scorrendo capisci il prodotto, non una presentazione</span>}
                description="La demo resta tutta verticale e usa feature reali gia presenti in Numa. Ogni passaggio ti mostra come entra il dato, come viene letto oggi e come Numa stima il dopo."
                contentClassName="pt-5"
              >
                <LandingProductDemo />
              </MacroSection>
            </div>
          </motion.section>

          <motion.section variants={macroItemVariants} id="how-it-works" className="px-4 scroll-mt-24" aria-labelledby="landing-how-title">
            <div className="mx-auto max-w-6xl">
              <MacroSection
                title={<span id="landing-how-title">Come funziona, in 4 passaggi</span>}
                description="Un solo prodotto, un solo linguaggio, un solo flusso chiaro dall'import al correttivo."
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
                title={<span id="landing-outcomes-title">Cosa ti porti a casa davvero</span>}
                description="Numa non vuole impressionarti per cinque minuti. Vuole aiutarti a capire meglio il tuo denaro ogni mese."
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
                  <SectionEyebrow>Privacy locale. Brain interno. Linguaggio chiaro.</SectionEyebrow>
                  <h2 id="landing-cta-title" className="max-w-[15ch] text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                    Se vuoi capire il tuo mese prima che ti sfugga, entra in Numa.
                  </h2>
                  <p className="max-w-3xl text-sm font-medium leading-relaxed text-muted-foreground sm:text-base">
                    Qui non trovi promesse magiche, solo un prodotto che legge i tuoi numeri in modo piu chiaro, privato e realistico.
                    Il prossimo passo e semplice: apri l&apos;app e parti dai dati che hai gia.
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
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">NUMA Budget</p>
            <p className="max-w-3xl text-sm font-medium leading-relaxed text-muted-foreground">
              Finanza personale locale-first, letture chiare, stime future con fonte dichiarata e Financial Lab dedicato alla quota mensile sostenibile.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
