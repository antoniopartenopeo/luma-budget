import { describe, it, expect } from "vitest"
import { narrateAdvisor } from "../advisor.narrator"
import { AdvisorFacts } from "../types"

// Helper to create facts
const createFacts = (
    predictedTotalEstimatedBalanceCents: number,
    predictedRemainingCurrentMonthExpensesCents: number = 8000
): AdvisorFacts => ({
    baseBalanceCents: predictedTotalEstimatedBalanceCents + predictedRemainingCurrentMonthExpensesCents,
    predictedRemainingCurrentMonthExpensesCents,
    predictedTotalEstimatedBalanceCents,
    primarySource: "fallback",
    historicalMonthsCount: 3,
    subscriptionCount: 0,
    subscriptionTotalYearlyCents: 0
})

describe("Advisor Narrator (Semantic Rules)", () => {

    it("should never say 'Ottimo lavoro' when in deficit", () => {
        const facts = createFacts(-10000) // -100€
        const result = narrateAdvisor(facts, "deficit")

        expect(result.text).not.toContain("Ottimo lavoro")
        expect(result.text).toContain("saldo totale stimato")
        expect(result.text).toContain("spese non essenziali")
    })

    it("should use cautious language for a very small positive balance", () => {
        const facts = createFacts(4000, 6000)
        const result = narrateAdvisor(facts, "positive_balance")

        expect(result.text).toContain("margine e ridotto")
        expect(result.text).toContain("tieni il ritmo")
        expect(result.text).not.toContain("Ottimo lavoro") // Should not be overly enthusiastic
    })

    it("should be positive for a solid positive balance", () => {
        const facts = createFacts(20000, 6000)
        const result = narrateAdvisor(facts, "positive_balance")

        expect(result.text).toContain("Saldo totale stimato positivo")
        expect(result.text).toContain("situazione resta gestibile")
    })

    it("should be neutral for neutral state", () => {
        const facts = createFacts(0)
        const result = narrateAdvisor(facts, "neutral")

        expect(result.text).toContain("Analisi in corso")
    })

})
