
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

        const [base, agg, bal] = scenarios
        expect(base.type).toBe("baseline")
        expect(agg.type).toBe("aggressive")
        expect(bal.type).toBe("balanced")
    })

    test("Baseline should have 0 savings", () => {
        const scenarios = generateScenarios(baseline, categories)
        expect(Object.keys(scenarios[0].applicationMap)).toHaveLength(0)
    })

    test("Balanced should target Superfluous (10%) and Comfort (2%)", () => {
        const scenarios = generateScenarios(baseline, categories)
        const savings = scenarios[2].applicationMap
        // Index 2 is Relaxed (Balanced) -> 10% / 2%

        expect(savings["rent"]).toBeUndefined() // Essential untouched
        expect(savings["dining"]).toBe(2)
        expect(savings["netflix"]).toBe(10)
    })

    test("Aggressive should have deeper cuts (40% / 15%)", () => {
        const scenarios = generateScenarios(baseline, categories)
        const savings = scenarios[1].applicationMap
        // Index 1 is Rapido (Aggressive) -> 40% / 15%

        expect(savings["rent"]).toBeUndefined()
        expect(savings["dining"]).toBe(15)
        expect(savings["netflix"]).toBe(40)
    })
})
