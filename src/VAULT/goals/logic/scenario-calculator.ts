import { BaselineMetrics } from "./financial-baseline"
import { applySavings, CategoryAverage } from "@/domain/simulation"
import { checkScenarioSustainability } from "./sustainability-guard"
import { projectGoalReachability } from "./projection-engine"
import { GoalScenarioResult, ScenarioConfig, ScenarioKey } from "../types"

/**
 * PURE DOMAIN LOGIC
 * Calculates a single scenario result based on inputs.
 * Zero UI dependencies.
 */
export function calculateScenario(input: {
    key: ScenarioKey
    baseline: BaselineMetrics
    averages: Record<string, CategoryAverage>
    config: ScenarioConfig
    goalTargetCents: number
    // Optional pivot for manual "What-if" overrides (defaults to config.applicationMap)
    customApplicationMap?: Record<string, number>
}): GoalScenarioResult {
    const { key, baseline, averages, config, goalTargetCents, customApplicationMap } = input

    // 1. Determine which map to use (Config vs Custom Override)
    const applicationMap = customApplicationMap || config.applicationMap

    // 2. Calculate Scenario Expenses
    const simulationResult = applySavings(averages, applicationMap)
    const scenarioExpenses = simulationResult.simulatedTotal

    // 3. Calculate Projected FCF (Average Income - Simulated Expenses)
    // Note: We use Baseline Average Income
    const projectedFCF = baseline.averageMonthlyIncome - scenarioExpenses

    // 4. Check Sustainability
    // Note: We currently assume 0 savings on essential for the sustainability check unless passed otherwise
    // In the future, if customApplicationMap includes essential savings, they should be passed here.
    const sustainability = checkScenarioSustainability(
        baseline.averageMonthlyIncome,
        baseline.averageEssentialExpenses,
        0,
        scenarioExpenses
    )

    // 5. Project Goal
    const projection = projectGoalReachability({
        goalTarget: goalTargetCents,
        currentFreeCashFlow: projectedFCF,
        historicalVariability: baseline.expensesStdDev
    })

    return {
        key,
        config,
        projection,
        sustainability,
        simulatedExpenses: scenarioExpenses
    }
}
