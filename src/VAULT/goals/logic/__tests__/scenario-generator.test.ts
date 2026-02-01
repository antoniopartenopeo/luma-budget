
import { generateScenarios } from "../scenario-generator"
import { BaselineMetrics } from "../financial-baseline"
import { Category } from "@/features/categories/config"
import { describe, test, expect } from "vitest"

describe("Scenario Generator Logic", () => {
    // Mock Data
    const baseline: BaselineMetrics = {
        averageMonthlyIncome: 200000,
        averageMonthlyExpenses: 150000,
        averageEssentialExpenses: 100000,
        expensesStdDev: 5000,
        monthsAnalyzed: 6
    }

    const categories: Category[] = [
        { id: "rent", spendingNature: "essential", label: "Rent", kind: "expense", color: "#000", hexColor: "#000", iconName: "home" },
        { id: "dining", spendingNature: "comfort", label: "Dining", kind: "expense", color: "#000", hexColor: "#000", iconName: "food" },
        { id: "netflix", spendingNature: "superfluous", label: "Netflix", kind: "expense", color: "#000", hexColor: "#000", iconName: "movie" }
    ]

    test("should generate 3 distinct scenarios", () => {
        const scenarios = generateScenarios(baseline, categories)
        expect(scenarios).toHaveLength(3)

        const [base, bal, agg] = scenarios // Correct order: baseline, balanced, aggressive
        expect(base.type).toBe("baseline")
        expect(bal.type).toBe("balanced")
        expect(agg.type).toBe("aggressive")
    })

    test("Baseline should have 0 savings", () => {
        const scenarios = generateScenarios(baseline, categories)
        // Now we expect explicit 0s for all categories
        expect(Object.keys(scenarios[0].applicationMap)).toHaveLength(3)
        expect(scenarios[0].applicationMap["rent"]).toBe(0)
    })

    test("Balanced should target Superfluous (20%) and Comfort (5%)", () => {
        const scenarios = generateScenarios(baseline, categories)
        const balanced = scenarios[1] // Index 1 is Balanced
        const savings = balanced.applicationMap

        expect(savings["rent"]).toBe(0) // Essential explicitly 0
        expect(savings["dining"]).toBe(5) // Comfort 5% (updated in RHYTHMS?)
        expect(savings["netflix"]).toBe(20) // Superfluous 20%
    })

    test("Aggressive should have deeper cuts (40% / 15%)", () => {
        const scenarios = generateScenarios(baseline, categories)
        const aggressive = scenarios[2] // Index 2 is Aggressive
        const savings = aggressive.applicationMap

        expect(savings["rent"]).toBe(0)
        expect(savings["dining"]).toBe(15) // Comfort 15%
        expect(savings["netflix"]).toBe(40) // Superfluous 40%
    })
})
