import { computeMonthlyAverages, applySavings, SimulationPeriod, CategoryAverage } from "../utils"
import { Transaction } from "@/features/transactions/api/types"

describe("Simulator Utils", () => {
    // Mock Date to ensure deterministic tests
    // 17 Gennaio 2026. Mese corrente: Gennaio.
    // Finestra 3 mesi: Ott, Nov, Dic 2025.
    const mockNow = new Date("2026-01-17T12:00:00Z")

    describe("computeMonthlyAverages", () => {
        it("should calculate correct averages excluding current month", () => {
            const period: SimulationPeriod = 3
            // Ottobre: 10000
            // Novembre: 20000
            // Dicembre: 0
            // Gennaio (corrente): 50000 -> Should be IGNORED
            const transactions: Partial<Transaction>[] = [
                { date: "2025-10-15", amountCents: 10000, type: "expense", categoryId: "cat1" },
                { date: "2025-11-20", amountCents: 20000, type: "expense", categoryId: "cat1" },
                { date: "2026-01-05", amountCents: 50000, type: "expense", categoryId: "cat1" }, // Current month
                { date: "2025-11-20", amountCents: 5000, type: "income", categoryId: "cat1" }, // Income ignored
            ]

            const result = computeMonthlyAverages(transactions as Transaction[], period, mockNow)

            expect(result["cat1"]).toBeDefined()
            // Total: 30000. Months: 3. Avg: 10000.
            expect(result["cat1"].averageAmount).toBe(10000)
            expect(result["cat1"].totalInPeriod).toBe(30000)
            expect(result["cat1"].monthCount).toBe(3)
        })

        it("should handle rounding correctly", () => {
            const period: SimulationPeriod = 3
            // Total 100. Avg 33.333 -> 33
            const transactions: Partial<Transaction>[] = [
                { date: "2025-12-01", amountCents: 100, type: "expense", categoryId: "cat2" }
            ]
            const result = computeMonthlyAverages(transactions as Transaction[], period, mockNow)
            expect(result["cat2"].averageAmount).toBe(33)
        })
    })

    describe("applySavings", () => {
        const mockAverages: Record<string, CategoryAverage> = {
            "food": { categoryId: "food", averageAmount: 10000, totalInPeriod: 0, monthCount: 3 }, // 100€
            "tech": { categoryId: "tech", averageAmount: 20000, totalInPeriod: 0, monthCount: 3 }, // 200€
        }

        it("should apply savings percentage correctly", () => {
            const savings = { "food": 10 } // 10% saving
            const result = applySavings(mockAverages, savings)

            // Food: 10000 * 0.9 = 9000
            expect(result.categoryResults["food"].simulated).toBe(9000)
            expect(result.categoryResults["food"].saving).toBe(1000)

            // Tech: 0% saving -> same
            expect(result.categoryResults["tech"].simulated).toBe(20000)
            expect(result.categoryResults["tech"].saving).toBe(0)
        })

        it("should calculate grand totals correctly", () => {
            const savings = { "food": 50, "tech": 50 } // 50% on both
            const result = applySavings(mockAverages, savings)

            const expectedTotalBaseline = 30000
            const expectedTotalSimulated = 5000 + 10000 // 15000

            expect(result.baselineTotal).toBe(expectedTotalBaseline)
            expect(result.simulatedTotal).toBe(expectedTotalSimulated)
            expect(result.savingsAmount).toBe(15000)
            expect(result.savingsPercent).toBe(50)
        })
    })
})
