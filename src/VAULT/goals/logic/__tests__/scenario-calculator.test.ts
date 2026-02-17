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
    test("allocates a prudential share of margin when scenario is secure", () => {
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
            config: createConfig({ essential: 0, comfort: 0, superfluous: 0 })
        })

        expect(result.sustainability.status).toBe("secure")
        expect(result.quota.baseMonthlyMarginCents).toBe(50000)
        expect(result.quota.baseMonthlyCapacityCents).toBe(45000)
        expect(result.quota.realtimeMonthlyCapacityCents).toBe(45000)
        expect(result.planBasis).toBe("historical")
    })

    test("uses stricter allocation when sustainability is fragile", () => {
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
            config: createConfig({ essential: 0, comfort: 0, superfluous: 0 })
        })

        expect(result.sustainability.status).toBe("fragile")
        expect(result.quota.baseMonthlyCapacityCents).toBe(9750)
    })

    test("sets capacity to zero when scenario is unsafe", () => {
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
            config: createConfig({ essential: 0, comfort: 0, superfluous: 0 })
        })

        expect(result.sustainability.status).toBe("unsafe")
        expect(result.quota.baseMonthlyCapacityCents).toBe(0)
        expect(result.planBasis).toBe("historical")
    })

    test("low confidence keeps capacity more conservative than high confidence", () => {
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
            )
        })

        const lowConfidence = calculateScenario({
            key: "baseline",
            baseline,
            averages,
            config: createConfig(
                { essential: 0, comfort: 0, superfluous: 0 },
                { calibration: { elasticityIndex: 0.3, stabilityFactor: 0.9, volatilityCents: 5000, confidenceScore: 45, lowConfidence: true } }
            )
        })

        expect(lowConfidence.quota.baseMonthlyCapacityCents).toBeLessThan(highConfidence.quota.baseMonthlyCapacityCents)
    })

    test("brain assist applies extra prudence on capacity", () => {
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
            config: createConfig({ essential: 0, comfort: 0, superfluous: 0 })
        })

        const withBrainAssist = calculateScenario({
            key: "baseline",
            baseline,
            averages,
            config: createConfig({ essential: 0, comfort: 0, superfluous: 0 }),
            brainAssist: {
                riskScore: 0.85,
                confidence: 0.9
            }
        })

        expect(withBrainAssist.quota.baseMonthlyCapacityCents).toBeLessThan(withoutBrainAssist.quota.baseMonthlyCapacityCents)
    })

    test("monotonicity: stronger rhythm cannot worsen monthly capacity", () => {
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
            config: createConfig({ essential: 0, comfort: 0, superfluous: 0 })
        })

        const strongerScenario = calculateScenario({
            key: "aggressive",
            baseline,
            averages,
            config: createConfig(
                { essential: 0, comfort: 20, superfluous: 40 },
                { type: "aggressive", label: "Aggressivo" }
            )
        })

        expect(strongerScenario.quota.baseMonthlyCapacityCents).toBeGreaterThanOrEqual(baselineScenario.quota.baseMonthlyCapacityCents)
    })

    test("applies realtime overlay basis and factor", () => {
        const baseline = createBaseline()
        const averages: Record<string, CategoryAverage> = {
            essential: { categoryId: "essential", averageAmount: 100000, totalInPeriod: 100000, monthCount: 1 },
            comfort: { categoryId: "comfort", averageAmount: 20000, totalInPeriod: 20000, monthCount: 1 },
            superfluous: { categoryId: "superfluous", averageAmount: 30000, totalInPeriod: 30000, monthCount: 1 }
        }

        const withOverlay = calculateScenario({
            key: "baseline",
            baseline,
            averages,
            config: createConfig({ essential: 0, comfort: 0, superfluous: 0 }),
            realtimeOverlay: {
                enabled: true,
                source: "brain",
                shortTermMonths: 2,
                capacityFactor: 0.9
            }
        })

        expect(withOverlay.planBasis).toBe("brain_overlay")
        expect(withOverlay.quota.realtimeOverlayApplied).toBe(true)
        expect(withOverlay.quota.realtimeWindowMonths).toBe(2)
        expect(withOverlay.quota.realtimeMonthlyCapacityCents).toBeLessThanOrEqual(withOverlay.quota.baseMonthlyCapacityCents)
    })
})
