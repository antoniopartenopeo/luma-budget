"use client"

import { startTransition, useState } from "react"
import type { ComponentType } from "react"
import type { LucideIcon } from "lucide-react"
import {
  ArrowDownUp,
  BrainCircuit,
  CreditCard,
  ShieldCheck,
  Sparkles,
  WalletCards
} from "lucide-react"
import { AnimatePresence, m } from "framer-motion"
import { cn } from "@/lib/utils"
function FloatingPill({ text, colorClass = "text-white/90" }: { text: string, colorClass?: string }) {
  return (
    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-40 flex items-center justify-center whitespace-nowrap rounded-full border border-black/[0.06] bg-white px-5 py-1.5 shadow-[0_6px_20px_rgba(0,0,0,0.08),_0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/90 dark:shadow-[0_8px_30px_rgba(0,0,0,0.8),_inset_0_1px_1px_rgba(255,255,255,0.1)] transition-colors duration-500">
      <span className={cn("text-[8px] sm:text-[9px] font-black tracking-[0.2em] uppercase", colorClass)}>
        {text}
      </span>
    </div>
  )
}

function ClarityPreview() {
  return (
    <div className="relative z-10 flex h-full flex-col justify-between px-5 py-6">
      <div className="space-y-5">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] dark:border-cyan-300/12 dark:bg-cyan-300/[0.08]">
          <BrainCircuit className="h-3.5 w-3.5 text-cyan-700 dark:text-cyan-200" />
          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-200">
            Stima locale attiva
          </span>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300">
            Margine del mese
          </span>
          <div className="space-y-2">
            <p className="text-4xl font-black tracking-tighter text-foreground sm:text-5xl">€ 1.245</p>
            <p className="max-w-[18rem] text-sm font-medium leading-relaxed text-foreground/62">
              Ti resta spazio per una nuova spesa fissa senza comprimere il mese.
            </p>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-black/6 bg-white/62 px-4 py-3 shadow-[0_18px_34px_-28px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/42">
                Lettura
              </p>
              <p className="mt-1 text-sm font-semibold tracking-tight text-foreground">
                Ricorrenze stabili, scenario sostenibile
              </p>
            </div>
            <div className="rounded-full border border-emerald-400/22 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700 dark:border-emerald-300/14 dark:bg-emerald-300/[0.08] dark:text-emerald-100">
              OK
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-3 rounded-[1.8rem] border border-black/6 bg-white/65 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex items-center justify-between text-xs font-semibold text-foreground/58">
            <span>Entrate note</span>
            <span>+ € 2.300</span>
          </div>
          <div className="h-2 rounded-full bg-black/5 dark:bg-white/8">
            <div className="h-full w-[72%] rounded-full bg-cyan-500 dark:bg-cyan-400" />
          </div>
          <div className="flex items-center justify-between text-xs font-semibold text-foreground/58">
            <span>Spese stimate</span>
            <span>- € 1.055</span>
          </div>
          <div className="h-2 rounded-full bg-black/5 dark:bg-white/8">
            <div className="h-full w-[46%] rounded-full bg-slate-400 dark:bg-white/32" />
          </div>
        </div>
      </div>
    </div>
  )
}

function TransactionsPreview() {
  return (
    <div className="relative z-10 flex h-full flex-col justify-between px-4 py-6">
      <div className="space-y-4">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-400/18 bg-slate-500/[0.08] px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] dark:border-white/10 dark:bg-white/[0.05]">
          <ArrowDownUp className="h-3.5 w-3.5 text-slate-700 dark:text-white/72" />
          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-700 dark:text-white/72">
            Lettura pulita
          </span>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-700 dark:text-slate-300">
            Ultimi movimenti
          </span>
          <p className="max-w-[18rem] text-sm font-medium leading-relaxed text-foreground/62">
            Numa separa subito entrate, uscite forti e piccole frizioni senza lasciarti nel rumore grezzo.
          </p>
        </div>

        <div className="rounded-[1.45rem] border border-black/6 bg-white/66 px-4 py-3 shadow-[0_18px_34px_-28px_rgba(15,23,42,0.2)] dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/42">Segnale</p>
              <p className="mt-1 text-sm font-semibold tracking-tight text-foreground">
                Le uscite ricorrenti emergono prima delle spese episodiche
              </p>
            </div>
            <div className="rounded-full border border-slate-400/18 bg-slate-500/[0.08] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/78">
              chiaro
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {[
          ["Affitto", "- € 690", "uscita forte"],
          ["Supermercato", "- € 58", "variabile"],
          ["Stipendio", "+ € 2.300", "entrata"],
        ].map(([label, value, date]) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-[1.35rem] border border-black/6 bg-white/76 px-4 py-3 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-white/[0.04]"
          >
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">{label}</p>
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-foreground/48">{date}</p>
            </div>
            <p className="text-sm font-black tracking-tight text-foreground">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function InputPreview() {
  return (
    <div className="relative z-10 flex h-full flex-col justify-between px-4 py-6">
      <div className="space-y-4">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/18 bg-emerald-500/[0.08] px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] dark:border-emerald-300/12 dark:bg-emerald-300/[0.08]">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-100" />
          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-100">
            Prova sicura
          </span>
        </div>

        <div className="rounded-[1.45rem] border border-black/6 bg-white/76 px-4 py-3 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-white/[0.04]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/46">Nuova spesa</p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-foreground/78">Cena con amici</p>
            <span className="rounded-full border border-black/6 bg-black/3 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-foreground/52 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/62">
              svago
            </span>
          </div>
        </div>

        <div className="rounded-[1.45rem] border border-emerald-400/22 bg-emerald-500/8 px-4 py-3 dark:border-emerald-300/12 dark:bg-emerald-300/[0.06]">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-100">
            Risposta immediata
          </p>
          <p className="mt-1 text-sm font-semibold tracking-tight text-foreground">
            Simuli l’idea senza sporcare il mese reale
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-[1fr_auto] gap-3">
          <div className="rounded-[1.2rem] border border-black/6 bg-white/72 px-4 py-3 text-sm font-black tracking-tight text-foreground dark:border-white/10 dark:bg-white/[0.04]">
            € 42,00
          </div>
          <div className="rounded-[1.2rem] border border-black/6 bg-white/72 px-4 py-3 text-sm font-semibold text-foreground/64 dark:border-white/10 dark:bg-white/[0.04]">
            scenario
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between rounded-[1.4rem] border border-emerald-400/24 bg-emerald-500/8 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-300/12 dark:bg-emerald-300/[0.06] dark:text-emerald-100">
          <span>Restano disponibili</span>
          <span>€ 1.203</span>
        </div>
      </div>
    </div>
  )
}

function SubscriptionsPreview() {
  return (
    <div className="relative z-10 flex h-full flex-col justify-between px-4 py-6">
      <div className="space-y-4">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-violet-400/18 bg-violet-500/[0.08] px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] dark:border-violet-300/12 dark:bg-violet-300/[0.08]">
          <Sparkles className="h-3.5 w-3.5 text-violet-700 dark:text-violet-100" />
          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-700 dark:text-violet-100">
            Peso ricorrente
          </span>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-violet-700 dark:text-violet-300">
            Spese fisse
          </span>
          <p className="max-w-[18rem] text-sm font-medium leading-relaxed text-foreground/62">
            Capisci subito cosa sta già occupando il mese prima ancora di pensare al resto.
          </p>
        </div>

        <div className="rounded-[1.45rem] border border-black/6 bg-white/66 px-4 py-3 shadow-[0_18px_34px_-28px_rgba(15,23,42,0.2)] dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/42">Impatto</p>
              <p className="mt-1 text-sm font-semibold tracking-tight text-foreground">
                Le ricorrenze assorbono la base del tuo margine
              </p>
            </div>
            <div className="rounded-full border border-violet-400/18 bg-violet-500/[0.08] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-violet-700 dark:border-violet-300/12 dark:bg-violet-300/[0.08] dark:text-violet-100">
              fisso
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {[
          ["Casa", "€ 690", "peso principale"],
          ["Palestra", "€ 29", "ricorrenza"],
          ["Streaming", "€ 16", "ricorrenza"],
        ].map(([label, value, cadence]) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-[1.35rem] border border-black/6 bg-white/74 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]"
          >
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">{label}</p>
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-foreground/46">{cadence}</p>
            </div>
            <p className="text-sm font-black tracking-tight text-foreground">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function SourcesPreview() {
  return (
    <div className="relative z-10 flex h-full flex-col justify-between px-4 py-6">
      <div className="space-y-4">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-orange-400/18 bg-orange-500/[0.08] px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] dark:border-orange-300/12 dark:bg-orange-300/[0.08]">
          <WalletCards className="h-3.5 w-3.5 text-orange-700 dark:text-orange-100" />
          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-700 dark:text-orange-100">
            Base ordinata
          </span>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-orange-700 dark:text-orange-300">
            Sorgenti
          </span>
          <p className="max-w-[18rem] text-sm font-medium leading-relaxed text-foreground/62">
            Porti dentro solo ciò che ti serve e Numa costruisce una base leggibile senza cloud e senza caos.
          </p>
        </div>

        <div className="rounded-[1.45rem] border border-black/6 bg-white/66 px-4 py-3 shadow-[0_18px_34px_-28px_rgba(15,23,42,0.2)] dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/42">Controllo</p>
              <p className="mt-1 text-sm font-semibold tracking-tight text-foreground">
                Ogni fonte resta esplicita e sotto la tua mano
              </p>
            </div>
            <div className="rounded-full border border-orange-400/18 bg-orange-500/[0.08] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-orange-700 dark:border-orange-300/12 dark:bg-orange-300/[0.08] dark:text-orange-100">
              locale
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {[
          ["Conto Principale", "sincronizzato a mano"],
          ["Carta Personale", "ultimi 30 giorni"],
          ["Carta Spese Fisse", "ricorrenze chiare"],
        ].map(([label, note]) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-[1.35rem] border border-black/6 bg-white/72 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-[1rem] bg-black/4 text-foreground/56 dark:bg-white/[0.06] dark:text-white/68">
              <CreditCard className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">{label}</p>
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-foreground/46">{note}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface PreviewCardDefinition {
  id: string
  title: string
  colorClass: string
  theme: "orange" | "slate" | "cyan" | "emerald" | "violet"
  icon: LucideIcon
  summary: string
  Preview: ComponentType
}

const CARDS: readonly PreviewCardDefinition[] = [
  {
    id: "sources",
    title: "Sorgenti",
    colorClass: "text-orange-700 dark:text-orange-400",
    theme: "orange",
    icon: WalletCards,
    summary: "Organizzi quello che hai gia senza ricostruire tutto a mano.",
    Preview: SourcesPreview
  },
  {
    id: "transactions",
    title: "Movimenti",
    colorClass: "text-slate-700 dark:text-slate-400",
    theme: "slate",
    icon: ArrowDownUp,
    summary: "Le uscite smettono di essere rumore e diventano lettura utile.",
    Preview: TransactionsPreview
  },
  {
    id: "clarity",
    title: "Visione Chiara",
    colorClass: "text-cyan-700 dark:text-cyan-400",
    theme: "cyan",
    icon: BrainCircuit,
    summary: "Vedi come Numa stima il margine del mese e quanto spazio hai davvero.",
    Preview: ClarityPreview
  },
  {
    id: "input",
    title: "Input Veloce",
    colorClass: "text-emerald-700 dark:text-emerald-400",
    theme: "emerald",
    icon: ShieldCheck,
    summary: "Provi una nuova spesa senza sporcare il tuo storico reale.",
    Preview: InputPreview
  },
  {
    id: "subscriptions",
    title: "Impatto Fisso",
    colorClass: "text-violet-700 dark:text-violet-400",
    theme: "violet",
    icon: Sparkles,
    summary: "Capisci quali abitudini ricorrenti stanno gia occupando il mese.",
    Preview: SubscriptionsPreview
  }
]

function getGlowColor(theme: PreviewCardDefinition["theme"]) {
  switch (theme) {
    case "emerald":
      return "var(--success)"
    case "cyan":
      return "var(--primary)"
    case "violet":
      return "oklch(0.64 0.17 315)"
    case "orange":
      return "oklch(0.72 0.16 60)"
    default:
      return "oklch(0.65 0 0)"
  }
}

export function LandingCoverFlow() {
  const [activeIndex, setActiveIndex] = useState(2)
  const totalCards = CARDS.length

  const activateCard = (index: number) => {
    startTransition(() => {
      setActiveIndex(index)
    })
  }

  const handleCardKeyDown = (index: number, event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault()
      activateCard((index + 1) % totalCards)
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault()
      activateCard((index - 1 + totalCards) % totalCards)
    }
  }

  return (
    <div className="relative mt-8 flex w-full flex-col items-center gap-6 overflow-visible sm:mt-16">
      <div className="relative flex h-[32rem] w-full items-center justify-center overflow-visible [perspective:2400px] sm:h-[36rem]">
      
      {CARDS.map((card, index) => {
        let distance = index - activeIndex
        if (distance > totalCards / 2) distance -= totalCards
        if (distance < -totalCards / 2) distance += totalCards

        const isCenter = distance === 0
        const isLeft1 = distance === -1
        const isRight1 = distance === 1
        const isLeft2 = distance === -2
        const isAdjacent = isLeft1 || isRight1

        const xOffset = isCenter ? 0 : isLeft1 ? -220 : isRight1 ? 220 : isLeft2 ? -380 : 380
        const zOffset = isCenter ? 0 : (isLeft1 || isRight1) ? -200 : -450
        const rotateY = isCenter ? 0 : isLeft1 ? 40 : isRight1 ? -40 : isLeft2 ? 65 : -65
        const scale = isCenter ? 1 : (isLeft1 || isRight1) ? 0.88 : 0.72
        const opacityTarget = isCenter ? 1 : (isLeft1 || isRight1) ? 0.35 : 0.05
        const Preview = card.Preview
        
        return (
          <m.button
            key={card.id}
            type="button"
            onClick={() => activateCard(index)}
            onKeyDown={(event) => handleCardKeyDown(index, event)}
            aria-label={`${card.title}. ${card.summary}`}
            aria-pressed={isCenter}
            className={cn(
               "absolute flex flex-col rounded-[2.5rem] text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
               "w-full max-w-[19rem] sm:max-w-[22rem] h-[26rem] sm:h-[30rem]",
               (!isCenter && !isAdjacent) && "max-sm:pointer-events-none max-sm:opacity-0",
               isCenter 
                ? "z-30 cursor-default border-black/10 dark:border-white/10"
                : isAdjacent
                  ? "z-20 cursor-pointer border-black/5 dark:border-white/5"
                  : "z-10 cursor-pointer pointer-events-none sm:pointer-events-auto"
            )}
            initial={false}
            animate={{
              x: xOffset,
              z: zOffset,
              rotateY: rotateY,
              scale: scale,
              opacity: opacityTarget
            }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 28,
              mass: 0.9
            }}
            style={{ transformStyle: "preserve-3d", willChange: "transform, opacity" }}
          >
             <div 
               className={cn(
                 "absolute inset-0 z-0 overflow-hidden rounded-[2.5rem] border backdrop-blur-3xl transition-[background-color,border-color,box-shadow,opacity] duration-700",
                 isCenter 
                  ? "bg-white/[0.93] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] dark:bg-zinc-950/80 dark:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] border-black/5 dark:border-white/10"
                  : "bg-white/60 shadow-2xl dark:bg-zinc-950/40 border-black/5 dark:border-white/5 hover:bg-white/80 dark:hover:bg-zinc-900/60",
                 !isCenter && "opacity-80"
               )}
             >
               <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-transparent dark:from-white/10 opacity-50 mix-blend-overlay pointer-events-none" />
               
               <AnimatePresence>
                 {isCenter && (
                   <m.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     transition={{ duration: 0.5 }}
                     className="absolute inset-0 pointer-events-none"
                   >
                     <div className="absolute inset-x-0 -bottom-32 h-64 blur-[90px] transition-colors duration-1000"
                          style={{
                            backgroundColor: getGlowColor(card.theme),
                            opacity: 0.15
                          }} 
                     />
                   </m.div>
                 )}
               </AnimatePresence>

               <div className="absolute inset-0 rounded-[2.5rem] pointer-events-none shadow-[inset_0_2px_6px_rgba(255,255,255,0.9),inset_0_-1px_2px_rgba(0,0,0,0.02)] dark:shadow-[inset_0_1px_3px_rgba(255,255,255,0.1),inset_0_-1px_1px_rgba(0,0,0,0.4)]" />
             </div>

             <FloatingPill text={card.title} colorClass={card.colorClass} />
             
             <div className="relative z-10 w-full h-full pointer-events-auto overflow-hidden rounded-[2.5rem]">
                <Preview />
             </div>

             {!isCenter ? (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-5">
                <div className="rounded-full border border-black/6 bg-white/62 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/52 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.05] dark:text-white/58">
                  Clicca per portare al centro
                </div>
              </div>
             ) : null}
          </m.button>
        )
      })}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 px-4" aria-label="Seleziona anteprima hero">
        {CARDS.map((card, index) => {
          const Icon = card.icon
          const isActive = index === activeIndex

          return (
            <button
              key={`selector-${card.id}`}
              type="button"
              onClick={() => activateCard(index)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition-[background-color,border-color,color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25",
                isActive
                  ? "border-primary/24 bg-primary/10 text-foreground shadow-[0_16px_30px_-22px_rgba(14,165,168,0.42)] dark:border-white/12 dark:bg-white/[0.06] dark:text-white"
                  : "border-black/6 bg-white/55 text-foreground/58 hover:border-black/10 hover:text-foreground dark:border-white/10 dark:bg-white/[0.04] dark:text-white/58 dark:hover:text-white/84"
              )}
              aria-pressed={isActive}
            >
              <Icon className="h-3.5 w-3.5" />
              {card.title}
            </button>
          )
        })}
      </div>
    </div>
  )
}
