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
            return narrateNeutral()
    }
}

function narrateDeficit(facts: AdvisorFacts): NarrationResult {
    const {
        predictedTotalEstimatedBalanceCents,
        predictedRemainingCurrentMonthExpensesCents,
    } = facts
    const saldoFormatted = formatCents(predictedTotalEstimatedBalanceCents)
    const remainingFormatted = formatCents(predictedRemainingCurrentMonthExpensesCents)

    return {
        text: `Attenzione: il saldo totale stimato scende a ${saldoFormatted}. Restano circa ${remainingFormatted} di spese attese nel mese: valuta un taglio sulle spese non essenziali.`
    }
}

function narratePositiveBalance(facts: AdvisorFacts): NarrationResult {
    const {
        predictedTotalEstimatedBalanceCents,
        predictedRemainingCurrentMonthExpensesCents,
    } = facts
    const saldoFormatted = formatCents(predictedTotalEstimatedBalanceCents)
    const remainingFormatted = formatCents(predictedRemainingCurrentMonthExpensesCents)
    const hasTightBuffer = predictedTotalEstimatedBalanceCents < 10000 // < €100

    if (hasTightBuffer) {
        return {
            text: `Il saldo totale stimato resta positivo (${saldoFormatted}), ma il margine e ridotto. Restano circa ${remainingFormatted} di spese nel mese: tieni il ritmo sotto controllo.`
        }
    }

    return {
        text: `Saldo totale stimato positivo (${saldoFormatted}). Con circa ${remainingFormatted} di spese residue previste, la situazione resta gestibile.`
    }
}

function narrateNeutral(): NarrationResult {
    return {
        text: "Analisi in corso. Continua a tracciare le tue spese per ricevere suggerimenti personalizzati."
    }
}
