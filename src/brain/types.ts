export const NEURAL_BRAIN_VERSION = 2 as const
export const FEATURE_SCHEMA_VERSION = 2 as const
export const NEURAL_BRAIN_VECTOR_SIZE = 8 as const
export const BRAIN_MATURITY_SAMPLE_TARGET = 120 as const

export const BRAIN_FEATURE_NAMES = [
    "expense_income_ratio",
    "superfluous_share",
    "comfort_share",
    "txn_density",
    "expense_momentum",
    "income_momentum",
    "discretionary_pressure",
    "expense_gap_ratio",
] as const

export type BrainFeatureName = (typeof BRAIN_FEATURE_NAMES)[number]

export interface NeuralHeadSnapshot {
    weights: number[]
    bias: number
    learningRate: number
    trainedSamples: number
    lossEma: number
    absErrorEma: number
}

export interface NeuralBrainSnapshot {
    version: number
    featureSchemaVersion: number
    weights: number[]
    bias: number
    learningRate: number
    trainedSamples: number
    lossEma: number
    absErrorEma: number
    currentMonthHead: NeuralHeadSnapshot
    dataFingerprint: string
    updatedAt: string
}

export interface NeuralTrainingSample {
    period: string
    x: number[]
    y: number
}

export interface BrainInferenceInput {
    period: string
    values: number[]
    names: readonly BrainFeatureName[]
    currentIncomeCents: number
    currentExpensesCents: number
}

export interface BrainCurrentMonthInferenceInput extends BrainInferenceInput {
    nowcastBaselineCents: number
}

export interface NeuralPrediction {
    predictedExpenseRatio: number
    riskScore: number
    confidence: number
    contributors: Array<{
        feature: BrainFeatureName
        value: number
        weight: number
        contribution: number
    }>
}

export interface BrainDataset {
    samples: NeuralTrainingSample[]
    inferenceInput: BrainInferenceInput | null
    nowcastSamples: NeuralTrainingSample[]
    currentMonthInferenceInput: BrainCurrentMonthInferenceInput | null
    fingerprint: string
    months: number
}

export type BrainEvolutionReason =
    | "trained"
    | "no-new-data"
    | "insufficient-data"
    | "uninitialized"
    | "read-only-inference"

export interface BrainTrainingProgress {
    epoch: number
    totalEpochs: number
    averageLoss: number
    sampleCount: number
}

export interface BrainReliabilityMetrics {
    sampleCount: number
    mae: number
    mape: number
    mapeSampleCount: number
}

export interface BrainEvolutionResult {
    reason: BrainEvolutionReason
    snapshot: NeuralBrainSnapshot | null
    datasetFingerprint: string | null
    didTrain: boolean
    epochsRun: number
    sampleCount: number
    monthsAnalyzed: number
    averageLoss: number
    prediction: NeuralPrediction | null
    inferencePeriod: string | null
    currentIncomeCents: number
    currentExpensesCents: number
    predictedExpensesNextMonthCents: number
    predictedCurrentMonthRemainingExpensesCents: number
    currentMonthNowcastConfidence: number
    currentMonthNowcastReady: boolean
    nextMonthReliability: BrainReliabilityMetrics
    nowcastReliability: BrainReliabilityMetrics
}
