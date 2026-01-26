/**
 * Advisor Narrator
 * ===============
 * 
 * Pure functions to generate narrative text for AI Advisor.
 * Compliant with numa-insights-semantics skill.
 */

import { formatCents } from "@/domain/money"
import { AdvisorFacts, AdvisorState, NarrationResult } from "./types"

/**
 * Generates narrative text for the AI Advisor (Smart Tip).
 */
export function narrateAdvisor(
    facts: AdvisorFacts,
    state: AdvisorState
): NarrationResult {
    switch (state) {
        case "deficit":
            return narrateDeficit(facts)
        case "positive_balance":
            return narratePositiveBalance(facts)
        case "neutral":
        default:
            return narrateNeutral(facts)
    }
}

function narrateDeficit(facts: AdvisorFacts): NarrationResult {
    const { deltaCents } = facts
    const deficitFormatted = formatCents(Math.abs(deltaCents))

    return {
        text: `Attenzione: le proiezioni indicano un disavanzo di ${deficitFormatted}. Considera di tagliare le spese non essenziali.`
    }
}

function narratePositiveBalance(facts: AdvisorFacts): NarrationResult {
    const { deltaCents, predictedIncomeCents } = facts
    const surplusFormatted = formatCents(deltaCents)

    // Check for Micro-Attivo / Micro-Surplus
    // "Surplus" > 5% of income OR > 50€ (example threshold for "substantial")
    // Rule: "Micro-Attivo" if < 5% Income or < 50€

    // Safety check for division by zero
    const incomeCents = predictedIncomeCents > 0 ? predictedIncomeCents : 1
    const savingsRatePercent = (deltaCents / incomeCents) * 100

    // Thresholds for "Significant Surplus" logic (defined in SKILL as relative)
    // Here we implement the safe logic: if small, use cautious language.
    const isMicroSurplus = savingsRatePercent < 5 || deltaCents < 5000 // < €50

    if (isMicroSurplus) {
        return {
            text: `Hai un piccolo margine positivo di ${surplusFormatted}. Mantieni l'equilibrio per consolidare il risultato.`
        }
    }

    // Significant surplus
    return {
        text: `Proiezione positiva con un avanzo stimato di ${surplusFormatted}. Un buon margine per i tuoi obiettivi.`
    }
}

function narrateNeutral(facts: AdvisorFacts): NarrationResult {
    return {
        text: "Analisi in corso. Continua a tracciare le tue spese per ricevere suggerimenti personalizzati."
    }
}
