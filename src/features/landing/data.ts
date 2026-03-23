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




export const LANDING_STORY_POINTS: LandingStoryPoint[] = [
  {
    icon: WalletCards,
    title: "Il dato c'è, la visione no",
    description: "Le app ti mostrano transazioni ordinate per data. Ma nessuna ti dice se il mese sta reggendo o cedendo."
  },
  {
    icon: ShieldCheck,
    title: "Il cloud non è un prerequisito",
    description: "Per leggere il tuo mese non serve collegare conti, creare account o mandare dati a un server remoto."
  },
  {
    icon: BrainCircuit,
    title: "Stimare e decidere sono due cose diverse",
    description: "Un conto è sapere quanto potrebbe restarti. Un altro è capire se puoi davvero aggiungere una nuova rata."
  }
]

export const LANDING_DIFFERENTIATORS: LandingDifferentItem[] = [
  {
    icon: CloudOff,
    title: "Nessun intermediario tra te e i tuoi dati",
    marketLabel: "Molte app partono da cloud sync, account collegati e dati ospitati fuori dal tuo dispositivo.",
    numaLabel: "In Numa il dato nasce e resta sul tuo dispositivo. Tu scegli se e quando spostarlo."
  },
  {
    icon: WalletCards,
    title: "Nessun metodo da studiare prima",
    marketLabel: "Molti tracker ti chiedono di scegliere un sistema di budgeting prima di mostrarti qualcosa di utile.",
    numaLabel: "Importi i movimenti e Numa li organizza. Il sistema si adatta a te, non il contrario."
  },
  {
    icon: Sparkles,
    title: "Numeri concreti, non promesse generiche",
    marketLabel: "L'etichetta \"AI\" viene usata ovunque, ma quasi mai produce un numero che puoi usare stasera.",
    numaLabel: "Il Brain ti restituisce un importo, un livello di affidabilità e un range temporale. Nient'altro."
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
    description: "Quando ha abbastanza dati, il Brain stima il resto del mese e il mese successivo. Se non è pronto, Numa lo dichiara.",
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
    title: "Un CSV, un file",
    description: "Esporti l'estratto conto dalla tua banca e lo carichi. Nessun collegamento automatico."
  },
  {
    stepLabel: "02",
    title: "Numa organizza tutto",
    description: "Duplicati, categorie, periodi: il motore fa la pulizia e tu confermi."
  },
  {
    stepLabel: "03",
    title: "Leggi e valuti",
    description: "Dashboard, stima e simulatore sono lì. Apri quello che ti serve, quando ti serve."
  },
  {
    stepLabel: "04",
    title: "Decidi con calma",
    description: "Nessuna pressione, nessun countdown. I dati restano lì finché non sei pronto."
  }
]

export const LANDING_OUTCOMES: LandingOutcome[] = [
  {
    icon: ArrowDownUp,
    title: "Meno ansia da notifica",
    description: "Smetti di controllare il saldo per paura. Lo guardi perché hai un contesto che lo rende leggibile."
  },
  {
    icon: ShieldCheck,
    title: "Più fiducia nelle tue scelte",
    description: "Quando sai quanto margine hai, dire sì o no a una spesa diventa una decisione, non un azzardo."
  },
  {
    icon: Sparkles,
    title: "Un'abitudine che dura",
    description: "Non serve disciplina da monaco. Basta aprire Numa una volta a settimana per restare orientato."
  }
]
