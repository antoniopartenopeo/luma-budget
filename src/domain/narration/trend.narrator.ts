/**
 * Trend Narrator
 * ==============
 * 
 * Pure functions to generate narrative text for temporal trends.
 */

import { NarrationResult, TrendFacts, TrendState } from "./types"

/**
 * Generates narrative text for a trend analysis.
 * 
 * @param facts - Temporal facts for the metric
 * @param state - Derived state (improving/deteriorating/stable/volatile/neutral)
 * @returns NarrationResult with text
 */
export function narrateTrend(
    facts: TrendFacts,
    state: TrendState
): NarrationResult {
    switch (state) {
        case "improving":
            return narrateImproving(facts)
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

function narrateImproving(facts: TrendFacts): NarrationResult {
    const { metricType, currentValueFormatted, changePercent } = facts
    const absChange = Math.abs(changePercent).toFixed(1)

    switch (metricType) {
        case "income":
            return { text: `Le entrate sono in crescita del ${absChange}% (${currentValueFormatted}). Trend positivo per il tuo cash flow.` }
        case "expenses":
            return { text: `Ottimo lavoro: le uscite sono diminuite del ${absChange}%. Stai ottimizzando i tuoi costi.` }
        case "savings_rate":
            return { text: `Il tasso di risparmio è migliorato del ${absChange}%. La tua efficienza finanziaria sta aumentando.` }
        default:
            return { text: `Questo indicatore mostra un miglioramento del ${absChange}%.` }
    }
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
