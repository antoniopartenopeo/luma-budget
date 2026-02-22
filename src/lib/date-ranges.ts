/**
 * Centralized date utility functions for NUMA Budget.
 * Provides consistent handling of periods (YYYY-MM) and date ranges.
 */

/**
 * Calculates start and end dates for a given period and range using UTC.
 * Used for strict date comparisons where timezone offsets should be ignored
 * (e.g. comparing ISO strings that are normalized to UTC days).
 * 
 * @param period - The "pivot" month in YYYY-MM format.
 * @param months - Number of months in the range (inclusive of the pivot month).
 */
export function calculateDateRange(period: string, months: number = 1): { startDate: Date, endDate: Date } {
    const [year, month] = period.split('-').map(Number)
    // End Date: The last millisecond of the pivot month in UTC
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))
    // Start Date: 1st of the starting month in UTC
    const startDate = new Date(Date.UTC(year, month - months, 1, 0, 0, 0, 0))
    return { startDate, endDate }
}

/**
 * Calculates start and end dates for a given period and range using Local Time.
 * Preferred for user-facing period filters.
 *
 * @param period - The "pivot" month in YYYY-MM format.
 * @param months - Number of months in the range (inclusive of the pivot month).
 */
export function calculateDateRangeLocal(period: string, months: number = 1): { startDate: Date, endDate: Date } {
    const [year, month] = period.split("-").map(Number)
    // End Date: The last millisecond of the pivot month in local time
    const endDate = new Date(year, month, 0, 23, 59, 59, 999)
    // Start Date: 1st of the starting month in local time
    const startDate = new Date(year, month - months, 1, 0, 0, 0, 0)
    return { startDate, endDate }
}

/**
 * Calculates start and end dates for a given period using Local Time.
 * Used for UI filtering where the user expects "midnight local time".
 */
export function getMonthBoundariesLocal(period: string): { start: Date; end: Date } {
    const [year, month] = period.split("-").map(Number)
    const start = new Date(year, month - 1, 1, 0, 0, 0, 0)
    const end = new Date(year, month, 0, 23, 59, 59, 999)
    return { start, end }
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
 * Returns the previous complete month as YYYY-MM.
 * Example: if now is 2026-01-17, returns 2025-12.
 */
export function getPreviousCompleteMonthPeriod(now: Date = new Date()): string {
    const previousMonthDate = new Date(now)
    previousMonthDate.setDate(0)
    return getCurrentPeriod(previousMonthDate)
}

/**
 * Returns month keys (YYYY-MM) from pivot backwards.
 * Includes pivot month as first element.
 */
export function getRollingMonthKeysFromPivot(pivotPeriod: string, months: number): string[] {
    const [year, month] = pivotPeriod.split("-").map(Number)
    const keys: string[] = []

    for (let i = 0; i < months; i++) {
        const date = new Date(year, month - 1 - i, 1)
        keys.push(getCurrentPeriod(date))
    }

    return keys
}

/**
 * Canonical range for "last N complete months" ending on previous month.
 */
export function getPreviousCompleteMonthsRange(
    months: number,
    now: Date = new Date()
): { pivotPeriod: string; startDate: Date; endDate: Date } {
    const pivotPeriod = getPreviousCompleteMonthPeriod(now)
    const { startDate, endDate } = calculateDateRange(pivotPeriod, months)
    return { pivotPeriod, startDate, endDate }
}

/**
 * Shift a period string by the provided number of months.
 * Positive delta moves forward, negative moves backward.
 */
export function shiftPeriod(period: string, deltaMonths: number): string {
    const [year, month] = period.split("-").map(Number)
    const shifted = new Date(year, month - 1 + deltaMonths, 1)
    return getCurrentPeriod(shifted)
}

/**
 * Format a period string to a human-readable month label (e.g. "Gennaio 2024")
 */
export function formatPeriodLabel(period: string, locale: string = "it-IT"): string {
    const [year, month] = period.split("-").map(Number)
    const date = new Date(year, month - 1, 1)
    const label = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(date)
    return label.charAt(0).toUpperCase() + label.slice(1)
}

/**
 * Format a Date to local YYYY-MM-DD without UTC conversion side effects.
 */
export function formatDateLocalISO(date: Date): string {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const day = date.getDate().toString().padStart(2, "0")
    return `${year}-${month}-${day}`
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
 * Get days elapsed in the current period (up to currentDate)
 * Uses Local boundaries logic.
 */
export function getDaysElapsedInMonth(period: string, currentDate: Date): number {
    const { start, end } = getMonthBoundariesLocal(period)

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
 * Checks if a timestamp represents a date within the given start/end boundaries.
 */
export function isDateInRange(timestamp: number, start: Date, end: Date): boolean {
    const d = new Date(timestamp)
    return d >= start && d <= end
}

/**
 * Generic filter for objects with a timestamp field.
 */
export function filterByRange<T extends { timestamp: number }>(
    items: T[],
    start: Date,
    end: Date
): T[] {
    return items.filter(t => isDateInRange(t.timestamp, start, end))
}
