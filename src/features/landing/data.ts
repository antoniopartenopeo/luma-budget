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

export const LANDING_STORY_POINTS: LandingStoryPoint[] = [
  {
    icon: WalletCards,
    title: "Il dato c'è. Il contesto no.",
    description: "Le app ordinano movimenti e categorie. Ma quasi mai ti dicono se il mese tiene o si sta stringendo."
  },
  {
    icon: ShieldCheck,
    title: "Il cloud non dovrebbe essere il prezzo d'ingresso",
    description: "Per leggere il tuo mese non serve collegare conti, creare account o spedire dati su un server remoto."
  },
  {
    icon: BrainCircuit,
    title: "Stimare non basta, se poi devi decidere da solo",
    description: "Sapere quanto potrebbe restarti non basta. Devi anche capire se una nuova rata o un abbonamento ci stanno davvero."
  }
]

export const LANDING_DIFFERENTIATORS: LandingDifferentItem[] = [
  {
    icon: CloudOff,
    title: "Nessun intermediario tra te e i tuoi dati",
    marketLabel: "Molte app partono da cloud sync, account collegati e dati ospitati fuori dal dispositivo.",
    numaLabel: "Il dato nasce e resta sul tuo dispositivo. Se vorrai spostarlo, lo deciderai tu."
  },
  {
    icon: WalletCards,
    title: "Nessun metodo da studiare prima",
    marketLabel: "Molti tracker ti chiedono di scegliere un metodo prima di mostrarti qualcosa di utile.",
    numaLabel: "Importi i movimenti e Numa li organizza. Non devi cambiare tu per farlo funzionare."
  },
  {
    icon: Sparkles,
    title: "Numeri concreti, non promesse generiche",
    marketLabel: "L'etichetta \"AI\" viene usata ovunque, ma quasi mai diventa un numero utile stasera.",
    numaLabel: "Il Brain ti restituisce un importo, un livello di affidabilita e un orizzonte chiaro. Senza fumo."
  }
]

export const LANDING_FLOW_STEPS: LandingFlowStep[] = [
  {
    icon: WalletCards,
    cue: "Import pulito",
    stepLabel: "01",
    title: "Importi lo storico senza caos",
    description: "Carichi un CSV, Numa legge il file, separa i casi dubbi e ti fa confermare il risultato prima di salvare."
  },
  {
    icon: ArrowDownUp,
    cue: "Lettura immediata",
    stepLabel: "02",
    title: "Capisci il mese da una sola schermata",
    description: "Saldo, composizione delle spese e movimenti stanno nello stesso punto, cosi vedi subito dove si sta stringendo il margine."
  },
  {
    icon: BrainCircuit,
    cue: "Stima futura",
    stepLabel: "03",
    title: "Vedi quanto potrebbe restarti",
    description: "Quando i dati bastano, il Brain stima fine mese e mese successivo. Se non e pronto, te lo dice chiaramente."
  },
  {
    icon: ShieldCheck,
    cue: "Decisione sostenibile",
    stepLabel: "04",
    title: "Scopri se una nuova spesa ci sta davvero",
    description: "Se stai pensando a rata, abbonamento o altra spesa fissa, Financial Lab ti mostra la quota mensile aggiuntiva sostenibile."
  }
]

export const LANDING_OUTCOMES: LandingOutcome[] = [
  {
    icon: ArrowDownUp,
    title: "Meno ansia da saldo",
    description: "Smetti di controllarlo per paura. Lo guardi perché hai finalmente un contesto che lo rende leggibile."
  },
  {
    icon: ShieldCheck,
    title: "Più fiducia nelle tue scelte",
    description: "Quando sai quanto margine hai, dire sì o no a una spesa diventa una decisione, non un azzardo."
  },
  {
    icon: Sparkles,
    title: "Un'abitudine che resta",
    description: "Non serve disciplina da monaco. Basta aprire Numa una volta a settimana per restare orientato."
  }
]
