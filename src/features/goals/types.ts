
import { CategoryAverage } from "@/features/simulator/utils"

export type SustainabilityStatus = "secure" | "sustainable" | "fragile" | "unsafe"

export interface SustainabilityResult {
    isSustainable: boolean // True if status is 'secure' or 'sustainable'
    status: SustainabilityStatus
    reason: string | null
    safeBufferRequired: number
    remainingBuffer: number
}

export type ScenarioType = "baseline" | "balanced" | "aggressive"

export interface ScenarioConfig {
    type: ScenarioType
    label: string
    description: string
    applicationMap: Record<string, number> // categoryId -> % of rhythm application (reduction)
}

export interface GoalScenarioResult {
    config: ScenarioConfig
    projection: ProjectionResult
    sustainability: SustainabilityResult
    simulatedExpenses: number
}

export interface ProjectionInput {
    goalTarget: number
    currentFreeCashFlow: number // Monthly average surplus
    historicalVariability: number // Standard deviation of free cash flow (or expenses)
    startDate?: Date // Optional start date for sequential projection
}

export interface ProjectionResult {
    minMonths: number // Best case (optimistic)
    likelyMonths: number // Median case
    maxMonths: number // Worst case (prudent)
    minDate: Date
    likelyDate: Date
    maxDate: Date
    canReach: boolean
    unreachableReason?: string
}

export interface NUMAGoal {
    id: string
    title: string
    targetCents: number
    createdAt: string
    reachedAt?: string
}

export interface GoalPortfolio {
    mainGoalId: string
    goals: NUMAGoal[]
    activeRhythm?: {
        type: ScenarioType
        label: string
        intensity: number
        benefitCents: number // Monthly FCF improvement in cents
        activatedAt: string
    }
}

export interface ActiveGoalCommitment {
    id: string
    goalTargetCents: number
    rhythmType: ScenarioType
    rhythmLabel: string
    intensity: number // Aggregate intensity (e.g. 0 to 1)
    activatedAt: string
}
