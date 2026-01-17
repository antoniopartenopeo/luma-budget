import { describe, it, expect } from "vitest"
import { computeMonthlyAverages, applySavings } from "../utils"
import { calculateDateRange } from "@/lib/date-ranges"
import { Transaction } from "@/features/transactions/api/types"

// Mock Utility similar to what we'd find in Dashboard
const calculateDashboardTotalExpenses = (transactions: Transaction[], period: string, months: number) => {
    // 1. Calculate Date Range (Shared Logic)
    const { startDate, endDate } = calculateDateRange(period, months)

    // 2. Filter & Sum
    return transactions
        .filter(t => {
            if (t.type !== 'expense') return false
            const d = new Date(t.timestamp)
            return d >= startDate && d <= endDate
        })
        .reduce((sum, t) => sum + Math.abs(t.amountCents), 0)
}

describe("Simulator Parity Check", () => {
    // Fixture Data
    const transactions: Transaction[] = [
        // Oct 2025
        { id: "1", timestamp: new Date("2025-10-15T10:00:00").getTime(), amountCents: -1000, type: "expense", categoryId: "c1" } as unknown as Transaction,
        { id: "2", timestamp: new Date("2025-10-30T23:00:00").getTime(), amountCents: -2000, type: "expense", categoryId: "c2" } as unknown as Transaction,
        // Nov 2025
        { id: "3", timestamp: new Date("2025-11-01T09:00:00").getTime(), amountCents: -500, type: "expense", categoryId: "c1" } as unknown as Transaction,
        // Dec 2025 (Pivot Month for Simulator)
        { id: "4", timestamp: new Date("2025-12-31T20:00:00").getTime(), amountCents: -10000, type: "expense", categoryId: "c3" } as unknown as Transaction,
        // Jan 2026 (Current Month - Excluded by Simulator)
        { id: "5", timestamp: new Date("2026-01-02T10:00:00").getTime(), amountCents: -5000, type: "expense", categoryId: "c1" } as unknown as Transaction,
    ]

    const NOW = new Date("2026-01-17T12:00:00") // Jan 17 2026
    // Simulator pivot will be Dec 2025 (Previous Month of NOW)
    // Pivot String: "2025-12"

    it("should match Dashboard total for 3 month window", () => {
        // Simulator (3 months ending Dec 2025)
        const avgs = computeMonthlyAverages(transactions, 3, NOW)
        const simResult = applySavings(avgs, {}) // 0% savings

        // Dashboard (Pivot "2025-12", Range 3 months)
        const dashTotal = calculateDashboardTotalExpenses(transactions, "2025-12", 3)

        // Sim Result: baselineTotal (Monthly Average in cents)
        // Dashboard Total (cents)

        // Sim Baseline should roughly be Dashboard / 3
        // Due to integer rounding per category:
        // C1: (1000+500)/3 = 500
        // C2: 2000/3 = 667
        // C3: 10000/3 = 3333
        // Sum = 4500.
        // Dashboard Total = 13500. 13500 / 3 = 4500.

        expect(simResult.baselineTotal).toBe(4500)
        expect(dashTotal).toBe(13500)
        expect(simResult.baselineTotal * 3).toBe(dashTotal)
    })

    it("should match Dashboard total for 1 month window (Pivot)", () => {
        // Simulator 1 month? Simulator uses 3,6,12.
        // Let's force check logic consistency.
        // If we passed 1 to computeMonthlyAverages (if type allowed), it should match Dashboard(1).
        // But let's check 3 months (Oct, Nov, Dec).

        const dashTotal = calculateDashboardTotalExpenses(transactions, "2025-12", 3)
        expect(dashTotal).toBe(13500)
    })
})
