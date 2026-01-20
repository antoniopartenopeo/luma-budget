import { Transaction } from "@/features/transactions/api/types"
import { getCategoryById } from "@/features/categories/config"
import { BudgetSpending, BudgetGroupId, BUDGET_GROUP_LABELS } from "../api/types"
import { getSignedCents, resolveBudgetGroupForTransaction } from "@/domain/transactions"
import { calculateUtilizationPct, sumExpensesInCents } from "@/domain/money"
import { getMonthBoundariesLocal, getCurrentPeriod as getLibCurrentPeriod, formatPeriodLabel } from "@/lib/date-ranges"

// =====================
// SPENDING CALCULATIONS
// =====================

/**
 * Calculate total spending for a given period
 */
export function calculateTotalSpent(transactions: Transaction[], period: string): number {
    const filtered = filterTransactionsByPeriod(transactions, period)
    const totalCents = sumExpensesInCents(filtered)
    return totalCents / 100
}

/**
 * Calculate spending broken down by budget group (essential, comfort, superfluous)
 */
export function calculateGroupSpending(transactions: Transaction[], period: string): BudgetSpending {
    const filtered = filterTransactionsByPeriod(transactions, period)
        .filter(t => t.type === "expense")

    const globalSpentCents = sumExpensesInCents(filterTransactionsByPeriod(transactions, period))

    const groupSpending = (["essential", "comfort", "superfluous"] as BudgetGroupId[]).map(groupId => {
        const groupTransactions = filtered.filter(t => {
            const category = getCategoryById(t.categoryId)
            const resolvedGroup = resolveBudgetGroupForTransaction(t, category?.spendingNature as BudgetGroupId)
            return resolvedGroup === groupId
        })
        const spentCents = groupTransactions.reduce((sum, t) => sum + Math.abs(getSignedCents(t)), 0)

        return {
            groupId,
            label: BUDGET_GROUP_LABELS[groupId],
            spent: spentCents / 100
        }
    })

    return {
        globalSpent: globalSpentCents / 100,
        groupSpending
    }
}

// Migrated to domain/transactions/utils.ts

// =====================
// HELPERS
// =====================

/**
 * Filter transactions by period (YYYY-MM format)
 */
function filterTransactionsByPeriod(transactions: Transaction[], period: string): Transaction[] {
    const { start, end } = getMonthBoundariesLocal(period)

    return transactions.filter(t => {
        const timestamp = t.timestamp
        return timestamp >= start.getTime() && timestamp <= end.getTime()
    })
}


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
    }).format(amount)
}

/**
 * Calculate percentage spent
 */
export function calculatePercentage(spent: number, budget: number): number {
    // Note: inputs are Units (EUR), but ratio is same as Cents.
    // We treat them as "units" here.
    return calculateUtilizationPct(spent, budget)
}
