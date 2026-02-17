import { BaselineMetrics } from "./financial-baseline"
import { applySavings, CategoryAverage } from "@/domain/simulation"
import { checkScenarioSustainability } from "./sustainability-guard"
import {
    BrainAssistSignal,
    GoalScenarioResult,
    RealtimeOverlaySignal,
    ScenarioConfig,
    ScenarioKey,
    SustainabilityStatus
} from "../types"

function resolveGoalAllocationRatio(status: SustainabilityStatus): number {
    if (status === "secure") return 0.9
    if (status === "sustainable") return 0.8
    if (status === "fragile") return 0.65
    return 0
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value))
}

function resolveConfidenceTuning(config: ScenarioConfig): { capacityFactor: number } {
    const score = Math.max(0, Math.min(100, config.calibration?.confidenceScore ?? 85))
    const lowConfidence = Boolean(config.calibration?.lowConfidence) || score < 55

    let capacityFactor = 1

    if (score >= 85) {
        capacityFactor = 1
    } else if (score >= 70) {
        capacityFactor = 0.96
    } else if (score >= 55) {
        capacityFactor = 0.88
    } else {
        capacityFactor = 0.78
    }

    if (lowConfidence) {
        capacityFactor *= 0.9
    }

    return { capacityFactor }
}

function resolveBrainAssistTuning(
    brainAssist?: BrainAssistSignal
): { capacityFactor: number } {
    if (!brainAssist) {
        return { capacityFactor: 1 }
    }

    const confidence = clamp(brainAssist.confidence, 0, 1)
    if (confidence < 0.55) {
        return { capacityFactor: 1 }
    }

    const risk = clamp(brainAssist.riskScore, 0, 1)
    const pressure = risk * confidence

    return {
        capacityFactor: clamp(1 - (pressure * 0.18), 0.78, 1)
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
    // Optional non-authoritative signal from Brain (risk/confidence only).
    brainAssist?: BrainAssistSignal
    realtimeOverlay?: RealtimeOverlaySignal
}): GoalScenarioResult {
    const { key, baseline, averages, config, brainAssist, realtimeOverlay } = input

    // 1. Determine scenario map
    const applicationMap = config.applicationMap

    // 2. Calculate Scenario Expenses
    const simulationResult = applySavings(averages, applicationMap)
    const scenarioExpenses = simulationResult.simulatedTotal

    // 3. Calculate Projected FCF (Average Income - Simulated Expenses)
    // Note: We use Baseline Average Income
    const projectedFCF = baseline.averageMonthlyIncome - scenarioExpenses

    // 4. Check Sustainability
    // Note: essentials remain protected (0 cut) in standard rhythm scenarios.
    const sustainability = checkScenarioSustainability(
        baseline.averageMonthlyIncome,
        baseline.averageEssentialExpenses,
        0,
        scenarioExpenses
    )

    // 5. Derive allocatable monthly capacity for the goal.
    // We don't allocate 100% of projected surplus: a portion remains as operational buffer.
    const allocationRatio = resolveGoalAllocationRatio(sustainability.status)
    const { capacityFactor } = resolveConfidenceTuning(config)
    const brainTuning = resolveBrainAssistTuning(brainAssist)
    const effectiveAllocationRatio = allocationRatio * capacityFactor * brainTuning.capacityFactor
    const allocatableMonthlyCapacity = Math.max(0, Math.round(projectedFCF * effectiveAllocationRatio))

    const realtimeOverlayApplied = Boolean(realtimeOverlay?.enabled)
    const realtimeCapacityFactor = realtimeOverlayApplied
        ? clamp(realtimeOverlay?.capacityFactor || 1, 0.82, 1.05)
        : 1
    const realtimeWindowMonths = realtimeOverlayApplied
        ? Math.max(1, Math.round(realtimeOverlay?.shortTermMonths || 2))
        : 0
    const realtimeMonthlyMarginCents = Math.round(projectedFCF * realtimeCapacityFactor)
    const realtimeMonthlyCapacityCents = Math.round(allocatableMonthlyCapacity * realtimeCapacityFactor)

    const planBasis: GoalScenarioResult["planBasis"] = realtimeOverlay?.enabled
        ? realtimeOverlay.source === "brain"
            ? "brain_overlay"
            : "fallback_overlay"
        : "historical"

    return {
        key,
        config,
        sustainability,
        simulatedExpenses: scenarioExpenses,
        quota: {
            baseMonthlyMarginCents: projectedFCF,
            realtimeMonthlyMarginCents,
            baseMonthlyCapacityCents: allocatableMonthlyCapacity,
            realtimeMonthlyCapacityCents,
            realtimeOverlayApplied,
            realtimeCapacityFactor,
            realtimeWindowMonths
        },
        planBasis
    }
}
