import { describe, expect, test } from "vitest"

import { calculateScenario } from "../scenario-calculator"
import { BaselineMetrics } from "../financial-baseline"
import { ScenarioConfig } from "../../types"
import { CategoryAverage } from "@/domain/simulation"

function createBaseline(overrides: Partial<BaselineMetrics> = {}): BaselineMetrics {
    return {
        averageMonthlyIncome: 200000,
        averageMonthlyExpenses: 150000,
        averageEssentialExpenses: 100000,
        averageSuperfluousExpenses: 30000,
        averageComfortExpenses: 20000,
        expensesStdDev: 5000,
        freeCashFlowStdDev: 5000,
        monthsAnalyzed: 6,
        activeMonths: 6,
        activityCoverageRatio: 1,
        ...overrides
    }
}

function createConfig(
    applicationMap: Record<string, number>,
    overrides: Partial<ScenarioConfig> = {}
): ScenarioConfig {
    return {
        type: "baseline",
        label: "Test",
        description: "Scenario di test",
        applicationMap,
        savingsMap: { superfluous: 0, comfort: 0 },
        ...overrides
    }
}

describe("Scenario Calculator", () => {
    test("allocates only a portion of surplus to goal projection when scenario is secure", () => {
        const baseline = createBaseline()
        const averages: Record<string, CategoryAverage> = {
            essential: { categoryId: "essential", averageAmount: 100000, totalInPeriod: 100000, monthCount: 1 },
            comfort: { categoryId: "comfort", averageAmount: 20000, totalInPeriod: 20000, monthCount: 1 },
            superfluous: { categoryId: "superfluous", averageAmount: 30000, totalInPeriod: 30000, monthCount: 1 }
        }

        const result = calculateScenario({
            key: "baseline",
            baseline,
            averages,
            config: createConfig({ essential: 0, comfort: 0, superfluous: 0 }),
            goalTargetCents: 100000
        })

        // FCF = 50,000, secure ratio = 0.9 -> allocatable = 45,000 => 3 months
        expect(result.sustainability.status).toBe("secure")
        expect(result.projection.canReach).toBe(true)
        expect(result.projection.likelyMonths).toBe(3)
        expect(result.monthlyGoalCapacityCents).toBe(45000)
        expect(result.projection.likelyMonthsPrecise).toBeLessThanOrEqual(3)
    })

    test("uses a stricter allocation when sustainability is fragile", () => {
        const baseline = createBaseline({
            averageMonthlyExpenses: 185000,
            averageEssentialExpenses: 120000,
            averageSuperfluousExpenses: 40000,
            averageComfortExpenses: 25000
        })

        const averages: Record<string, CategoryAverage> = {
            essential: { categoryId: "essential", averageAmount: 120000, totalInPeriod: 120000, monthCount: 1 },
            comfort: { categoryId: "comfort", averageAmount: 25000, totalInPeriod: 25000, monthCount: 1 },
            superfluous: { categoryId: "superfluous", averageAmount: 40000, totalInPeriod: 40000, monthCount: 1 }
        }

        const result = calculateScenario({
            key: "baseline",
            baseline,
            averages,
            config: createConfig({ essential: 0, comfort: 0, superfluous: 0 }),
            goalTargetCents: 100000
        })

        // FCF = 15,000, fragile ratio = 0.65 -> allocatable = 9,750 => 11 months
        expect(result.sustainability.status).toBe("fragile")
        expect(result.projection.canReach).toBe(true)
        expect(result.monthlyGoalCapacityCents).toBe(9750)
        expect(result.projection.likelyMonths).toBe(11)
    })

    test("marks projection unreachable when scenario is unsafe", () => {
        const baseline = createBaseline({
            averageMonthlyIncome: 100000,
            averageMonthlyExpenses: 150000,
            averageEssentialExpenses: 90000,
            averageSuperfluousExpenses: 40000,
            averageComfortExpenses: 20000
        })

        const averages: Record<string, CategoryAverage> = {
            essential: { categoryId: "essential", averageAmount: 90000, totalInPeriod: 90000, monthCount: 1 },
            comfort: { categoryId: "comfort", averageAmount: 20000, totalInPeriod: 20000, monthCount: 1 },
            superfluous: { categoryId: "superfluous", averageAmount: 40000, totalInPeriod: 40000, monthCount: 1 }
        }

        const result = calculateScenario({
            key: "baseline",
            baseline,
            averages,
            config: createConfig({ essential: 0, comfort: 0, superfluous: 0 }),
            goalTargetCents: 50000
        })

        expect(result.sustainability.status).toBe("unsafe")
        expect(result.monthlyGoalCapacityCents).toBe(0)
        expect(result.projection.canReach).toBe(false)
    })

    test("applies confidence-aware prudence: low confidence slows likely projection", () => {
        const baseline = createBaseline()
        const averages: Record<string, CategoryAverage> = {
            essential: { categoryId: "essential", averageAmount: 100000, totalInPeriod: 100000, monthCount: 1 },
            comfort: { categoryId: "comfort", averageAmount: 20000, totalInPeriod: 20000, monthCount: 1 },
            superfluous: { categoryId: "superfluous", averageAmount: 30000, totalInPeriod: 30000, monthCount: 1 }
        }

        const highConfidence = calculateScenario({
            key: "baseline",
            baseline,
            averages,
            config: createConfig(
                { essential: 0, comfort: 0, superfluous: 0 },
                { calibration: { elasticityIndex: 0.3, stabilityFactor: 0.9, volatilityCents: 5000, confidenceScore: 88 } }
            ),
            goalTargetCents: 400000
        })

        const lowConfidence = calculateScenario({
            key: "baseline",
            baseline,
            averages,
            config: createConfig(
                { essential: 0, comfort: 0, superfluous: 0 },
                { calibration: { elasticityIndex: 0.3, stabilityFactor: 0.9, volatilityCents: 5000, confidenceScore: 45, lowConfidence: true } }
            ),
            goalTargetCents: 400000
        })

        expect(highConfidence.projection.canReach).toBe(true)
        expect(lowConfidence.projection.canReach).toBe(true)
        expect(lowConfidence.projection.likelyMonthsPrecise).toBeGreaterThan(highConfidence.projection.likelyMonthsPrecise)
        expect(lowConfidence.projection.likelyMonths).toBeGreaterThanOrEqual(highConfidence.projection.likelyMonths)
    })

    test("applies brain-assist prudence when risk signal is ready", () => {
        const baseline = createBaseline()
        const averages: Record<string, CategoryAverage> = {
            essential: { categoryId: "essential", averageAmount: 100000, totalInPeriod: 100000, monthCount: 1 },
            comfort: { categoryId: "comfort", averageAmount: 20000, totalInPeriod: 20000, monthCount: 1 },
            superfluous: { categoryId: "superfluous", averageAmount: 30000, totalInPeriod: 30000, monthCount: 1 }
        }

        const withoutBrainAssist = calculateScenario({
            key: "baseline",
            baseline,
            averages,
            config: createConfig({ essential: 0, comfort: 0, superfluous: 0 }),
            goalTargetCents: 250000
        })

        const withBrainAssist = calculateScenario({
            key: "baseline",
            baseline,
            averages,
            config: createConfig({ essential: 0, comfort: 0, superfluous: 0 }),
            goalTargetCents: 250000,
            brainAssist: {
                riskScore: 0.85,
                confidence: 0.9
            }
        })

        expect(withoutBrainAssist.projection.canReach).toBe(true)
        expect(withBrainAssist.projection.canReach).toBe(true)
        expect(withBrainAssist.projection.likelyMonthsPrecise)
            .toBeGreaterThan(withoutBrainAssist.projection.likelyMonthsPrecise)
        expect(withBrainAssist.projection.likelyMonths)
            .toBeGreaterThanOrEqual(withoutBrainAssist.projection.likelyMonths)
    })

    test("monotonicity guard: higher monthly capacity cannot worsen likely precise months", () => {
        const baseline = createBaseline()
        const averages: Record<string, CategoryAverage> = {
            essential: { categoryId: "essential", averageAmount: 100000, totalInPeriod: 100000, monthCount: 1 },
            comfort: { categoryId: "comfort", averageAmount: 20000, totalInPeriod: 20000, monthCount: 1 },
            superfluous: { categoryId: "superfluous", averageAmount: 30000, totalInPeriod: 30000, monthCount: 1 }
        }

        const baselineScenario = calculateScenario({
            key: "baseline",
            baseline,
            averages,
            config: createConfig({ essential: 0, comfort: 0, superfluous: 0 }),
            goalTargetCents: 50000
        })

        const strongerScenario = calculateScenario({
            key: "aggressive",
            baseline,
            averages,
            config: createConfig(
                { essential: 0, comfort: 20, superfluous: 40 },
                { type: "aggressive", label: "Aggressivo" }
            ),
            goalTargetCents: 50000
        })

        expect(strongerScenario.monthlyGoalCapacityCents).toBeGreaterThanOrEqual(baselineScenario.monthlyGoalCapacityCents)
        expect(strongerScenario.projection.likelyMonthsPrecise).toBeLessThanOrEqual(baselineScenario.projection.likelyMonthsPrecise)
    })
})
