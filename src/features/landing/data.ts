import type { LucideIcon } from "lucide-react"
import {
  ArrowDownUp,
  BrainCircuit,
  CloudOff,
  FileSpreadsheet,
  FlaskConical,
  LayoutDashboard,
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

export interface LandingDemoStep {
  id: "import" | "overview" | "insights" | "scenarios"
  icon: LucideIcon
  eyebrow: string
  title: string
  description: string
  outcome: string
}

export interface LandingFlowStep {
  stepLabel: string
  title: string
  description: string
}

export interface LandingOutcome {
  icon: LucideIcon
  title: string
  description: string
}

export interface DemoImportSignal {
  label: string
  detail: string
}

export interface DemoOverviewMetric {
  label: string
  value: string
  note: string
}

export interface DemoOverviewBreakdown {
  label: string
  value: string
  share: number
}

export interface DemoOverviewMovement {
  label: string
  category: string
  amountCents: number
}

export interface DemoBrainState {
  title: string
  description: string
}

export interface DemoBrainMetric {
  label: string
  value: string
  note: string
}

export interface DemoScenario {
  label: string
  quotaCents: number
  note: string
  example: string
  accentClassName: string
}


export const LANDING_STORY_POINTS: LandingStoryPoint[] = [
  {
    icon: WalletCards,
    title: "Parte da una frustrazione reale",
    description: "Molte app registrano bene le spese, ma non aiutano davvero a capire il mese che stai vivendo."
  },
  {
    icon: ShieldCheck,
    title: "Mette la privacy all'inizio",
    description: "I dati restano locali per default, perche la finanza personale non dovrebbe essere utile solo se passa dal cloud."
  },
  {
    icon: BrainCircuit,
    title: "Separa lettura, stima e decisione",
    description: "Prima capisci il presente, poi vedi il possibile dopo, e solo alla fine valuti una nuova spesa fissa."
  }
]

export const LANDING_DIFFERENTIATORS: LandingDifferentItem[] = [
  {
    icon: CloudOff,
    title: "La privacy non e una postilla",
    marketLabel: "Molte app partono da cloud sync, account collegati e dati ospitati fuori dal tuo dispositivo.",
    numaLabel: "Numa parte dal locale: piu controllo sul dato, meno dipendenza da servizi esterni."
  },
  {
    icon: WalletCards,
    title: "Non ti costringe a seguire un rito",
    marketLabel: "Molti tracker ti chiedono prima metodo, budget o regole, e solo dopo provano a spiegarti il mese.",
    numaLabel: "Numa parte dai movimenti che hai gia e li rende leggibili senza trasformare tutto in un esercizio."
  },
  {
    icon: Sparkles,
    title: "Ti dice cose precise, non slogan",
    marketLabel: "Sul mercato ci sono tante promesse generiche su AI, automazioni e simulazioni, ma spesso non e chiaro cosa facciano davvero.",
    numaLabel: "Numa calcola stime chiare per il mese in corso e per il prossimo, e ti dice esattamente quale quota fissa puoi aggiungere."
  }
]

export const LANDING_DEMO_STEPS: LandingDemoStep[] = [
  {
    id: "import",
    icon: FileSpreadsheet,
    eyebrow: "Momento 1",
    title: "Importi lo storico senza caos",
    description: "Il CSV non entra alla cieca: Numa legge, raggruppa, segnala i casi dubbi e ti fa confermare il risultato.",
    outcome: "Il dato entra pulito e resta tuo."
  },
  {
    id: "overview",
    icon: LayoutDashboard,
    eyebrow: "Momento 2",
    title: "Capisci il mese da una sola schermata",
    description: "Saldo, composizione delle spese e movimenti parlano la stessa lingua, nello stesso periodo.",
    outcome: "Capisci subito dove si sta stringendo il margine."
  },
  {
    id: "insights",
    icon: BrainCircuit,
    eyebrow: "Momento 3",
    title: "Vedi quanto potrebbe restarti",
    description: "Quando ha abbastanza dati, il Brain stima il resto del mese e il mese successivo. Se non e pronto, Numa lo dichiara.",
    outcome: "La stima futura resta chiara e onesta."
  },
  {
    id: "scenarios",
    icon: FlaskConical,
    eyebrow: "Momento 4",
    title: "Scopri se una nuova spesa ci sta davvero",
    description: "Se stai pensando a rata, abbonamento o altra quota fissa, Financial Lab ti restituisce la quota mensile aggiuntiva sostenibile.",
    outcome: "Decidi prima di impegnarti."
  }
]

export const LANDING_FLOW_STEPS: LandingFlowStep[] = [
  {
    stepLabel: "01",
    title: "Porti dentro il tuo storico",
    description: "Parti da dati reali, non da una pagina vuota e non da un conto da collegare per forza."
  },
  {
    stepLabel: "02",
    title: "Numa ti aiuta a leggere il mese",
    description: "Vedi subito cosa sta pesando, cosa e flessibile e dove si sta comprimendo il margine."
  },
  {
    stepLabel: "03",
    title: "Se la stima e pronta, ti mostra il dopo",
    description: "Il Brain lavora su fine mese e mese successivo e dichiara sempre quando usa lo storico."
  },
  {
    stepLabel: "04",
    title: "Valuti una nuova spesa senza improvvisare",
    description: "Financial Lab ti dice quale quota mensile aggiuntiva puoi sostenere senza confondere simulazione e operativita."
  }
]

export const LANDING_OUTCOMES: LandingOutcome[] = [
  {
    icon: ArrowDownUp,
    title: "Meno rumore",
    description: "Capisci cosa conta senza perderti tra categorie, schermate e rituali da seguire."
  },
  {
    icon: ShieldCheck,
    title: "Piu controllo",
    description: "I dati restano locali per default e il prodotto non parte chiedendoti di cederli al cloud."
  },
  {
    icon: Sparkles,
    title: "Decisioni piu prudenti",
    description: "Prima leggi il mese, poi guardi la stima, poi capisci se una nuova spesa fissa e davvero sostenibile."
  }
]

export const DEMO_IMPORT_SIGNALS: DemoImportSignal[] = [
  {
    label: "78 movimenti letti",
    detail: "Numa separa subito i movimenti utili dal rumore."
  },
  {
    label: "3 gruppi da rivedere",
    detail: "I casi dubbi vengono raccolti in modo leggibile prima del salvataggio."
  }
]

export const DEMO_OVERVIEW_METRICS: DemoOverviewMetric[] = [
  {
    label: "Disponibile nel mese",
    value: "EUR 1842",
    note: "La fotografia di partenza e immediata."
  },
  {
    label: "Spese flessibili",
    value: "27%",
    note: "La parte che puoi alleggerire si riconosce subito."
  }
]

export const DEMO_OVERVIEW_BREAKDOWN: DemoOverviewBreakdown[] = [
  {
    label: "Casa",
    value: "61%",
    share: 61
  },
  {
    label: "Spesa flessibile",
    value: "39%",
    share: 39
  }
]

export const DEMO_OVERVIEW_MOVEMENTS: DemoOverviewMovement[] = [
  {
    label: "Spesa settimanale",
    category: "Cibo",
    amountCents: -9300
  }
]

export const DEMO_BRAIN_STATES: DemoBrainState[] = [
  {
    title: "Stima di fine mese",
    description: "Il Brain prova a stimare quanto potresti ancora spendere da qui a fine mese."
  },
  {
    title: "Stima del mese prossimo",
    description: "Quando ha abbastanza storico, il Brain prova a leggere il ritmo del mese successivo."
  },
  {
    title: "Controllo di affidabilita",
    description: "Se la stima non e abbastanza solida, Numa torna allo storico e lo dichiara."
  }
]

export const DEMO_BRAIN_METRICS: DemoBrainMetric[] = [
  {
    label: "Fine mese",
    value: "EUR 430",
    note: "Quanto potresti ancora spendere nel mese in corso."
  },
  {
    label: "Mese prossimo",
    value: "EUR 1540",
    note: "Una lettura sintetica del mese che arriva."
  }
]

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    label: "Baseline",
    quotaCents: 24000,
    note: "Con il ritmo attuale, questa e la quota fissa aggiuntiva sostenibile.",
    example: "Esempio: un piccolo abbonamento annuale spalmato sul mese o una rata leggera.",
    accentClassName: "border-primary/20 bg-primary/10 text-primary"
  },
  {
    label: "Balanced",
    quotaCents: 38000,
    note: "Se alleggerisci una parte del comfort, la quota sostenibile sale.",
    example: "Esempio: un corso, un servizio ricorrente o una rata media.",
    accentClassName: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
  },
  {
    label: "Focused",
    quotaCents: 52000,
    note: "Se stringi anche gli extra, puoi sostenere una quota fissa ancora piu alta.",
    example: "Esempio: una rata piu impegnativa, masolo con un margine piu disciplinato.",
    accentClassName: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300"
  }
] as const
