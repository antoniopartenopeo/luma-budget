/**
 * Trend Narrator
 * ==============
 * 
 * Pure functions to generate narrative text for temporal trends.
 */

import { NarrationResult, TrendFacts, TrendState, OrchestrationContext } from "./types"

/**
 * Generates narrative text for a trend analysis.
 * 
 * @param facts - Temporal facts for the metric
 * @param state - Derived state (improving/deteriorating/stable/volatile/neutral)
 * @returns NarrationResult with text
 */
// Update signature to accept context
export function narrateTrend(
    facts: TrendFacts,
    state: TrendState,
    context?: OrchestrationContext
): NarrationResult {
    switch (state) {
        case "improving":
            return narrateImproving(facts, context)
        case "deteriorating":
            return narrateDeteriorating(facts)
        case "stable":
            return narrateStable(facts)
        case "volatile":
            return narrateVolatile(facts)
        case "neutral":
        default:
            return narrateNeutral(facts)
    }
}

// =====================
// STATE-SPECIFIC NARRATORS
// =====================

function narrateImproving(facts: TrendFacts, context?: OrchestrationContext): NarrationResult {
    const { metricType, metricId, currentValueFormatted, changePercent, isSavingsRateNegative, savingsRateValue } = facts
    const absChange = Math.abs(changePercent).toFixed(1)

    // Contextual Flag: Check if we need to warn about current crisis despite improvement
    const showContextWarning = context?.hasHighSeverityCurrentIssue && metricType === "savings_rate"

    let baseText = ""

    switch (metricType) {
        case "income":
            baseText = `Le entrate sono in crescita del ${absChange}% (${currentValueFormatted}). Trend positivo per il tuo cash flow.`
            break
        case "expenses":
            baseText = `Ottimo lavoro: le uscite sono diminuite del ${absChange}%. Stai ottimizzando i tuoi costi.`
            break
        case "savings_rate":
            // Semantic Safeguard: If we are still in negative territory (deficit), avoid "Efficiency" / "Improving".
            if (metricId === "savings_rate" && isSavingsRateNegative) {
                baseText = `Il disavanzo si è ridotto del ${absChange}%. Stai recuperando terreno.`
            } else if (savingsRateValue !== undefined && savingsRateValue < 0.05) {
                // Micro-hardening: avoid "efficienza" (ambiguous).
                baseText = `Il tasso di risparmio è aumentato del ${absChange}%. Continua a costruire il tuo margine.`
            } else {
                baseText = `Il tasso di risparmio è in aumento del ${absChange}%. La tua capacità di risparmio sta crescendo.`
            }
            break
        default:
            baseText = `Questo indicatore mostra un miglioramento del ${absChange}%.`
    }

    if (showContextWarning) {
        return { text: `${baseText} Questo mese però mostra un disavanzo, quindi la priorità è rientrare dal picco di spesa.` }
    }

    return { text: baseText }
}

function narrateDeteriorating(facts: TrendFacts): NarrationResult {
    const { metricType, currentValueFormatted, changePercent } = facts
    const absChange = Math.abs(changePercent).toFixed(1)

    switch (metricType) {
        case "income":
            return { text: `Le entrate hanno subito una flessione del ${absChange}%. Verifica se si tratta di un evento isolato.` }
        case "expenses":
            return { text: `Attenzione: le spese sono aumentate del ${absChange}% (${currentValueFormatted}). Monitora le voci di uscita.` }
        case "savings_rate":
            return { text: `Il tasso di risparmio è calato del ${absChange}%. C'è meno margine per i tuoi obiettivi futuri.` }
        default:
            return { text: `Questo indicatore mostra un peggioramento del ${absChange}%.` }
    }
}

function narrateStable(facts: TrendFacts): NarrationResult {
    const { metricType } = facts

    switch (metricType) {
        case "expenses":
            return { text: "Le uscite sono rimaste sostanzialmente costanti. Sei in una fase di equilibrio." }
        case "income":
            return { text: "Le entrate sono stabili. Buona prevedibilità per la tua pianificazione." }
        default:
            return { text: "L'indicatore non mostra variazioni significative in questo periodo." }
    }
}

function narrateVolatile(facts: TrendFacts): NarrationResult {
    const { metricType, changePercent } = facts
    const absChange = Math.abs(changePercent).toFixed(1)

    return { text: `Forte variabilità rilevata (${absChange}%). La gestione finanziaria richiede maggiore attenzione ai flussi irregolari.` }
}

function narrateNeutral(facts: TrendFacts): NarrationResult {
    return { text: "Dati insufficienti per identificare un trend consolidato negli ultimi mesi." }
}
