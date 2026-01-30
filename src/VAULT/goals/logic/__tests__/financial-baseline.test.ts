
import { calculateBaselineMetrics } from "../financial-baseline"
import { Transaction } from "@/features/transactions/api/types"
import { Category } from "@/features/categories/config"
import { describe, test, expect } from "vitest"

// Mock Data Builders
const createCategory = (id: string, nature: "essential" | "comfort" | "superfluous"): Category => ({
    id,
    label: id,
    kind: "expense",
    spendingNature: nature,
    color: "blue",
    hexColor: "#000000",
    iconName: "home"
})

const createTransaction = (
    amount: number,
    type: "income" | "expense",
    dateStr: string,
    categoryId: string = "cat1"
): Transaction => ({
    id: Math.random().toString(),
    amountCents: Math.abs(amount * 100),
    type,
    date: dateStr,
    timestamp: new Date(dateStr).getTime(),
    description: "test",
    category: "test",
    categoryId
})

describe("Financial Baseline Logic", () => {
    const categories = [
        createCategory("rent", "essential"),
        createCategory("dining", "comfort")
    ]

    const now = new Date("2024-06-15T12:00:00Z") // Pivot date

    // Scenario: Steady income and expenses for past 3 months (Mar, Apr, May 2024)
    // Pivot should be May 2024 (Month previous to June)
    // Range 3 months: March, April, May
    const steadyTransactions = [
        // March
        createTransaction(2000, "income", "2024-03-01T12:00:00"),
        createTransaction(1000, "expense", "2024-03-05T12:00:00", "rent"), // Essential
        createTransaction(500, "expense", "2024-03-10T12:00:00", "dining"), // Comfort

        // April
        createTransaction(2000, "income", "2024-04-01T12:00:00"),
        createTransaction(1000, "expense", "2024-04-05T12:00:00", "rent"),
        createTransaction(500, "expense", "2024-04-10T12:00:00", "dining"),

        // May
        createTransaction(2000, "income", "2024-05-01T12:00:00"),
        createTransaction(1000, "expense", "2024-05-05T12:00:00", "rent"),
        createTransaction(500, "expense", "2024-05-10T12:00:00", "dining"),
    ]

    test("should calculate correct averages for steady state", () => {
        const result = calculateBaselineMetrics(steadyTransactions, categories, 3, now)

        expect(result.averageMonthlyIncome).toBe(200000) // 2000.00
        expect(result.averageMonthlyExpenses).toBe(150000) // 1500.00
        expect(result.averageEssentialExpenses).toBe(100000) // 1000.00
        expect(result.expensesStdDev).toBeLessThan(1000) // Should be 0 or very close
        expect(result.monthsAnalyzed).toBe(3)
    })

    test("should handle volatility correctly (Standard Deviation)", () => {
        const volatileTransactions = [
            // Month 1: 1000 expense
            createTransaction(1000, "expense", "2024-03-05", "rent"),
            // Month 2: 2000 expense
            createTransaction(2000, "expense", "2024-04-05", "rent"),
            // Month 3: 1500 expense
            createTransaction(1500, "expense", "2024-05-05", "rent"),
        ]

        // Avg: 1500
        // Diffs: -500, +500, 0
        // SqDiffs: 250000, 250000, 0
        // AvgSqDiff: 166666.66
        // Sqrt: ~408

        const result = calculateBaselineMetrics(volatileTransactions, categories, 3, now)
        expect(result.averageMonthlyExpenses).toBe(150000)

        // StdDev check (approximate)
        // 408 * 100 cents = 40800
        expect(result.expensesStdDev).toBeGreaterThan(40000)
        expect(result.expensesStdDev).toBeLessThan(42000)
    })

    test("BUG REPRO: should not return 0 if data exists but date iteration is slightly off", () => {
        // If the iterative map initialization uses Date objects poorly (timezone shift etc), it might miss the string keys
        // used by transaction mapping.

        // Single transaction in range
        const tx = [createTransaction(1000, "expense", "2024-05-15", "rent")]

        const result = calculateBaselineMetrics(tx, categories, 3, now)

        // If this returns 0, it means the map key didn't match the transaction key
        expect(result.averageMonthlyExpenses).toBeGreaterThan(0)
    })
})
