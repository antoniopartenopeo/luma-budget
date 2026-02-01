import { Category } from "@/features/categories/config"
import { BaselineMetrics } from "./financial-baseline"
import { ScenarioConfig } from "../types"
import { RHYTHMS } from "../config/rhythms"

/**
 * Generates savings scenarios based on spending habits.
 * Returns a list of configurations that can be fed into the simulator/projection engine.
 */
export function generateScenarios(
    baseline: BaselineMetrics,
    categories: Category[]
): ScenarioConfig[] {
    return RHYTHMS.map(rhythm => {
        const applicationMap: Record<string, number> = {}

        categories.forEach(cat => {
            if (cat.spendingNature === 'superfluous') {
                applicationMap[cat.id] = rhythm.savings.superfluous
            } else if (cat.spendingNature === 'comfort') {
                applicationMap[cat.id] = rhythm.savings.comfort
            } else {
                applicationMap[cat.id] = 0
            }
        })

        return {
            type: rhythm.type,
            label: rhythm.label,
            description: rhythm.description,
            applicationMap,
            savingsMap: rhythm.savings
        }
    })

}
