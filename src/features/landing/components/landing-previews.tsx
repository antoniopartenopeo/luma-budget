"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import {
  BrainCircuit,
  CheckCircle2,
  FileSpreadsheet,
  FlaskConical,
  LayoutDashboard,
  Sparkles,
  WalletCards
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  LANDING_STORY_POINTS,
  type LandingDemoStep
} from "../data"

function PreviewFrame({
  eyebrow,
  statusLabel,
  footerNote,
  children
}: {
  eyebrow: string
  statusLabel: string
  footerNote?: string
  children: ReactNode
}) {
  return (
    <div className="surface-strong flex h-[440px] w-full flex-col overflow-hidden p-4 sm:p-5 lg:h-[460px] lg:p-6">
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
          {eyebrow}
        </Badge>
        <Badge variant="outline" className="border-white/35 bg-white/50 dark:border-white/12 dark:bg-white/[0.05]">
          {statusLabel}
        </Badge>
      </div>

      <div className="my-4 flex-1 space-y-3 overflow-hidden">{children}</div>

      {footerNote ? (
        <div className="mt-auto shrink-0 rounded-[1.2rem] border border-primary/12 bg-primary/10 px-4 py-3">
          <p className="text-[13px] font-semibold leading-relaxed text-foreground">{footerNote}</p>
        </div>
      ) : null}
    </div>
  )
}

export function LandingHeroConsole() {
  return (
    <div className="surface-strong overflow-hidden p-6 sm:p-8">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
            Il Problema
          </Badge>
        </div>

        <div className="space-y-2">
          <h3 className="max-w-[20ch] text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            Perché le app classiche non bastano.
          </h3>
          <p className="max-w-3xl text-sm font-medium leading-relaxed text-muted-foreground sm:text-base">
            Registrare ogni singola transazione spesso crea solo ansia numerica. Serve un prodotto che ti aiuti a capire il mese che stai vivendo, senza costringerti a seguire moduli rigidi.
          </p>
        </div>

        <div className="space-y-3">
          {LANDING_STORY_POINTS.map((point) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
              className="surface-subtle p-4 sm:p-5"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] border border-primary/18 bg-primary/10 text-primary">
                  <point.icon className="h-5 w-5" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-base font-bold text-foreground">{point.title}</p>
                  <p className="text-sm font-medium leading-relaxed text-muted-foreground">{point.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="rounded-[1.5rem] border border-primary/14 bg-primary/10 px-4 py-4">
          <p className="text-sm font-semibold leading-relaxed text-foreground">
            Prima capisci il presente. Poi guardi la stima. Solo dopo decidi se aggiungere una nuova spesa fissa.
          </p>
        </div>
      </div>
    </div>
  )
}

function ImportPreview({ isActive }: { isActive: boolean }) {
  return (
    <PreviewFrame
      eyebrow="Import"
      statusLabel="Controllo locale"
      footerNote="L'import csv non entra alla cieca: prima si pulisce in automatico, poi lo confermi."
    >
      <div className="flex h-full flex-col items-center justify-center py-6">
        <motion.div 
          animate={isActive ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-primary/20 bg-primary/10 shadow-inner"
        >
          <FileSpreadsheet className="h-10 w-10 text-primary" />
          <motion.div 
             initial={{ scale: 0 }}
             animate={isActive ? { scale: 1 } : { scale: 0 }}
             transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 20 }}
             className="absolute -bottom-3 -right-3 flex h-10 w-10 items-center justify-center rounded-full border-4 border-background bg-emerald-500 text-white dark:border-[#0a0a0a]"
          >
            <CheckCircle2 className="h-5 w-5" />
          </motion.div>
        </motion.div>
        
        <div className="mt-8 space-y-2 px-4 text-center">
          <h4 className="text-xl font-black tracking-tight text-foreground">estratto-conto.csv</h4>
          <p className="mx-auto max-w-[24ch] text-sm font-medium leading-relaxed text-muted-foreground">
            78 movimenti elaborati, 3 duplicati scartati automaticamente.
          </p>
        </div>

        <div className="mt-8 flex w-full max-w-[200px] flex-col gap-2">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
            <motion.div 
               className="h-full rounded-full bg-primary" 
               initial={{ width: "0%" }} 
               animate={isActive ? { width: "100%" } : { width: "0%" }} 
               transition={{ delay: 0.1, duration: 1.2, ease: "easeOut" }} 
            />
          </div>
          <p className="text-center text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Pronto per il ledger</p>
        </div>
      </div>
    </PreviewFrame>
  )
}

function OverviewPreview({ isActive }: { isActive: boolean }) {
  return (
    <PreviewFrame
      eyebrow="Mese in corso"
      statusLabel="Una lettura sola"
      footerNote="Non devi aprire dieci tab per capire come sta andando il tuo mese in lettura."
    >
      <div className="flex h-full flex-col justify-center gap-3 py-1">
        <motion.div 
          animate={isActive ? { y: 0, opacity: 1 } : { y: 10, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-[1.5rem] border border-white/28 bg-white/60 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/72">Disponibile Mensile</p>
          <p className="mt-1 text-5xl sm:text-6xl font-black tracking-tighter text-foreground">€ 1.842</p>
          
          <div className="mt-5 space-y-2">
            <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
              <span className="text-foreground">Spese fisse (61%)</span>
              <span className="text-primary">Flessibile (39%)</span>
            </div>
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/5">
              <motion.div initial={{ width: 0 }} animate={isActive ? { width: "61%" } : { width: 0 }} transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }} className="h-full bg-foreground/20 dark:bg-white/20" />
              <motion.div initial={{ width: 0 }} animate={isActive ? { width: "39%" } : { width: 0 }} transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }} className="relative h-full overflow-hidden bg-primary">
                 <motion.div initial={{ x: "-100%" }} animate={isActive ? { x: "200%" } : { x: "-100%" }} transition={{ delay: 0.8, duration: 1.5, repeat: Infinity, repeatDelay: 3 }} className="absolute inset-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        <div className="flex gap-2">
          <motion.div 
            animate={isActive ? { y: 0, opacity: 1 } : { y: 10, opacity: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="flex-1 rounded-[1.2rem] border border-primary/20 bg-primary/10 p-3.5"
          >
            <LayoutDashboard className="mb-2 h-5 w-5 text-primary" />
            <p className="text-sm font-bold text-foreground">Focus Cibo</p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-primary">-93 € sttim.</p>
          </motion.div>
          <motion.div 
            animate={isActive ? { y: 0, opacity: 1 } : { y: 10, opacity: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="flex-1 rounded-[1.2rem] border border-white/28 bg-white/60 p-3.5 dark:border-white/10 dark:bg-white/[0.04]"
          >
            <WalletCards className="mb-2 h-5 w-5 text-muted-foreground/50" />
            <p className="text-sm font-bold text-foreground">Abitudini</p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">In linea</p>
          </motion.div>
        </div>
      </div>
    </PreviewFrame>
  )
}

function BrainPreview({ isActive }: { isActive: boolean }) {
  return (
    <PreviewFrame
      eyebrow="Brain"
      statusLabel="Stime in corso"
      footerNote="Il calcolo e puramente probabilistico: se l'affidabilita scende, torna allo storico."
    >
      <div className="flex h-full flex-col justify-center py-2">
        <motion.div 
          animate={isActive ? { scale: 1, opacity: 1 } : { scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[2rem] border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
        >
          {/* Topographic calculating pattern layer */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: "repeating-radial-gradient(circle at 100% 100%, transparent 0, transparent 12px, currentColor 12px, currentColor 13px)" }} />
          
          <motion.div 
             animate={isActive ? { rotate: 360 } : { rotate: 0 }}
             transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
             className="absolute -right-12 -top-12 opacity-[0.04] dark:opacity-[0.08]"
          >
             <BrainCircuit className="h-48 w-48 text-primary" />
          </motion.div>
          <div className="relative z-10 space-y-8">
            <div>
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Predizione Brain
              </p>
              <p className="mt-3 text-6xl sm:text-7xl font-black tracking-tighter text-foreground">€ 1.540</p>
              <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">
                Stima del margine disponibile alla fine del mese prossimo.
              </p>
            </div>

            <div className="rounded-[1.2rem] border border-white/40 bg-white/70 p-4 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-black/40">
              <div className="mb-2.5 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">Affidabilita Modello</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Alta (78%)</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={isActive ? { width: "78%" } : { width: 0 }} 
                  transition={{ delay: 0.3, duration: 1.5, ease: [0.22, 1, 0.36, 1] }} 
                  className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </PreviewFrame>
  )
}

function ScenarioPreview({ isActive }: { isActive: boolean }) {
  return (
    <PreviewFrame
      eyebrow="Financial Lab"
      statusLabel="Quota in eccesso"
      footerNote="La domanda qui non e quanto puoi spendere, ma quanto puoi bloccarti a lungo termine."
    >
      <div className="flex h-full flex-col justify-center gap-4 py-1">
        
        <motion.div 
          animate={isActive ? { y: 0, opacity: 1 } : { y: -10, opacity: 0 }}
          className="flex w-full items-center justify-between rounded-full border border-white/28 bg-white/60 p-1.5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
        >
           <div className="rounded-full bg-foreground px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-background shadow-sm">Baseline</div>
           <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Balanced</div>
           <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Focused</div>
        </motion.div>

        <motion.div 
          animate={isActive ? { scale: 1, opacity: 1 } : { scale: 0.95, opacity: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="relative overflow-hidden flex flex-col items-center justify-center rounded-[2rem] border border-primary/20 bg-primary/5 py-7 shadow-[inset_0_0_20px_rgba(var(--primary),0.05)]"
        >
           {/* Topographic calculating pattern layer */}
           <div className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.06]" style={{ backgroundImage: "repeating-radial-gradient(circle at 50% 0%, transparent 0, transparent 16px, currentColor 16px, currentColor 17px)" }} />
           
           <div className="relative z-10 flex flex-col items-center">
             <motion.div 
                animate={isActive ? { scale: [1, 1.05, 1] } : {}} 
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
             >
               <FlaskConical className="mb-3 h-8 w-8 text-primary opacity-90 drop-shadow-md" />
             </motion.div>
             <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Nuova Fissa Sostenibile</p>
             <h3 className="mt-1 text-6xl sm:text-7xl font-black tracking-tighter text-foreground drop-shadow-sm">+240 €</h3>
             <p className="mt-1.5 text-sm font-medium text-muted-foreground">aggiuntivi ogni mese</p>
           </div>
        </motion.div>

      </div>
    </PreviewFrame>
  )
}

export function LandingStepPreview({
  step,
  isActive
}: {
  step: LandingDemoStep
  isActive: boolean
}) {
  const PREVIEW_MAP: Record<LandingDemoStep["id"], React.FC<{ isActive: boolean }>> = {
    import: ImportPreview,
    overview: OverviewPreview,
    insights: BrainPreview,
    scenarios: ScenarioPreview
  }
  
  const Component = PREVIEW_MAP[step.id]
  return Component ? <Component isActive={isActive} /> : null
}
