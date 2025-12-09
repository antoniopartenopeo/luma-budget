import { Transaction } from "@/features/transactions/api/types"
import { getCategoryById } from "@/features/categories/config"
import { BudgetSpending, BudgetGroupId, BUDGET_GROUP_LABELS } from "../api/types"

// =====================
// SPENDING CALCULATIONS
// =====================

/**
 * Calculate total spending for a given period
 */
export function calculateTotalSpent(transactions: Transaction[], period: string): number {
    return filterTransactionsByPeriod(transactions, period)
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + parseAmount(t.amount), 0)
}

/**
 * Calculate spending broken down by budget group (essential, comfort, superfluous)
 */
export function calculateGroupSpending(transactions: Transaction[], period: string): BudgetSpending {
    const filtered = filterTransactionsByPeriod(transactions, period)
        .filter(t => t.type === "expense")

    const globalSpent = filtered.reduce((sum, t) => sum + parseAmount(t.amount), 0)

    const groupSpending = (["essential", "comfort", "superfluous"] as BudgetGroupId[]).map(groupId => {
        const spent = filtered
            .filter(t => {
                const category = getCategoryById(t.categoryId)
                return category?.spendingNature === groupId
            })
            .reduce((sum, t) => sum + parseAmount(t.amount), 0)

        return {
            groupId,
            label: BUDGET_GROUP_LABELS[groupId],
            spent
        }
    })

    return {
        globalSpent,
        groupSpending
    }
}

// =====================
// HELPERS
// =====================

/**
 * Filter transactions by period (YYYY-MM format)
 */
function filterTransactionsByPeriod(transactions: Transaction[], period: string): Transaction[] {
    const [year, month] = period.split("-").map(Number)

    return transactions.filter(t => {
        const date = new Date(t.timestamp)
        return date.getFullYear() === year && date.getMonth() + 1 === month
    })
}

/**
 * Parse amount string to number (handles currency symbols and formatting)
 */
function parseAmount(amount: string): number {
    // Remove currency symbols, spaces, and handle European number format
    const cleaned = amount
        .replace(/[€$£+\s]/g, "")
        .replace(/\./g, "") // Remove thousands separator
        .replace(",", ".") // Convert decimal separator

    const value = Math.abs(parseFloat(cleaned) || 0)
    return value
}

/**
 * Get current period in YYYY-MM format
 */
export function getCurrentPeriod(): string {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

/**
 * Format period for display (e.g., "Dicembre 2025")
 */
export function formatPeriodDisplay(period: string): string {
    const [year, month] = period.split("-").map(Number)
    const date = new Date(year, month - 1, 1)

    return date.toLocaleDateString("it-IT", {
        month: "long",
        year: "numeric"
    }).replace(/^\w/, c => c.toUpperCase()) // Capitalize first letter
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
    if (budget <= 0) return 0
    return Math.round((spent / budget) * 100)
}
