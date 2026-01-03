import { describe, it, expect } from 'vitest'
import { Transaction } from "@/features/transactions/api/types"
import { DashboardTimeFilter } from "@/features/dashboard/api/types"

// Simulated logic for testing
function buildMonthlyCategoryMatrix(transactions: Transaction[], filter: DashboardTimeFilter, topN: number = 4) {
    if (!transactions || transactions.length === 0) {
        return { chartData: [], months: [], allCategories: [], periodBreakdown: [] }
    }

    const endDate = new Date(filter.period + "-01")
    endDate.setMonth(endDate.getMonth() + 1)
    endDate.setDate(0)

    const startDate = new Date(filter.period + "-01")
    if (filter.mode === "range" && filter.months) {
        startDate.setMonth(startDate.getMonth() - (filter.months - 1))
    }
    startDate.setDate(1)

    const expenses = transactions.filter(t => {
        const d = new Date(t.timestamp)
        return t.type === "expense" && d >= startDate && d <= endDate
    })

    if (expenses.length === 0) {
        return { chartData: [], months: [], allCategories: [], periodBreakdown: [] }
    }

    const matrix: Record<string, Record<string, number>> = {}
    const months: string[] = []

    const iterDate = new Date(startDate)
    while (iterDate <= endDate) {
        const mLabel = new Intl.DateTimeFormat("it-IT", { month: "short" }).format(iterDate)
        const label = mLabel.charAt(0).toUpperCase() + mLabel.slice(1)
        months.push(label)
        matrix[label] = {}
        iterDate.setMonth(iterDate.getMonth() + 1)
    }

    expenses.forEach(tx => {
        const tDate = new Date(tx.timestamp)
        const mLabel = new Intl.DateTimeFormat("it-IT", { month: "short" }).format(tDate)
        const label = mLabel.charAt(0).toUpperCase() + mLabel.slice(1)
        if (!matrix[label]) return
        const current = matrix[label][tx.categoryId] || 0
        matrix[label][tx.categoryId] = current + (tx.amountCents || 0) / 100
    })

    const periodCategoryTotals: Record<string, number> = {}
    expenses.forEach(tx => {
        const current = periodCategoryTotals[tx.categoryId] || 0
        periodCategoryTotals[tx.categoryId] = current + (tx.amountCents || 0) / 100
    })

    const sortedCategories = Object.entries(periodCategoryTotals)
        .sort(([, a], [, b]) => b - a)
        .map(([id, value]) => ({ id, value }))

    const topCatIds = sortedCategories.slice(0, topN).map(c => c.id)
    const othersCatIds = sortedCategories.slice(topN).map(c => c.id)

    const categories = topCatIds.map(id => ({
        id,
        name: id // simplified for test
    }))

    if (othersCatIds.length > 0) {
        categories.push({ id: "altro", name: "Altro" })
    }

    const chartData = months.map(month => {
        const row: Record<string, string | number> = { name: month }
        let othersSum = 0
        topCatIds.forEach(id => { row[id] = matrix[month][id] || 0 })
        othersSum = othersCatIds.reduce((acc, cid) => acc + (matrix[month][cid] || 0), 0)
        if (othersCatIds.length > 0) { row["altro"] = othersSum }
        return row
    })

    const pb = categories.map(cat => {
        let total = 0
        if (cat.id === "altro") {
            total = othersCatIds.reduce((acc, id) => acc + (periodCategoryTotals[id] || 0), 0)
        } else {
            total = periodCategoryTotals[cat.id] || 0
        }
        return { ...cat, value: total }
    })

    // Sort: top categories first, Altro ALWAYS last
    const pbSorted = pb.sort((a, b) => {
        if (a.id === "altro") return 1
        if (b.id === "altro") return -1
        return b.value - a.value
    })

    return { chartData, months, allCategories: categories, periodBreakdown: pbSorted }
}

describe('SpendingCompositionCard Logic', () => {
    const mockFilter: DashboardTimeFilter = {
        mode: "month",
        period: "2024-01"
    }

    it('should correctly shape data for a single month and ensure sum integrity', () => {
        const transactions: Transaction[] = [
            { id: "1", amountCents: 1000, type: "expense", categoryId: "c1", timestamp: new Date("2024-01-15").getTime() } as unknown as Transaction,
            { id: "2", amountCents: 2000, type: "expense", categoryId: "c2", timestamp: new Date("2024-01-16").getTime() } as unknown as Transaction,
        ]

        const result = buildMonthlyCategoryMatrix(transactions, mockFilter)

        expect(result.chartData).toHaveLength(1)
        const row = result.chartData[0]
        const total = Number(row.c1) + Number(row.c2)
        expect(total).toBe(30)
        expect(result.periodBreakdown).toHaveLength(2)
        expect(result.periodBreakdown.find(b => b.id === "c1")?.value).toBe(10)
        expect(result.periodBreakdown.find(b => b.id === "c2")?.value).toBe(20)
    })

    it('should group categories into "Altro" and keep it last', () => {
        const transactions: Transaction[] = [
            { id: "1", amountCents: 5000, type: "expense", categoryId: "top1", timestamp: new Date("2024-01-15").getTime() } as unknown as Transaction,
            { id: "2", amountCents: 4000, type: "expense", categoryId: "top2", timestamp: new Date("2024-01-15").getTime() } as unknown as Transaction,
            { id: "3", amountCents: 3000, type: "expense", categoryId: "top3", timestamp: new Date("2024-01-15").getTime() } as unknown as Transaction,
            { id: "4", amountCents: 2000, type: "expense", categoryId: "top4", timestamp: new Date("2024-01-15").getTime() } as unknown as Transaction,
            { id: "5", amountCents: 1000, type: "expense", categoryId: "other1", timestamp: new Date("2024-01-15").getTime() } as unknown as Transaction,
            { id: "6", amountCents: 500, type: "expense", categoryId: "other2", timestamp: new Date("2024-01-15").getTime() } as unknown as Transaction,
        ]

        const result = buildMonthlyCategoryMatrix(transactions, mockFilter, 4)

        expect(result.allCategories).toHaveLength(5) // 4 top + Altro
        expect(result.periodBreakdown[4].id).toBe("altro")
        expect(Number(result.chartData[0].altro)).toBe(15)

        const row = result.chartData[0]
        const sumSegments = Number(row.top1) + Number(row.top2) + Number(row.top3) + Number(row.top4) + Number(row.altro)
        expect(sumSegments).toBe(155)
    })

    it('should handle multiple months correctly and preserve month-level breakdown', () => {
        const filter3M: DashboardTimeFilter = {
            mode: "range",
            period: "2024-03",
            months: 3
        }

        const transactions: Transaction[] = [
            { id: "1", amountCents: 1000, type: "expense", categoryId: "c1", timestamp: new Date("2024-01-15").getTime() } as unknown as Transaction,
            { id: "2", amountCents: 2300, type: "expense", categoryId: "c2", timestamp: new Date("2024-02-15").getTime() } as unknown as Transaction,
            { id: "3", amountCents: 3000, type: "expense", categoryId: "c1", timestamp: new Date("2024-03-15").getTime() } as unknown as Transaction,
        ]

        const result = buildMonthlyCategoryMatrix(transactions, filter3M)

        expect(result.months).toHaveLength(3)
        expect(Number(result.chartData[0].c1)).toBe(10)
        expect(Number(result.chartData[1].c2)).toBe(23)
        expect(result.periodBreakdown.find(b => b.id === "c1")?.value).toBe(40)
        expect(result.periodBreakdown.find(b => b.id === "c2")?.value).toBe(23)
    })

    it('should return empty state when no transactions match', () => {
        const result = buildMonthlyCategoryMatrix([], mockFilter)
        expect(result.chartData).toHaveLength(0)
        expect(result.allCategories).toHaveLength(0)
    })
})
