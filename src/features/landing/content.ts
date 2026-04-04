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
  srTitle: "Numa Budget. Tieni sotto controllo le tue spese, senza stress e senza condividere nulla.",
  headline: "Tieni sotto controllo le tue spese. Senza stress, senza condividere nulla.",
  supportingCopy:
    "Numa Budget ti aiuta a capire quanto puoi spendere oggi, a valutare una nuova spesa prima di farla e a tenere tutto sul tuo dispositivo.",
  primaryCtaLabel: "Prova Numa gratis",
  microcopy: "Nessuna registrazione richiesta. I tuoi dati non lasciano il tuo dispositivo.",
  panels: [
    {
      icon: CloudOff,
      title: "Privacy",
      description: "I tuoi dati restano sul dispositivo"
    },
    {
      icon: WalletCards,
      title: "Budget",
      description: "Capisci quanto puoi ancora spendere"
    },
    {
      icon: BrainCircuit,
      title: "Previsione",
      description: "Valuti una spesa prima di farla"
    }
  ]
} as const satisfies LandingHeroEditorialContent

export const LANDING_NAV_ITEMS = [
  { href: "#problema", label: "Problema" },
  { href: "#differenza", label: "Differenza" },
  { href: "#come-inizi", label: "Come inizi" },
  { href: "#brain-hero", label: "Brain" },
  { href: "#outcomes", label: "Esito" }
] as const satisfies readonly LandingNavItem[]

export const LANDING_PROBLEM_SECTION = {
  eyebrow: "Il problema",
  title: "Sai cosa hai speso. Non sai quanto puoi ancora spendere.",
  description:
    "Guardare i movimenti del conto non basta quando devi capire se una nuova spesa entra davvero nel mese.",
  statement:
    "Numa non è solo un modo più ordinato di vedere le spese. È un modo più semplice per decidere con più calma."
} as const satisfies LandingProblemContent

export const LANDING_STORY_POINTS: LandingStoryPoint[] = [
  {
    icon: WalletCards,
    title: "Vedi le uscite, non quanto ti resta",
    description:
      "La banca ti mostra cosa è già uscito. Numa ti aiuta a capire quanto puoi ancora spendere prima della fine del mese."
  },
  {
    icon: ShieldCheck,
    title: "I tuoi dati restano tuoi",
    description:
      "Numa funziona sul tuo dispositivo e non manda i tuoi movimenti a server esterni. Le tue finanze restano sotto il tuo controllo."
  },
  {
    icon: BrainCircuit,
    title: "Prova prima di impegnarti",
    description:
      "Vuoi aggiungere una rata o un abbonamento? Puoi vedere subito se quella spesa entra davvero nel budget del mese."
  }
]

export const LANDING_DIFFERENCE_SECTION = {
  eyebrow: "Le tue finanze restano tue.",
  title: "I tuoi soldi, senza passare da altri server."
} as const

export const LANDING_DIFFERENTIATORS: LandingDifferentItem[] = [
  {
    icon: CloudOff,
    title: "Niente copie altrove",
    marketEyebrow: "Altrove",
    marketLabel: "Molte app ti chiedono di caricare i movimenti sui loro server.",
    glimpseEyebrow: "Di solito",
    numaLabel: "Con Numa i dati restano sul tuo dispositivo. Li leggi e li usi senza spostarli altrove.",
    kicker: "Sul tuo dispositivo",
    note: "Nessun cloud obbligatorio nel percorso principale.",
    glimpses: ["Cloud obbligatorio", "Copie remote", "Server esterni"]
  },
  {
    icon: ShieldCheck,
    title: "Niente accesso al conto",
    marketEyebrow: "Altrove",
    marketLabel: "Altre soluzioni chiedono collegamenti diretti alla banca o credenziali condivise.",
    glimpseEyebrow: "Di solito",
    numaLabel: "Con Numa lavori solo con i movimenti che scegli tu di caricare. Nessun accesso diretto al conto.",
    kicker: "Solo ciò che scegli",
    note: "Decidi tu quali dati usare e quando usarli.",
    glimpses: ["Accesso al conto", "Connessione continua", "Più dipendenze"]
  },
  {
    icon: BrainCircuit,
    title: "Niente analisi inviate fuori",
    marketEyebrow: "Altrove",
    marketLabel: "Spesso le analisi passano da servizi esterni che non controlli davvero.",
    glimpseEyebrow: "Di solito",
    numaLabel: "Numa elabora le stime sul tuo dispositivo, così privacy e chiarezza restano nella stessa esperienza.",
    kicker: "Analisi privata",
    note: "La parte intelligente non richiede di inviare i tuoi dati altrove.",
    glimpses: ["Analisi esterne", "Servizi terzi", "Percorsi opachi"]
  }
]

export const LANDING_HOW_IT_WORKS_SECTION = {
  eyebrow: "Come inizi",
  title: "Quattro passaggi. Nessuna complicazione.",
  description:
    "Carichi i movimenti dalla banca, vedi il mese in un colpo d'occhio e capisci se una nuova spesa ci sta davvero."
} as const satisfies LandingSectionCopy

export const LANDING_FLOW_STEPS: LandingFlowStep[] = [
  {
    icon: WalletCards,
    cue: "Carica i movimenti",
    stepLabel: "01",
    title: "Carica i movimenti dalla tua banca",
    description:
      "Scarichi il file dei movimenti dalla banca e lo carichi su Numa. L'app li organizza automaticamente in pochi passaggi."
  },
  {
    icon: ArrowDownUp,
    cue: "Guarda il mese",
    stepLabel: "02",
    title: "Vedi il tuo mese in un colpo d'occhio",
    description:
      "Entrate, spese ricorrenti e movimenti si ricompongono in una schermata unica, più facile da leggere."
  },
  {
    icon: BrainCircuit,
    cue: "Capisci quanto resta",
    stepLabel: "03",
    title: "Scopri quanto puoi ancora spendere",
    description:
      "Numa analizza come spendi di solito e ti mostra una previsione realistica di quello che potrebbe restarti a fine mese."
  },
  {
    icon: ShieldCheck,
    cue: "Prova una scelta",
    stepLabel: "04",
    title: "Prova una nuova spesa prima di farla",
    description:
      "Vuoi aggiungere una rata o un abbonamento? Lo verifichi prima, senza impegnarti e senza fare conti a mano."
  }
]

export const LANDING_BRAIN_CONTENT = {
  sectionTitle: "Il Brain di Numa",
  acts: [
    {
      kicker: "Il lato intelligente di Numa",
      titleLines: ["Numa osserva", "le tue abitudini", "e ti aiuta a prevedere il mese."],
      description:
        "Analizza le spese abituali e ti mostra una stima realistica di quanto potrebbe restarti a fine mese."
    },
    {
      kicker: "Una previsione utile",
      titleLines: ["Ti aiuta", "a decidere,", "non a indovinare."],
      description:
        "La stima serve a capire se una spesa nuova è sostenibile, non a riempire la schermata di numeri."
    },
    {
      kicker: "Quando i dati non bastano",
      titleLines: ["Numa te lo dice", "chiaramente,", "senza forzare la previsione."],
      description:
        "Se il quadro è troppo incompleto per una stima affidabile, te lo dice subito invece di fingere precisione."
    }
  ]
} as const satisfies LandingBrainContent

export const LANDING_OUTCOMES_SECTION = {
  eyebrow: "Cosa cambia",
  title: "Meno ansia, più chiarezza.",
  description:
    "Il beneficio non è controllare tutto. È sentirti più tranquillo quando devi capire come sta andando il mese."
} as const satisfies LandingSectionCopy

export const LANDING_OUTCOMES: LandingOutcome[] = [
  {
    icon: ArrowDownUp,
    title: "Smetti di evitare il conto",
    description:
      "Non apri l'app per scoprire una brutta sorpresa. La apri per capire come stai davvero questo mese."
  },
  {
    icon: ShieldCheck,
    title: "Decidi senza sensi di colpa",
    description:
      "Quando sai quanto puoi spendere, una rata o un abbonamento diventano una scelta più chiara e meno ansiosa."
  },
  {
    icon: Sparkles,
    title: "Pochi minuti a settimana bastano",
    description:
      "Non servono fogli complessi o categorizzazioni infinite. Bastano pochi minuti per non perdere il filo del mese."
  }
]

export const LANDING_CLOSING = {
  eyebrow: "Quando vuoi iniziare",
  railLabel: "Nessuna registrazione richiesta",
  title: "Apri il mese. Poi decidi.",
  description:
    "Prova Numa gratis. Il punto è capire i tuoi soldi con più chiarezza, prima di aggiungere una nuova spesa.",
  primaryCtaLabel: "Prova GRATIS"
} as const satisfies LandingClosingContent

export const LANDING_FOOTER = {
  description: "Un'app per gestire le tue finanze con più chiarezza, direttamente sul tuo dispositivo.",
  productHeading: "Prodotto",
  productItems: ["Carica i movimenti", "Previsioni del mese", "Prova una spesa"] as const,
  supportHeading: "Supporto",
  supportItems: [
    { label: "FAQ", href: "/faq" },
    { label: "Privacy", href: "/privacy" },
    { label: "Aggiornamenti", href: "/updates" }
  ] as const satisfies readonly LandingFooterLink[]
} as const satisfies LandingFooterContent

export const LANDING_IMMERSIVE_FALLBACKS = {
  difference: {
    eyebrow: "La differenza di Numa",
    title: "I tuoi soldi restano sul tuo dispositivo.",
    description:
      "La sezione si sta preparando con lo stesso tono della landing: privacy reale, niente cloud obbligatorio, più controllo per te."
  },
  brain: {
    eyebrow: "Il Brain di Numa",
    title: "Una previsione utile, costruita sui tuoi dati.",
    description:
      "Il Brain arriva come supporto alla decisione: meno incertezza, più chiarezza quando vuoi valutare una spesa."
  }
} as const
