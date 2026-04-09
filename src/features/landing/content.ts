import type { LucideIcon } from "lucide-react"
import {
  ArrowDownUp,
  BrainCircuit,
  CloudOff,
  ShieldCheck,
  Sparkles,
  WalletCards
} from "lucide-react"

export interface LandingSectionCopy {
  eyebrow: string
  title: string
  description: string
}

export interface LandingProblemContent extends LandingSectionCopy {
  statement: string
}

export interface LandingStoryPoint {
  icon: LucideIcon
  title: string
  description: string
}

export interface LandingDifferentItem {
  icon: LucideIcon
  title: string
  marketEyebrow: string
  marketLabel: string
  glimpseEyebrow: string
  numaLabel: string
  kicker: string
  note: string
  glimpses: readonly string[]
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
  supportingCopy: string
  primaryCtaLabel: string
  microcopy: string
  panels: LandingHeroEditorialPanel[]
}

export interface LandingBrainAct {
  kicker: string
  titleLines: readonly string[]
  description: string
}

export interface LandingBrainContent {
  sectionTitle: string
  acts: readonly [LandingBrainAct, LandingBrainAct, LandingBrainAct]
}

export interface LandingClosingContent {
  eyebrow: string
  railLabel: string
  title: string
  description: string
  primaryCtaLabel: string
}

export interface LandingNavItem {
  href: string
  label: string
}

export interface LandingFooterLink {
  label: string
  href: string
}

export interface LandingFooterContent {
  description: string
  productHeading: string
  productItems: readonly string[]
  supportHeading: string
  supportItems: readonly LandingFooterLink[]
}

export const LANDING_HERO_EDITORIAL = {
  srTitle: "Numa Budget. Il tuo mese. Limpido come non mai.",
  headline: "Il tuo mese. Limpido come non mai.",
  supportingCopy:
    "Scopri il tuo vero margine di spesa in un istante. E con un'intelligenza che non lascia mai il tuo dispositivo.",
  primaryCtaLabel: "Inizia senza account",
  microcopy: "Privato. Nessun cloud, nessuna registrazione.",
  panels: [
    {
      icon: CloudOff,
      title: "Privacy",
      description: "Esiste solo dove sei tu."
    },
    {
      icon: WalletCards,
      title: "Budget",
      description: "Sai subito se è sostenibile."
    },
    {
      icon: BrainCircuit,
      title: "Brain",
      description: "La mente sui tuoi soldi."
    }
  ]
} as const satisfies LandingHeroEditorialContent

export const LANDING_NAV_ITEMS = [
  { href: "#problema", label: "Oltre" },
  { href: "#differenza", label: "Differenza" },
  { href: "#come-inizi", label: "Setup" },
  { href: "#brain-hero", label: "Neural Core" },
  { href: "#outcomes", label: "Esito" }
] as const satisfies readonly LandingNavItem[]

export const LANDING_PROBLEM_SECTION = {
  eyebrow: "Oltre la banca",
  title: "Il passato è scritto. Il futuro è tuo.",
  description:
    "La banca ti mostra cosa è già uscito. Numa ti mostra cosa puoi ancora fare. Con fredda precisione.",
  statement:
    "Dal rumore di mille righe alla sintesi di un margine, in un colpo d'occhio."
} as const satisfies LandingProblemContent

export const LANDING_STORY_POINTS: LandingStoryPoint[] = [
  {
    icon: WalletCards,
    title: "Guarda avanti, non indietro.",
    description:
      "La banca è passiva. Numa anticipa il tuo margine a fine mese, chiarendo oggi cosa accadrà domani."
  },
  {
    icon: ShieldCheck,
    title: "Privato. Di default.",
    description:
      "Funziona sul tuo processore. I tuoi dati non partono per nessun server. Sei l'unico proprietario."
  },
  {
    icon: BrainCircuit,
    title: "Prova. Poi decidi.",
    description:
      "Aggiungi uno scenario, verifica se la tua nuova spesa è sostenibile. Fallo con sicurezza prima di impegnarti."
  }
]

export const LANDING_DIFFERENCE_SECTION = {
  eyebrow: "Sicurezza",
  title: "Privato. E punto."
} as const

export const LANDING_DIFFERENTIATORS: LandingDifferentItem[] = [
  {
    icon: CloudOff,
    title: "Zero Cloud",
    marketEyebrow: "Gli altri",
    marketLabel: "La quasi totalità delle app registra i tuoi movimenti sui propri server remoti.",
    glimpseEyebrow: "Numa",
    numaLabel: "Il tuo Mac o iPhone è l'unico luogo dell'universo in cui risiedono i tuoi dati.",
    kicker: "Inviolabile",
    note: "Tutta l'elaborazione avviene offline.",
    glimpses: ["Nessun server", "Solo locale", "Zero tracking"]
  },
  {
    icon: ShieldCheck,
    title: "Sconnesso alla radice",
    marketEyebrow: "Gli altri",
    marketLabel: "Esigono le tue credenziali bancarie scavalcando la tua privacy.",
    glimpseEyebrow: "Numa",
    numaLabel: "Nessun accesso diretto. Sei tu a importare quello che desideri dal tuo istituto.",
    kicker: "Il tuo caveau",
    note: "Pieno controllo sul tuo perimetro.",
    glimpses: ["Nessun login in-app", "Zero token Open Banking"]
  },
  {
    icon: BrainCircuit,
    title: "Intelligenza On-Device",
    marketEyebrow: "Gli altri",
    marketLabel: "Per l'analisi avanzata inviano i tuoi flussi a intelligenze cloud opache.",
    glimpseEyebrow: "Numa",
    numaLabel: "Il Brain calcola ogni stima direttamente sul chip del tuo dispositivo. Magia nera senza server.",
    kicker: "Il Neural Engine",
    note: "La potenza limite dell'AI a casa tua.",
    glimpses: ["Motore locale", "Previsioni istantanee", "Machine Learning"]
  }
]

export const LANDING_HOW_IT_WORKS_SECTION = {
  eyebrow: "Setup",
  title: "Quattro step. Magia inclusa.",
  description:
    "Un flusso invisibile. Pochi minuti per stabilire il tono dell'intero mese."
} as const satisfies LandingSectionCopy

export const LANDING_FLOW_STEPS: LandingFlowStep[] = [
  {
    icon: WalletCards,
    cue: "Importa",
    stepLabel: "01",
    title: "Importa dalla banca in un istante.",
    description:
      "Scarica il file. Trascinalo su Numa. L'app fa il resto, categorizzando a una velocità impressionante."
  },
  {
    icon: ArrowDownUp,
    cue: "Sintetizza",
    stepLabel: "02",
    title: "Il tuo mese intero in uno schermo.",
    description:
      "Tutte le entrate e uscite ricorrenti fuse in un'unica, limpida vista panoramica."
  },
  {
    icon: BrainCircuit,
    cue: "Prevedi",
    stepLabel: "03",
    title: "Il margine emerge dall'ombra.",
    description:
      "Il Neural Core di Numa proietta le tue abitudini di spesa. Ti svela subito cosa resterà a fine mese."
  },
  {
    icon: ShieldCheck,
    cue: "Simula",
    stepLabel: "04",
    title: "La spesa giusta al momento giusto.",
    description:
      "Inserisci una spesa fittizia. Il margine reagisce istantaneamente. Decidi serenamente, non indovini."
  }
]

export const LANDING_BRAIN_CONTENT = {
  sectionTitle: "Il Neural Core",
  acts: [
    {
      kicker: "L'Intelligenza vera",
      titleLines: ["Numa osserva", "e anticipa", "il tuo mese."],
      description:
        "Non fa la media. Comprende il tuo ritmo biologico di spesa e lo proietta nel futuro in tempo reale."
    },
    {
      kicker: "Utilità pura",
      titleLines: ["Non indovina.", "Calcola,", "e rassicura."],
      description:
        "L'algoritmo non satura lo schermo di grafici insensati. Ti fornisce l'unico dato vitale: il budget rimanente sostenibile."
    },
    {
      kicker: "Realismo estremo",
      titleLines: ["Se manca base,", "non inventa,", "ti avvisa."],
      description:
        "Quando i dati non bastano, si ferma. Niente miracoli opachi. Solo solida potenza di calcolo a tuo servizio."
    }
  ]
} as const satisfies LandingBrainContent

export const LANDING_OUTCOMES_SECTION = {
  eyebrow: "L'esito",
  title: "Meno ansia. Controllo totale.",
  description:
    "Non sei qui per compilare tabelle excel anni '90. Sei qui per vivere serenamente, sicuro del tuo margine reale."
} as const satisfies LandingSectionCopy

export const LANDING_OUTCOMES: LandingOutcome[] = [
  {
    icon: ArrowDownUp,
    title: "L'ansia del login scompare",
    description:
      "Scopri la certezza di sapere sempre cosa troverai in banca. Il mese perde opacità e acquisisce forma solida."
  },
  {
    icon: ShieldCheck,
    title: "Lo status si rinforza",
    description:
      "Una borsa o un viaggio perdono il gusto amaro della decisione frettolosa. Riacquisti il privilegio della lucidità."
  },
  {
    icon: Sparkles,
    title: "Il tempo recuperato",
    description:
      "Due minuti. Forse tre. Scusarsi per avere così tanto tempo libero diventerà un'abitudine."
  }
]

export const LANDING_CLOSING = {
  eyebrow: "Il primo passo",
  railLabel: "Nessun login richiesto",
  title: "Il mese. Nelle tue mani.",
  description:
    "Zero account da creare, zero attese infinite e niente cloud opachi. Esplora il tuo mese come merita di essere vissuto. Con il pieno potere decisionale.",
  primaryCtaLabel: "Inizia senza account"
} as const satisfies LandingClosingContent

export const LANDING_FOOTER = {
  description: "L'intelligenza finanziaria locale che inizia e finisce con il tuo consenso.",
  productHeading: "Prodotto",
  productItems: ["Architettura Local First", "Il Neural Core", "Import CSV ultraveloce"] as const,
  supportHeading: "Risorse",
  supportItems: [
    { label: "Domande frequenti", href: "/faq" },
    { label: "Manifesto Privacy", href: "/privacy" },
    { label: "Release log", href: "/updates" }
  ] as const satisfies readonly LandingFooterLink[]
} as const satisfies LandingFooterContent

export const LANDING_IMMERSIVE_FALLBACKS = {
  difference: {
    eyebrow: "La differenza di Numa",
    title: "Privato. E punto.",
    description:
      "I tuoi dati finanziari nascono e muoiono sul perimetro protetto del tuo hardware. Niente server intermedi."
  },
  brain: {
    eyebrow: "Il Neural Core",
    title: "Una previsione vitale.",
    description:
      "L'intelligenza di Numa scova pattern di spesa invisibili per restituirti un solido margine."
  }
} as const
