import { Transaction } from "@/features/transactions/api/types"
import { calculateDateRange } from "@/lib/date-ranges"

// If types are defined in this file (which they were previously), restore them or import them.
// Looking at previous file content, CategoryAverage and SimulationResult were defined inline. 
// I should restore them if they are not in ./types.

export type SimulationPeriod = 3 | 6 | 12

export interface CategoryAverage {
    categoryId: string
    averageAmount: number // in cents, integer
    totalInPeriod: number
    monthCount: number
}

export interface SimulationResult {
    baselineTotal: number
    simulatedTotal: number
    savingsAmount: number
    savingsPercent: number
    categoryResults: Record<string, {
        baseline: number
        simulated: number
        saving: number
        percent: number
    }>
}

// ... existing types export ...

/**
 * Calcola la media mensile per categoria basandosi su una finestra temporale.
 * Utilizza la logica di filtering condivisa (calculateDateRange).
 * Per il simulatore, "ultimi N mesi" si intende solitamente "ultimi N mesi completi".
 * Quindi se oggi è il 17 Gennaio, e chiedo 3 mesi, il periodo pivot dovrebbe essere Dicembre (mese precedente).
 * 
 * @param periodMonths - 3, 6, or 12
 * @param now - Reference date (default: Date.now())
 */
export function computeMonthlyAverages(
    transactions: Transaction[],
    periodMonths: SimulationPeriod,
    now: Date = new Date()
): Record<string, CategoryAverage> {
    // 1. Determina il "Mese Precedente" come pivot per avere mesi completi
    // E.g. se siamo a Gennaio, pivot = "YYYY-12" dell'anno scorso
    const previousMonthDate = new Date(now)
    previousMonthDate.setDate(0) // Last day of previous month

    const pivotYear = previousMonthDate.getFullYear()
    const pivotMonth = previousMonthDate.getMonth() + 1 // 1-12
    const pivotStr = `${pivotYear}-${pivotMonth.toString().padStart(2, '0')}`

    // 2. Calcola range usando l'utility condivisa
    const { startDate, endDate } = calculateDateRange(pivotStr, periodMonths)

    // 3. Filtra transazioni (Expense only, in range)
    const sums: Record<string, number> = {}

    transactions.forEach(t => {
        if (t.type !== 'expense') return

        const tDate = new Date(t.timestamp)
        if (tDate >= startDate && tDate <= endDate) {
            const catId = t.categoryId || "uncategorized"
            // Use amountCents directly (integer math)
            sums[catId] = (sums[catId] || 0) + Math.abs(t.amountCents)
        }
    })

    // 4. Calcola medie (Integer division with round)
    const result: Record<string, CategoryAverage> = {}

    Object.keys(sums).forEach(catId => {
        const total = sums[catId]
        const average = Math.round(total / periodMonths)

        result[catId] = {
            categoryId: catId,
            totalInPeriod: total,
            monthCount: periodMonths,
            averageAmount: average
        }
    })

    return result
}

/**
 * Applica le percentuali di risparmio alle medie baseline.
 * Lavora interamente con interi (centesimi).
 */
export function applySavings(
    averages: Record<string, CategoryAverage>,
    savingsMap: Record<string, number> // categoryId -> saving percent (0-100)
): SimulationResult {
    const categoryResults: SimulationResult['categoryResults'] = {}
    let baselineTotal = 0
    let simulatedTotal = 0

    Object.values(averages).forEach(avg => {
        const percent = Math.min(100, Math.max(0, savingsMap[avg.categoryId] || 0))
        const baseline = avg.averageAmount

        // Calcolo simulato: baseline * (1 - percent/100)
        // Usiamo i centesimi, quindi round finale
        const simulated = Math.round(baseline * (1 - percent / 100))
        const saving = baseline - simulated

        categoryResults[avg.categoryId] = {
            baseline,
            simulated,
            saving,
            percent
        }

        baselineTotal += baseline
        simulatedTotal += simulated
    })

    return {
        baselineTotal,
        simulatedTotal,
        savingsAmount: baselineTotal - simulatedTotal,
        savingsPercent: baselineTotal > 0
            ? Math.round(((baselineTotal - simulatedTotal) / baselineTotal) * 100)
            : 0,
        categoryResults
    }
}

// ==========================================
// NEW FEATURES: Group Expansion & Overrides
// ==========================================

import { Category, SpendingNature } from "@/features/categories/config"

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
            groups[cat.spendingNature].items.push({
                category: cat,
                averageAmount: avg
            })
            groups[cat.spendingNature].totalBaseline += avg
        }
    })

    // Sort items by averageAmount desc
    Object.values(groups).forEach(g => {
        g.items.sort((a, b) => b.averageAmount - a.averageAmount)
    })

    return groups
}
