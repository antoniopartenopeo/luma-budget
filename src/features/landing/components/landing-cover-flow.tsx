"use client"

import { useState } from "react"
import { m, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

// Import ICONE
import { 
  ActivitySquare, 
  CreditCard 
} from "lucide-react"

// Import VERI COMPONENTI Numa Strutturali Funzionali
import { KpiCard } from "@/components/patterns/kpi-card"
import { QuickExpenseInput } from "@/features/transactions/components/quick-expense-input"
import { TransactionRowCard } from "@/features/transactions/components/transaction-row-card"
import { UsedCardsKpiDeck } from "@/features/dashboard/components/used-cards-kpi-deck"
import { SubscriptionPortfolioCard, type SubscriptionPortfolioItem } from "@/components/patterns/subscription-portfolio-card"

// Import TYPES
import type { Transaction } from "@/features/transactions/api/types"
import type { DashboardCardUsage } from "@/features/dashboard/api/types"

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1",
    description: "Ristorante Da Mario",
    amountCents: 4500,
    type: "expense",
    date: new Date().toISOString(),
    category: "Dining Out",
    categoryId: "dining",
    isSuperfluous: true,
  },
  {
    id: "tx-2",
    description: "Amazon Prime",
    amountCents: 499,
    type: "expense",
    date: new Date().toISOString(),
    category: "Subscriptions",
    categoryId: "software",
    isSuperfluous: true,
  },
  {
    id: "tx-3",
    description: "Stipendio Mensile",
    amountCents: 185000,
    type: "income",
    date: new Date().toISOString(),
    category: "Salary",
    categoryId: "income",
    isSuperfluous: false,
  }
]

const MOCK_CARDS: DashboardCardUsage[] = [
  { cardId: 'c1', network: 'Mastercard', last4: '8821', status: 'active', confidence: 'high', walletProvider: 'Apple Pay', lastSeen: new Date().toISOString(), firstSeen: new Date().toISOString() },
  { cardId: 'c2', network: 'Visa', last4: '0491', status: 'active', confidence: 'medium', walletProvider: 'Nessuno', lastSeen: new Date().toISOString(), firstSeen: new Date().toISOString() },
]

const MOCK_SUBSCRIPTIONS: SubscriptionPortfolioItem[] = [
  { id: 'sub1', description: 'Netflix Premium', categoryId: 'movies', categoryLabel: 'Film', amountCents: 1599, occurrences: 12, impactPct: 4.2, transactionsHref: '#' },
  { id: 'sub2', description: 'Palestra FitActive', categoryId: 'gym', categoryLabel: 'Salute', amountCents: 2990, occurrences: 6, impactPct: 7.0, transactionsHref: '#' },
  { id: 'sub3', description: 'Aruba Hosting', categoryId: 'tools', categoryLabel: 'Lavoro', amountCents: 3499, occurrences: 4, impactPct: 8.5, transactionsHref: '#' },
]

// --- Mockups Wrap of Real Components --- //

function CardsAppMockup() {
  return (
    <div className="relative z-10 flex h-full w-full flex-col px-4 pt-10 overflow-hidden">
      <div className="flex flex-col gap-1 items-center mb-6">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-600 dark:text-orange-400">Metodi Tracciati</span>
        <div className="h-1 w-8 rounded-full bg-orange-500/20" />
      </div>
      
      <div className="w-[135%] origin-top-left scale-[0.74] ml-0">
        <UsedCardsKpiDeck 
            cards={MOCK_CARDS} 
            showHeader={false} 
        />
        {/* Decorative Fake Skeleton for remainder */}
        <div className="mt-4 opacity-50 space-y-4 pointer-events-none">
             <div className="h-32 w-full rounded-[1.9rem] bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-sm" />
        </div>
      </div>
    </div>
  )
}

function SubscriptionsAppMockup() {
  return (
    <div className="relative z-10 flex h-full w-full flex-col px-4 pt-10 overflow-hidden">
      <div className="flex flex-col gap-1 items-center mb-6">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-violet-600 dark:text-violet-400">Piani Ricorrenti</span>
        <div className="h-1 w-8 rounded-full bg-violet-500/20" />
      </div>
      
      <div className="w-[135%] origin-top-left scale-[0.74] ml-0">
         <SubscriptionPortfolioCard 
            items={MOCK_SUBSCRIPTIONS} 
            hiddenCount={1} 
            formatAmount={(cents) => `€ ${(cents / 100).toLocaleString("it-IT", { minimumFractionDigits: 2 })}`}
         />
      </div>
    </div>
  )
}

function TransactionsAppMockup() {
  return (
    <div className="relative z-10 flex h-full flex-col px-4 py-8 w-full gap-3 overflow-hidden">
      <div className="flex items-center gap-2 px-1 mb-2">
        <ActivitySquare className="h-4 w-4 text-slate-400" />
        <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Storico App</span>
      </div>
      <div className="w-[120%] origin-top-left scale-[0.833] ml-0">
        <div className="flex flex-col gap-2.5 w-full">
          {MOCK_TRANSACTIONS.map(tx => (
            <TransactionRowCard key={tx.id} transaction={tx} layout="compact" showChevron className="shadow-lg border-black/5 dark:border-white/5" />
          ))}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/90 dark:from-black/90 to-transparent pointer-events-none rounded-b-[2.5rem]" />
    </div>
  )
}

function KpiAppMockup() {
  return (
    <div className="relative z-10 flex h-full flex-col px-4 sm:px-6 justify-center">
      <div className="mb-6 flex flex-col gap-1 items-center">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">Marginimetro</span>
        <div className="h-1 w-8 rounded-full bg-cyan-500/20" />
      </div>
      <KpiCard
        title="Quanto ti resta"
        value="€ 1.450,50"
        animatedValue={145050}
        formatFn={(v) => `€ ${(v / 100).toLocaleString("it-IT", { minimumFractionDigits: 2 })}`}
        comparisonLabel="Periodo attivo"
        tone="positive"
        icon={CreditCard}
        description="Il saldo del periodo corrente mostra quanto margine hai al netto delle spese fisse periodiche."
        explainabilityText="Buffer di ricchezza libero."
        className="shadow-2xl h-auto border-white/30 dark:border-white/10"
      />
    </div>
  )
}

function ExpenseAppMockup() {
  return (
    <div className="relative z-10 flex h-full flex-col px-4 pt-10 pb-6 w-full">
      <div className="flex flex-col gap-1 items-center mb-8">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Punto Inserimento</span>
        <div className="h-1 w-8 rounded-full bg-emerald-500/20" />
      </div>
      <div className="w-full">
        <QuickExpenseInput variant="mobile-panel" />
      </div>
      {/* Scheletro UI per riempire il resto della card fedelmente come un app canvas */}
      <div className="mt-8 space-y-3 opacity-30 pointer-events-none select-none">
        <div className="h-14 w-full rounded-2xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-sm" />
        <div className="h-14 w-full rounded-2xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-sm" />
        <div className="h-14 w-full rounded-2xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-sm" />
      </div>
    </div>
  )
}

// --- Pillola Tipografica Superiore --- //
function FloatingPill({ text, colorClass = "text-white/90" }: { text: string, colorClass?: string }) {
  return (
    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-40 flex items-center justify-center whitespace-nowrap rounded-full border border-black/[0.06] bg-white px-5 py-1.5 shadow-[0_6px_20px_rgba(0,0,0,0.08),_0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/90 dark:shadow-[0_8px_30px_rgba(0,0,0,0.8),_inset_0_1px_1px_rgba(255,255,255,0.1)] transition-colors duration-500">
      <span className={cn("text-[8px] sm:text-[9px] font-black tracking-[0.2em] uppercase", colorClass)}>
        {text}
      </span>
    </div>
  )
}

// --- Motore Dati della Ghiera a 5 --- //
const CARDS = [
  { id: 'cards', component: CardsAppMockup, title: "Sorgenti", colorClass: "text-orange-700 dark:text-orange-400", theme: "orange" },
  { id: 'transactions', component: TransactionsAppMockup, title: "Lista Cruda", colorClass: "text-slate-700 dark:text-slate-400", theme: "slate" },
  { id: 'dashboard', component: KpiAppMockup, title: "Visione Chiara", colorClass: "text-cyan-700 dark:text-cyan-400", theme: "cyan" },
  { id: 'expense', component: ExpenseAppMockup, title: "Input Veloce", colorClass: "text-emerald-700 dark:text-emerald-400", theme: "emerald" },
  { id: 'subscriptions', component: SubscriptionsAppMockup, title: "Impatto Fisso", colorClass: "text-violet-700 dark:text-violet-400", theme: "violet" }
]

export function LandingCoverFlow() {
  const [activeIndex, setActiveIndex] = useState(2)

  return (
    <div className="relative mt-8 sm:mt-16 flex w-full h-[32rem] sm:h-[36rem] items-center justify-center [perspective:2400px] overflow-visible">
      
      {CARDS.map((card, index) => {
        // Calcolo della distanza in logica "Ghiera ad anello a 5" (Modulo 5)
        let distance = index - activeIndex
        // Normalizzazione rapida per wrap-around
        if (distance > 2) distance -= 5
        if (distance < -2) distance += 5

        const isCenter = distance === 0
        const isLeft1 = distance === -1
        const isRight1 = distance === 1
        const isLeft2 = distance === -2
        const isRight2 = distance === 2

        // Parametri Fisici 3D calibrati per uno scaglione morbido e cinematico
        const xOffset = isCenter ? 0 : isLeft1 ? -220 : isRight1 ? 220 : isLeft2 ? -380 : 380
        const zOffset = isCenter ? 0 : (isLeft1 || isRight1) ? -200 : -450
        const rotateY = isCenter ? 0 : isLeft1 ? 40 : isRight1 ? -40 : isLeft2 ? 65 : -65
        const scale = isCenter ? 1 : (isLeft1 || isRight1) ? 0.88 : 0.72
        
        // Opacità sproporzionata per enfatizzare la messa a fuoco (isCenter assoluta)
        const opacityTarget = isCenter ? 1 : (isLeft1 || isRight1) ? 0.35 : 0.05
        
        return (
          <m.div
            key={card.id}
            onClick={() => setActiveIndex(index)}
            className={cn(
               "absolute flex flex-col rounded-[2.5rem] transition-colors",
               "w-full max-w-[19rem] sm:max-w-[22rem] h-[26rem] sm:h-[30rem]",
               // Nascondo del tutto su mobile le carte esterne per mantenere il layout intatto su iPhone 11/12
               (!isCenter && !isLeft1 && !isRight1) && "max-sm:!opacity-0 max-sm:pointer-events-none",
               isCenter 
                ? "z-30 cursor-default border-black/10 dark:border-white/10"
                : (isLeft1 || isRight1)
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
             {/* Background & Glass Materials */}
             <div 
               className={cn(
                 "absolute inset-0 z-0 overflow-hidden rounded-[2.5rem] border backdrop-blur-3xl transition-all duration-700",
                 isCenter 
                  ? "bg-white/[0.93] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] dark:bg-zinc-950/80 dark:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] border-black/5 dark:border-white/10"
                  : "bg-white/60 shadow-2xl dark:bg-zinc-950/40 border-black/5 dark:border-white/5 hover:bg-white/80 dark:hover:bg-zinc-900/60",
                 // Rimosso il blur-[1px] per accelerazione GPU (evita pesante ricalcolo gaussiano ad ogni frame)
                 !isCenter && "opacity-80"
               )}
             >
               {/* Ambient Glow */}
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
                            backgroundColor: card.theme === 'emerald' ? 'var(--emerald-400)' 
                                            : card.theme === 'cyan' ? 'var(--cyan-400)' 
                                            : card.theme === 'violet' ? 'var(--violet-400)' 
                                            : card.theme === 'orange' ? 'var(--orange-400)' 
                                            : 'var(--slate-400)',
                            opacity: 0.15
                          }} 
                     />
                   </m.div>
                 )}
               </AnimatePresence>

               {/* Inset shadow (Glass thickness) */}
               <div className="absolute inset-0 rounded-[2.5rem] pointer-events-none shadow-[inset_0_2px_6px_rgba(255,255,255,0.9),inset_0_-1px_2px_rgba(0,0,0,0.02)] dark:shadow-[inset_0_1px_3px_rgba(255,255,255,0.1),inset_0_-1px_1px_rgba(0,0,0,0.4)]" />
             </div>

             <FloatingPill text={card.title} colorClass={card.colorClass} />
             
             {/* THE ACTUAL REAL APP COMPONENTS MOUNTED HERE */}
             <div className="relative z-10 w-full h-full pointer-events-auto">
                <card.component />
             </div>
             
             {/* Scudo hardware per intercettare click e focus prima che raggiungano i componenti veri se la carta non è a fuoco */}
             {!isCenter && <div className="absolute inset-0 z-50 cursor-pointer" title="Clicca per portare al centro" />}
          </m.div>
        )
      })}
    </div>
  )
}
