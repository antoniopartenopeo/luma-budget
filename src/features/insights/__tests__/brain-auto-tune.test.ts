import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { BrainEvolutionResult, NeuralBrainSnapshot } from "@/brain"
import {
    adaptBrainAdaptivePolicy,
    DEFAULT_BRAIN_ADAPTIVE_POLICY,
    loadBrainAdaptivePolicy,
} from "../brain-auto-tune"
import { STORAGE_KEY_BRAIN_ADAPTIVE_POLICY } from "@/lib/storage-keys"

function buildSnapshot(trainedSamples: number): NeuralBrainSnapshot {
    return {
        version: 2,
        featureSchemaVersion: 2,
        weights: [0, 0, 0, 0, 0, 0, 0, 0],
        bias: 0,
        learningRate: 0.03,
        trainedSamples,
        lossEma: 0.1,
        absErrorEma: 0.14,
        currentMonthHead: {
            weights: [0, 0, 0, 0, 0, 0, 0, 0],
            bias: 0,
            learningRate: 0.03,
            trainedSamples,
            lossEma: 0.09,
            absErrorEma: 0.12,
        },
        dataFingerprint: "brain-v2-test",
        updatedAt: "2026-02-18T00:00:00.000Z",
    }
}

function buildEvolution(overrides: Partial<BrainEvolutionResult> = {}): BrainEvolutionResult {
    return {
        reason: "trained",
        snapshot: buildSnapshot(120),
        datasetFingerprint: "brain-v2-test",
        didTrain: true,
        epochsRun: 4,
        sampleCount: 20,
        monthsAnalyzed: 4,
        averageLoss: 0.08,
        prediction: null,
        inferencePeriod: "2026-02",
        currentIncomeCents: 320000,
        currentExpensesCents: 180000,
        predictedExpensesNextMonthCents: 190000,
        predictedCurrentMonthRemainingExpensesCents: 65000,
        currentMonthNowcastConfidence: 0.84,
        currentMonthNowcastReady: true,
        nextMonthReliability: {
            sampleCount: 20,
            mae: 0.14,
            mape: 0.18,
            mapeSampleCount: 20,
        },
        nowcastReliability: {
            sampleCount: 20,
            mae: 0.14,
            mape: 0.18,
            mapeSampleCount: 20,
        },
        ...overrides,
    }
}

describe("brain-auto-tune", () => {
    beforeEach(() => {
        window.localStorage.clear()
        vi.useFakeTimers()
        vi.setSystemTime(new Date("2026-02-18T12:00:00.000Z"))
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it("loads default policy when storage is empty", () => {
        const policy = loadBrainAdaptivePolicy()

        expect(policy).toEqual(DEFAULT_BRAIN_ADAPTIVE_POLICY)
    })

    it("normalizes persisted policy values to bounded ranges", () => {
        window.localStorage.setItem(
            STORAGE_KEY_BRAIN_ADAPTIVE_POLICY,
            JSON.stringify({
                minNowcastConfidence: 0.2,
                outlierMinConfidence: 0.1,
                primaryBlendThreshold: 2,
                overshootDeltaCents: 1500,
                rollingQuality: 3,
                steps: -9,
                updatedAt: 42,
            })
        )

        const policy = loadBrainAdaptivePolicy()

        expect(policy.minNowcastConfidence).toBe(0.66)
        expect(policy.outlierMinConfidence).toBe(0.84)
        expect(policy.primaryBlendThreshold).toBe(0.78)
        expect(policy.overshootDeltaCents).toBe(20000)
        expect(policy.rollingQuality).toBe(1)
        expect(policy.steps).toBe(0)
        expect(policy.updatedAt).toBe(DEFAULT_BRAIN_ADAPTIVE_POLICY.updatedAt)
    })

    it("keeps thresholds stable when reliability evidence is sparse", () => {
        const initialPolicy = {
            ...DEFAULT_BRAIN_ADAPTIVE_POLICY,
            minNowcastConfidence: 0.76,
            outlierMinConfidence: 0.9,
            primaryBlendThreshold: 0.66,
            overshootDeltaCents: 36000,
            rollingQuality: 0.58,
            steps: 5,
        }

        const adapted = adaptBrainAdaptivePolicy(
            initialPolicy,
            buildEvolution({
                currentMonthNowcastConfidence: 0.82,
                nowcastReliability: {
                    sampleCount: 2,
                    mae: 0.2,
                    mape: 0.25,
                    mapeSampleCount: 2,
                },
            })
        )

        expect(adapted.minNowcastConfidence).toBe(initialPolicy.minNowcastConfidence)
        expect(adapted.outlierMinConfidence).toBe(initialPolicy.outlierMinConfidence)
        expect(adapted.primaryBlendThreshold).toBe(initialPolicy.primaryBlendThreshold)
        expect(adapted.overshootDeltaCents).toBe(initialPolicy.overshootDeltaCents)
        expect(adapted.steps).toBe(initialPolicy.steps)
        expect(adapted.rollingQuality).not.toBe(initialPolicy.rollingQuality)
    })

    it("tightens policy after strong quality degradation", () => {
        const initialPolicy = {
            ...DEFAULT_BRAIN_ADAPTIVE_POLICY,
            minNowcastConfidence: 0.72,
            outlierMinConfidence: 0.88,
            primaryBlendThreshold: 0.6,
            overshootDeltaCents: 30000,
            rollingQuality: 0.8,
            steps: 8,
        }

        const adapted = adaptBrainAdaptivePolicy(
            initialPolicy,
            buildEvolution({
                snapshot: buildSnapshot(40),
                currentMonthNowcastConfidence: 0.38,
                currentMonthNowcastReady: false,
                nowcastReliability: {
                    sampleCount: 24,
                    mae: 0.7,
                    mape: 0.95,
                    mapeSampleCount: 24,
                },
            })
        )

        expect(adapted.minNowcastConfidence).toBeGreaterThan(initialPolicy.minNowcastConfidence)
        expect(adapted.outlierMinConfidence).toBeGreaterThan(initialPolicy.outlierMinConfidence)
        expect(adapted.primaryBlendThreshold).toBeGreaterThan(initialPolicy.primaryBlendThreshold)
        expect(adapted.overshootDeltaCents).toBeGreaterThan(initialPolicy.overshootDeltaCents)
        expect(adapted.steps).toBe(initialPolicy.steps + 1)
    })

    it("relaxes strict policy when quality is consistently high", () => {
        const strictPolicy = {
            ...DEFAULT_BRAIN_ADAPTIVE_POLICY,
            minNowcastConfidence: 0.86,
            outlierMinConfidence: 0.95,
            primaryBlendThreshold: 0.75,
            overshootDeltaCents: 62000,
            rollingQuality: 0.35,
            steps: 12,
        }

        const adapted = adaptBrainAdaptivePolicy(
            strictPolicy,
            buildEvolution({
                snapshot: buildSnapshot(180),
                currentMonthNowcastConfidence: 0.97,
                currentMonthNowcastReady: true,
                nowcastReliability: {
                    sampleCount: 28,
                    mae: 0.06,
                    mape: 0.09,
                    mapeSampleCount: 28,
                },
            })
        )

        expect(adapted.minNowcastConfidence).toBeLessThan(strictPolicy.minNowcastConfidence)
        expect(adapted.outlierMinConfidence).toBeLessThan(strictPolicy.outlierMinConfidence)
        expect(adapted.primaryBlendThreshold).toBeLessThan(strictPolicy.primaryBlendThreshold)
        expect(adapted.overshootDeltaCents).toBeLessThan(strictPolicy.overshootDeltaCents)
        expect(adapted.steps).toBe(strictPolicy.steps + 1)
    })

    it("handles missing reliability payload without throwing", () => {
        const evolutionWithoutReliability = {
            ...buildEvolution(),
            nowcastReliability: undefined,
        } as unknown as BrainEvolutionResult

        expect(() => adaptBrainAdaptivePolicy(DEFAULT_BRAIN_ADAPTIVE_POLICY, evolutionWithoutReliability)).not.toThrow()
    })
})
