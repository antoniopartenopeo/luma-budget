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
import { CategoryIds } from "@/domain/categories"
import type { CategorySummary } from "@/features/dashboard/api/types"
import type { Transaction } from "@/features/transactions/api/types"

export interface LandingHeroPoint {
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

export interface LandingStoryPoint {
  icon: LucideIcon
  title: string
  description: string
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

export const LANDING_HERO_POINTS: LandingHeroPoint[] = [
  {
    icon: CloudOff,
    title: "Dati locali per default",
    description: "Numa preferisce lavorare sul dispositivo: storico, letture e scenari non partono dal cloud."
  },
  {
    icon: FileSpreadsheet,
    title: "Import guidato",
    description: "Porti dentro il CSV, controlli i punti dubbi e confermi solo quando il dato ha senso."
  },
  {
    icon: BrainCircuit,
    title: "Brain interno",
    description: "Quando ha dati sufficienti, stima il resto del mese e la spesa del mese prossimo con fonte dichiarata."
  },
  {
    icon: FlaskConical,
    title: "Scenari separati",
    description: "Financial Lab ti dice quale quota mensile aggiuntiva puoi reggere se vuoi aggiungere rata, abbonamento o altra spesa fissa."
  }
]

export const LANDING_STORY_POINTS: LandingStoryPoint[] = [
  {
    icon: WalletCards,
    title: "Nasce da un problema molto semplice",
    description: "Molte app mostrano categorie e totali, ma non ti aiutano davvero a capire il mese che stai vivendo."
  },
  {
    icon: CloudOff,
    title: "Parte dalla privacy, non dal cloud",
    description: "Numa preferisce trattare i dati finanziari sul dispositivo, perche sono sensibili e non dovrebbero essere l'ultimo pensiero."
  },
  {
    icon: BrainCircuit,
    title: "Unisce presente e futuro nello stesso prodotto",
    description: "Dashboard per leggere adesso, Brain per stimare fine mese e mese successivo, Financial Lab per capire quale nuova quota fissa puoi sostenere."
  }
]

export const LANDING_DIFFERENTIATORS: LandingDifferentItem[] = [
  {
    icon: CloudOff,
    title: "Non parte dal cloud",
    marketLabel: "Molte app note puntano su sincronizzazione remota, account collegati e dati ospitati fuori dal tuo dispositivo.",
    numaLabel: "Numa sceglie una base locale-first: piu privacy, piu controllo, meno dipendenza da promesse esterne."
  },
  {
    icon: WalletCards,
    title: "Non ti impone un metodo rigido",
    marketLabel: "Molti tracker ti chiedono di seguire un rituale preciso o di adattarti al loro modello prima ancora di leggere il mese.",
    numaLabel: "Numa parte dai tuoi movimenti: ti aiuta a capire cosa pesa davvero senza trasformare ogni spesa in una colpa."
  },
  {
    icon: BrainCircuit,
    title: "Non usa l'AI come slogan",
    marketLabel: "Sul mercato e pieno di promesse vaghe: automazione totale, consigli magici, etichette intelligenti che non spiegano nulla.",
    numaLabel: "Numa usa un brain interno per stime future concrete: resto del mese, mese prossimo, fonte dichiarata e controlli di affidabilita."
  },
  {
    icon: ShieldCheck,
    title: "Non promette miracoli",
    marketLabel: "Molte soluzioni ti vendono il risultato prima ancora di mostrarti il problema reale.",
    numaLabel: "Numa fa una promessa piu onesta: capire il tuo mese in tempo, vedere dove intervenire e provare un correttivo credibile."
  }
]

export const LANDING_DEMO_STEPS: LandingDemoStep[] = [
  {
    id: "import",
    icon: FileSpreadsheet,
    eyebrow: "Passo 1",
    title: "Porti dentro lo storico e lo controlli prima",
    description: "Il CSV non entra alla cieca: Numa legge, raggruppa, segnala i casi dubbi e ti fa confermare tutto in modo semplice.",
    outcome: "Il dato entra pulito e resta tuo."
  },
  {
    id: "overview",
    icon: LayoutDashboard,
    eyebrow: "Passo 2",
    title: "Il mese si legge da una sola schermata",
    description: "Dashboard, composizione spese e movimenti parlano la stessa lingua, nello stesso periodo, senza salti inutili.",
    outcome: "Capisci subito dove si stringe il margine."
  },
  {
    id: "insights",
    icon: BrainCircuit,
    eyebrow: "Passo 3",
    title: "Il Brain stima fine mese e mese prossimo",
    description: "Quando ha abbastanza dati, produce stime future su quanto potresti ancora spendere da qui a fine mese e su quanto potresti spendere il mese prossimo.",
    outcome: "Vedi una stima futura con fonte e affidabilita."
  },
  {
    id: "scenarios",
    icon: FlaskConical,
    eyebrow: "Passo 4",
    title: "Financial Lab ti dice quale quota fissa puoi sostenere",
    description: "Se stai valutando rata, abbonamento o altra spesa mensile ricorrente, parte dal tuo margine e restituisce la quota aggiuntiva sostenibile.",
    outcome: "Capisci quanto puoi permetterti ogni mese."
  }
]

export const LANDING_FLOW_STEPS: LandingFlowStep[] = [
  {
    stepLabel: "01",
    title: "Importa quello che hai gia",
    description: "Parti dal tuo CSV, non da una pagina vuota e non da una banca collegata per forza."
  },
  {
    stepLabel: "02",
    title: "Leggi il mese in pochi secondi",
    description: "KPI, categorie e movimenti restano allineati, cosi il punto si capisce subito."
  },
  {
    stepLabel: "03",
    title: "Guarda una stima futura affidabile",
    description: "Il Brain lavora su fine mese e mese successivo. Se non e pronto, Numa passa allo storico e lo dichiara."
  },
  {
    stepLabel: "04",
    title: "Capisci quale quota fissa puoi reggere",
    description: "Financial Lab ti aiuta a valutare rata, abbonamento o nuova spesa ricorrente senza toccare il ledger."
  }
]

export const LANDING_OUTCOMES: LandingOutcome[] = [
  {
    icon: ArrowDownUp,
    title: "Sai cosa pesa davvero",
    description: "Vedi subito se il problema sono spese essenziali, comfort ricorrenti o extra che si stanno accumulando."
  },
  {
    icon: ShieldCheck,
    title: "Proteggi la privacy",
    description: "Il dato finanziario resta locale per default: Numa non ti chiede di partire cedendo tutto al cloud."
  },
  {
    icon: BrainCircuit,
    title: "Hai stime future piu oneste",
    description: "Il Brain non gioca a fare il mago: stima fine mese e mese prossimo, e mostra sempre quando una fonte e davvero pronta."
  },
  {
    icon: Sparkles,
    title: "Decidi prima della fine del mese",
    description: "Capisci il problema mentre si sta formando e puoi testare una correzione prima del consuntivo finale."
  }
]

export const HERO_TRANSACTIONS: Transaction[] = [
  {
    id: "hero-rent",
    description: "Affitto casa",
    amountCents: 72000,
    type: "expense",
    category: "Affitto o Mutuo",
    categoryId: CategoryIds.AFFITTO_MUTUO,
    date: "2026-04-02T08:00:00.000Z",
    timestamp: new Date("2026-04-02T08:00:00.000Z").getTime(),
    classificationSource: "manual"
  },
  {
    id: "hero-grocery",
    description: "Supermercato quartiere",
    amountCents: 6840,
    type: "expense",
    category: "Spesa Alimentare",
    categoryId: CategoryIds.CIBO,
    date: "2026-04-07T18:10:00.000Z",
    timestamp: new Date("2026-04-07T18:10:00.000Z").getTime(),
    classificationSource: "ruleBased"
  },
  {
    id: "hero-streaming",
    description: "Streaming annuale",
    amountCents: 1599,
    type: "expense",
    category: "Streaming & Media",
    categoryId: CategoryIds.ABBONAMENTI,
    date: "2026-04-10T09:15:00.000Z",
    timestamp: new Date("2026-04-10T09:15:00.000Z").getTime(),
    classificationSource: "ruleBased"
  }
]

export const DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: "demo-food",
    description: "Spesa settimanale",
    amountCents: 9320,
    type: "expense",
    category: "Spesa Alimentare",
    categoryId: CategoryIds.CIBO,
    date: "2026-04-11T10:00:00.000Z",
    timestamp: new Date("2026-04-11T10:00:00.000Z").getTime(),
    classificationSource: "ruleBased"
  },
  {
    id: "demo-subscription",
    description: "Toolkit design",
    amountCents: 2290,
    type: "expense",
    category: "Streaming & Media",
    categoryId: CategoryIds.ABBONAMENTI,
    date: "2026-04-12T12:00:00.000Z",
    timestamp: new Date("2026-04-12T12:00:00.000Z").getTime(),
    classificationSource: "ruleBased"
  },
  {
    id: "demo-micro",
    description: "Upgrade in-app",
    amountCents: 890,
    type: "expense",
    category: "Acquisti In-App & Digitale",
    categoryId: CategoryIds.MICRO_DIGITALI,
    isSuperfluous: true,
    date: "2026-04-13T21:20:00.000Z",
    timestamp: new Date("2026-04-13T21:20:00.000Z").getTime(),
    classificationSource: "ai"
  }
]

export const DEMO_CATEGORY_SUMMARY: CategorySummary[] = [
  {
    id: CategoryIds.AFFITTO_MUTUO,
    name: "Affitto o Mutuo",
    valueCents: 72000,
    value: 720,
    color: "#0f766e"
  },
  {
    id: CategoryIds.CIBO,
    name: "Spesa Alimentare",
    valueCents: 28900,
    value: 289,
    color: "#ea580c"
  },
  {
    id: CategoryIds.RISTORANTI,
    name: "Ristoranti & Take-away",
    valueCents: 12400,
    value: 124,
    color: "#f97316"
  },
  {
    id: CategoryIds.ABBONAMENTI,
    name: "Streaming & Media",
    valueCents: 3600,
    value: 36,
    color: "#0ea5e9"
  },
  {
    id: CategoryIds.MICRO_DIGITALI,
    name: "Acquisti In-App & Digitale",
    valueCents: 1790,
    value: 17.9,
    color: "#14b8a6"
  }
]

export const DEMO_BRAIN_STATES = [
  {
    title: "Spesa prossimo mese",
    description: "Quanto potresti spendere il mese prossimo in base a storico, ritmo recente e periodo dell'anno."
  },
  {
    title: "Residuo stimato del mese",
    description: "Quanto potresti ancora spendere da qui a fine mese quando il Brain supera il controllo di qualita."
  },
  {
    title: "Affidabilita della stima",
    description: "La stima viene mostrata in primo piano solo quando e considerata abbastanza solida."
  }
] as const

export const DEMO_SCENARIOS = [
  {
    label: "Baseline",
    quota: "€ 240",
    note: "Se mantieni il ritmo attuale, questa e la quota fissa aggiuntiva che puoi sostenere.",
    accentClassName: "border-primary/20 bg-primary/10 text-primary"
  },
  {
    label: "Balanced",
    quota: "€ 380",
    note: "Se alleggerisci una parte del comfort, la quota mensile sostenibile sale.",
    accentClassName: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
  },
  {
    label: "Focused",
    quota: "€ 520",
    note: "Se stringi anche gli extra, puoi reggere una quota fissa ancora piu alta.",
    accentClassName: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300"
  }
] as const
