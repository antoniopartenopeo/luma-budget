import { Transaction, TransactionType } from "./types"
import { formatSignedCents, parseCurrencyToCents } from "@/domain/money/currency"
import { getCategoryById } from "@/domain/categories/utils"
import { migrateCategoryId } from "@/domain/categories/migration"

/**
 * Helper to get signed cents from amountCents.
 * Income is positive, Expense is negative.
 */
export function getSignedCents(t: Transaction): number {
    const absCents = Math.abs(t.amountCents || 0)
    if (absCents === 0) return 0
    return t.type === "income" ? absCents : -absCents
}

/**
 * Formats string amount from signed cents.
 * e.g. 1050 (income) -> "+€10,50"
 * e.g. -1050 (expense) -> "-€10,50"
 */
export function formatCentsSignedFromType(absCents: number, type: TransactionType): string {
    const signedValue = type === "income" ? absCents : -Math.abs(absCents)
    return formatSignedCents(signedValue)
}

/**
 * Normalizes a transaction by ensuring amountCents is present.
 * Migration: Automatically migrates legacy category IDs to the new system.
 * Does NOT mutate the input object.
 */
export function normalizeTransactionAmount(t: Partial<Transaction> & Record<string, unknown>): Transaction {
    const raw = t as Transaction

    // 0. Migrate categoryId if it's legacy
    const migratedId = raw.categoryId ? migrateCategoryId(raw.categoryId) : raw.categoryId

    // 1. Ensure amountCents is a number
    const absCents = Math.abs(Number(raw.amountCents) || 0)

    // 2. Return updated object (no more legacy 'amount' string)
    return {
        ...raw,
        categoryId: migratedId,
        amountCents: absCents
    }
}

/**
 * Helper to check rule-based superfluous status
 */
export const calculateSuperfluousStatus = (
    categoryId: string,
    type: TransactionType,
    categories: any[] // Using any[] to avoid circular dependency if Category is in domain/categories/types
): boolean => {
    if (type === "income") return false
    const cat = getCategoryById(categoryId, categories)
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
