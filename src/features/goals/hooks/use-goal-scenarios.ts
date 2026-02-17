import { useMemo } from "react"
import { calculateBaselineMetrics, BaselineMetrics } from "@/VAULT/goals/logic/financial-baseline"
import { generateScenarios } from "@/VAULT/goals/logic/scenario-generator"
import { Category } from "@/domain/categories"
import { Transaction } from "@/domain/transactions"
import { BrainAssistSignal, GoalScenarioResult, RealtimeOverlaySignal, ScenarioKey } from "@/VAULT/goals/types"
import { calculateScenario } from "@/VAULT/goals/logic/scenario-calculator"
import { MonthlyAveragesResult } from "@/features/simulator/utils"

interface UseGoalScenariosProps {
    simulationPeriod?: 3 | 6 | 12
    categories: Category[]
    transactions: Transaction[] | undefined
    averages: MonthlyAveragesResult | null
    isLoading: boolean
    brainAssist?: BrainAssistSignal | null
    realtimeOverlay?: RealtimeOverlaySignal | null
}

interface UseGoalScenariosResult {
    isLoading: boolean
    scenarios: GoalScenarioResult[]
    baselineMetrics: BaselineMetrics | null
}

export function useGoalScenarios({
    simulationPeriod = 6,
    categories,
    transactions,
    averages,
    isLoading,
    brainAssist,
    realtimeOverlay,
}: UseGoalScenariosProps): UseGoalScenariosResult {
    // Compute logic from upstream read model to avoid duplicated data pipelines.
    const results = useMemo(() => {
        if (isLoading || !transactions || !averages) return { scenarios: [], baseline: null }

        // A. Baseline Metrics
        const baseline = calculateBaselineMetrics(transactions, categories, simulationPeriod)

        // B. Generate Scenarios (Configs)
        const configs = generateScenarios(baseline, categories)

        // C. Calculate Results using Pure Logic
        const scenarioResults: GoalScenarioResult[] = configs.map(config => {
            // Map known Rhythm types to ScenarioKeys strictly
            let key: ScenarioKey = "baseline"
            if (config.type === "balanced") key = "balanced"
            if (config.type === "aggressive") key = "aggressive"

            return calculateScenario({
                key,
                baseline,
                averages: averages.categories,
                config,
                brainAssist: brainAssist || undefined,
                realtimeOverlay: realtimeOverlay || undefined
            })
        })

        return { scenarios: scenarioResults, baseline }

    }, [transactions, averages, simulationPeriod, categories, isLoading, brainAssist, realtimeOverlay])

    return {
        isLoading,
        scenarios: results.scenarios,
        baselineMetrics: results.baseline
    }
}
