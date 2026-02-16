import { describe, it, expect } from "vitest"
import { getInsightThresholds } from "../utils"
import { buildCategorySpikeInsights, buildBudgetRiskInsight } from "../generators"
import { CategorySpikeInput, BudgetRiskInput } from "../types"

describe("Insights Sensitivity", () => {
    describe("getInsightThresholds", () => {
        it("should return LOW thresholds", () => {
            const t = getInsightThresholds("low")
            expect(t.spikeMinDeltaCents).toBe(10000)
            expect(t.spikeMinDeltaPct).toBe(50)
            expect(t.topDriversMinDeltaCents).toBe(10000)
        })

        it("should return MEDIUM thresholds by default", () => {
            const t = getInsightThresholds("medium")
            expect(t.spikeMinDeltaCents).toBe(5000)
            expect(t.spikeMinDeltaPct).toBe(30)
            expect(t.topDriversMinDeltaCents).toBe(0)
        })

        it("should return HIGH thresholds", () => {
            const t = getInsightThresholds("high")
            expect(t.spikeMinDeltaCents).toBe(2000)
            expect(t.spikeMinDeltaPct).toBe(20)
            expect(t.budgetHighPct).toBe(25)
        })
    })

    describe("Category Spike Sensitivity", () => {
        const categoriesMap = new Map([["food", { label: "Cibo" }]])
        const currentPeriod = "2026-01"

        // €40 spike (4000 cents). 
        // Baseline: €100 (10000 cents) avg.
        // Current: €140 (14000 cents).
        // Delta cents = 4000, Delta pct = 40%.

        const input: CategorySpikeInput = {
            transactions: [
                { categoryId: "food", amountCents: -14000, type: "expense", timestamp: new Date("2026-01-15").getTime() },
                { categoryId: "food", amountCents: -10000, type: "expense", timestamp: new Date("2025-12-15").getTime() },
                { categoryId: "food", amountCents: -10000, type: "expense", timestamp: new Date("2025-11-15").getTime() },
                { categoryId: "food", amountCents: -10000, type: "expense", timestamp: new Date("2025-10-15").getTime() },
            ],
            categoriesMap,
            currentPeriod
        }

        it("should trigger alert in HIGH sensitivity (€20/20%)", () => {
            const thresholds = getInsightThresholds("high")
            const insights = buildCategorySpikeInsights(input, thresholds)
            expect(insights.length).toBe(1)
        })

        it("should NOT trigger alert in LOW sensitivity (€100/50%)", () => {
            const thresholds = getInsightThresholds("low")
            const insights = buildCategorySpikeInsights(input, thresholds)
            expect(insights.length).toBe(0)
        })
    })

    describe("Budget Risk Sensitivity", () => {
        const period = "2026-01"
        const budgetCents = 100000 // €1000
        const currentDate = new Date("2026-01-15") // Mid month

        // Spent €550 in 15 days = €1100 projected.
        // Delta = €100 = 10% over budget.

        const input: BudgetRiskInput = {
            transactions: [
                { amountCents: -55000, type: "expense", timestamp: new Date("2026-01-10").getTime() }
            ],
            budgetCents,
            period,
            currentDate
        }

        it("should trigger alert in HIGH sensitivity (10% threshold)", () => {
            const thresholds = getInsightThresholds("high")
            const insight = buildBudgetRiskInsight(input, thresholds)
            expect(insight).not.toBeNull()
            expect(insight?.severity).toBe("medium") // 10% is medium in HIGH
        })

        it("should NOT trigger alert in LOW sensitivity (30% threshold)", () => {
            const thresholds = getInsightThresholds("low")
            const insight = buildBudgetRiskInsight(input, thresholds)
            expect(insight).toBeNull()
        })
    })
})
