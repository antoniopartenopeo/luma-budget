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

export const LANDING_FLOW_STEPS: LandingFlowStep[] = [
  {
    stepLabel: "01",
    title: "Importi lo storico senza caos",
    description: "Carichi un CSV, Numa legge il file, separa i casi dubbi e ti fa confermare il risultato prima di salvare."
  },
  {
    stepLabel: "02",
    title: "Capisci il mese da una sola schermata",
    description: "Saldo, composizione delle spese e movimenti stanno nello stesso punto, cosi vedi subito dove si sta stringendo il margine."
  },
  {
    stepLabel: "03",
    title: "Vedi quanto potrebbe restarti",
    description: "Quando i dati bastano, il Brain stima fine mese e mese successivo. Se non e pronto, te lo dice chiaramente."
  },
  {
    stepLabel: "04",
    title: "Scopri se una nuova spesa ci sta davvero",
    description: "Se stai pensando a rata, abbonamento o altra spesa fissa, Financial Lab ti mostra la quota mensile aggiuntiva sostenibile."
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
