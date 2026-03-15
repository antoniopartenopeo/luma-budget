import type { BrainEvolutionResult, NeuralBrainSnapshot } from "@/brain"
import type { EventTone, StageState } from "./brain-runtime-types"

export const BRAIN_CANONICAL_NAME = "Brain"
export const BRAIN_READY_LABEL = "Brain pronto"
export const BRAIN_HISTORY_LABEL = "Storico analizzato"
export const BRAIN_CONSISTENCY_LABEL = "Stabilità interna"
export const BRAIN_SIGNAL_SECTION_LABEL = "Segnali del Brain"

export function resolveBrainStage(snapshot: NeuralBrainSnapshot | null): StageState {
    if (!snapshot) {
        return {
            id: "dormant",
            label: "Non attivo",
            summary: "Il Brain è fermo. Avvialo per iniziare ad analizzare il tuo storico.",
            badgeVariant: "outline",
        }
    }

    const trainedSamples = snapshot.trainedSamples
    if (trainedSamples === 0) {
        return {
            id: "newborn",
            label: "Appena avviato",
            summary: "Il Brain è stato creato ma non ha ancora dati sufficienti per imparare.",
            badgeVariant: "secondary",
        }
    }

    if (trainedSamples < 36) {
        return {
            id: "imprinting",
            label: "Sta imparando",
            summary: "Il Brain sta iniziando a riconoscere le tue abitudini a partire dallo storico disponibile.",
            badgeVariant: "secondary",
        }
    }

    return {
        id: "adapting",
        label: "Attivo",
        summary: "Il Brain ha già una base utile e continua ad aggiornarsi quando arrivano nuovi dati.",
        badgeVariant: "secondary",
    }
}

export function formatBrainEvolutionReason(result: BrainEvolutionResult): { title: string; detail: string; tone: EventTone } {
    if (result.reason === "trained") {
        return {
            title: "Apprendimento completato",
            detail: `Il Brain ha riletto ${result.sampleCount} dati e ha aggiornato stime e segnali. Stabilità interna ${result.averageLoss.toFixed(4)}.`,
            tone: "positive",
        }
    }

    if (result.reason === "no-new-data") {
        return {
            title: "Nessun dato nuovo",
            detail: "Dall'ultima analisi non sono arrivati dati nuovi utili, quindi il Brain non cambia.",
            tone: "neutral",
        }
    }

    if (result.reason === "insufficient-data") {
        return {
            title: "Dati insufficienti",
            detail: `Servono ancora più dati per produrre letture stabili: mesi utili ${result.monthsAnalyzed}, dati letti ${result.sampleCount}.`,
            tone: "warning",
        }
    }

    return {
        title: "Brain non avviato",
        detail: "Avvia il Brain per iniziare a leggere il tuo storico e costruire le prime stime.",
        tone: "warning",
    }
}

export function resolveBrainSourceLabel(source: "brain" | "fallback"): string {
    return source === "brain" ? "Brain" : "Storico"
}

export function formatBrainTopbarTitle(percent: number, trainedSamples: number, maturityTarget: number): string {
    return `Brain · ${BRAIN_READY_LABEL} ${percent}% · ${BRAIN_HISTORY_LABEL} ${trainedSamples}/${maturityTarget} dati`
}

export function formatBrainTopbarAriaLabel(percent: number): string {
    return `Apri Brain (${percent}% pronto)`
}
