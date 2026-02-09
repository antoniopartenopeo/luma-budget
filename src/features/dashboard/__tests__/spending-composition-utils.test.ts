import { describe, it, expect } from "vitest"
import { Transaction } from "@/features/transactions/api/types"
import { DashboardTimeFilter } from "@/features/dashboard/api/types"
import {
    buildSpendingCompositionSlices,
    SYNTHETIC_ALTRI_ID
} from "../utils/spending-composition"

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
})
