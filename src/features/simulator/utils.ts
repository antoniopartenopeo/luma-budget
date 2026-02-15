import { Transaction } from "@/domain/transactions"
import { Category, SpendingNature } from "@/domain/categories"
import { type CategoryAverage } from "@/domain/simulation"
import { calculateDateRange, filterByRange } from "@/lib/date-ranges"

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
    // 1. Determina il "Mese Precedente" come pivot per avere mesi completi
    const previousMonthDate = new Date(now)
    previousMonthDate.setDate(0) // Last day of previous month

    const pivotYear = previousMonthDate.getFullYear()
    const pivotMonth = previousMonthDate.getMonth() + 1 // 1-12
    const pivotStr = `${pivotYear}-${pivotMonth.toString().padStart(2, '0')}`

    // 2. Calcola range usando l'utility condivisa
    const { startDate, endDate } = calculateDateRange(pivotStr, periodMonths)

    // 3. Filtra transazioni (Income + Expense, in range)
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

    // 4. Calcola medie
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

// ==========================================
// NEW FEATURES: Group Expansion & Overrides
// ==========================================

export type SuperfluousStatus = "OK" | "WARN" | "HIGH"

/**
 * Determina la percentuale effettiva da applicare.
 * L'override vince sempre sul gruppo se presente (non null).
 */
export function computeEffectiveSavingsPct(groupPct: number, overridePct: number | null): number {
    if (overridePct !== null) {
        return Math.min(100, Math.max(0, overridePct))
    }
    return Math.min(100, Math.max(0, groupPct))
}

/**
 * Classifica lo stato delle spese superflue per la Priority Card.
 */
export function classifySuperfluousSpend(
    superfluousAvgCents: number,
    totalExpensesAvgCents: number
): SuperfluousStatus {
    if (totalExpensesAvgCents === 0) return "OK"
    if (superfluousAvgCents === 0) return "OK"

    // Converti in Euro per i check di soglia assoluta
    const superfluousEuro = superfluousAvgCents / 100
    const share = superfluousAvgCents / totalExpensesAvgCents

    // Rule: HIGH se share >= 20% OR spese > 200€
    if (share >= 0.20 || superfluousEuro >= 200) return "HIGH"

    // Rule: WARN se 10% <= share < 20% AND spese >= 50€
    if (share >= 0.10 && superfluousEuro >= 50) return "WARN"

    return "OK"
}

export interface GroupedSimulationData {
    nature: SpendingNature
    items: {
        category: Category
        averageAmount: number
    }[]
    totalBaseline: number
}

/**
 * Raggruppa le categorie per SpendingNature e le ordina per spesa decrescente (Baseline).
 */
export function groupAndSortCategories(
    averages: Record<string, CategoryAverage>,
    allCategories: Category[]
): Record<SpendingNature, GroupedSimulationData> {
    const groups: Record<SpendingNature, GroupedSimulationData> = {
        essential: { nature: "essential", items: [], totalBaseline: 0 },
        comfort: { nature: "comfort", items: [], totalBaseline: 0 },
        superfluous: { nature: "superfluous", items: [], totalBaseline: 0 }
    }

    const validCategories = allCategories.filter(c => c.kind === "expense")

    validCategories.forEach(cat => {
        const avg = averages[cat.id]?.averageAmount || 0
        if (groups[cat.spendingNature]) {
            groups[cat.spendingNature].totalBaseline += avg

            // Only add to items list if > 0 (REAL expenses criteria)
            if (avg > 0) {
                groups[cat.spendingNature].items.push({
                    category: cat,
                    averageAmount: avg
                })
            }
        }
    })

    // Sort items by averageAmount desc and slice top 5
    Object.values(groups).forEach(g => {
        g.items.sort((a, b) => {
            const diff = b.averageAmount - a.averageAmount
            if (diff !== 0) return diff
            // Tie-break by label for deterministic order
            return a.category.label.localeCompare(b.category.label)
        })
        g.items = g.items.slice(0, 5)
    })

    return groups
}
