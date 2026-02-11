import {
    BrainFeatureName,
    NEURAL_BRAIN_VECTOR_SIZE,
    NeuralPrediction,
    NeuralBrainSnapshot,
    NeuralHeadSnapshot,
    NeuralTrainingSample,
    NEURAL_BRAIN_VERSION,
    FEATURE_SCHEMA_VERSION
} from "./types"

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value))
}

function toFiniteNumber(value: unknown, fallback: number): number {
    return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

function sigmoid(x: number): number {
    if (x > 20) return 1
    if (x < -20) return 0
    return 1 / (1 + Math.exp(-x))
}

function dot(a: number[], b: number[]): number {
    let sum = 0
    const n = Math.min(a.length, b.length)
    for (let i = 0; i < n; i++) sum += a[i] * b[i]
    return sum
}

function ensureVectorSize(values: number[], size: number): number[] {
    if (values.length === size) return [...values]
    const out = new Array(size).fill(0)
    for (let i = 0; i < Math.min(values.length, size); i++) out[i] = values[i]
    return out
}

export function createEmptyBrainHead(learningRate: number = 0.035): NeuralHeadSnapshot {
    return {
        weights: new Array(NEURAL_BRAIN_VECTOR_SIZE).fill(0),
        bias: 0,
        learningRate: clamp(learningRate, 0.008, 0.05),
        trainedSamples: 0,
        lossEma: 0,
    }
}

function normalizeHead(raw: unknown, fallbackLearningRate: number = 0.035): NeuralHeadSnapshot | null {
    if (!raw || typeof raw !== "object") return null
    const candidate = raw as Partial<NeuralHeadSnapshot>
    if (!Array.isArray(candidate.weights)) return null

    const normalizedWeights = ensureVectorSize(
        candidate.weights.map((value) => toFiniteNumber(value, 0)),
        NEURAL_BRAIN_VECTOR_SIZE
    )

    return {
        weights: normalizedWeights,
        bias: clamp(toFiniteNumber(candidate.bias, 0), -8, 8),
        learningRate: clamp(toFiniteNumber(candidate.learningRate, fallbackLearningRate), 0.008, 0.05),
        trainedSamples: Math.max(0, Math.round(toFiniteNumber(candidate.trainedSamples, 0))),
        lossEma: Math.max(0, toFiniteNumber(candidate.lossEma, 0)),
    }
}

function resolveCurrentMonthHead(snapshot: NeuralBrainSnapshot): NeuralHeadSnapshot {
    return normalizeHead(snapshot.currentMonthHead, snapshot.learningRate) ?? createEmptyBrainHead(snapshot.learningRate)
}

function extractNextMonthHead(snapshot: NeuralBrainSnapshot): NeuralHeadSnapshot {
    return {
        weights: ensureVectorSize(snapshot.weights, NEURAL_BRAIN_VECTOR_SIZE),
        bias: clamp(snapshot.bias, -8, 8),
        learningRate: clamp(snapshot.learningRate, 0.008, 0.05),
        trainedSamples: Math.max(0, Math.round(snapshot.trainedSamples)),
        lossEma: Math.max(0, snapshot.lossEma),
    }
}

function withNextMonthHead(snapshot: NeuralBrainSnapshot, head: NeuralHeadSnapshot): NeuralBrainSnapshot {
    return {
        ...snapshot,
        weights: [...head.weights],
        bias: head.bias,
        learningRate: head.learningRate,
        trainedSamples: head.trainedSamples,
        lossEma: head.lossEma,
    }
}

function withCurrentMonthHead(snapshot: NeuralBrainSnapshot, head: NeuralHeadSnapshot): NeuralBrainSnapshot {
    return {
        ...snapshot,
        currentMonthHead: {
            ...head,
            weights: [...head.weights],
        },
    }
}

interface ForwardResult {
    normalizedX: number[]
    s: number
    predictedExpenseRatio: number
}

function forwardHead(head: NeuralHeadSnapshot, x: number[]): ForwardResult {
    const normalizedX = ensureVectorSize(x, NEURAL_BRAIN_VECTOR_SIZE)
    const z = dot(head.weights, normalizedX) + head.bias
    const s = sigmoid(z)
    const predictedExpenseRatio = s * 2 // [0, 2]
    return { normalizedX, s, predictedExpenseRatio }
}

export function createNewBrainSnapshot(nowIso: string = new Date().toISOString()): NeuralBrainSnapshot {
    const nextMonthHead = createEmptyBrainHead()
    return {
        version: NEURAL_BRAIN_VERSION,
        featureSchemaVersion: FEATURE_SCHEMA_VERSION,
        // This vector is intentionally all zeros: newborn brain with no prior knowledge.
        weights: [...nextMonthHead.weights],
        bias: nextMonthHead.bias,
        learningRate: nextMonthHead.learningRate,
        trainedSamples: nextMonthHead.trainedSamples,
        lossEma: nextMonthHead.lossEma,
        currentMonthHead: createEmptyBrainHead(),
        dataFingerprint: "",
        updatedAt: nowIso,
    }
}

export function migrateBrainSnapshot(
    rawSnapshot: unknown,
    nowIso: string = new Date().toISOString()
): NeuralBrainSnapshot | null {
    if (!rawSnapshot || typeof rawSnapshot !== "object") return null
    const candidate = rawSnapshot as Partial<NeuralBrainSnapshot> & {
        currentMonthHead?: Partial<NeuralHeadSnapshot> | null
        dataFingerprint?: unknown
        updatedAt?: unknown
    }

    const nextMonthHead = normalizeHead(candidate, 0.035)
    if (!nextMonthHead) return null

    const currentMonthHead = normalizeHead(candidate.currentMonthHead, nextMonthHead.learningRate)
        ?? createEmptyBrainHead(nextMonthHead.learningRate)

    return {
        version: NEURAL_BRAIN_VERSION,
        featureSchemaVersion: FEATURE_SCHEMA_VERSION,
        weights: [...nextMonthHead.weights],
        bias: nextMonthHead.bias,
        learningRate: nextMonthHead.learningRate,
        trainedSamples: nextMonthHead.trainedSamples,
        lossEma: nextMonthHead.lossEma,
        currentMonthHead,
        dataFingerprint: typeof candidate.dataFingerprint === "string" ? candidate.dataFingerprint : "",
        updatedAt: typeof candidate.updatedAt === "string" ? candidate.updatedAt : nowIso,
    }
}

export function isSnapshotCompatible(snapshot: NeuralBrainSnapshot | null | undefined): snapshot is NeuralBrainSnapshot {
    if (!snapshot) return false
    if (snapshot.version !== NEURAL_BRAIN_VERSION) return false
    if (snapshot.featureSchemaVersion !== FEATURE_SCHEMA_VERSION) return false

    const nextMonthHead = normalizeHead(snapshot, snapshot.learningRate)
    if (!nextMonthHead) return false

    const currentMonthHead = normalizeHead(snapshot.currentMonthHead, snapshot.learningRate)
    if (!currentMonthHead) return false

    return nextMonthHead.weights.length === NEURAL_BRAIN_VECTOR_SIZE
        && currentMonthHead.weights.length === NEURAL_BRAIN_VECTOR_SIZE
}

function trainHeadEpoch(
    head: NeuralHeadSnapshot,
    samples: NeuralTrainingSample[],
): {
    head: NeuralHeadSnapshot
    averageLoss: number
} {
    if (samples.length === 0) {
        return { head, averageLoss: head.lossEma }
    }

    const next: NeuralHeadSnapshot = {
        ...head,
        weights: [...head.weights],
    }

    let totalLoss = 0
    for (const sample of samples) {
        const target = clamp(sample.y, 0, 2)
        const { normalizedX, s, predictedExpenseRatio } = forwardHead(next, sample.x)
        const error = predictedExpenseRatio - target
        const loss = error * error
        totalLoss += loss

        // dLoss/dz with predictedExpenseRatio = 2 * sigmoid(z)
        const dLossDz = 2 * error * (2 * s * (1 - s))
        for (let i = 0; i < next.weights.length; i++) {
            const gradient = dLossDz * normalizedX[i]
            next.weights[i] = clamp(next.weights[i] - next.learningRate * gradient, -8, 8)
        }
        next.bias = clamp(next.bias - next.learningRate * dLossDz, -8, 8)
    }

    return {
        head: next,
        averageLoss: totalLoss / samples.length,
    }
}

function finalizeHeadSnapshot(
    head: NeuralHeadSnapshot,
    sampleCount: number,
    averageLoss: number
): NeuralHeadSnapshot {
    const alpha = 0.22
    const nextLossEma = head.lossEma === 0
        ? averageLoss
        : (1 - alpha) * head.lossEma + alpha * averageLoss

    return {
        ...head,
        trainedSamples: head.trainedSamples + sampleCount,
        lossEma: nextLossEma,
        learningRate: clamp(head.learningRate * 0.997, 0.008, 0.05),
    }
}

function computeConfidence(head: NeuralHeadSnapshot): number {
    const sampleFactor = clamp(head.trainedSamples / 72, 0, 1)
    const lossFactor = 1 - clamp(head.lossEma / 0.22, 0, 1)
    return clamp(0.12 + sampleFactor * 0.7 + lossFactor * 0.18, 0.08, 0.99)
}

function predictWithHead(
    head: NeuralHeadSnapshot,
    values: number[],
    names: readonly BrainFeatureName[],
): NeuralPrediction {
    const { normalizedX, predictedExpenseRatio } = forwardHead(head, values)
    const riskScore = sigmoid((predictedExpenseRatio - 1) * 5.5)
    const confidence = computeConfidence(head)

    const contributors = names.map((feature, index) => {
        const value = normalizedX[index] ?? 0
        const weight = head.weights[index] ?? 0
        return {
            feature,
            value,
            weight,
            contribution: value * weight,
        }
    }).sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))

    return {
        predictedExpenseRatio,
        riskScore,
        confidence,
        contributors,
    }
}

export function trainBrainEpoch(
    snapshot: NeuralBrainSnapshot,
    samples: NeuralTrainingSample[],
): {
    snapshot: NeuralBrainSnapshot
    averageLoss: number
} {
    const { head, averageLoss } = trainHeadEpoch(extractNextMonthHead(snapshot), samples)
    return {
        snapshot: withNextMonthHead(snapshot, head),
        averageLoss,
    }
}

export function trainCurrentMonthHeadEpoch(
    snapshot: NeuralBrainSnapshot,
    samples: NeuralTrainingSample[],
): {
    snapshot: NeuralBrainSnapshot
    averageLoss: number
} {
    const { head, averageLoss } = trainHeadEpoch(resolveCurrentMonthHead(snapshot), samples)
    return {
        snapshot: withCurrentMonthHead(snapshot, head),
        averageLoss,
    }
}

export function finalizeTrainingSnapshot(
    snapshot: NeuralBrainSnapshot,
    sampleCount: number,
    averageLoss: number,
    fingerprint: string,
    nowIso: string = new Date().toISOString()
): NeuralBrainSnapshot {
    const nextHead = finalizeHeadSnapshot(extractNextMonthHead(snapshot), sampleCount, averageLoss)
    return {
        ...withNextMonthHead(snapshot, nextHead),
        dataFingerprint: fingerprint,
        updatedAt: nowIso,
    }
}

export function finalizeCurrentMonthTrainingSnapshot(
    snapshot: NeuralBrainSnapshot,
    sampleCount: number,
    averageLoss: number,
    fingerprint: string,
    nowIso: string = new Date().toISOString()
): NeuralBrainSnapshot {
    const currentHead = finalizeHeadSnapshot(resolveCurrentMonthHead(snapshot), sampleCount, averageLoss)
    return {
        ...withCurrentMonthHead(snapshot, currentHead),
        dataFingerprint: fingerprint,
        updatedAt: nowIso,
    }
}

export function predictWithBrain(
    snapshot: NeuralBrainSnapshot,
    values: number[],
    names: readonly BrainFeatureName[],
): NeuralPrediction {
    return predictWithHead(extractNextMonthHead(snapshot), values, names)
}

export function predictCurrentMonthWithBrain(
    snapshot: NeuralBrainSnapshot,
    values: number[],
    names: readonly BrainFeatureName[],
): NeuralPrediction {
    return predictWithHead(resolveCurrentMonthHead(snapshot), values, names)
}
