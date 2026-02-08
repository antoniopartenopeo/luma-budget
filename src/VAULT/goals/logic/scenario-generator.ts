import { Category } from "@/features/categories/config"
import { BaselineMetrics } from "./financial-baseline"
import { ScenarioConfig } from "../types"
import { RHYTHMS } from "../config/rhythms"

/**
 * Calibrates savings percentages based on financial elasticity.
 * This is the 'Intelligence' that makes Numa unique: it learns from the user's
 * history to propose a rhythm that is challenging but mathematically calibrated.
 */
function calibrateAdaptiveSavings(baseline: BaselineMetrics, intensity: number) {
    if (intensity === 0) return {
        savings: { superfluous: 0, comfort: 0 },
        metadata: { elasticityIndex: 1, stabilityFactor: 1, volatilityCents: baseline.expensesStdDev }
    }

    // 1. Elasticity (How much room is there in extra spending?)
    const extraSpendingTotal = baseline.averageSuperfluousExpenses + baseline.averageComfortExpenses
    const totalExpenses = baseline.averageMonthlyExpenses || 1

    // Ratio of extra spending: higher means more 'fat' to cut.
    // If you spend 50% in extras, cutting is easier than if you spend 5%.
    const elasticityIndex = extraSpendingTotal / totalExpenses

    // 2. Stability (How much risk can we take?)
    // Normalized coefficient of variation: 1 = stable, 0.4 = wild
    const instability = (baseline.expensesStdDev / totalExpenses)
    const stabilityFactor = Math.max(0.4, 1 - (instability * 1.5))

    // 3. Calibration Formula
    // Base potential is weighted by elasticity and stability
    const potential = elasticityIndex * stabilityFactor

    // Superfluous is targeted more aggressively than Comfort
    // Balanced intensity (0.5) targets a fraction of the 'potential'
    const superfluousCut = Math.round(potential * intensity * 120) // Multiplier for UX feeling
    const comfortCut = Math.round(potential * intensity * 50)

    return {
        savings: {
            // Clamp to ranges that feel human/possible
            // Balanced minimum is at least 15% superfluous cut.
            superfluous: Math.min(85, Math.max(15 * intensity, superfluousCut)),
            comfort: Math.min(40, Math.max(5 * intensity, comfortCut))
        },
        metadata: {
            elasticityIndex,
            stabilityFactor,
            volatilityCents: baseline.expensesStdDev
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

        const applicationMap: Record<string, number> = {}

        categories.forEach(cat => {
            if (cat.spendingNature === 'superfluous') {
                applicationMap[cat.id] = savings.superfluous
            } else if (cat.spendingNature === 'comfort') {
                applicationMap[cat.id] = savings.comfort
            } else {
                applicationMap[cat.id] = 0
            }
        })

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
