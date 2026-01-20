import { parseCurrencyToCents } from "./currency"

/**
 * Calculates the percentage of a part relative to a total.
 * Returns an integer percentage (0-100).
 * Handles division by zero (returns 0).
 */
export function calculateSharePct(partCents: number, totalCents: number): number {
    if (!totalCents || totalCents === 0) return 0
    return Math.round((partCents / totalCents) * 100)
}

/**
 * Calculates the percentage growth/decline between two values.
 * Returns an integer percentage (e.g., 50 for +50%, -20 for -20%).
 * If baseline is 0:
 * - if current > 0 returns 100 (max growth cap hint) or we could define convention.
 * - usually insights used 100 as fallback.
 */
export function calculateGrowthPct(currentCents: number, baselineCents: number): number {
    if (baselineCents === 0) {
        return currentCents > 0 ? 100 : 0
    }
    return Math.round(((currentCents - baselineCents) / baselineCents) * 100)
}

/**
 * Calculates budget utilization percentage.
 * Handles division by zero.
 */
export function calculateUtilizationPct(spentCents: number, budgetCents: number): number {
    if (!budgetCents || budgetCents <= 0) return 0
    return Math.round((spentCents / budgetCents) * 100)
}

/**
 * Sums the absolute value of expenses in a transaction list.
 * Only processes transactions of type 'expense'.
 * Returns result in CENTS.
 */
export function sumExpensesInCents(transactions: { type: string, amountCents?: number, amount?: string }[]): number {
    return transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => {
            let val = 0
            if (t.amountCents !== undefined) val = t.amountCents
            else if (t.amount) val = parseCurrencyToCents(t.amount)
            return sum + Math.abs(val)
        }, 0)
}

/**
 * Sums the absolute value of income in a transaction list.
 * Only processes transactions of type 'income'.
 * Returns result in CENTS.
 */
export function sumIncomeInCents(transactions: { type: string, amountCents?: number, amount?: string }[]): number {
    return transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => {
            let val = 0
            if (t.amountCents !== undefined) val = t.amountCents
            else if (t.amount) val = parseCurrencyToCents(t.amount)
            return sum + Math.abs(val)
        }, 0)
}
