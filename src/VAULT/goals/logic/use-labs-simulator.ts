import { useMemo } from "react"
import { LabsSimulationInput, LabsSimulationResult } from "../types"
import { projectGoalReachability } from "./projection-engine"
import { differenceInMonths } from "date-fns"

/**
 * Hook acting as a safe "Bridge" between Labs UI and the Projection Engine.
 * It calculates hypothetical scenarios without persisting any state.
 */
export function useLabsSimulator(input: LabsSimulationInput | null): LabsSimulationResult | null {
    return useMemo(() => {
        if (!input) return null

        const { goalTargetCents, currentFCF, currentBenefit, proposedPaceAdjustment, variability } = input

        // 1. Current State Projection (Baseline + Active Rhythm)
        const currentTotalFCF = currentFCF + currentBenefit
        const currentResult = projectGoalReachability({
            goalTarget: goalTargetCents,
            currentFreeCashFlow: currentTotalFCF,
            historicalVariability: variability
        })

        // 2. Simulated State Projection (Current State + User Adjustment)
        // User adjustment is additive to the current state.
        const simulatedTotalFCF = currentTotalFCF + proposedPaceAdjustment
        const simulatedResult = projectGoalReachability({
            goalTarget: goalTargetCents,
            currentFreeCashFlow: simulatedTotalFCF,
            historicalVariability: variability
        })

        // 3. Compute Deltas
        const originalMonths = currentResult.likelyMonths
        const simulatedMonths = simulatedResult.likelyMonths

        // Handle infinity cases safely
        const safeOriginal = originalMonths === Infinity ? 999 : originalMonths
        const safeSimulated = simulatedMonths === Infinity ? 999 : simulatedMonths

        const timeSaved = Math.max(0, safeOriginal - safeSimulated)

        return {
            originalMonths: isFinite(originalMonths) ? originalMonths : -1, // Use -1 or distinct val for display logic
            simulatedMonths: isFinite(simulatedMonths) ? simulatedMonths : -1,
            timeSaved,
            projectedDate: simulatedResult.likelyDate,
            canReach: simulatedResult.canReach
        }
    }, [input])
}
