/**
 * KPI Narrator
 * ===========
 * 
 * Pure functions to generate narrative text for individual KPI Cards.
 */

import { NarrationResult, KPIFacts, KPIState } from "./types"

/**
 * Generates narrative text for a single KPI card.
 * 
 * @param facts - Pre-calculated facts for the KPI
 * @param state - Derived state (good/attention/critical/neutral)
 * @returns NarrationResult with text
 */
export function narrateKPI(
    facts: KPIFacts,
    state: KPIState
): NarrationResult {
    switch (state) {
        case "good":
            return narrateGood(facts)
        case "attention":
            return narrateAttention(facts)
        case "critical":
            return narrateCritical(facts)
        case "neutral":
        default:
            return narrateNeutral(facts)
    }
}

// =====================
// STATE-SPECIFIC NARRATORS
// =====================

function narrateGood(facts: KPIFacts): NarrationResult {
    const { kpiId } = facts

    switch (kpiId) {
        case "balance":
            return { text: "Il tuo saldo è in attivo. Ottima gestione complessiva." }
        case "expenses":
            return { text: "Le uscite sono sotto controllo e in linea con le aspettative." }
        case "budget":
            return { text: "Ottimo margine rispetto al ritmo pianificato." }
        case "superfluous":
            return { text: "Spese extra contenute entro i limiti desiderati." }
        default:
            return { text: "Indicatore in fascia positiva. Continua così." }
    }
}

function narrateAttention(facts: KPIFacts): NarrationResult {
    const { kpiId, percent, targetPercent } = facts

    switch (kpiId) {
        case "balance":
            return { text: "Il saldo è ridotto. Monitora le prossime uscite." }
        case "budget":
            return { text: `Ritmo di spesa elevato (${percent}% di margine rimanente).` }
        case "superfluous":
            return { text: `Spese extra al ${percent}%, vicine al target del ${targetPercent}%.` }
        default:
            return { text: "Questo indicatore richiede un monitoraggio preventivo." }
    }
}

function narrateCritical(facts: KPIFacts): NarrationResult {
    const { kpiId, percent, targetPercent } = facts

    switch (kpiId) {
        case "balance":
            return { text: "Attenzione: saldo in negativo. Azione correttiva necessaria." }
        case "budget":
            return { text: "Sei oltre la soglia del ritmo pianificato." }
        case "superfluous":
            return { text: `Spese extra al ${percent}%, oltre il target del ${targetPercent}%.` }
        default:
            return { text: "Livello critico: necessaria una revisione immediata." }
    }
}

function narrateNeutral(facts: KPIFacts): NarrationResult {
    const { kpiId } = facts

    switch (kpiId) {
        case "budget":
            return { text: "Definisci un ritmo per avere un'analisi più precisa." }
        case "superfluous":
            return { text: "I dati sulle spese extra sono ancora limitati." }
        default:
            return { text: "Nessuna anomalia o segnale rilevante da riportare." }
    }
}
