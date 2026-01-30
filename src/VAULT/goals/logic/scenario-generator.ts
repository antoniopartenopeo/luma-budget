import { Category } from "@/features/categories/config"
import { BaselineMetrics } from "./financial-baseline"
import { ScenarioConfig } from "../types"

/**
 * Generates savings scenarios based on spending habits.
 * Returns a list of configurations that can be fed into the simulator/projection engine.
 */
export function generateScenarios(
    baseline: BaselineMetrics,
    categories: Category[]
): ScenarioConfig[] {
    // 1. Andamento Naturale (Baseline)
    const baselineScenario: ScenarioConfig = {
        type: "baseline",
        label: "Andamento naturale",
        description: "Continua secondo il tuo passo abituale.",
        applicationMap: {}
    }

    // 2. Andamento Rilassato (Relaxed)
    const relaxedSavings: Record<string, number> = {}
    categories.forEach(cat => {
        if (cat.spendingNature === 'superfluous') relaxedSavings[cat.id] = 10
        if (cat.spendingNature === 'comfort') relaxedSavings[cat.id] = 2
    })

    const relaxedScenario: ScenarioConfig = {
        type: "balanced",
        label: "Andamento rilassato",
        description: "Privilegia la fluidità nel quotidiano.",
        applicationMap: relaxedSavings
    }

    // 3. Andamento Sostenuto (Aggressive)
    const rapidoSavings: Record<string, number> = {}
    categories.forEach(cat => {
        if (cat.spendingNature === 'superfluous') rapidoSavings[cat.id] = 40
        if (cat.spendingNature === 'comfort') rapidoSavings[cat.id] = 15
    })

    const rapidoScenario: ScenarioConfig = {
        type: "aggressive",
        label: "Andamento sostenuto",
        description: "Un passo più deciso anticipa la data di arrivo.",
        applicationMap: rapidoSavings
    }

    return [baselineScenario, rapidoScenario, relaxedScenario]
}
