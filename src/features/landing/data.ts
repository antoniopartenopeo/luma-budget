import type { LucideIcon } from "lucide-react"
import {
  ArrowDownUp,
  BrainCircuit,
  CloudOff,
  ShieldCheck,
  Sparkles,
  WalletCards
} from "lucide-react"

export interface LandingStoryPoint {
  icon: LucideIcon
  title: string
  description: string
}

export interface LandingDifferentItem {
  icon: LucideIcon
  title: string
  marketLabel: string
  numaLabel: string
}

export interface LandingFlowStep {
  icon: LucideIcon
  cue: string
  stepLabel: string
  title: string
  description: string
}

export interface LandingOutcome {
  icon: LucideIcon
  title: string
  description: string
}

export interface LandingHeroEditorialPanel {
  icon: LucideIcon
  title: string
  description: string
}

export interface LandingHeroEditorialContent {
  srTitle: string
  headline: string
  primaryCtaLabel: string
  secondaryCtaLabel: string
  supportingCopy: string
  panels: LandingHeroEditorialPanel[]
}

export const LANDING_STORY_POINTS: LandingStoryPoint[] = [
  {
    icon: WalletCards,
    title: "Passato, non margine",
    description: "Molti tracker si fermano alle uscite registrate. Il punto, invece, è capire quanto spazio hai davvero nel mese in corso."
  },
  {
    icon: ShieldCheck,
    title: "Dati con confini chiari",
    description: "Numa lavora in locale, senza trasformare il tuo quadro finanziario in un dato da affidare a un servizio remoto."
  },
  {
    icon: BrainCircuit,
    title: "Stima per decidere",
    description: "Vedere quanto potrebbe restare è utile solo quando quella stima ti aiuta a valutare una rata, un abbonamento o una nuova spesa fissa."
  }
]

export const LANDING_DIFFERENTIATORS: LandingDifferentItem[] = [
  {
    icon: CloudOff,
    title: "Il cloud non è invitato",
    marketLabel: "Ti obbligano a caricare l'estratto conto sui loro server.",
    numaLabel: "Numa elabora tutto nel tuo browser. I dati non escono dal dispositivo."
  },
  {
    icon: ShieldCheck,
    title: "Nessun accesso alla banca",
    marketLabel: "Chiedono connessioni dirette e le credenziali del tuo conto.",
    numaLabel: "Lavori solo con file scaricati da te. Nessun ponte aperto tra noi e i tuoi risparmi."
  },
  {
    icon: BrainCircuit,
    title: "Anche l'IA è offline",
    marketLabel: "Le stime vengono inviate ad algoritmi esterni e opachi.",
    numaLabel: "Il Brain calcola le proiezioni in locale. Nessuna API esterna nel percorso principale."
  }
]

export const LANDING_FLOW_STEPS: LandingFlowStep[] = [
  {
    icon: WalletCards,
    cue: "Importa i dati",
    stepLabel: "01",
    title: "Parti da un estratto conto",
    description: "Carichi il file esportato dalla banca. Numa organizza i movimenti, segnala le anomalie e ti lascia il controllo prima di elaborare."
  },
  {
    icon: ArrowDownUp,
    cue: "Leggi il presente",
    stepLabel: "02",
    title: "Vedi il mese per intero",
    description: "Saldo, ricorrenze e movimenti si ricompongono in un quadro leggibile. Non devi interpretare cinque schermate diverse per capire dove sei."
  },
  {
    icon: BrainCircuit,
    cue: "Guarda il margine",
    stepLabel: "03",
    title: "Stima cosa potrebbe restarti",
    description: "Il Brain locale osserva ritmo di spesa e storico recente per proiettare il fine mese con prudenza."
  },
  {
    icon: ShieldCheck,
    cue: "Valuta una scelta",
    stepLabel: "04",
    title: "Prova una nuova spesa senza impegnarti",
    description: "Usa il Financial Lab per simulare rate o abbonamenti e capire se entrano davvero nel quadro del mese prima di dire sì."
  }
]

export const LANDING_OUTCOMES: LandingOutcome[] = [
  {
    icon: ArrowDownUp,
    title: "Leggi il mese con più calma",
    description: "Non apri l'app per controllare un allarme. La apri per confermare che il quadro resta leggibile."
  },
  {
    icon: ShieldCheck,
    title: "Decidi con meno incertezza",
    description: "Conoscere il margine reale trasforma una spesa potenzialmente ansiosa in una scelta più ponderata."
  },
  {
    icon: Sparkles,
    title: "Controllo leggero, non ossessivo",
    description: "Nessuna micro-gestione punitiva. Bastano pochi minuti per riallinearti e capire dove sta andando il mese."
  }
]

export const LANDING_HERO_EDITORIAL = {
  srTitle: "Numa Budget. Prima di dire sì, leggi il mese intero.",
  headline: "Un'app local-first per capire se una spesa entra nel mese.",
  primaryCtaLabel: "Apri Numa",
  secondaryCtaLabel: "Prova app demo",
  supportingCopy: "Importi un estratto conto, leggi il margine e provi una scelta senza mandare i tuoi dati fuori dal dispositivo.",
  panels: [
    {
      icon: CloudOff,
      title: "Locale",
      description: "I dati restano qui"
    },
    {
      icon: WalletCards,
      title: "Margine",
      description: "Quello che resta nel mese"
    },
    {
      icon: BrainCircuit,
      title: "Stima",
      description: "Una previsione prudente"
    }
  ]
} as const satisfies LandingHeroEditorialContent
