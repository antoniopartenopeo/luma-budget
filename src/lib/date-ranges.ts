/**
 * Calculates start and end dates for a given period and range.
 * Used to ensure consistency between Dashboard and Simulator.
 * 
 * @param period - The "pivot" month in YYYY-MM format.
 * @param months - Number of months in the range (inclusive of the pivot month).
 */
export function calculateDateRange(period: string, months: number = 1): { startDate: Date, endDate: Date } {
    // 1. Determine End Date (End of the pivot month)
    const endDate = new Date(period + "-01")
    endDate.setMonth(endDate.getMonth() + 1)
    endDate.setDate(0)
    endDate.setHours(23, 59, 59, 999) // Ensure we cover the full last day

    // 2. Determine Start Date
    const startDate = new Date(period + "-01")
    if (months > 1) {
        startDate.setMonth(startDate.getMonth() - (months - 1))
    }
    // Set to start of month
    startDate.setDate(1)
    startDate.setHours(0, 0, 0, 0)

    return { startDate, endDate }
}
