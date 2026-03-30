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
    title: "I numeri passati non decidono il tuo futuro",
    description: "Le app tradizionali si fermano a dirti cosa hai speso. Numa usa quei dati per darti il potere di decidere cosa puoi permetterti oggi."
  },
  {
    icon: ShieldCheck,
    title: "I tuoi dati. Il tuo perimetro.",
    description: "Nessun server remoto, nessuna violazione possibile. Numa trasforma il tuo dispositivo nell'unico caveau finanziario di cui hai bisogno."
  },
  {
    icon: BrainCircuit,
    title: "Dalla stima passiva all'azione tattica",
    description: "Sapere quanto resterà è solo l'inizio. Il vero potere è testare in tempo reale se una nuova spesa fissa è matematicamente sostenibile."
  }
]

export const LANDING_DIFFERENTIATORS: LandingDifferentItem[] = [
  {
    icon: CloudOff,
    title: "Sovranità totale sui tuoi dati",
    marketLabel: "Il mercato offre sincronizzazioni cloud vulnerabili in cambio di comodità.",
    numaLabel: "Con Numa, il dato nasce e vive solo sul tuo dispositivo. Nessun intermediario. Sicurezza matematica."
  },
  {
    icon: WalletCards,
    title: "Potere immediato, zero frizione",
    marketLabel: "I tracker classici richiedono settimane per impostare budget e regole complesse.",
    numaLabel: "Importa i movimenti. Numa li struttura all'istante, adattandosi alla tua realtà senza importi dogmi."
  },
  {
    icon: Sparkles,
    title: "Proiezioni chirurgiche, mai approssimative",
    marketLabel: "L'IA nel fintech è spesso fumo: chat inutili o consigli generici.",
    numaLabel: "Il Brain di Numa calcola un impatto esatto e il margine di sicurezza residuo. Pragmatismo assoluto."
  }
]

export const LANDING_FLOW_STEPS: LandingFlowStep[] = [
  {
    icon: WalletCards,
    cue: "Importazione sicura",
    stepLabel: "01",
    title: "Acquisisci il tuo storico bancario",
    description: "Carichi il CSV della tua banca. Numa orchestra l'importazione, isola le anomalie e ti lascia il controllo totale prima di elaborare."
  },
  {
    icon: ArrowDownUp,
    cue: "Visione assoluta",
    stepLabel: "02",
    title: "Dominio istantaneo del presente",
    description: "Saldo corrente, pattern di spesa e movimenti convergono in un'unica interfaccia tattica. Nessuna distrazione, solo focus."
  },
  {
    icon: BrainCircuit,
    cue: "Analisi predittiva",
    stepLabel: "03",
    title: "Sblocca la visione sul tuo futuro",
    description: "L'intelligenza locale incrocia i dati e proietta il tuo fine mese. Il futuro diventa un parametro lucidamente calcolabile."
  },
  {
    icon: ShieldCheck,
    cue: "Scelta strategica",
    stepLabel: "04",
    title: "Esegui mosse sostenibili",
    description: "Usa il Financial Lab per simulare nuove rate o abbonamenti. Numa ti mostra istantaneamente l'impatto sul tuo intero ecosistema finanziario."
  }
]

export const LANDING_OUTCOMES: LandingOutcome[] = [
  {
    icon: ArrowDownUp,
    title: "Lucidità finanziaria totale",
    description: "Smetti di controllare il saldo per paura. Lo consulti per confermare che la tua traiettoria di spesa è perfetta."
  },
  {
    icon: ShieldCheck,
    title: "Decisioni inflessibili",
    description: "Conoscere il tuo vero margine trasforma una scommessa ansiosa in una scelta ponderata, sicura e infallibile."
  },
  {
    icon: Sparkles,
    title: "Controllo senza sforzo",
    description: "Nessuna micro-gestione opprimente. Ti basterà aprire Numa pochi minuti a settimana per mantenere un allineamento perfetto."
  }
]
