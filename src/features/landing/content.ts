import type { LucideIcon } from "lucide-react"
import {
  ArrowDownUp,
  BrainCircuit,
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

export interface LandingHeroEditorialContent {
  srTitle: string
  headline: string
  supportingCopy: string
  primaryCtaLabel: string
  primaryCtaHref: string
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
    "Importi quello che hai gia. Capisci quanto ti resta davvero questo mese. E puoi provare una nuova spesa con piu lucidita.",
  primaryCtaLabel: "Inizia senza account",
  primaryCtaHref: "/dashboard"
} as const satisfies LandingHeroEditorialContent

export const LANDING_NAV_ITEMS = [
  { href: "#problema", label: "Problema" },
  { href: "#differenza", label: "Differenza" },
  { href: "#come-inizi", label: "Come inizi" },
  { href: "#brain-hero", label: "Brain" },
  { href: "#outcomes", label: "Risultati" }
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
    title: "Leggi il passato una volta sola.",
    description:
      "Importi quello che esiste gia. Numa ordina i movimenti e prepara la base da cui leggere davvero il mese."
  },
  {
    icon: ShieldCheck,
    title: "Capisci il peso reale del mese.",
    description:
      "Ricorrenze, uscite forti e ritmo di spesa smettono di essere rumore. Diventano un margine leggibile."
  },
  {
    icon: BrainCircuit,
    title: "Prova il futuro prima di decidere.",
    description:
      "Aggiungi uno scenario e vedi subito se resta spazio sostenibile. Decidi con lucidita, non per istinto."
  }
]

export const LANDING_DIFFERENCE_SECTION = {
  eyebrow: "Insight Engine",
  title: "Piu movimenti. Piu Brain."
} as const

export const LANDING_DIFFERENTIATORS: LandingDifferentItem[] = [
  {
    icon: BrainCircuit,
    title: "Il Brain cresce",
    marketEyebrow: "Input",
    marketLabel: "Ogni nuova transazione aggiunge contesto reale invece di rumore isolato.",
    glimpseEyebrow: "Insight",
    numaLabel: "Con poche righe Numa legge pattern grezzi. Con una base piu ampia inizia a produrre insight affidabili, margine e segnali decisionali.",
    kicker: "Insight progressivo",
    note: "L'intelligenza si nutre di contesto.",
    glimpses: ["Pattern", "Margine", "Segnali"]
  },
  {
    icon: ArrowDownUp,
    title: "Riconosce il ritmo",
    marketEyebrow: "Prima",
    marketLabel: "Le uscite sembrano solo righe sparse senza una direzione leggibile.",
    glimpseEyebrow: "Dopo",
    numaLabel: "Quando le ricorrenze emergono, il mese smette di essere un elenco e diventa una struttura leggibile.",
    kicker: "Pattern detection",
    note: "Il peso del mese prende forma.",
    glimpses: ["Ricorrenze", "Cadenza", "Peso"]
  },
  {
    icon: Sparkles,
    title: "Sblocca decisioni",
    marketEyebrow: "Dati",
    marketLabel: "Vedi quello che e gia successo ma non cosa puoi ancora permetterti.",
    glimpseEyebrow: "Brain",
    numaLabel: "Quando il contesto e sufficiente, Numa traduce i movimenti in una risposta concreta: cosa puoi fare adesso senza stressare il mese.",
    kicker: "Decision support",
    note: "L'insight arriva quando la base e pronta.",
    glimpses: ["Scenario", "Spazio", "Lucidita"]
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
