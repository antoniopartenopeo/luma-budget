"use client"

import { useRef } from "react"
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion"
import { BrainCircuit, Cpu, Fingerprint, Focus } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const BRAIN_SIGNAL_LINES = [
  "CSV_IMPORT_BATCH: 78 MOVIMENTI",
  "DEDUPE_REVIEW: 3 CASI",
  "MERCHANT_GROUPING: STABILE",
  "MESE_CORRENTE: ATTIVO",
  "FORECAST_MODE: CORE READY",
  "FALLBACK_ROUTE: STORICO"
]

export function LandingBrainHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  // Physical inertia dampening for buttery smooth Apple-style animations
  // Lower stiffness & damping with higher mass creates an uninterrupted "video-like" glide
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 10,
    damping: 20,
    mass: 2,
    restDelta: 0.001
  })

  const sceneOpacity = useTransform(smoothProgress, [0, 0.08], [0, 1])
  
  // Dramatic 3D Separation with Macro Depth of Field
  const bottomY = useTransform(smoothProgress, [0.1, 0.35], [0, 180])
  const bottomScale = useTransform(smoothProgress, [0.1, 0.35], [1, 0.55])
  const bottomOpacity = useTransform(smoothProgress, [0.1, 0.35], [1, 0.15])
  const bottomRotateX = useTransform(smoothProgress, [0.1, 0.35], [0, 35])
  const bottomBlur = useTransform(smoothProgress, [0.1, 0.35], ["blur(0px)", "blur(12px)"])

  const middleY = useTransform(smoothProgress, [0.1, 0.35], [0, 80])
  const middleScale = useTransform(smoothProgress, [0.1, 0.35], [1, 0.85])
  const middleOpacity = useTransform(smoothProgress, [0.1, 0.35], [1, 0.6])
  const middleRotateX = useTransform(smoothProgress, [0.1, 0.35], [0, 15])
  const middleBlur = useTransform(smoothProgress, [0.1, 0.35], ["blur(0px)", "blur(4px)"])

  const topY = useTransform(smoothProgress, [0.1, 0.35], [0, -20])
  const topScale = useTransform(smoothProgress, [0.1, 0.35], [1, 1.08])
  
  const textOpacity = useTransform(smoothProgress, [0.08, 0.24], [1, 0])
  const topContentOpacity = useTransform(smoothProgress, [0.45, 0.50], [1, 0])
  const layerBorderRadius = useTransform(smoothProgress, [0.45, 0.50], ["24px", "180px"])
  
  const finalScale = useTransform(smoothProgress, [0.50, 0.65], [1, 15])
  const bgY = useTransform(smoothProgress, [0, 1], ["0%", "35%"])
  
  const maskOpacity = useTransform(smoothProgress, [0.45, 0.50], [0, 1])
  const revealOpacity = useTransform(smoothProgress, [0.60, 0.70], [0, 1])
  const revealY = useTransform(smoothProgress, [0.60, 0.70], [20, 0])

  if (prefersReducedMotion) {
    return (
      <div className="px-4">
        <div className="mx-auto max-w-6xl">
          <div className="surface-strong overflow-hidden p-6 sm:p-8 lg:p-10">
            <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              <div className="space-y-4">
                <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                  Numa Brain
                </Badge>
                <div className="space-y-3">
                  <h2 id="landing-brain-hero-title" className="max-w-[16ch] text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                    Quando il Brain e pronto, ti mostra il possibile dopo.
                  </h2>
                  <p className="max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground sm:text-base">
                    La previsione resta prudente: dichiara l&apos;affidabilita del modello e torna allo storico quando non ci sono ancora abbastanza segnali.
                  </p>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/35 bg-white/70 p-5 shadow-xl dark:border-white/10 dark:bg-white/[0.05]">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                      <Focus className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Margine Mese Prossimo</p>
                      <p className="text-3xl font-black tracking-tighter text-foreground">EUR 1540</p>
                    </div>
                  </div>
                  <div className="rounded-[1.35rem] border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">Affidabilita 78%</p>
                    <p className="mt-1 text-sm font-medium leading-relaxed text-foreground">
                      Se l&apos;affidabilita scende, Numa dichiara il fallback e usa la base storica.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative h-[600vh] w-full bg-background [perspective:1000px]">
      <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-center overflow-hidden">
        <motion.div style={{ y: bgY, opacity: textOpacity }} className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <h2 className="text-center text-[12vw] leading-none font-black tracking-tighter text-black/[0.03] dark:text-white/[0.02]">
            POSSIBILE
            <br />
            DOPO
          </h2>
        </motion.div>

        <motion.div style={{ opacity: textOpacity }} className="absolute top-20 z-50 px-6 text-center md:top-28">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Numa Brain</p>
          <h2 id="landing-brain-hero-title" className="mx-auto max-w-3xl text-4xl leading-tight font-black tracking-tight text-foreground md:text-6xl">
            Quando il Brain e pronto, ti mostra il possibile dopo.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground sm:text-base">
            Le previsioni restano advisory: mostrano affidabilita reale e tornano allo storico quando il modello non e ancora pronto.
          </p>
        </motion.div>

        <motion.div style={{ opacity: sceneOpacity }} className="relative z-10 flex h-[300px] w-[300px] items-center justify-center sm:h-[360px] sm:w-[360px]">
          {/* Intense Core Backlight Glow */}
          <motion.div 
             style={{ scale: middleScale, opacity: bottomOpacity }}
             className="absolute inset-0 -z-10 rounded-full bg-primary/20 blur-[80px]" 
          />

          <motion.div
            style={{ y: bottomY, scale: bottomScale, opacity: bottomOpacity, rotateX: bottomRotateX, filter: bottomBlur }}
            className="absolute inset-0 z-0 flex flex-col items-center justify-center overflow-hidden rounded-[24px] border border-white/20 bg-background/80 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-black/90"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,168,0.18),_transparent_58%)]" />
            <div className="space-y-1 text-center font-mono text-[10px] opacity-70 sm:text-[11px]">
              {BRAIN_SIGNAL_LINES.concat(BRAIN_SIGNAL_LINES).map((line, index) => (
                <p key={`${line}-${index}`} className="text-foreground/60">
                  {line}
                </p>
              ))}
            </div>
          </motion.div>

          <motion.div
            style={{ y: middleY, scale: middleScale, opacity: middleOpacity, rotateX: middleRotateX, filter: middleBlur }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center overflow-hidden rounded-[24px] border border-primary/40 bg-background/60 p-6 shadow-[0_30px_80px_rgba(14,165,168,0.25)] backdrop-blur-xl dark:bg-black/70"
          >
            <Cpu className="absolute -left-10 h-40 w-40 text-primary/30" />
            <BrainCircuit className="absolute -right-10 bottom-0 h-40 w-40 text-primary/30" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-primary/50 bg-primary/20 shadow-[0_0_60px_rgba(14,165,168,0.4)]">
              <Fingerprint className="h-10 w-10 text-primary opacity-80" />
            </div>
          </motion.div>

          <motion.div
            style={{ y: topY, scale: finalScale, borderRadius: layerBorderRadius }}
            className="absolute inset-0 z-20 origin-center overflow-hidden bg-white/80 p-6 backdrop-blur-2xl dark:bg-[#070707]/90"
          >
            {/* The actual border and shadow that fades out before the lens explodes, preventing massive scaling artifacts */}
            <motion.div 
               style={{ opacity: topContentOpacity }}
               className="pointer-events-none absolute inset-0 rounded-[inherit] border border-white/50 shadow-[0_40px_100px_rgba(0,0,0,0.1)] dark:border-white/15 dark:shadow-[0_60px_120px_rgba(0,0,0,0.8)]"
            />
            
            {/* Cinematic expanding shadow contour to make the explosion pop against the dark background */}
            <motion.div 
               style={{ opacity: useTransform(smoothProgress, [0.50, 0.65], [0, 1]) }}
               className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[0_0_1px_rgba(0,0,0,0.8)] ring-1 ring-black/10 dark:shadow-[0_0_2px_rgba(255,255,255,0.6)] dark:ring-white/20"
            />

            <motion.div style={{ opacity: maskOpacity }} className="absolute inset-0 bg-background" />

            <motion.div style={{ opacity: topContentOpacity, scale: topScale }} className="relative z-10 flex h-full flex-col items-center justify-center text-center">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-primary/20 bg-primary/10 shadow-inner">
                <Focus className="h-6 w-6 text-primary" />
              </div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Margine Mese Prossimo</p>
              <h3 className="text-5xl font-black tracking-tighter text-foreground">EUR 1540</h3>
              <p className="mt-5 inline-block rounded-full bg-emerald-500/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Affidabilita 78%
              </p>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* The Post-Explosion Reveal */}
        <motion.div
           style={{ opacity: revealOpacity, y: revealY }}
           className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 text-center pointer-events-none"
        >
           <h3 className="text-4xl md:text-6xl font-black tracking-tight text-foreground max-w-3xl">
             Il tuo mese, <br /> finalmente sotto controllo.
           </h3>
           <p className="mt-6 text-lg font-medium text-muted-foreground">
             Il Brain di Numa pensa al futuro.<br/>A te resta solo vivere il presente.
           </p>
        </motion.div>
      </div>
    </div>
  )
}
