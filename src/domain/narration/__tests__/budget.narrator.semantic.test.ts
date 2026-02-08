import { describe, it, expect } from "vitest"
import { deriveBudgetState } from "../derive-state"
import { narrateBudget } from "../budget.narrator"
import { BudgetFacts } from "../types"

describe("Budget Semantic Enforcement Suite", () => {

    const BANNED_POSITIVE_TERMS = ["in linea", "ottimo lavoro", "sotto controllo"]

    const createFacts = (overrides: Partial<BudgetFacts>): BudgetFacts => ({
        spentCents: 10000,
        limitCents: 100000,
        elapsedRatio: 0.5,
        utilizationRatio: 10000 / 100000,
        pacingRatio: (10000 / 100000) / 0.5,
        projectedSpendCents: (10000 / 100) / (0.5 / 100), // simplified
        isDataIncomplete: false,
        ...overrides
    })

    // 1. Rule B1: Early Month Precedence
    it("Rule B1: Early month (elapsed < 15%) -> early_uncertain", () => {
        const facts = createFacts({ elapsedRatio: 0.1, utilizationRatio: 0.05 })
        const state = deriveBudgetState(facts)
        expect(state).toBe("early_uncertain")

        const text = narrateBudget(facts, state).text.toLowerCase()
        BANNED_POSITIVE_TERMS.forEach(term => expect(text).not.toContain(term))
        expect(text).toContain("iniziato")
        expect(text).toContain("non sono ancora sufficienti")
    })

    // 2. Rule B2 & B3: Pacing Required and On Track
    it("Rule B3: Healthy Pacing -> on_track", () => {
        const facts = createFacts({ elapsedRatio: 0.5, utilizationRatio: 0.4, pacingRatio: 0.8 })
        const state = deriveBudgetState(facts)
        expect(state).toBe("on_track")

        const text = narrateBudget(facts, state).text.toLowerCase()
        expect(text).toContain("in linea")
        expect(text).toContain("ritmo pianificato")
    })

    // 3. Rule B4: At Risk (High Pacing)
    it("Rule B4: High Pacing (Utilization > Elapsed) -> at_risk", () => {
        const facts = createFacts({ elapsedRatio: 0.4, utilizationRatio: 0.6, pacingRatio: 1.5 })
        const state = deriveBudgetState(facts)
        expect(state).toBe("at_risk")

        const text = narrateBudget(facts, state).text.toLowerCase()
        BANNED_POSITIVE_TERMS.forEach(term => expect(text).not.toContain(term))
        expect(text).toContain("cautela")
        expect(text).toContain("potresti superare")
    })

    // 4. Rule B4: At Risk (Projected > Limit)
    it("Rule B4: Projected Overrun -> at_risk", () => {
        const facts = createFacts({
            elapsedRatio: 0.5,
            spentCents: 51000,
            limitCents: 100000,
            projectedSpendCents: 102000
        })
        const state = deriveBudgetState(facts)
        expect(state).toBe("at_risk")
    })

    // 5. Rule B5: Over Budget
    it("Rule B5: Spent > Limit -> over_budget", () => {
        const facts = createFacts({ spentCents: 105000, limitCents: 100000 })
        const state = deriveBudgetState(facts)
        expect(state).toBe("over_budget")

        const text = narrateBudget(facts, state).text.toLowerCase()
        BANNED_POSITIVE_TERMS.forEach(term => expect(text).not.toContain(term))
        expect(text).toContain("superato")
        expect(text).toContain("50,00")
        expect(text).not.toContain("ottimo")
    })

    // 6. Rule B6: Missing Data
    it("Rule B6: Missing Data -> calm", () => {
        const facts = createFacts({ isDataIncomplete: true })
        const state = deriveBudgetState(facts)
        expect(state).toBe("calm")

        const text = narrateBudget(facts, state).text.toLowerCase()
        expect(text).toContain("mancano dati")
    })
})
