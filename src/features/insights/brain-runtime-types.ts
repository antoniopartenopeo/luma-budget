export type BrainRuntimeMode = "active" | "readonly"
export type EventTone = "neutral" | "positive" | "warning" | "critical"
export type StageId = "dormant" | "newborn" | "imprinting" | "adapting"

export interface TimelineEvent {
    id: string
    title: string
    detail: string
    at: string
    tone: EventTone
}

export interface StageState {
    id: StageId
    label: string
    summary: string
    badgeVariant: "outline" | "secondary"
}

export interface TrainingState {
    isTraining: boolean
    epoch: number
    totalEpochs: number
    progress: number
    currentLoss: number
    sampleCount: number
    lastCompletedAt: string | null
}

export interface EvolutionPoint {
    at: number
    readiness: number
    experience: number
    stability: number
}
