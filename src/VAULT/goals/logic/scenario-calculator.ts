import { BaselineMetrics } from "./financial-baseline"
import { applySavings, CategoryAverage } from "@/domain/simulation"
import { checkScenarioSustainability } from "./sustainability-guard"
import { projectGoalReachability } from "./projection-engine"
import { BrainAssistSignal, GoalScenarioResult, ScenarioConfig, ScenarioKey, SustainabilityStatus } from "../types"

function resolveGoalAllocationRatio(status: SustainabilityStatus): number {
    if (status === "secure") return 0.9
    if (status === "sustainable") return 0.8
    if (status === "fragile") return 0.65
    return 0
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value))
}

function resolveScenarioIntensity(config: ScenarioConfig): number {
    if (config.type === "baseline") return 0
    if (config.type === "balanced") return 0.5
    if (config.type === "aggressive") return 1

    // Manual scenario fallback: weighted average between superfluous and comfort cuts.
    const weighted = ((config.savingsMap?.superfluous || 0) * 0.7) + ((config.savingsMap?.comfort || 0) * 0.3)
    return Math.max(0, Math.min(1, weighted / 100))
}

function resolveConfidenceTuning(config: ScenarioConfig): { capacityFactor: number; variabilityFactor: number } {
    const score = Math.max(0, Math.min(100, config.calibration?.confidenceScore ?? 85))
    const lowConfidence = Boolean(config.calibration?.lowConfidence) || score < 55

    let capacityFactor = 1
    let variabilityFactor = 0.95

    if (score >= 85) {
        capacityFactor = 1
        variabilityFactor = 0.95
    } else if (score >= 70) {
        capacityFactor = 0.96
        variabilityFactor = 1.05
    } else if (score >= 55) {
        capacityFactor = 0.88
        variabilityFactor = 1.18
    } else {
        capacityFactor = 0.78
        variabilityFactor = 1.32
    }

    if (lowConfidence) {
        capacityFactor *= 0.9
        variabilityFactor *= 1.1
    }

    return { capacityFactor, variabilityFactor }
}

function resolveBrainAssistTuning(
    brainAssist?: BrainAssistSignal
): { capacityFactor: number; variabilityFactor: number } {
    if (!brainAssist) {
        return { capacityFactor: 1, variabilityFactor: 1 }
    }

    const confidence = clamp(brainAssist.confidence, 0, 1)
    if (confidence < 0.55) {
        return { capacityFactor: 1, variabilityFactor: 1 }
    }

    const risk = clamp(brainAssist.riskScore, 0, 1)
    const pressure = risk * confidence

    return {
        capacityFactor: clamp(1 - (pressure * 0.18), 0.78, 1),
        variabilityFactor: clamp(1 + (pressure * 0.28), 1, 1.35)
    }
}

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
    // Optional non-authoritative signal from Brain (risk/confidence only).
    brainAssist?: BrainAssistSignal
}): GoalScenarioResult {
    const { key, baseline, averages, config, goalTargetCents, customApplicationMap, brainAssist } = input

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

    // 5. Derive allocatable monthly capacity for the goal.
    // We don't allocate 100% of projected surplus: a portion remains as operational buffer.
    const allocationRatio = resolveGoalAllocationRatio(sustainability.status)
    const intensity = resolveScenarioIntensity(config)
    const { capacityFactor, variabilityFactor } = resolveConfidenceTuning(config)
    const brainTuning = resolveBrainAssistTuning(brainAssist)
    const effectiveAllocationRatio = allocationRatio * capacityFactor * brainTuning.capacityFactor
    const allocatableMonthlyCapacity = Math.max(0, Math.round(projectedFCF * effectiveAllocationRatio))

    const freeCashFlowVariability = baseline.freeCashFlowStdDev > 0
        ? baseline.freeCashFlowStdDev
        : baseline.expensesStdDev
    const adherenceRiskFactor = 1 + (intensity * 0.12)
    const allocatableVariability = Math.max(
        0,
        Math.round(
            freeCashFlowVariability
            * allocationRatio
            * variabilityFactor
            * adherenceRiskFactor
            * brainTuning.variabilityFactor
        )
    )

    // 5. Project Goal
    const projection = projectGoalReachability({
        goalTarget: goalTargetCents,
        currentFreeCashFlow: allocatableMonthlyCapacity,
        historicalVariability: allocatableVariability
    })

    return {
        key,
        config,
        projection,
        sustainability,
        simulatedExpenses: scenarioExpenses,
        monthlyGoalCapacityCents: allocatableMonthlyCapacity
    }
}
