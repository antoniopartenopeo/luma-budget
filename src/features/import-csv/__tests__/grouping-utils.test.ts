/**
 * Tests for grouping-utils
 */

import { computeGroups, applyCategoryToGroup } from "../grouping-utils"
import type { PreviewRow } from "../types"

// Helper to create mock rows
function createMockRow(overrides: Partial<PreviewRow> & { rowIndex: number; description: string }): PreviewRow {
    return {
        rowIndex: overrides.rowIndex,
        date: "2024-01-15",
        description: overrides.description,
        amountCents: overrides.amountCents ?? -1000,
        type: overrides.type ?? "expense",
        rawValues: {},
        parseErrors: [],
        isValid: overrides.isValid ?? true,
        isDuplicate: overrides.isDuplicate ?? false,
        selectedCategoryId: overrides.selectedCategoryId ?? "altro",
        isSelected: overrides.isSelected ?? true
    }
}

describe("computeGroups", () => {
    it("groups rows by pattern key", () => {
        const rows: PreviewRow[] = [
            createMockRow({ rowIndex: 0, description: "PAGAMENTO POS AMAZON EU SARL ORD 123" }),
            createMockRow({ rowIndex: 1, description: "PAGAMENTO POS AMAZON EU SARL ORD 456" }),
            createMockRow({ rowIndex: 2, description: "PAGAMENTO POS NETFLIX 789" })
        ]

        const groups = computeGroups(rows)

        expect(groups.length).toBe(2)
        expect(groups.some(g => g.count === 2)).toBe(true) // Amazon group
        expect(groups.some(g => g.count === 1)).toBe(true) // Netflix group
    })

    it("excludes invalid rows", () => {
        const rows: PreviewRow[] = [
            createMockRow({ rowIndex: 0, description: "AMAZON", isValid: true }),
            createMockRow({ rowIndex: 1, description: "AMAZON", isValid: false })
        ]

        const groups = computeGroups(rows)

        expect(groups[0].count).toBe(1)
    })

    it("separates income and expense with same merchant", () => {
        const rows: PreviewRow[] = [
            createMockRow({ rowIndex: 0, description: "AMAZON REFUND", type: "income", amountCents: 1000 }),
            createMockRow({ rowIndex: 1, description: "AMAZON PURCHASE", type: "expense", amountCents: -1000 })
        ]

        const groups = computeGroups(rows)

        expect(groups.length).toBe(2)
    })

    it("sorts by count descending", () => {
        const rows: PreviewRow[] = [
            createMockRow({ rowIndex: 0, description: "NETFLIX" }),
            createMockRow({ rowIndex: 1, description: "AMAZON ORD 1" }),
            createMockRow({ rowIndex: 2, description: "AMAZON ORD 2" }),
            createMockRow({ rowIndex: 3, description: "AMAZON ORD 3" })
        ]

        const groups = computeGroups(rows)

        expect(groups[0].count).toBeGreaterThanOrEqual(groups[1].count)
    })

    it("is O(n) - handles large datasets efficiently", () => {
        const rows: PreviewRow[] = Array.from({ length: 1000 }, (_, i) =>
            createMockRow({
                rowIndex: i,
                // Use same merchant names to test grouping
                description: `PAGAMENTO CONAD CITY ROMA ${i}`
            })
        )

        const start = performance.now()
        const groups = computeGroups(rows)
        const duration = performance.now() - start

        // Performance check
        expect(duration).toBeLessThan(100) // Should complete in < 100ms
        // All should group together since variable tokens (numbers) are removed
        expect(groups.length).toBe(1)
    })

    it("produces stable output (same input -> same output)", () => {
        const rows: PreviewRow[] = [
            createMockRow({ rowIndex: 0, description: "AMAZON ORD 111" }),
            createMockRow({ rowIndex: 1, description: "NETFLIX SUB" }),
            createMockRow({ rowIndex: 2, description: "AMAZON ORD 222" })
        ]

        const groups1 = computeGroups(rows)
        const groups2 = computeGroups(rows)

        expect(groups1.map(g => g.patternKey)).toEqual(groups2.map(g => g.patternKey))
    })
})

describe("applyCategoryToGroup", () => {
    it("applies category to all rows in group", () => {
        const rows: PreviewRow[] = [
            createMockRow({ rowIndex: 0, description: "AMAZON", selectedCategoryId: "altro" }),
            createMockRow({ rowIndex: 1, description: "AMAZON", selectedCategoryId: "altro" }),
            createMockRow({ rowIndex: 2, description: "NETFLIX", selectedCategoryId: "altro" })
        ]

        const groups = computeGroups(rows)
        const amazonGroup = groups.find(g => g.merchantKey.includes("amazon"))!

        const updated = applyCategoryToGroup(rows, amazonGroup, "intrattenimento")

        expect(updated[0].selectedCategoryId).toBe("intrattenimento")
        expect(updated[1].selectedCategoryId).toBe("intrattenimento")
        expect(updated[2].selectedCategoryId).toBe("altro") // Netflix unchanged
    })
})

describe("grouping quality metrics", () => {
    /**
     * Synthetic dataset simulating real Italian bank statements
     */
    function generateSyntheticDataset(count: number): PreviewRow[] {
        const templates = [
            // High frequency - should group well
            { desc: "PAGAMENTO POS CONAD CITY ROMA", count: 30 },
            { desc: "PAGAMENTO POS AMAZON EU SARL", count: 25 },
            { desc: "ADDEBITO CARTA NETFLIX.COM", count: 12 },
            { desc: "ADDEBITO CARTA SPOTIFY", count: 12 },
            { desc: "BONIFICO SEPA AFFITTO CASA", count: 12 },
            // Medium frequency
            { desc: "PAGAMENTO POS ESSELUNGA", count: 8 },
            { desc: "PRELIEVO ATM UNICREDIT", count: 6 },
            { desc: "PAGAMENTO POS IKEA ITALIA", count: 4 },
            // Low frequency / variable
            { desc: "BONIFICO DA MARIO ROSSI", count: 2 },
            { desc: "PAGAMENTO BOLLETTA ENEL", count: 3 }
        ]

        const rows: PreviewRow[] = []
        let rowIndex = 0

        for (const template of templates) {
            for (let i = 0; i < template.count && rows.length < count; i++) {
                rows.push(createMockRow({
                    rowIndex: rowIndex++,
                    description: `${template.desc} ${100000 + i}`, // Add variable suffix
                    amountCents: -(Math.floor(Math.random() * 10000) + 100)
                }))
            }
        }

        // Fill remaining with random
        while (rows.length < count) {
            rows.push(createMockRow({
                rowIndex: rowIndex++,
                description: `PAGAMENTO GENERICO ${rowIndex}`,
                amountCents: -(Math.floor(Math.random() * 5000) + 100)
            }))
        }

        return rows
    }

    it("meets quality criteria on synthetic dataset", () => {
        const rows = generateSyntheticDataset(150)
        const groups = computeGroups(rows)

        // Calculate percentiles
        const sizes = groups.map(g => g.count).sort((a, b) => a - b)
        const p50Index = Math.floor(sizes.length * 0.5)
        const p90Index = Math.floor(sizes.length * 0.9)
        const p50 = sizes[p50Index]
        const p90 = sizes[p90Index]
        const maxSize = Math.max(...sizes)

        console.log(`Groups: ${groups.length}, P50: ${p50}, P90: ${p90}, Max: ${maxSize}`)

        // Quality assertions
        expect(p50).toBeLessThanOrEqual(8)
        expect(p90).toBeLessThanOrEqual(25)
        expect(maxSize).toBeLessThanOrEqual(200)
    })

    it("handles all-unique descriptions gracefully", () => {
        // All descriptions have "unique transaction" as pattern -> 1 group
        const rows = Array.from({ length: 50 }, (_, i) =>
            createMockRow({
                rowIndex: i,
                description: `WORD${i}A WORD${i}B WORD${i}C`,
                amountCents: -1000
            })
        )

        const groups = computeGroups(rows)

        // Each unique word pattern should create separate groups
        expect(groups.length).toBeGreaterThan(10)
        expect(groups.every(g => g.count <= 5)).toBe(true)
    })
})
