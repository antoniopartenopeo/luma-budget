import { Transaction } from "@/features/transactions/api/types"
import { getCategoryById, Category } from "@/features/categories/config"
import { BudgetSpending, BudgetGroupId, BUDGET_GROUP_LABELS } from "../api/types"
import { getSignedCents, resolveBudgetGroupForTransaction } from "@/domain/transactions"
import { calculateUtilizationPct, sumExpensesInCents } from "@/domain/money"
import { getMonthBoundariesLocal, getCurrentPeriod as getLibCurrentPeriod, formatPeriodLabel, filterByRange } from "@/lib/date-ranges"

// =====================
// SPENDING CALCULATIONS
// =====================

/**
 * Calculate total spending for a given period
 */
export function calculateTotalSpent(transactions: Transaction[], period: string): number {
    const { start, end } = getMonthBoundariesLocal(period)
    const filtered = filterByRange(transactions, start, end)
    return sumExpensesInCents(filtered)
}

/**
 * Calculate spending broken down by budget group (essential, comfort, superfluous)
 */
export function calculateGroupSpending(
    transactions: Transaction[],
    period: string,
    categories: Category[]
): BudgetSpending {
    const { start, end } = getMonthBoundariesLocal(period)
    const filtered = filterByRange(transactions, start, end)
        .filter(t => t.type === "expense")

    const globalSpentCents = sumExpensesInCents(filtered)

    const groupSpending = (["essential", "comfort", "superfluous"] as BudgetGroupId[]).map(groupId => {
        const groupTransactions = filtered.filter(t => {
            const category = getCategoryById(t.categoryId, categories)
            const resolvedGroup = resolveBudgetGroupForTransaction(t, category?.spendingNature as BudgetGroupId)
            return resolvedGroup === groupId
        })
        const spentCents = groupTransactions.reduce((sum, t) => sum + Math.abs(getSignedCents(t)), 0)

        return {
            groupId,
            label: BUDGET_GROUP_LABELS[groupId],
            spentCents
        }
    })

    return {
        globalSpentCents,
        groupSpending
    }
}

// =====================
// HELPERS
// =====================

/**
 * Get current period in YYYY-MM format
 */
export function getCurrentPeriod(): string {
    return getLibCurrentPeriod()
}

export function formatPeriodDisplay(period: string): string {
    return formatPeriodLabel(period)
}

/**
 * Get previous period
 */
export function getPreviousPeriod(period: string): string {
    const [year, month] = period.split("-").map(Number)
    const date = new Date(year, month - 2, 1) // month - 2 because months are 0-indexed
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

/**
 * Get next period
 */
export function getNextPeriod(period: string): string {
    const [year, month] = period.split("-").map(Number)
    const date = new Date(year, month, 1) // month because months are 0-indexed
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("it-IT", {
        style: "currency",
        currency: "EUR"
    }).format(amount / 100)
}

/**
 * Calculate percentage spent
 */
export function calculatePercentage(spentCents: number, budgetCents: number): number {
    return calculateUtilizationPct(spentCents, budgetCents)
}
