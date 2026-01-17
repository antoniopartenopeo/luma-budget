import { Transaction } from "@/features/transactions/api/types"

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

/**
 * Calcola la media mensile per categoria basandosi su una finestra temporale.
 * Esclude SEMPRE il mese corrente per avere dati completi.
 */
export function computeMonthlyAverages(
    transactions: Transaction[],
    monthsWindow: SimulationPeriod,
    now: Date = new Date()
): Record<string, CategoryAverage> {
    // 1. Definisci la finestra temporale (mesi completi precedenti)
    const endDate = new Date(now.getFullYear(), now.getMonth(), 1) // Start of current month (exclusive)
    const startDate = new Date(endDate)
    startDate.setMonth(startDate.getMonth() - monthsWindow)

    // 2. Filtra transazioni: Solo spese, solo nel periodo
    const relevantTransactions = transactions.filter(t => {
        const tDate = new Date(t.date)
        return (
            t.type === "expense" &&
            tDate >= startDate &&
            tDate < endDate
        )
    })

    // 3. Aggrega per categoria
    const sums: Record<string, number> = {}

    relevantTransactions.forEach(t => {
        const catId = t.categoryId || "uncategorized"
        sums[catId] = (sums[catId] || 0) + t.amountCents
    })

    // 4. Calcola medie
    const result: Record<string, CategoryAverage> = {}

    // Processa tutte le categorie trovate (anche quelle non presenti avranno average 0 se non nel filtro, ma qui processiamo solo quelle con tx)
    // NB: Per una UI completa, il chiamante dovrebbe mergiare con la lista completa delle categorie.
    Object.keys(sums).forEach(catId => {
        result[catId] = {
            categoryId: catId,
            totalInPeriod: sums[catId],
            monthCount: monthsWindow,
            averageAmount: Math.round(sums[catId] / monthsWindow)
        }
    })

    return result
}

/**
 * Applica le percentuali di risparmio alle medie baseline.
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
