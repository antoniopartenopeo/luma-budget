
import { generateSmartContext } from "../context-engine"
import { DashboardSummary } from "@/features/dashboard/api/types"

describe("Smart Context Engine", () => {

    // Helper to create mock summary
    const mockSummary = (overrides: Partial<DashboardSummary> = {}): DashboardSummary => ({
        totalSpent: 0,
        totalIncome: 0,
        totalExpenses: 0,
        netBalance: 0,
        budgetTotal: 0,
        budgetRemaining: 0,
        uselessSpendPercent: 0,
        categoriesSummary: [],
        usefulVsUseless: { useful: 0, useless: 0 },
        monthlyExpenses: [],
        ...overrides
    })

    test("LIQUIDITY PARADOX: Should warn when Budget >> Balance", () => {
        const result = generateSmartContext({
            summary: mockSummary({
                netBalance: 426,
                budgetRemaining: 2570,
                budgetTotal: 2570
            })
        })

        expect(result['budgetRemaining']).toBeDefined()
        expect(result['budgetRemaining'].id).toBe('liquidity-paradox')
        expect(result['budgetRemaining'].level).toBe('warning')
        expect(result['budgetRemaining'].message).toContain("426") // Should mention balance
    })

    test("SAFE HARBOR: Should success when Balance >> Budget", () => {
        const result = generateSmartContext({
            summary: mockSummary({
                netBalance: 5000,
                budgetRemaining: 1000,
                budgetTotal: 2000
            })
        })

        expect(result['budgetRemaining']).toBeDefined()
        expect(result['budgetRemaining'].id).toBe('safe-harbor')
        expect(result['budgetRemaining'].level).toBe('success')
    })

    test("PACING ALARM: Should danger when spending too fast early in month", () => {
        // Mock date to 5th of month
        const mockDate = new Date("2024-02-05")

        const result = generateSmartContext({
            summary: mockSummary({
                totalSpent: 600,
                budgetTotal: 1000,
                budgetRemaining: 400
            }),
            currentDate: mockDate
        })

        expect(result['totalSpent']).toBeDefined()
        expect(result['totalSpent'].id).toBe('pacing-alarm')
        expect(result['totalSpent'].level).toBe('danger')
    })
})
