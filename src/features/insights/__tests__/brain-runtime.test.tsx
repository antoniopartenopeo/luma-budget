import { useEffect } from "react"
import { act, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { STORAGE_KEY_BRAIN_SNAPSHOT } from "@/lib/storage-keys"
import { STORAGE_MUTATION_EVENT } from "@/lib/storage-utils"
import {
    __resetBrainRuntimeForTests,
    useBrainRuntime,
    useBrainRuntimeState,
} from "../brain-runtime"

const fetchTransactionsMock = vi.fn()
const getCategoriesMock = vi.fn()
const initializeBrainMock = vi.fn()
const resetBrainMock = vi.fn()
const evolveBrainFromHistoryMock = vi.fn()
const getBrainSnapshotMock = vi.fn()
const loadBrainAdaptivePolicyMock = vi.fn()
const saveBrainAdaptivePolicyMock = vi.fn()
const adaptBrainAdaptivePolicyMock = vi.fn()

vi.mock("@/features/transactions/api/repository", () => ({
    fetchTransactions: () => fetchTransactionsMock(),
    __resetTransactionsCache: vi.fn(),
}))

vi.mock("@/features/categories/api/repository", () => ({
    getCategories: () => getCategoriesMock(),
    __resetCategoriesCache: vi.fn(),
}))

vi.mock("@/brain", () => ({
    BRAIN_MATURITY_SAMPLE_TARGET: 120,
    computeBrainInputSignature: (
        transactions: Array<{ timestamp: number; amountCents: number; categoryId: string; type: string; isSuperfluous?: boolean }>,
        categories: Array<{ id: string; spendingNature: string }>,
        period: string
    ) => {
        const txSignature = transactions
            .map((tx) => `${tx.timestamp}:${tx.amountCents}:${tx.categoryId}:${tx.type}:${tx.isSuperfluous === true ? 1 : tx.isSuperfluous === false ? 0 : "u"}`)
            .join("|")
        const categoriesSignature = categories
            .map((category) => `${category.id}:${category.spendingNature}`)
            .join("|")
        return `${period}:${txSignature}:${categoriesSignature}`
    },
    evolveBrainFromHistory: (...args: unknown[]) => evolveBrainFromHistoryMock(...args),
    getBrainSnapshot: () => getBrainSnapshotMock(),
    initializeBrain: (...args: unknown[]) => initializeBrainMock(...args),
    resetBrain: (...args: unknown[]) => resetBrainMock(...args),
}))

vi.mock("../brain-auto-tune", () => ({
    DEFAULT_BRAIN_ADAPTIVE_POLICY: {
        version: 1,
        minNowcastConfidence: 0.72,
        outlierMinConfidence: 0.88,
        primaryBlendThreshold: 0.6,
        overshootDeltaCents: 30000,
        rollingQuality: 0.5,
        steps: 0,
        updatedAt: new Date(0).toISOString(),
    },
    loadBrainAdaptivePolicy: () => loadBrainAdaptivePolicyMock(),
    saveBrainAdaptivePolicy: (...args: unknown[]) => saveBrainAdaptivePolicyMock(...args),
    adaptBrainAdaptivePolicy: (...args: unknown[]) => adaptBrainAdaptivePolicyMock(...args),
}))

function ts(isoDate: string): number {
    return new Date(isoDate).getTime()
}

function buildSnapshot(overrides: Record<string, unknown> = {}) {
    return {
        version: 2,
        featureSchemaVersion: 2,
        weights: [0, 0, 0, 0, 0, 0, 0, 0],
        bias: 0,
        learningRate: 0.03,
        trainedSamples: 48,
        lossEma: 0.08,
        absErrorEma: 0.12,
        currentMonthHead: {
            weights: [0, 0, 0, 0, 0, 0, 0, 0],
            bias: 0,
            learningRate: 0.03,
            trainedSamples: 48,
            lossEma: 0.08,
            absErrorEma: 0.12,
        },
        dataFingerprint: "brain-runtime-test",
        updatedAt: "2026-03-15T10:00:00.000Z",
        ...overrides,
    }
}

function buildEvolutionResult(overrides: Record<string, unknown> = {}) {
    return {
        reason: "trained",
        snapshot: buildSnapshot(),
        datasetFingerprint: "brain-runtime-test",
        didTrain: true,
        epochsRun: 3,
        sampleCount: 12,
        monthsAnalyzed: 3,
        averageLoss: 0.08,
        prediction: {
            predictedExpenseRatio: 0.62,
            riskScore: 0.41,
            confidence: 0.79,
            contributors: [],
        },
        inferencePeriod: "2026-03",
        currentIncomeCents: 240000,
        currentExpensesCents: 120000,
        predictedExpensesNextMonthCents: 140000,
        predictedCurrentMonthRemainingExpensesCents: 45000,
        currentMonthNowcastConfidence: 0.79,
        currentMonthNowcastReady: true,
        nowcastReliability: {
            sampleCount: 0,
            mae: 0,
            mape: 0,
            mapeSampleCount: 0,
        },
        nextMonthReliability: {
            sampleCount: 0,
            mae: 0,
            mape: 0,
            mapeSampleCount: 0,
        },
        ...overrides,
    }
}

function RuntimeHarness({
    mode = "active",
    preferredPeriod = "2026-03",
    onValue,
}: {
    mode?: "active" | "readonly"
    preferredPeriod?: string
    onValue?: (value: ReturnType<typeof useBrainRuntime>) => void
}) {
    const value = useBrainRuntime({ mode, preferredPeriod })

    useEffect(() => {
        onValue?.(value)
    }, [onValue, value])

    return null
}

function RuntimeStateHarness({
    onValue,
}: {
    onValue?: (value: ReturnType<typeof useBrainRuntimeState>) => void
}) {
    const value = useBrainRuntimeState()

    useEffect(() => {
        onValue?.(value)
    }, [onValue, value])

    return null
}

async function flushRuntime() {
    await act(async () => {
        await Promise.resolve()
        await Promise.resolve()
        await Promise.resolve()
    })
}

describe("brain-runtime", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        __resetBrainRuntimeForTests()

        fetchTransactionsMock.mockResolvedValue([
            { id: "tx-1", amountCents: 120000, type: "expense", timestamp: ts("2026-03-01T08:00:00.000Z"), categoryId: "rent", isSuperfluous: false },
            { id: "tx-2", amountCents: 230000, type: "income", timestamp: ts("2026-03-03T08:00:00.000Z"), categoryId: "income", isSuperfluous: false },
        ])
        getCategoriesMock.mockResolvedValue([
            { id: "rent", spendingNature: "essential" },
            { id: "income", spendingNature: "essential" },
        ])
        getBrainSnapshotMock.mockReturnValue(null)
        initializeBrainMock.mockReturnValue(buildSnapshot({ trainedSamples: 0, currentMonthHead: { weights: [0, 0, 0, 0, 0, 0, 0, 0], bias: 0, learningRate: 0.03, trainedSamples: 0, lossEma: 0.12, absErrorEma: 0.16 } }))
        evolveBrainFromHistoryMock.mockResolvedValue(buildEvolutionResult())
        loadBrainAdaptivePolicyMock.mockReturnValue({
            version: 1,
            minNowcastConfidence: 0.72,
            outlierMinConfidence: 0.88,
            primaryBlendThreshold: 0.6,
            overshootDeltaCents: 30000,
            rollingQuality: 0.5,
            steps: 0,
            updatedAt: new Date(0).toISOString(),
        })
        adaptBrainAdaptivePolicyMock.mockImplementation((policy: unknown) => policy)
    })

    afterEach(() => {
        __resetBrainRuntimeForTests()
    })

    it("deduplicates active evolution across multiple consumers on the same signature", async () => {
        render(
            <>
                <RuntimeHarness mode="active" preferredPeriod="2026-03" />
                <RuntimeHarness mode="active" preferredPeriod="2026-03" />
            </>
        )

        await flushRuntime()

        expect(initializeBrainMock).toHaveBeenCalledTimes(1)
        expect(evolveBrainFromHistoryMock).toHaveBeenCalledTimes(1)
        expect(saveBrainAdaptivePolicyMock).toHaveBeenCalledTimes(1)
    })

    it("keeps readonly consumers side-effect free for training and policy persistence", async () => {
        render(<RuntimeHarness mode="readonly" preferredPeriod="2026-03" />)

        await flushRuntime()

        expect(initializeBrainMock).not.toHaveBeenCalled()
        expect(evolveBrainFromHistoryMock).toHaveBeenCalledTimes(1)
        expect(evolveBrainFromHistoryMock).toHaveBeenLastCalledWith(
            expect.any(Array),
            expect.any(Array),
            expect.objectContaining({
                allowTraining: false,
                preferredPeriod: "2026-03",
            })
        )
        expect(saveBrainAdaptivePolicyMock).not.toHaveBeenCalled()
    })

    it("syncs same-tab snapshot updates without polling", async () => {
        let latestState!: ReturnType<typeof useBrainRuntimeState>

        render(<RuntimeStateHarness onValue={(value) => { latestState = value }} />)

        await flushRuntime()

        expect(latestState.snapshot).toBeNull()
        expect(latestState.brainExperiencePercent).toBe(0)

        getBrainSnapshotMock.mockReturnValue(buildSnapshot({ trainedSamples: 64, currentMonthHead: { weights: [0, 0, 0, 0, 0, 0, 0, 0], bias: 0, learningRate: 0.03, trainedSamples: 64, lossEma: 0.05, absErrorEma: 0.09 } }))

        await act(async () => {
            window.dispatchEvent(new CustomEvent(STORAGE_MUTATION_EVENT, {
                detail: {
                    key: STORAGE_KEY_BRAIN_SNAPSHOT,
                    operation: "set",
                },
            }))
            await Promise.resolve()
        })

        expect(latestState.snapshot?.trainedSamples).toBe(64)
        expect(latestState.brainExperiencePercent).toBe(53)
    })
})
