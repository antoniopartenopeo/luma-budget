import { useMemo } from "react"
import { useMonthlyAverages } from "@/features/simulator/hooks"
import { calculateBaselineMetrics } from "./financial-baseline"
import { generateScenarios } from "./scenario-generator"
import { Category } from "@/features/categories/config"
import { GoalScenarioResult, ScenarioKey } from "../types"
import { useTransactions } from "@/features/transactions/api/use-transactions"
import { calculateScenario } from "./scenario-calculator"

interface UseGoalScenariosProps {
    goalTargetCents: number
    simulationPeriod?: 3 | 6 | 12
    categories: Category[]
}

interface UseGoalScenariosResult {
    isLoading: boolean
    scenarios: GoalScenarioResult[]
    baselineMetrics: BaselineMetrics | null
}

export function useGoalScenarios({
    goalTargetCents,
    simulationPeriod = 6,
    categories
}: UseGoalScenariosProps): UseGoalScenariosResult {

    // 1. Fetch Data
    const { data: transactions, isLoading: isTxLoading } = useTransactions()
    const { rawAverages: averages, isLoading: isSimLoading } = useMonthlyAverages(simulationPeriod)

    const isLoading = isTxLoading || isSimLoading

    // 2. Compute logic
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
                goalTargetCents
            })
        })

        return { scenarios: scenarioResults, baseline }

    }, [transactions, averages, goalTargetCents, simulationPeriod, categories, isLoading])

    return {
        isLoading,
        scenarios: results.scenarios,
        baselineMetrics: results.baseline
    }
}
