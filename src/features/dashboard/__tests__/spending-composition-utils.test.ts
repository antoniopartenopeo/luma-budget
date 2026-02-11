import { describe, it, expect } from "vitest"
import { Transaction } from "@/features/transactions/api/types"
import { DashboardTimeFilter } from "@/features/dashboard/api/types"
import {
    buildSpendingCompositionSlices,
    buildSpendingCompositionSlicesFromSummary,
    SYNTHETIC_ALTRI_ID
} from "../utils/spending-composition"
import type { CategorySummary } from "@/features/dashboard/api/types"

const mockCategories = [
    { id: "c1", label: "Alimentari" },
    { id: "c2", label: "Viaggi" },
    { id: "c3", label: "Svago" },
    { id: "c4", label: "Tech" }
]

function tx(
    id: string,
    amountCents: number,
    type: "income" | "expense",
    categoryId: string,
    dateIso: string
): Transaction {
    return {
        id,
        amountCents,
        date: dateIso,
        description: id,
        category: categoryId,
        categoryId,
        type,
        timestamp: new Date(dateIso).getTime()
    }
}

describe("spending-composition utils", () => {
    it("returns empty list for empty transactions", () => {
        const filter: DashboardTimeFilter = { mode: "month", period: "2024-01" }
        expect(buildSpendingCompositionSlices([], filter, mockCategories)).toEqual([])
    })

    it("filters by month and excludes income", () => {
        const filter: DashboardTimeFilter = { mode: "month", period: "2024-01" }
        const transactions: Transaction[] = [
            tx("t1", 1200, "expense", "c1", "2024-01-10"),
            tx("t2", 800, "income", "c2", "2024-01-11"),
            tx("t3", 500, "expense", "c2", "2024-02-01")
        ]

        const result = buildSpendingCompositionSlices(transactions, filter, mockCategories)

        expect(result).toHaveLength(1)
        expect(result[0]).toEqual({ id: "c1", name: "Alimentari", value: 1200 })
    })

    it("groups tail categories into synthetic 'Altri'", () => {
        const filter: DashboardTimeFilter = { mode: "month", period: "2024-01" }
        const transactions: Transaction[] = [
            tx("t1", 5000, "expense", "c1", "2024-01-10"),
            tx("t2", 4000, "expense", "c2", "2024-01-10"),
            tx("t3", 3000, "expense", "c3", "2024-01-10"),
            tx("t4", 2000, "expense", "c4", "2024-01-10")
        ]

        const result = buildSpendingCompositionSlices(transactions, filter, mockCategories, 2)

        expect(result).toHaveLength(3)
        expect(result[0].id).toBe("c1")
        expect(result[1].id).toBe("c2")
        expect(result[2]).toEqual({
            id: SYNTHETIC_ALTRI_ID,
            name: "Altri",
            value: 5000
        })
    })

    it("supports range mode over multiple months", () => {
        const filter: DashboardTimeFilter = { mode: "range", period: "2024-03", months: 3 }
        const transactions: Transaction[] = [
            tx("jan", 1000, "expense", "c1", "2024-01-15"),
            tx("feb", 2000, "expense", "c2", "2024-02-15"),
            tx("mar", 3000, "expense", "c1", "2024-03-15"),
            tx("apr", 9999, "expense", "c3", "2024-04-01")
        ]

        const result = buildSpendingCompositionSlices(transactions, filter, mockCategories)

        expect(result).toHaveLength(2)
        expect(result[0]).toEqual({ id: "c1", name: "Alimentari", value: 4000 })
        expect(result[1]).toEqual({ id: "c2", name: "Viaggi", value: 2000 })
    })

    it("builds slices from dashboard summary with deterministic ordering", () => {
        const summary: CategorySummary[] = [
            { id: "c-tech", name: "Tecnologia", valueCents: 3000, value: 30, color: "#6366f1" },
            { id: "c-food", name: "Alimentari", valueCents: 3000, value: 30, color: "#ea580c" },
            { id: "c-sub", name: "Abbonamenti", valueCents: 1000, value: 10, color: "#3b82f6" }
        ]

        const result = buildSpendingCompositionSlicesFromSummary(summary, 5)
        expect(result).toHaveLength(3)
        expect(result[0]).toMatchObject({ id: "c-food", name: "Alimentari", value: 3000, color: "#ea580c" })
        expect(result[1]).toMatchObject({ id: "c-tech", name: "Tecnologia", value: 3000, color: "#6366f1" })
        expect(result[2]).toMatchObject({ id: "c-sub", name: "Abbonamenti", value: 1000, color: "#3b82f6" })
    })

    it("aggregates overflow categories into synthetic 'Altri' from summary", () => {
        const summary: CategorySummary[] = [
            { id: "c1", name: "A", valueCents: 5000, value: 50, color: "#111111" },
            { id: "c2", name: "B", valueCents: 4000, value: 40, color: "#222222" },
            { id: "c3", name: "C", valueCents: 3000, value: 30, color: "#333333" },
            { id: "c4", name: "D", valueCents: 2000, value: 20, color: "#444444" }
        ]

        const result = buildSpendingCompositionSlicesFromSummary(summary, 2)
        expect(result).toHaveLength(3)
        expect(result[0]).toMatchObject({ id: "c1", value: 5000 })
        expect(result[1]).toMatchObject({ id: "c2", value: 4000 })
        expect(result[2]).toEqual({
            id: SYNTHETIC_ALTRI_ID,
            name: "Altri",
            value: 5000,
            color: "#94a3b8"
        })
    })

    it("returns empty when summary is missing or all values are zero", () => {
        expect(buildSpendingCompositionSlicesFromSummary(undefined, 5)).toEqual([])

        const zeroSummary: CategorySummary[] = [
            { id: "z1", name: "Zero", valueCents: 0, value: 0, color: "#000000" }
        ]
        expect(buildSpendingCompositionSlicesFromSummary(zeroSummary, 5)).toEqual([])
    })
})
