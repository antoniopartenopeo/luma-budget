/**
 * Tests for Grouping Utilities V2
 * 
 * Covers:
 * - Sorting by totalAbsCents (income/expense separated)
 * - Subgroup generation (count >= 2)
 * - Split/merge state transitions
 * - Significance threshold/topN
 */

import { describe, it, expect } from "vitest"
import {
    computeGroupsV2,
    splitSubgroup,
    mergeSubgroup,
    setGroupSelected,
    computeSignificance,
    markTopNAsSignificant,
    applyCategoryToGroupV2,
    applyCategoryToSubgroup
} from "../grouping-utils-v2"
import type { PreviewRow } from "../types"
import { MIN_DUP_COUNT } from "../types"

// ============================================================================
// TEST HELPERS
// ============================================================================

function createRow(overrides: Partial<PreviewRow> & { rowIndex: number; amountCents: number; description: string }): PreviewRow {
    return {
        rowIndex: overrides.rowIndex,
        date: "2024-01-15",
        description: overrides.description,
        amountCents: overrides.amountCents,
        type: overrides.type ?? (overrides.amountCents < 0 ? "expense" : "income"),
        rawValues: {},
        parseErrors: [],
        isValid: overrides.isValid ?? true,
        isDuplicate: overrides.isDuplicate ?? false,
        selectedCategoryId: overrides.selectedCategoryId ?? "altro",
        isSelected: overrides.isSelected ?? true
    }
}

// ============================================================================
// SORTING TESTS
// ============================================================================

describe("computeGroupsV2 - sorting", () => {
    it("sorts expense groups by totalAbsCents descending", () => {
        const rows: PreviewRow[] = [
            createRow({ rowIndex: 0, amountCents: -1000, description: "Small expense", type: "expense" }),
            createRow({ rowIndex: 1, amountCents: -5000, description: "Large expense", type: "expense" }),
            createRow({ rowIndex: 2, amountCents: -3000, description: "Medium expense", type: "expense" })
        ]

        const result = computeGroupsV2(rows)

        expect(result.expense.length).toBe(3)
        expect(result.expense[0].totalAbsCents).toBe(5000)
        expect(result.expense[1].totalAbsCents).toBe(3000)
        expect(result.expense[2].totalAbsCents).toBe(1000)
    })

    it("sorts income groups by totalAbsCents descending", () => {
        const rows: PreviewRow[] = [
            createRow({ rowIndex: 0, amountCents: 2000, description: "Small income", type: "income" }),
            createRow({ rowIndex: 1, amountCents: 8000, description: "Large income", type: "income" }),
            createRow({ rowIndex: 2, amountCents: 4000, description: "Medium income", type: "income" })
        ]

        const result = computeGroupsV2(rows)

        expect(result.income.length).toBe(3)
        expect(result.income[0].totalAbsCents).toBe(8000)
        expect(result.income[1].totalAbsCents).toBe(4000)
        expect(result.income[2].totalAbsCents).toBe(2000)
    })

    it("separates income and expense into different arrays", () => {
        const rows: PreviewRow[] = [
            createRow({ rowIndex: 0, amountCents: -1000, description: "Amazon purchase online", type: "expense" }),
            createRow({ rowIndex: 1, amountCents: 2000, description: "Salary deposit monthly", type: "income" }),
            createRow({ rowIndex: 2, amountCents: -3000, description: "Netflix subscription monthly", type: "expense" })
        ]

        const result = computeGroupsV2(rows)

        expect(result.expense.length).toBe(2)
        expect(result.income.length).toBe(1)
        expect(result.expense.every(g => g.type === "expense")).toBe(true)
        expect(result.income.every(g => g.type === "income")).toBe(true)
    })

    it("puts expenses before income in combined 'all' array", () => {
        const rows: PreviewRow[] = [
            createRow({ rowIndex: 0, amountCents: 5000, description: "Income", type: "income" }),
            createRow({ rowIndex: 1, amountCents: -1000, description: "Expense", type: "expense" })
        ]

        const result = computeGroupsV2(rows)

        expect(result.all.length).toBe(2)
        expect(result.all[0].type).toBe("expense")
        expect(result.all[1].type).toBe("income")
    })
})

// ============================================================================
// SUBGROUP TESTS
// ============================================================================

describe("computeGroupsV2 - subgroups", () => {
    it("creates subgroup when same amount appears >= MIN_DUP_COUNT times", () => {
        const rows: PreviewRow[] = [
            createRow({ rowIndex: 0, amountCents: -999, description: "Netflix subscription", type: "expense" }),
            createRow({ rowIndex: 1, amountCents: -999, description: "Netflix subscription", type: "expense" }),
            createRow({ rowIndex: 2, amountCents: -999, description: "Netflix subscription", type: "expense" })
        ]

        const result = computeGroupsV2(rows)

        expect(result.expense.length).toBe(1)
        expect(result.expense[0].subgroups.length).toBe(1)
        expect(result.expense[0].subgroups[0].amountCents).toBe(999)
        expect(result.expense[0].subgroups[0].count).toBe(3)
        expect(result.expense[0].subgroups[0].isSplit).toBe(false)
    })

    it("does not create subgroup when count < MIN_DUP_COUNT", () => {
        const rows: PreviewRow[] = [
            createRow({ rowIndex: 0, amountCents: -999, description: "Netflix subscription", type: "expense" }),
            createRow({ rowIndex: 1, amountCents: -1299, description: "Netflix subscription", type: "expense" })
        ]

        const result = computeGroupsV2(rows)

        expect(result.expense.length).toBe(1)
        expect(result.expense[0].subgroups.length).toBe(0)
    })

    it("creates multiple subgroups for different amounts", () => {
        const rows: PreviewRow[] = [
            // €9.99 x 3
            createRow({ rowIndex: 0, amountCents: -999, description: "Spotify", type: "expense" }),
            createRow({ rowIndex: 1, amountCents: -999, description: "Spotify", type: "expense" }),
            createRow({ rowIndex: 2, amountCents: -999, description: "Spotify", type: "expense" }),
            // €4.99 x 2
            createRow({ rowIndex: 3, amountCents: -499, description: "Spotify", type: "expense" }),
            createRow({ rowIndex: 4, amountCents: -499, description: "Spotify", type: "expense" }),
            // €14.99 x 1 (no subgroup)
            createRow({ rowIndex: 5, amountCents: -1499, description: "Spotify", type: "expense" })
        ]

        const result = computeGroupsV2(rows)

        expect(result.expense[0].subgroups.length).toBe(2)
        // Sorted by (count * amount) desc: 999*3=2997 > 499*2=998
        expect(result.expense[0].subgroups[0].amountCents).toBe(999)
        expect(result.expense[0].subgroups[1].amountCents).toBe(499)
    })

    it("sorts subgroups by (count * amount) descending", () => {
        const rows: PreviewRow[] = [
            // €2.00 x 5 = 1000
            ...Array.from({ length: 5 }, (_, i) =>
                createRow({ rowIndex: i, amountCents: -200, description: "Small recurring", type: "expense" })
            ),
            // €8.00 x 2 = 1600
            createRow({ rowIndex: 5, amountCents: -800, description: "Small recurring", type: "expense" }),
            createRow({ rowIndex: 6, amountCents: -800, description: "Small recurring", type: "expense" })
        ]

        const result = computeGroupsV2(rows)

        expect(result.expense[0].subgroups.length).toBe(2)
        // 800*2=1600 > 200*5=1000
        expect(result.expense[0].subgroups[0].amountCents).toBe(800)
        expect(result.expense[0].subgroups[1].amountCents).toBe(200)
    })
})

// ============================================================================
// SPLIT/MERGE TESTS
// ============================================================================

describe("split/merge subgroups", () => {
    it("splitSubgroup marks subgroup as split", () => {
        const rows: PreviewRow[] = [
            createRow({ rowIndex: 0, amountCents: -999, description: "Netflix", type: "expense" }),
            createRow({ rowIndex: 1, amountCents: -999, description: "Netflix", type: "expense" })
        ]

        const result = computeGroupsV2(rows)
        const group = result.expense[0]

        expect(group.subgroups[0].isSplit).toBe(false)

        const updated = splitSubgroup(group, 999)

        expect(updated.subgroups[0].isSplit).toBe(true)
        // Original unchanged
        expect(group.subgroups[0].isSplit).toBe(false)
    })

    it("mergeSubgroup marks subgroup as not split", () => {
        const rows: PreviewRow[] = [
            createRow({ rowIndex: 0, amountCents: -999, description: "Netflix", type: "expense" }),
            createRow({ rowIndex: 1, amountCents: -999, description: "Netflix", type: "expense" })
        ]

        const result = computeGroupsV2(rows)
        let group = splitSubgroup(result.expense[0], 999)

        expect(group.subgroups[0].isSplit).toBe(true)

        group = mergeSubgroup(group, 999)

        expect(group.subgroups[0].isSplit).toBe(false)
    })

    it("split/merge is pure - does not mutate original", () => {
        const rows: PreviewRow[] = [
            createRow({ rowIndex: 0, amountCents: -999, description: "Test", type: "expense" }),
            createRow({ rowIndex: 1, amountCents: -999, description: "Test", type: "expense" })
        ]

        const result = computeGroupsV2(rows)
        const original = result.expense[0]

        splitSubgroup(original, 999)

        expect(original.subgroups[0].isSplit).toBe(false)
    })
})

// ============================================================================
// SIGNIFICANCE TESTS
// ============================================================================

describe("significance scoring", () => {
    it("computeGroupsV2 marks groups above threshold as significant", () => {
        const rows: PreviewRow[] = [
            createRow({ rowIndex: 0, amountCents: -10000, description: "Big expense", type: "expense" }),
            createRow({ rowIndex: 1, amountCents: -1000, description: "Small expense", type: "expense" })
        ]

        // Threshold €50 = 5000 cents
        const result = computeGroupsV2(rows, { thresholdCents: 5000 })

        expect(result.expense[0].isSignificant).toBe(true)  // €100 > €50
        expect(result.expense[1].isSignificant).toBe(false) // €10 < €50
    })

    it("isGroupSelected defaults to isSignificant", () => {
        const rows: PreviewRow[] = [
            createRow({ rowIndex: 0, amountCents: -10000, description: "Big", type: "expense" }),
            createRow({ rowIndex: 1, amountCents: -1000, description: "Small", type: "expense" })
        ]

        const result = computeGroupsV2(rows, { thresholdCents: 5000 })

        expect(result.expense[0].isGroupSelected).toBe(true)
        expect(result.expense[1].isGroupSelected).toBe(false)
    })

    it("markTopNAsSignificant marks only top N groups", () => {
        const rows: PreviewRow[] = [
            createRow({ rowIndex: 0, amountCents: -5000, description: "Amazon store purchase", type: "expense" }),
            createRow({ rowIndex: 1, amountCents: -3000, description: "Netflix monthly subscription", type: "expense" }),
            createRow({ rowIndex: 2, amountCents: -1000, description: "Spotify premium plan", type: "expense" }),
            createRow({ rowIndex: 3, amountCents: -500, description: "Apple icloud storage", type: "expense" })
        ]

        const result = computeGroupsV2(rows, { thresholdCents: 0 }) // All significant initially
        expect(result.expense.length).toBe(4) // Ensure we have 4 groups

        const topN = markTopNAsSignificant(result.expense, 2)

        expect(topN.filter(g => g.isSignificant).length).toBe(2)
        expect(topN[0].isSignificant).toBe(true) // €50
        expect(topN[1].isSignificant).toBe(true) // €30
        expect(topN[2].isSignificant).toBe(false) // €10
        expect(topN[3].isSignificant).toBe(false) // €5
    })

    it("computeSignificance reapplies threshold", () => {
        const rows: PreviewRow[] = [
            createRow({ rowIndex: 0, amountCents: -10000, description: "Big", type: "expense" }),
            createRow({ rowIndex: 1, amountCents: -3000, description: "Mid", type: "expense" }),
            createRow({ rowIndex: 2, amountCents: -1000, description: "Small", type: "expense" })
        ]

        const result = computeGroupsV2(rows, { thresholdCents: 0 }) // All significant
        const recomputed = computeSignificance(result.expense, 5000)

        expect(recomputed[0].isSignificant).toBe(true)  // €100
        expect(recomputed[1].isSignificant).toBe(false) // €30
        expect(recomputed[2].isSignificant).toBe(false) // €10
    })
})

// ============================================================================
// GROUP SELECTION TESTS
// ============================================================================

describe("group selection", () => {
    it("setGroupSelected updates isGroupSelected", () => {
        const rows: PreviewRow[] = [
            createRow({ rowIndex: 0, amountCents: -1000, description: "Test", type: "expense" })
        ]

        const result = computeGroupsV2(rows, { thresholdCents: 0 })
        const group = result.expense[0]

        expect(group.isGroupSelected).toBe(true)

        const updated = setGroupSelected(group, false)

        expect(updated.isGroupSelected).toBe(false)
        // Original unchanged
        expect(group.isGroupSelected).toBe(true)
    })
})

// ============================================================================
// CATEGORY APPLICATION TESTS
// ============================================================================

describe("category application", () => {
    it("applyCategoryToGroupV2 updates all rows in group", () => {
        const rows: PreviewRow[] = [
            createRow({ rowIndex: 0, amountCents: -1000, description: "Netflix", type: "expense" }),
            createRow({ rowIndex: 1, amountCents: -1000, description: "Netflix", type: "expense" }),
            createRow({ rowIndex: 2, amountCents: -2000, description: "Other", type: "expense" })
        ]

        const result = computeGroupsV2(rows)
        // Find Netflix group (has 2 rows)
        const netflixGroup = result.expense.find(g => g.count === 2)!

        const updated = applyCategoryToGroupV2(rows, netflixGroup, "streaming")

        expect(updated[0].selectedCategoryId).toBe("streaming")
        expect(updated[1].selectedCategoryId).toBe("streaming")
        expect(updated[2].selectedCategoryId).toBe("altro") // Unchanged
    })

    it("applyCategoryToSubgroup updates only subgroup rows", () => {
        const rows: PreviewRow[] = [
            createRow({ rowIndex: 0, amountCents: -999, description: "Spotify", type: "expense" }),
            createRow({ rowIndex: 1, amountCents: -999, description: "Spotify", type: "expense" }),
            createRow({ rowIndex: 2, amountCents: -1299, description: "Spotify", type: "expense" })
        ]

        const result = computeGroupsV2(rows)
        const group = result.expense[0]
        const subgroup = group.subgroups[0] // The €9.99 subgroup

        const updated = applyCategoryToSubgroup(rows, subgroup, "music")

        expect(updated[0].selectedCategoryId).toBe("music")
        expect(updated[1].selectedCategoryId).toBe("music")
        expect(updated[2].selectedCategoryId).toBe("altro") // Different amount, unchanged
    })
})

// ============================================================================
// PERFORMANCE SANITY
// ============================================================================

describe("performance", () => {
    it("handles 1000 rows efficiently", () => {
        const rows: PreviewRow[] = Array.from({ length: 1000 }, (_, i) =>
            createRow({
                rowIndex: i,
                amountCents: -(100 + (i % 50) * 100), // 50 different amounts
                description: `Merchant ${i % 20}`, // 20 different merchants
                type: "expense"
            })
        )

        const start = performance.now()
        const result = computeGroupsV2(rows)
        const duration = performance.now() - start

        expect(duration).toBeLessThan(100) // Should complete in <100ms
        expect(result.expense.length).toBeGreaterThan(0)
    })
})
