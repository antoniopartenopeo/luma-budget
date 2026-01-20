import { Transaction, TransactionType } from "./types"
import { formatSignedCents, parseCurrencyToCents } from "@/domain/money/currency"
import { getCategoryById } from "@/domain/categories/utils"

/**
 * Helper to get signed cents from amountCents if available, falling back to parsing.
 * Income is positive, Expense is negative.
 */
export function getSignedCents(t: Transaction): number {
    let absCents: number
    if (t.amountCents !== undefined && !isNaN(t.amountCents)) {
        absCents = Math.abs(t.amountCents)
    } else {
        absCents = Math.abs(parseCurrencyToCents(t.amount))
    }
    return t.type === "income" ? absCents : -absCents
}

/**
 * Formats string amount from signed cents.
 * e.g. 1050 (income) -> "+€10,50"
 * e.g. -1050 (expense) -> "-€10,50"
 */
export function formatCentsSignedFromType(absCents: number, type: TransactionType): string {
    const signedValue = type === "income" ? absCents : -Math.abs(absCents)
    // We reuse formatSignedCents which handles standard formatting
    return formatSignedCents(signedValue)
}

/**
 * Normalizes a transaction by ensuring amountCents is present and amount string is consistent.
 * Handles legacy formats (float numbers, unformatted strings).
 * Does NOT mutate the input object.
 */
export function normalizeTransactionAmount(t: any): Transaction {
    const raw = t as Transaction & { amount?: number | string }

    // 1. Resolve source of truth (amountCents > parse(amount))
    let absCents: number

    if (raw.amountCents !== undefined && typeof raw.amountCents === 'number' && !isNaN(raw.amountCents)) {
        absCents = Math.abs(raw.amountCents)
    } else if (raw.amount !== undefined) {
        if (typeof raw.amount === 'number') {
            // Legacy float: format 12.34
            absCents = Math.abs(Math.round(raw.amount * 100))
        } else if (typeof raw.amount === 'string') {
            // Legacy string: format "€ 10.50"
            absCents = Math.abs(parseCurrencyToCents(raw.amount))
        } else {
            absCents = 0
        }
    } else {
        absCents = 0
    }

    // 2. Derive normalized string
    // This ensures that "€ 10.50" becomes "+€10,50" consistently
    // We only keep the original string if it already contains the € symbol and it was a string
    const normalizedString = (typeof raw.amount === 'string' && raw.amount.includes('€'))
        ? raw.amount
        : formatCentsSignedFromType(absCents, raw.type)

    // 3. Return updated object
    return {
        ...raw,
        amountCents: absCents,
        amount: normalizedString
    } as Transaction
}

/**
 * Helper to check rule-based superfluous status
 */
export const calculateSuperfluousStatus = (categoryId: string, type: TransactionType): boolean => {
    if (type === "income") return false
    const cat = getCategoryById(categoryId)
    return cat?.spendingNature === "superfluous"
}

/**
 * Resolve the budget group for a transaction, taking into account manual overrides.
 * Aligns budget actuals with the "isSuperfluous" logic used in Dashboard/KPIs.
 */
export function resolveBudgetGroupForTransaction(
    transaction: Transaction,
    categoryNature?: "essential" | "comfort" | "superfluous"
): "essential" | "comfort" | "superfluous" {
    // 1. Manual override: if marked as superfluous, it ALWAYS goes to 'superfluous'
    if (transaction.isSuperfluous === true) {
        return "superfluous"
    }

    // 2. Manual override: if marked as NOT superfluous BUT category is superfluous,
    // we de-escalate it to 'comfort' (standard behavior for non-useless svago/altro).
    if (transaction.isSuperfluous === false && categoryNature === "superfluous") {
        return "comfort"
    }

    // 3. Fallback to category nature, with 'essential' as default for safety/unknowns
    return categoryNature || "essential"
}
