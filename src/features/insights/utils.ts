// Insights Utility Functions
// ==========================
// Pure functions for date manipulation and transaction aggregation

/**
 * Get the start and end dates for a given month period
 */
export function getMonthBoundaries(period: string): { start: Date; end: Date } {
    const [year, month] = period.split("-").map(Number)
    const start = new Date(year, month - 1, 1, 0, 0, 0, 0)
    const end = new Date(year, month, 0, 23, 59, 59, 999) // Last day of month
    return { start, end }
}

/**
 * Get days elapsed in the current period (up to currentDate)
 */
export function getDaysElapsedInMonth(period: string, currentDate: Date): number {
    const { start, end } = getMonthBoundaries(period)

    // If currentDate is before the period, return 0
    if (currentDate < start) return 0

    // If currentDate is after the period, return full month days
    if (currentDate > end) return end.getDate()

    // Return days elapsed (including today)
    return currentDate.getDate()
}

/**
 * Get total days in the month
 */
export function getDaysInMonth(period: string): number {
    const [year, month] = period.split("-").map(Number)
    return new Date(year, month, 0).getDate()
}

/**
 * Filter transactions by a specific month period
 */
export function filterTransactionsByMonth<T extends { timestamp: number }>(
    transactions: T[],
    period: string
): T[] {
    const { start, end } = getMonthBoundaries(period)
    return transactions.filter(t => {
        const date = new Date(t.timestamp)
        return date >= start && date <= end
    })
}

/**
 * Get previous N months from a given period (excluding the given period)
 * Returns array of period strings in format "YYYY-MM"
 */
export function getPreviousMonths(period: string, count: number): string[] {
    const [year, month] = period.split("-").map(Number)
    const result: string[] = []

    for (let i = 1; i <= count; i++) {
        const d = new Date(year, month - 1 - i, 1)
        const y = d.getFullYear()
        const m = (d.getMonth() + 1).toString().padStart(2, "0")
        result.push(`${y}-${m}`)
    }

    return result
}

/**
 * Calculate total expense cents by category for a set of transactions
 */
export function getExpenseTotalsByCategoryCents(
    transactions: { categoryId: string; amountCents: number; type: "income" | "expense" }[]
): Map<string, number> {
    const totals = new Map<string, number>()

    for (const t of transactions) {
        if (t.type !== "expense") continue
        const current = totals.get(t.categoryId) || 0
        totals.set(t.categoryId, current + Math.abs(t.amountCents))
    }

    return totals
}

/**
 * Calculate total expense cents for a set of transactions
 */
export function getTotalExpenseCents(
    transactions: { amountCents: number; type: "income" | "expense" }[]
): number {
    return transactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + Math.abs(t.amountCents), 0)
}

/**
 * Format a period string to a human-readable month label
 */
export function formatPeriodLabel(period: string, locale: string = "it-IT"): string {
    const [year, month] = period.split("-").map(Number)
    const date = new Date(year, month - 1, 1)
    const label = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(date)
    return label.charAt(0).toUpperCase() + label.slice(1)
}

/**
 * Get current period in YYYY-MM format
 */
export function getCurrentPeriod(date: Date = new Date()): string {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    return `${year}-${month}`
}

/**
 * Build a transactions page URL with filters
 */
export function buildTransactionsUrl(params: {
    period?: string
    categoryId?: string
    sortByAmount?: boolean
}): string {
    const searchParams = new URLSearchParams()

    if (params.period) {
        const { start, end } = getMonthBoundaries(params.period)
        // Use local date parts to avoid timezone shift from toISOString()
        const formatDate = (d: Date) => {
            const y = d.getFullYear()
            const m = (d.getMonth() + 1).toString().padStart(2, "0")
            const day = d.getDate().toString().padStart(2, "0")
            return `${y}-${m}-${day}`
        }
        searchParams.set("period", "custom")
        searchParams.set("from", formatDate(start))
        searchParams.set("to", formatDate(end))
    }

    if (params.categoryId) {
        searchParams.set("cat", params.categoryId)
    }

    if (params.sortByAmount) {
        searchParams.set("sort", "amount")
        searchParams.set("order", "desc")
    }

    const queryString = searchParams.toString()
    return `/transactions${queryString ? `?${queryString}` : ""}`
}
