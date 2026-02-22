import { Transaction } from "@/domain/transactions"
import { type CategoryAverage } from "@/domain/simulation"
import { filterByRange, getPreviousCompleteMonthsRange } from "@/lib/date-ranges"

/**
 * GOVERNANCE NOTE:
 * This file contains Core Optimization Logic.
 * It is used by the "Financial Lab" module but is safe to re-use
 * in Insights or other read-only analysis tools.
 * 
 * Please do not enforce UI coupling here. Keep logic pure.
 */

export type SimulationPeriod = 3 | 6 | 12

export type { CategoryAverage, SimulationResult } from "@/domain/simulation"

export interface MonthlyAveragesResult {
    categories: Record<string, CategoryAverage>
    incomeCents: number
}

export { applySavings } from "@/domain/simulation"

/**
 * Calcola la media mensile per categoria basandosi su una finestra temporale.
 * Utilizza la logica di filtering condivisa (calculateDateRange).
 * Per il simulatore, "ultimi N mesi" si intende solitamente "ultimi N mesi completi".
 * Quindi se oggi è il 17 Gennaio, e chiedo 3 mesi, il periodo pivot dovrebbe essere Dicembre (mese precedente).
 * 
 * @param periodMonths - 3, 6, or 12
 */
export function computeMonthlyAverages(
    transactions: Transaction[],
    periodMonths: SimulationPeriod,
    now: Date = new Date()
): MonthlyAveragesResult {
    // 1. Range canonico "ultimi N mesi completi" (pivot sul mese precedente)
    const { startDate, endDate } = getPreviousCompleteMonthsRange(periodMonths, now)

    // 2. Filtra transazioni (Income + Expense, in range)
    const sums: Record<string, number> = {}
    let incomeTotal = 0

    const inRangeTransactions = filterByRange(transactions, startDate, endDate)

    inRangeTransactions.forEach(t => {
        const amount = Math.abs(t.amountCents)
        if (t.type === 'income') {
            incomeTotal += amount
        } else {
            const catId = t.categoryId || "uncategorized"
            sums[catId] = (sums[catId] || 0) + amount
        }
    })

    // 3. Calcola medie
    const categories: Record<string, CategoryAverage> = {}

    Object.keys(sums).forEach(catId => {
        const total = sums[catId]
        categories[catId] = {
            categoryId: catId,
            totalInPeriod: total,
            monthCount: periodMonths,
            averageAmount: Math.round(total / periodMonths)
        }
    })

    return {
        categories,
        incomeCents: Math.round(incomeTotal / periodMonths)
    }
}
