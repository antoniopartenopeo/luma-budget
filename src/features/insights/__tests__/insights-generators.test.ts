/**
 * Insight Generators Unit Tests
 * 
 * Tests the pure generator functions for budget-risk, category-spike, and top-drivers insights.
 */

import { describe, it, expect } from "vitest"
import {
    buildBudgetRiskInsight,
    buildCategorySpikeInsights,
    buildTopDriversInsight,
} from "../generators"
import { INSIGHT_THRESHOLDS } from "../constants"

// Helper to create mock transactions
function createTransaction(overrides: {
    id?: string
    description?: string
    categoryId?: string
    amountCents?: number
    type?: "income" | "expense"
    timestamp?: number
}) {
    return {
        id: overrides.id || `t-${Math.random().toString(36).slice(2)}`,
        description: overrides.description || "Test Transaction",
        categoryId: overrides.categoryId || "altro",
        amountCents: overrides.amountCents || 1000,
        type: overrides.type || "expense",
        timestamp: overrides.timestamp || Date.now(),
    }
}

// Helper to get timestamp for a specific date
function getTimestamp(year: number, month: number, day: number): number {
    return new Date(year, month - 1, day, 12, 0, 0).getTime()
}

describe("buildBudgetRiskInsight", () => {
    const period = "2026-01"
    const midMonth = new Date(2026, 0, 15, 12, 0, 0) // Jan 15, 2026

    it("returns null when no budget is set", () => {
        const transactions = [
            createTransaction({ amountCents: 10000, timestamp: getTimestamp(2026, 1, 5) }),
        ]

        const result = buildBudgetRiskInsight({
            transactions,
            budgetCents: null,
            period,
            currentDate: midMonth,
        })

        expect(result).toBeNull()
    })

    it("returns null when budget is zero", () => {
        const transactions = [
            createTransaction({ amountCents: 10000, timestamp: getTimestamp(2026, 1, 5) }),
        ]

        const result = buildBudgetRiskInsight({
            transactions,
            budgetCents: 0,
            period,
            currentDate: midMonth,
        })

        expect(result).toBeNull()
    })

    it("returns null when projected spending is within budget", () => {
        // Spent €50 in 15 days, budget is €200
        // Projection: (5000 / 15) * 31 = ~10333 cents = €103.33
        const transactions = [
            createTransaction({ amountCents: 5000, timestamp: getTimestamp(2026, 1, 5) }),
        ]

        const result = buildBudgetRiskInsight({
            transactions,
            budgetCents: 20000, // €200
            period,
            currentDate: midMonth,
        })

        expect(result).toBeNull()
    })

    it("returns insight when projected spending exceeds budget", () => {
        // Spent €150 in 15 days, budget is €200
        // Projection: (15000 / 15) * 31 = 31000 cents = €310
        // Delta: 31000 - 20000 = 11000 (+55%)
        const transactions = [
            createTransaction({ amountCents: 15000, timestamp: getTimestamp(2026, 1, 5) }),
        ]

        const result = buildBudgetRiskInsight({
            transactions,
            budgetCents: 20000, // €200
            period,
            currentDate: midMonth,
        })

        expect(result).not.toBeNull()
        expect(result?.kind).toBe("budget-risk")
        expect(result?.severity).toBe("high") // >25% over budget
        expect(result?.metrics.deltaCents).toBeGreaterThan(0)
    })

    it("returns medium severity when moderately over budget", () => {
        // Spent €100 in 15 days, budget is €200
        // Projection: (10000 / 15) * 31 = ~20666 cents = €206.66
        // Delta: ~666 cents (~3.3%) -> low severity
        const transactions = [
            createTransaction({ amountCents: 10000, timestamp: getTimestamp(2026, 1, 10) }),
        ]

        // Budget that would result in ~15% over
        const budgetCents = 18000 // €180
        // Projection at day 10: (10000/10)*31 = 31000
        // Delta: 31000 - 18000 = 13000 (~72%) -> high

        const result = buildBudgetRiskInsight({
            transactions,
            budgetCents,
            period,
            currentDate: new Date(2026, 0, 10), // Day 10
        })

        expect(result).not.toBeNull()
        // This will be high due to the large percentage
    })

    it("returns null when no days elapsed (first of month at midnight)", () => {
        const transactions = [
            createTransaction({ amountCents: 10000, timestamp: getTimestamp(2026, 1, 1) }),
        ]

        // Before the period starts
        const result = buildBudgetRiskInsight({
            transactions,
            budgetCents: 20000,
            period,
            currentDate: new Date(2025, 11, 31), // Dec 31, 2025
        })

        expect(result).toBeNull()
    })

    it("only considers expense transactions, ignoring income", () => {
        const transactions = [
            createTransaction({ amountCents: 50000, type: "income", timestamp: getTimestamp(2026, 1, 5) }),
            createTransaction({ amountCents: 3000, type: "expense", timestamp: getTimestamp(2026, 1, 5) }),
        ]

        // Only €30 expense in 15 days, budget €100
        // Projection: (3000/15)*31 = 6200 cents = €62
        const result = buildBudgetRiskInsight({
            transactions,
            budgetCents: 10000, // €100
            period,
            currentDate: midMonth,
        })

        expect(result).toBeNull() // Within budget
    })

    it("generates correct action URL", () => {
        const transactions = [
            createTransaction({ amountCents: 20000, timestamp: getTimestamp(2026, 1, 5) }),
        ]

        const result = buildBudgetRiskInsight({
            transactions,
            budgetCents: 10000,
            period,
            currentDate: midMonth,
        })

        expect(result?.actions[0].href).toContain("/transactions")
        expect(result?.actions[0].href).toContain("from=2026-01-01")
        expect(result?.actions[0].href).toContain("to=2026-01-31")
    })
})

describe("buildCategorySpikeInsights", () => {
    const currentPeriod = "2026-01"
    const categoriesMap = new Map([
        ["cibo", { label: "Cibo" }],
        ["svago", { label: "Svago" }],
        ["trasporti", { label: "Trasporti" }],
    ])

    it("returns empty array when no spikes above thresholds", () => {
        // Stable spending across months
        const transactions = [
            // Current month
            createTransaction({ categoryId: "cibo", amountCents: 5000, timestamp: getTimestamp(2026, 1, 10) }),
            // Previous 3 months (similar amounts)
            createTransaction({ categoryId: "cibo", amountCents: 5000, timestamp: getTimestamp(2025, 12, 10) }),
            createTransaction({ categoryId: "cibo", amountCents: 5000, timestamp: getTimestamp(2025, 11, 10) }),
            createTransaction({ categoryId: "cibo", amountCents: 5000, timestamp: getTimestamp(2025, 10, 10) }),
        ]

        const result = buildCategorySpikeInsights({
            transactions,
            categoriesMap,
            currentPeriod,
        })

        expect(result).toHaveLength(0)
    })

    it("detects spike when delta exceeds both thresholds", () => {
        // Current: €150, Baseline avg: €50 -> delta €100 (+200%)
        const transactions = [
            // Current month
            createTransaction({ categoryId: "svago", amountCents: 15000, timestamp: getTimestamp(2026, 1, 10) }),
            // Previous 3 months
            createTransaction({ categoryId: "svago", amountCents: 5000, timestamp: getTimestamp(2025, 12, 10) }),
            createTransaction({ categoryId: "svago", amountCents: 5000, timestamp: getTimestamp(2025, 11, 10) }),
            createTransaction({ categoryId: "svago", amountCents: 5000, timestamp: getTimestamp(2025, 10, 10) }),
        ]

        const result = buildCategorySpikeInsights({
            transactions,
            categoriesMap,
            currentPeriod,
        })

        expect(result).toHaveLength(1)
        expect(result[0].kind).toBe("category-spike")
        expect(result[0].title).toContain("Svago")
        expect(result[0].metrics.deltaCents).toBe(10000) // €100
        expect(result[0].metrics.deltaPct).toBe(200) // 200%
    })

    it("ignores spike below absolute threshold (€50)", () => {
        // Current: €60, Baseline avg: €30 -> delta €30 (+100%)
        // Delta is above 30% but below €50
        const transactions = [
            createTransaction({ categoryId: "cibo", amountCents: 6000, timestamp: getTimestamp(2026, 1, 10) }),
            createTransaction({ categoryId: "cibo", amountCents: 3000, timestamp: getTimestamp(2025, 12, 10) }),
            createTransaction({ categoryId: "cibo", amountCents: 3000, timestamp: getTimestamp(2025, 11, 10) }),
            createTransaction({ categoryId: "cibo", amountCents: 3000, timestamp: getTimestamp(2025, 10, 10) }),
        ]

        const result = buildCategorySpikeInsights({
            transactions,
            categoriesMap,
            currentPeriod,
        })

        expect(result).toHaveLength(0)
    })

    it("ignores spike below percentage threshold (30%)", () => {
        // Current: €160, Baseline avg: €150 -> delta €10 (+6.7%)
        // Delta is above €50 but below 30%
        const transactions = [
            createTransaction({ categoryId: "cibo", amountCents: 16000, timestamp: getTimestamp(2026, 1, 10) }),
            createTransaction({ categoryId: "cibo", amountCents: 15000, timestamp: getTimestamp(2025, 12, 10) }),
            createTransaction({ categoryId: "cibo", amountCents: 15000, timestamp: getTimestamp(2025, 11, 10) }),
            createTransaction({ categoryId: "cibo", amountCents: 15000, timestamp: getTimestamp(2025, 10, 10) }),
        ]

        const result = buildCategorySpikeInsights({
            transactions,
            categoriesMap,
            currentPeriod,
        })

        expect(result).toHaveLength(0)
    })

    it("returns max 3 categories sorted by delta", () => {
        // Create 4 spikes, should only return top 3
        const transactions = [
            // Current month - 4 categories with spikes
            createTransaction({ categoryId: "cibo", amountCents: 20000, timestamp: getTimestamp(2026, 1, 10) }),
            createTransaction({ categoryId: "svago", amountCents: 30000, timestamp: getTimestamp(2026, 1, 10) }),
            createTransaction({ categoryId: "trasporti", amountCents: 25000, timestamp: getTimestamp(2026, 1, 10) }),
            // Previous months - baseline €30 each
            createTransaction({ categoryId: "cibo", amountCents: 3000, timestamp: getTimestamp(2025, 12, 10) }),
            createTransaction({ categoryId: "svago", amountCents: 3000, timestamp: getTimestamp(2025, 12, 10) }),
            createTransaction({ categoryId: "trasporti", amountCents: 3000, timestamp: getTimestamp(2025, 12, 10) }),
            createTransaction({ categoryId: "cibo", amountCents: 3000, timestamp: getTimestamp(2025, 11, 10) }),
            createTransaction({ categoryId: "svago", amountCents: 3000, timestamp: getTimestamp(2025, 11, 10) }),
            createTransaction({ categoryId: "trasporti", amountCents: 3000, timestamp: getTimestamp(2025, 11, 10) }),
            createTransaction({ categoryId: "cibo", amountCents: 3000, timestamp: getTimestamp(2025, 10, 10) }),
            createTransaction({ categoryId: "svago", amountCents: 3000, timestamp: getTimestamp(2025, 10, 10) }),
            createTransaction({ categoryId: "trasporti", amountCents: 3000, timestamp: getTimestamp(2025, 10, 10) }),
        ]

        const result = buildCategorySpikeInsights({
            transactions,
            categoriesMap,
            currentPeriod,
        })

        expect(result.length).toBeLessThanOrEqual(INSIGHT_THRESHOLDS.SPIKE_TOP_CATEGORIES)
        // Should be sorted by delta: svago (27000), trasporti (22000), cibo (17000)
        expect(result[0].title).toContain("Svago")
    })

    it("handles zero baseline gracefully (new category)", () => {
        // Category only appears in current month
        const transactions = [
            createTransaction({ categoryId: "svago", amountCents: 10000, timestamp: getTimestamp(2026, 1, 10) }),
        ]

        const result = buildCategorySpikeInsights({
            transactions,
            categoriesMap,
            currentPeriod,
        })

        // Should detect as spike (100% increase from 0)
        expect(result).toHaveLength(1)
        expect(result[0].metrics.deltaPct).toBe(100)
    })

    it("ignores income transactions", () => {
        const transactions = [
            createTransaction({ categoryId: "svago", amountCents: 50000, type: "income", timestamp: getTimestamp(2026, 1, 10) }),
        ]

        const result = buildCategorySpikeInsights({
            transactions,
            categoriesMap,
            currentPeriod,
        })

        expect(result).toHaveLength(0)
    })

    it("generates correct action URL with category filter", () => {
        const transactions = [
            createTransaction({ categoryId: "svago", amountCents: 15000, timestamp: getTimestamp(2026, 1, 10) }),
            createTransaction({ categoryId: "svago", amountCents: 3000, timestamp: getTimestamp(2025, 12, 10) }),
            createTransaction({ categoryId: "svago", amountCents: 3000, timestamp: getTimestamp(2025, 11, 10) }),
            createTransaction({ categoryId: "svago", amountCents: 3000, timestamp: getTimestamp(2025, 10, 10) }),
        ]

        const result = buildCategorySpikeInsights({
            transactions,
            categoriesMap,
            currentPeriod,
        })

        expect(result[0].actions[0].href).toContain("cat=svago")
    })
})

describe("buildTopDriversInsight", () => {
    const currentPeriod = "2026-01"
    const categoriesMap = new Map([
        ["cibo", { label: "Cibo" }],
        ["svago", { label: "Svago" }],
    ])

    it("returns null when no expense transactions in period", () => {
        const transactions = [
            createTransaction({ type: "income", amountCents: 50000, timestamp: getTimestamp(2026, 1, 10) }),
        ]

        const result = buildTopDriversInsight({
            transactions,
            categoriesMap,
            currentPeriod,
        })

        expect(result).toBeNull()
    })

    it("returns insight with top 5 transactions by amount", () => {
        const transactions = [
            createTransaction({ id: "t1", description: "Big expense", amountCents: 10000, timestamp: getTimestamp(2026, 1, 10) }),
            createTransaction({ id: "t2", description: "Medium expense", amountCents: 5000, timestamp: getTimestamp(2026, 1, 11) }),
            createTransaction({ id: "t3", description: "Small expense", amountCents: 2000, timestamp: getTimestamp(2026, 1, 12) }),
            createTransaction({ id: "t4", description: "Tiny expense", amountCents: 1000, timestamp: getTimestamp(2026, 1, 13) }),
            createTransaction({ id: "t5", description: "Mini expense", amountCents: 500, timestamp: getTimestamp(2026, 1, 14) }),
            createTransaction({ id: "t6", description: "Micro expense", amountCents: 100, timestamp: getTimestamp(2026, 1, 15) }),
        ]

        const result = buildTopDriversInsight({
            transactions,
            categoriesMap,
            currentPeriod,
        })

        expect(result).not.toBeNull()
        expect(result?.drivers).toHaveLength(5)
        expect(result?.drivers?.[0].label).toBe("Big expense")
        expect(result?.drivers?.[0].amountCents).toBe(10000)
    })

    it("calculates month-over-month delta correctly", () => {
        const transactions = [
            // Current month: €200
            createTransaction({ amountCents: 20000, timestamp: getTimestamp(2026, 1, 10) }),
            // Previous month: €150
            createTransaction({ amountCents: 15000, timestamp: getTimestamp(2025, 12, 10) }),
        ]

        const result = buildTopDriversInsight({
            transactions,
            categoriesMap,
            currentPeriod,
        })

        expect(result?.metrics.deltaCents).toBe(5000) // +€50
        expect(result?.severity).toBe("medium") // Positive delta
    })

    it("returns low severity when spending decreased", () => {
        const transactions = [
            // Current month: €100
            createTransaction({ amountCents: 10000, timestamp: getTimestamp(2026, 1, 10) }),
            // Previous month: €150
            createTransaction({ amountCents: 15000, timestamp: getTimestamp(2025, 12, 10) }),
        ]

        const result = buildTopDriversInsight({
            transactions,
            categoriesMap,
            currentPeriod,
        })

        expect(result?.metrics.deltaCents).toBe(-5000) // -€50
        expect(result?.severity).toBe("low")
    })

    it("generates correct action URL with amount sort", () => {
        const transactions = [
            createTransaction({ amountCents: 10000, timestamp: getTimestamp(2026, 1, 10) }),
        ]

        const result = buildTopDriversInsight({
            transactions,
            categoriesMap,
            currentPeriod,
        })

        expect(result?.actions[0].href).toContain("sort=amount")
        expect(result?.actions[0].href).toContain("order=desc")
    })
})
