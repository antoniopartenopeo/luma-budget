


export type SustainabilityStatus = "secure" | "sustainable" | "fragile" | "unsafe"

export interface SustainabilityResult {
    isSustainable: boolean // True if status is 'secure' or 'sustainable'
    status: SustainabilityStatus
    reason: string | null
    safeBufferRequired: number
    remainingBuffer: number
}

export type ScenarioType = "baseline" | "balanced" | "aggressive"
export type ScenarioKey = "baseline" | "balanced" | "aggressive"

export interface CalibrationMetadata {
    elasticityIndex: number
    stabilityFactor: number
    lowConfidence?: boolean
    volatilityCents: number
    confidenceScore?: number
    coverageRatio?: number
    marginRatio?: number
}

export interface BrainAssistSignal {
    riskScore: number
    confidence: number
}

export interface RealtimeOverlaySignal {
    enabled: boolean
    source: "brain" | "fallback"
    shortTermMonths: number
    capacityFactor: number
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

export interface QuotaScenarioResult {
    key: ScenarioKey
    config: ScenarioConfig
    sustainability: SustainabilityResult
    simulatedExpenses: number
    quota: {
        baseMonthlyMarginCents: number
        realtimeMonthlyMarginCents: number
        baseMonthlyCapacityCents: number
        realtimeMonthlyCapacityCents: number
        realtimeOverlayApplied: boolean
        realtimeCapacityFactor: number
        realtimeWindowMonths: number
    }
    planBasis: "historical" | "brain_overlay" | "fallback_overlay"
}
