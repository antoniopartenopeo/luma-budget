import { BRAIN_MATURITY_SAMPLE_TARGET, type BrainEvolutionResult } from "@/brain"
import { STORAGE_KEY_BRAIN_ADAPTIVE_POLICY } from "@/lib/storage-keys"

const POLICY_VERSION = 1 as const

export interface BrainAdaptivePolicy {
    version: number
    minNowcastConfidence: number
    outlierMinConfidence: number
    primaryBlendThreshold: number
    overshootDeltaCents: number
    rollingQuality: number
    steps: number
    updatedAt: string
}

export const DEFAULT_BRAIN_ADAPTIVE_POLICY: BrainAdaptivePolicy = {
    version: POLICY_VERSION,
    minNowcastConfidence: 0.72,
    outlierMinConfidence: 0.88,
    primaryBlendThreshold: 0.6,
    overshootDeltaCents: 30000,
    rollingQuality: 0.5,
    steps: 0,
    updatedAt: new Date(0).toISOString(),
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value))
}

function hasLocalStorage(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined"
}

function toFiniteNumber(value: unknown, fallback: number): number {
    return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

function normalizePolicy(raw: unknown): BrainAdaptivePolicy {
    if (!raw || typeof raw !== "object") return { ...DEFAULT_BRAIN_ADAPTIVE_POLICY }
    const candidate = raw as Partial<BrainAdaptivePolicy>

    const minNowcastConfidence = clamp(
        toFiniteNumber(candidate.minNowcastConfidence, DEFAULT_BRAIN_ADAPTIVE_POLICY.minNowcastConfidence),
        0.66,
        0.9
    )
    const outlierMinConfidence = clamp(
        Math.max(
            toFiniteNumber(candidate.outlierMinConfidence, DEFAULT_BRAIN_ADAPTIVE_POLICY.outlierMinConfidence),
            minNowcastConfidence + 0.08
        ),
        0.84,
        0.97
    )

    return {
        version: POLICY_VERSION,
        minNowcastConfidence,
        outlierMinConfidence,
        primaryBlendThreshold: clamp(
            toFiniteNumber(candidate.primaryBlendThreshold, DEFAULT_BRAIN_ADAPTIVE_POLICY.primaryBlendThreshold),
            0.55,
            0.78
        ),
        overshootDeltaCents: Math.round(clamp(
            toFiniteNumber(candidate.overshootDeltaCents, DEFAULT_BRAIN_ADAPTIVE_POLICY.overshootDeltaCents),
            20000,
            70000
        )),
        rollingQuality: clamp(
            toFiniteNumber(candidate.rollingQuality, DEFAULT_BRAIN_ADAPTIVE_POLICY.rollingQuality),
            0,
            1
        ),
        steps: Math.max(0, Math.round(toFiniteNumber(candidate.steps, DEFAULT_BRAIN_ADAPTIVE_POLICY.steps))),
        updatedAt: typeof candidate.updatedAt === "string"
            ? candidate.updatedAt
            : DEFAULT_BRAIN_ADAPTIVE_POLICY.updatedAt,
    }
}

export function loadBrainAdaptivePolicy(): BrainAdaptivePolicy {
    if (!hasLocalStorage()) return { ...DEFAULT_BRAIN_ADAPTIVE_POLICY }

    try {
        const raw = window.localStorage.getItem(STORAGE_KEY_BRAIN_ADAPTIVE_POLICY)
        if (!raw) return { ...DEFAULT_BRAIN_ADAPTIVE_POLICY }

        const parsed = JSON.parse(raw)
        const normalized = normalizePolicy(parsed)
        const serialized = JSON.stringify(normalized)
        if (serialized !== raw) {
            window.localStorage.setItem(STORAGE_KEY_BRAIN_ADAPTIVE_POLICY, serialized)
        }
        return normalized
    } catch {
        return { ...DEFAULT_BRAIN_ADAPTIVE_POLICY }
    }
}

export function saveBrainAdaptivePolicy(policy: BrainAdaptivePolicy): void {
    if (!hasLocalStorage()) return
    try {
        window.localStorage.setItem(STORAGE_KEY_BRAIN_ADAPTIVE_POLICY, JSON.stringify(policy))
    } catch {
        // noop
    }
}

interface QualitySignal {
    quality: number
    sampleCount: number
}

function resolveQualitySignal(evolution: BrainEvolutionResult): QualitySignal {
    const reliability = evolution.nowcastReliability ?? {
        sampleCount: 0,
        mae: 0,
        mape: 0,
        mapeSampleCount: 0,
    }
    const sampleCount = Math.max(0, Math.round(toFiniteNumber(reliability.sampleCount, 0)))
    const confidenceScore = clamp(evolution.currentMonthNowcastConfidence, 0, 1)
    if (sampleCount <= 0) {
        return {
            quality: clamp(0.4 + (confidenceScore * 0.2), 0, 1),
            sampleCount: 0,
        }
    }

    const mapeScore = 1 - clamp(toFiniteNumber(reliability.mape, 0) / 0.65, 0, 1)
    const maeScore = 1 - clamp(toFiniteNumber(reliability.mae, 0) / 0.5, 0, 1)
    const readinessBonus = evolution.currentMonthNowcastReady ? 0.08 : 0

    return {
        quality: clamp((mapeScore * 0.45) + (maeScore * 0.3) + (confidenceScore * 0.25) + readinessBonus, 0, 1),
        sampleCount,
    }
}

export function adaptBrainAdaptivePolicy(
    currentPolicy: BrainAdaptivePolicy,
    evolution: BrainEvolutionResult
): BrainAdaptivePolicy {
    const policy = normalizePolicy(currentPolicy)
    const signal = resolveQualitySignal(evolution)
    const maturityScore = clamp(
        (evolution.snapshot?.currentMonthHead?.trainedSamples ?? 0) / BRAIN_MATURITY_SAMPLE_TARGET,
        0,
        1
    )

    const nextRollingQuality = policy.steps === 0
        ? signal.quality
        : clamp((policy.rollingQuality * 0.8) + (signal.quality * 0.2), 0, 1)

    // Not enough evidence: keep policy stable and only refresh quality memory.
    if (signal.sampleCount < 4) {
        return {
            ...policy,
            rollingQuality: nextRollingQuality,
            updatedAt: new Date().toISOString(),
        }
    }

    const strictness = clamp(1 - nextRollingQuality, 0, 1)
    const desiredNowcastConfidence = clamp(
        0.68 + (strictness * 0.18) - (maturityScore * 0.03),
        0.66,
        0.9
    )
    const desiredOutlierConfidence = clamp(
        Math.max(desiredNowcastConfidence + 0.08, 0.84 + (strictness * 0.07) - (maturityScore * 0.02)),
        0.84,
        0.97
    )
    const desiredPrimaryBlendThreshold = clamp(
        0.56 + (strictness * 0.16) - (maturityScore * 0.025),
        0.55,
        0.78
    )
    const desiredOvershootDeltaCents = Math.round(clamp(
        22000 + (strictness * 32000),
        20000,
        70000
    ))

    const sampleWeight = clamp(signal.sampleCount / 24, 0, 1)
    const adaptationRate = clamp(0.14 + (sampleWeight * 0.2), 0.14, 0.34)
    const lerp = (from: number, to: number) => from + ((to - from) * adaptationRate)

    let minNowcastConfidence = clamp(lerp(policy.minNowcastConfidence, desiredNowcastConfidence), 0.66, 0.9)
    let outlierMinConfidence = clamp(lerp(policy.outlierMinConfidence, desiredOutlierConfidence), 0.84, 0.97)
    let primaryBlendThreshold = clamp(lerp(policy.primaryBlendThreshold, desiredPrimaryBlendThreshold), 0.55, 0.78)
    let overshootDeltaCents = Math.round(clamp(lerp(policy.overshootDeltaCents, desiredOvershootDeltaCents), 20000, 70000))

    // Simple rollback guard: if quality drops abruptly, tighten policy immediately.
    if (signal.quality < (policy.rollingQuality - 0.12)) {
        minNowcastConfidence = clamp(Math.max(minNowcastConfidence, policy.minNowcastConfidence + 0.015), 0.66, 0.9)
        outlierMinConfidence = clamp(Math.max(outlierMinConfidence, policy.outlierMinConfidence + 0.015), 0.84, 0.97)
        primaryBlendThreshold = clamp(Math.max(primaryBlendThreshold, policy.primaryBlendThreshold + 0.01), 0.55, 0.78)
        overshootDeltaCents = Math.round(clamp(Math.max(overshootDeltaCents, policy.overshootDeltaCents + 2000), 20000, 70000))
    }

    outlierMinConfidence = clamp(Math.max(outlierMinConfidence, minNowcastConfidence + 0.08), 0.84, 0.97)

    return {
        version: POLICY_VERSION,
        minNowcastConfidence,
        outlierMinConfidence,
        primaryBlendThreshold,
        overshootDeltaCents,
        rollingQuality: nextRollingQuality,
        steps: policy.steps + 1,
        updatedAt: new Date().toISOString(),
    }
}
