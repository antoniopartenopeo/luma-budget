import { Transaction, TransactionType } from "@/features/transactions/api/types"

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
