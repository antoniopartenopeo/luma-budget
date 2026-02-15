
import { generateScenarios } from "../scenario-generator"
import { BaselineMetrics } from "../financial-baseline"
import { Category } from "@/domain/categories"
import { calculateScenario } from "../scenario-calculator"
import { describe, test, expect } from "vitest"

describe("Scenario Generator Logic", () => {
    // Mock Data with Granular Nature
    const baseline: BaselineMetrics = {
        averageMonthlyIncome: 200000,
        averageMonthlyExpenses: 150000,
        averageEssentialExpenses: 100000,
        averageSuperfluousExpenses: 30000, // Explicit extra spending
        averageComfortExpenses: 20000,
        expensesStdDev: 5000,
        freeCashFlowStdDev: 5000,
        monthsAnalyzed: 6,
        activeMonths: 6,
        activityCoverageRatio: 1
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

    test("Adaptive Calibration: Balanced should proposal reasonable cuts", () => {
        const scenarios = generateScenarios(baseline, categories)
        const balanced = scenarios[1]
        const savings = balanced.applicationMap

        expect(savings["rent"]).toBe(0)
        // 0.33 elasticity * 0.95 stability * 0.5 intensity * 120 mult ~= 19%
        expect(savings["netflix"]).toBeGreaterThanOrEqual(15)
        expect(savings["dining"]).toBeLessThan(savings["netflix"])
    })

    test("Adaptive Calibration: Aggressive should scale cuts with intensity", () => {
        const scenarios = generateScenarios(baseline, categories)
        const aggressive = scenarios[2]
        const balanced = scenarios[1]

        expect(aggressive.applicationMap["netflix"]).toBeGreaterThan(balanced.applicationMap["netflix"])
        expect(aggressive.applicationMap["dining"]).toBeGreaterThan(balanced.applicationMap["dining"])
    })

    test("Regression Guard: stronger rhythms should not produce worse monthly capacity", () => {
        const scenarios = generateScenarios(baseline, categories)
        const averages = {
            rent: { categoryId: "rent", averageAmount: 100000, totalInPeriod: 600000, monthCount: 6 },
            dining: { categoryId: "dining", averageAmount: 20000, totalInPeriod: 120000, monthCount: 6 },
            netflix: { categoryId: "netflix", averageAmount: 30000, totalInPeriod: 180000, monthCount: 6 }
        }

        const baselineResult = calculateScenario({
            key: "baseline",
            baseline,
            averages,
            config: scenarios[0],
            goalTargetCents: 50000
        })
        const balancedResult = calculateScenario({
            key: "balanced",
            baseline,
            averages,
            config: scenarios[1],
            goalTargetCents: 50000
        })
        const aggressiveResult = calculateScenario({
            key: "aggressive",
            baseline,
            averages,
            config: scenarios[2],
            goalTargetCents: 50000
        })

        const baselineSurplus = baseline.averageMonthlyIncome - baselineResult.simulatedExpenses
        const balancedSurplus = baseline.averageMonthlyIncome - balancedResult.simulatedExpenses
        const aggressiveSurplus = baseline.averageMonthlyIncome - aggressiveResult.simulatedExpenses

        expect(balancedSurplus).toBeGreaterThanOrEqual(baselineSurplus)
        expect(aggressiveSurplus).toBeGreaterThanOrEqual(balancedSurplus)
        expect(aggressiveResult.simulatedExpenses).toBeLessThanOrEqual(balancedResult.simulatedExpenses)
        expect(balancedResult.simulatedExpenses).toBeLessThanOrEqual(baselineResult.simulatedExpenses)
    })

    test("Reliability Guard: low data coverage marks scenarios as low-confidence", () => {
        const lowCoverageBaseline: BaselineMetrics = {
            ...baseline,
            activityCoverageRatio: 0.3,
            activeMonths: 2
        }

        const lowCoverageScenarios = generateScenarios(lowCoverageBaseline, categories)
        expect(lowCoverageScenarios[0].calibration?.lowConfidence).toBe(true)
        expect(lowCoverageScenarios[1].calibration?.lowConfidence).toBe(true)
        expect(lowCoverageScenarios[2].calibration?.lowConfidence).toBe(true)
    })
})
