/**
 * Snapshot Narrator
 * =================
 * 
 * Pure function that generates narrative text for Flash Summary.
 * 
 * RULES (from Narration Contract v1):
 * - No access to transactions/budget directly
 * - All monetary values already formatted in facts
 * - No string parsing for numbers, no calculations
 * - State determines message type, facts fill in details
 */

import { NarrationResult, SnapshotFacts, SnapshotState } from "./types"

/**
 * Generates narrative text for the Flash Summary overlay.
 * 
 * @param facts - Pre-calculated and pre-formatted facts
 * @param state - Derived state (thriving/stable/strained/critical/calm)
 * @param locale - Locale for any text formatting (default: it-IT)
 * @returns NarrationResult with text and optional short version
 */
export function narrateSnapshot(
    facts: SnapshotFacts,
    state: SnapshotState,
    locale: string = "it-IT"
): NarrationResult {
    switch (state) {
        case "thriving":
            return narrateThriving(facts)
        case "stable":
            return narrateStable(facts)
        case "strained":
            return narrateStrained(facts)
        case "critical":
            return narrateCritical(facts)
        case "calm":
        default:
            return narrateCalm(facts)
    }
}

// =====================
// STATE-SPECIFIC NARRATORS
// =====================

function narrateThriving(facts: SnapshotFacts): NarrationResult {
    const { savingsRatePercent } = facts

    if (savingsRatePercent !== undefined && savingsRatePercent > 0) {
        return {
            text: `Ottimo livello di risparmio: ${savingsRatePercent}% questo mese. Un risultato solido.`,
            shortText: `Risparmi: ${savingsRatePercent}%`
        }
    }

    return {
        text: "Gestione finanziaria molto positiva questo mese. Continua così.",
        shortText: "Mese positivo"
    }
}

function narrateStable(facts: SnapshotFacts): NarrationResult {
    return {
        text: "La situazione è in equilibrio. Non si rilevano anomalie o scostamenti significativi rispetto ai piani.",
        shortText: "Situazione stabile"
    }
}

function narrateStrained(facts: SnapshotFacts): NarrationResult {
    const { utilizationPercent, superfluousPercent, superfluousTargetPercent, balanceCents } = facts

    // Priority: balance deficit
    if (balanceCents < 0) {
        return {
            text: "Il saldo del mese è in negativo. Monitora le spese impreviste per rientrare nei piani.",
            shortText: "Saldo in negativo"
        }
    }

    // Priority: superfluous over target (more actionable advice)
    if (superfluousPercent !== undefined && superfluousTargetPercent !== undefined &&
        superfluousPercent > superfluousTargetPercent) {
        return {
            text: `Le spese superflue sono al ${superfluousPercent}%, oltre il target del ${superfluousTargetPercent}%. Valuta un piccolo taglio per migliorare il margine.`,
            shortText: `Superflue: ${superfluousPercent}%`
        }
    }

    // Secondary: budget strained
    if (utilizationPercent !== undefined && utilizationPercent > 90) {
        return {
            text: `Attenzione: hai utilizzato il ${utilizationPercent}% del budget disponibile. Resta poco margine per i prossimi giorni.`,
            shortText: `Budget: ${utilizationPercent}%`
        }
    }

    // Fallback
    return {
        text: "Alcuni indicatori suggeriscono cautela nella gestione delle prossime spese.",
        shortText: "Da monitorare"
    }
}

function narrateCritical(facts: SnapshotFacts): NarrationResult {
    const { utilizationPercent, superfluousPercent, balanceCents } = facts

    if (balanceCents < 0 && utilizationPercent !== undefined && utilizationPercent > 100) {
        return {
            text: `Situazione critica: sei oltre il budget (${utilizationPercent}%) con un saldo negativo. È necessaria una revisione immediata delle spese.`,
            shortText: "Criticità budget"
        }
    }

    return {
        text: `Indicatori fuori soglia: budget al ${utilizationPercent ?? "?"}% e spese superflue al ${superfluousPercent ?? "?"}%. Richiesta attenzione immediata.`,
        shortText: "Attenzione urgente"
    }
}

function narrateCalm(facts: SnapshotFacts): NarrationResult {
    return {
        text: "Il mese è nelle fasi iniziali o i dati sono ancora limitati per elaborare un'analisi dettagliata.",
        shortText: "Dati iniziali"
    }
}
