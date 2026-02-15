import { Category } from "@/domain/categories"
import { BaselineMetrics } from "./financial-baseline"
import { ScenarioConfig } from "../types"
import { RHYTHMS } from "../config/rhythms"
import { buildNatureApplicationMap } from "@/domain/simulation"

/**
 * Calibrates savings percentages based on financial elasticity.
 * This is the 'Intelligence' that makes Numa unique: it learns from the user's
 * history to propose a rhythm that is challenging but mathematically calibrated.
 */
function calibrateAdaptiveSavings(baseline: BaselineMetrics, intensity: number) {
    const averageFreeCashFlow = baseline.averageMonthlyIncome - baseline.averageMonthlyExpenses
    const totalExpenses = baseline.averageMonthlyExpenses || 1
    const coverageRatio = baseline.activityCoverageRatio
    const incomeBase = Math.max(1, baseline.averageMonthlyIncome)
    const marginRatio = averageFreeCashFlow / incomeBase

    const expenseInstability = baseline.expensesStdDev / totalExpenses
    const cashFlowInstability = baseline.freeCashFlowStdDev / Math.max(Math.abs(averageFreeCashFlow), incomeBase * 0.1, 1)
    const combinedInstability = (expenseInstability * 0.6) + (cashFlowInstability * 0.4)
    const stabilityFactor = Math.max(0.35, 1 - (combinedInstability * 0.8))

    const coverageScore = Math.round(Math.max(0, Math.min(100, coverageRatio * 100)))
    const stabilityScore = Math.round(Math.max(0, Math.min(100, stabilityFactor * 100)))
    const marginScore = Math.round(Math.max(0, Math.min(100, 50 + (marginRatio * 120))))
    const confidenceScore = Math.round((coverageScore * 0.45) + (stabilityScore * 0.35) + (marginScore * 0.2))
    const lowCoverage = coverageRatio < 0.5 || baseline.activeMonths < Math.min(3, baseline.monthsAnalyzed)
    const lowConfidence = confidenceScore < 55 || lowCoverage

    if (intensity === 0) return {
        savings: { superfluous: 0, comfort: 0 },
        metadata: {
            elasticityIndex: 1,
            stabilityFactor: 1,
            lowConfidence,
            volatilityCents: baseline.expensesStdDev,
            confidenceScore,
            coverageRatio,
            marginRatio
        }
    }

    // 1. Elasticity (How much room is there in extra spending?)
    const extraSpendingTotal = baseline.averageSuperfluousExpenses + baseline.averageComfortExpenses

    // Ratio of extra spending: higher means more 'fat' to cut.
    // If you spend 50% in extras, cutting is easier than if you spend 5%.
    const elasticityIndex = extraSpendingTotal / totalExpenses

    // 3. Adaptive Pressure
    // If expenses are close to income, cuts need to be more effective.
    const expensePressure = Math.min(1.25, Math.max(0.8, baseline.averageMonthlyExpenses / incomeBase))

    // If free cash flow is low/negative, we gently increase adaptation intensity.
    const lowMarginThreshold = incomeBase * 0.1
    const marginStressFactor = averageFreeCashFlow <= 0 ? 1.2 : averageFreeCashFlow < lowMarginThreshold ? 1.1 : 1

    // Low data coverage -> reduce aggressiveness for reliability.
    const confidenceFactor = confidenceScore >= 80
        ? 1
        : confidenceScore >= 65
            ? 0.92
            : confidenceScore >= 55
                ? 0.85
                : 0.72

    // 4. Calibration Formula
    // Base potential is weighted by elasticity, stability and real affordability pressure.
    const potential = elasticityIndex * stabilityFactor * expensePressure * marginStressFactor * confidenceFactor

    // Superfluous is targeted more aggressively than Comfort
    // Balanced intensity (0.5) targets a fraction of the 'potential'
    const superfluousCut = Math.round(potential * intensity * 120) // Multiplier for UX feeling
    const comfortCut = Math.round(potential * intensity * 50)

    const superfluousFloor = intensity >= 1 ? 20 : intensity >= 0.5 ? 10 : 0
    const comfortFloor = intensity >= 1 ? 8 : intensity >= 0.5 ? 3 : 0

    return {
        savings: {
            // Clamp to ranges that feel human/possible
            superfluous: Math.min(85, Math.max(superfluousFloor, superfluousCut)),
            comfort: Math.min(40, Math.max(comfortFloor, comfortCut))
        },
        metadata: {
            elasticityIndex,
            stabilityFactor,
            lowConfidence,
            volatilityCents: baseline.expensesStdDev,
            confidenceScore,
            coverageRatio,
            marginRatio
        }
    }
}

/**
 * Generates savings scenarios based on spending habits.
 * Returns a list of configurations that can be fed into the simulator/projection engine.
 */
export function generateScenarios(
    baseline: BaselineMetrics,
    categories: Category[]
): ScenarioConfig[] {
    return RHYTHMS.map(rhythm => {
        // Here is where the MAGIC happens: Adaptive Calibration
        // Numa learns the "weight" of the rhythm from the baseline
        const { savings, metadata } = calibrateAdaptiveSavings(baseline, rhythm.intensity)
        const applicationMap = buildNatureApplicationMap(categories, savings)

        return {
            type: rhythm.type,
            label: rhythm.label,
            description: rhythm.description,
            applicationMap,
            savingsMap: savings,
            calibration: metadata
        }
    })
}
