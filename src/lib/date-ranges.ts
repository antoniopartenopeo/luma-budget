/**
 * Calculates start and end dates for a given period and range.
 * Used to ensure consistency between Dashboard and Simulator.
 * 
 * @param period - The "pivot" month in YYYY-MM format.
 * @param months - Number of months in the range (inclusive of the pivot month).
 */
export function calculateDateRange(period: string, months: number = 1): { startDate: Date, endDate: Date } {
    // 1. Determine End Date (End of the pivot month)
    // Parse period (YYYY-MM)
    const [year, month] = period.split('-').map(Number)

    // Javascript Date Month is 0-indexed (0=Jan, 11=Dec)
    // The input period "2024-01" means January. month variable is 1.
    // So we use month-1 for Date constructor.

    // End Date: The last second of the pivot month
    // Date.UTC(year, month, 0) gives the last day of the PREVIOUS month? 
    // No, Date.UTC(2024, 1, 0) -> Feb 0 -> Jan 31. Correct.
    // We want end of "period" month. period "01" (Jan).
    // Date.UTC(year, month, 0) -> (2024, 1, 0) -> Jan 31.
    // We want 23:59:59.999

    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))

    // Start Date: 1st of the starting month
    // If months=1, start is 1st of "period".
    // Date.UTC(year, month - 1 - (months - 1), 1) -> (2024, 0, 1) -> Jan 1.

    const startDate = new Date(Date.UTC(year, month - months, 1, 0, 0, 0, 0))

    return { startDate, endDate }
}
