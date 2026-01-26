import { describe, it, expect } from "vitest"
import { narrateAdvisor } from "../advisor.narrator"
import { AdvisorFacts, AdvisorState } from "../types"

// Helper to create facts
const createFacts = (delta: number, income: number = 500000): AdvisorFacts => ({
    predictedIncomeCents: income,
    predictedExpensesCents: income - delta,
    deltaCents: delta,
    historicalMonthsCount: 3,
    subscriptionCount: 0,
    subscriptionTotalYearlyCents: 0
})

describe("Advisor Narrator (Semantic Rules)", () => {

    it("should never say 'Ottimo lavoro' when in deficit", () => {
        const facts = createFacts(-10000) // -100€
        const result = narrateAdvisor(facts, "deficit")

        expect(result.text).not.toContain("Ottimo lavoro")
        expect(result.text).toContain("disavanzo")
        expect(result.text).toContain("tagliare le spese")
    })

    it("should use cautious language for micro-surplus (< 5% income)", () => {
        // Income 1000€ (100000 cents), Surplus 40€ (4000 cents) -> 4% (micro)
        const facts = createFacts(4000, 100000)
        const result = narrateAdvisor(facts, "positive_balance")

        expect(result.text).toContain("piccolo margine")
        expect(result.text).toContain("Mantieni l'equilibrio")
        expect(result.text).not.toContain("Ottimo lavoro") // Should not be overly enthusiastic
    })

    it("should be positive for significant surplus", () => {
        // Income 1000€, Surplus 200€ -> 20% (significant)
        const facts = createFacts(20000, 100000)
        const result = narrateAdvisor(facts, "positive_balance")

        expect(result.text).toContain("Proiezione positiva")
        expect(result.text).toContain("buon margine")
    })

    it("should be neutral for neutral state", () => {
        const facts = createFacts(0)
        const result = narrateAdvisor(facts, "neutral")

        expect(result.text).toContain("Analisi in corso")
    })

})
