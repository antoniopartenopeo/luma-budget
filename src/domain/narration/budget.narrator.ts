/**
 * Budget Narrator
 * ===============
 * 
 * Pure function that generates narrative text for the Budget section.
 * 
 * RULES:
 * - NO access to transactions/budget repository.
 * - NO calculations inside (use facts).
 * - NOT judgmental, NOT punitive.
 */

import { NarrationResult, BudgetFacts, BudgetState } from "./types"
import { formatCents } from "@/domain/money"

/**
 * Generates narrative text for the Budget section/card.
 * 
 * @param facts - Pre-calculated BudgetFacts
 * @param state - Derived BudgetState
 * @returns NarrationResult with text and optional decorations
 */
export function narrateBudget(
    facts: BudgetFacts,
    state: BudgetState
): NarrationResult {
    switch (state) {
        case "early_uncertain":
            return {
                text: "Il mese è appena iniziato. I dati attuali non sono ancora sufficienti per una proiezione affidabile del ritmo di spesa.",
                shortText: "Analisi in corso"
            }

        case "at_risk":
            return {
                text: "Il ritmo di spesa attuale suggerisce cautela: continuando così, potresti superare il ritmo pianificato del mese.",
                shortText: "Ritmo elevato"
            }

        case "over_budget":
            const overrunAmount = facts.spentCents - facts.limitCents
            return {
                text: `Hai superato il ritmo pianificato di ${formatCents(overrunAmount)}. Questo andamento è oltre la soglia ottimale.`,
                shortText: "Fuori ritmo"
            }

        case "on_track":
            return {
                text: "Le spese sono in linea con la programmazione temporale del mese. Stai rispettando il ritmo pianificato.",
                shortText: "In linea"
            }

        case "calm":
        default:
            return {
                text: "Non ci sono segnali significativi o mancano dati sufficienti per elaborare un'analisi del ritmo al momento.",
                shortText: "Nessun segnale"
            }
    }
}
