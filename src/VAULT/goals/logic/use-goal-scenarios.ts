
import { useMemo } from "react"
import { useMonthlyAverages } from "@/features/simulator/hooks"
import { calculateBaselineMetrics } from "./financial-baseline"
import { generateScenarios } from "./scenario-generator"
import { checkScenarioSustainability } from "./sustainability-guard"
import { projectGoalReachability } from "./projection-engine"
import { applySavings } from "@/features/simulator/utils"
import { Category } from "@/features/categories/config"
import { GoalScenarioResult } from "../types"
import { useTransactions } from "@/features/transactions/api/use-transactions"

interface UseGoalScenariosProps {
    goalTargetCents: number
    simulationPeriod?: 3 | 6 | 12
    categories: Category[]
}

interface UseGoalScenariosResult {
    isLoading: boolean
    scenarios: GoalScenarioResult[]
    baselineMetrics: any // Using specific type internally but generic export for now if needed by UI
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

        // B. Generate Scenarios
        const configs = generateScenarios(baseline, categories)

        // C. Project each Scenario
        const scenarioResults: GoalScenarioResult[] = configs.map(config => {
            // Calculate Scenario Expenses
            const simulationResult = applySavings(averages, config.applicationMap)
            const scenarioExpenses = simulationResult.simulatedTotal

            // Calculate Projected FCF (Average Income - Simulated Expenses)
            // Note: We use Baseline Average Income
            const projectedFCF = baseline.averageMonthlyIncome - scenarioExpenses

            // Check Sustainability FIRST
            const sustainability = checkScenarioSustainability(
                baseline.averageMonthlyIncome,
                baseline.averageEssentialExpenses,
                0, // No essential savings driven manual input yet
                scenarioExpenses
            )

            // Project Goal
            const projection = projectGoalReachability({
                goalTarget: goalTargetCents,
                currentFreeCashFlow: projectedFCF,
                historicalVariability: baseline.expensesStdDev
            })

            return {
                config,
                projection,
                sustainability,
                simulatedExpenses: scenarioExpenses
            }
        })

        return { scenarios: scenarioResults, baseline }

    }, [transactions, averages, goalTargetCents, simulationPeriod, categories, isLoading])

    return {
        isLoading,
        scenarios: results.scenarios,
        baselineMetrics: results.baseline
    }
}
