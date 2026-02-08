


export type SustainabilityStatus = "secure" | "sustainable" | "fragile" | "unsafe"

export interface SustainabilityResult {
    isSustainable: boolean // True if status is 'secure' or 'sustainable'
    status: SustainabilityStatus
    reason: string | null
    safeBufferRequired: number
    remainingBuffer: number
}

export type ScenarioType = "baseline" | "balanced" | "aggressive" | "manual"
export type ScenarioKey = "baseline" | "balanced" | "aggressive" | "custom"

export interface CalibrationMetadata {
    elasticityIndex: number
    stabilityFactor: number
    lowConfidence?: boolean
    volatilityCents: number
}

export interface ScenarioConfig {
    type: ScenarioType
    label: string
    description: string
    applicationMap: Record<string, number> // categoryId -> % of rhythm application (reduction)
    savingsMap: { superfluous: number; comfort: number } // Abstract config percentages for UI display
    calibration?: CalibrationMetadata
}


export interface RhythmPreset {
    type: ScenarioType
    label: string
    description: string
    intensity: number
    savings: {
        superfluous: number
        comfort: number
    }
}

export interface GoalScenarioResult {
    key: ScenarioKey
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

// Explicit "Contract" for Labs Simulation
export interface LabsSimulationInput {
    goalTargetCents: number
    currentFCFCents: number      // Current "Velocity" (Income - Expenses)
    currentBenefitCents: number  // Existing Rhythm Benefit in place
    proposedPaceAdjustmentCents: number // User input (e.g. "I want to save +100€ more")
    variabilityCents: number     // Standard Deviation
}

export interface LabsSimulationResult {
    originalMonths: number
    simulatedMonths: number
    minMonths: number
    maxMonths: number
    timeSaved: number
    projectedDate: Date
    canReach: boolean
}
