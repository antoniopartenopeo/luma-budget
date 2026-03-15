import { useEffect } from "react"
import { act, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { DEFAULT_BRAIN_ADAPTIVE_POLICY } from "../brain-auto-tune"
import { useAIAdvisor, type AIAdvisorResult } from "../use-ai-advisor"

const useTransactionsMock = vi.fn()
const useCategoriesMock = vi.fn()
const useDashboardSummaryMock = vi.fn()
const useBrainRuntimeMock = vi.fn()

vi.mock("@/features/transactions/api/use-transactions", () => ({
    useTransactions: () => useTransactionsMock(),
}))

vi.mock("@/features/categories/api/use-categories", () => ({
    useCategories: () => useCategoriesMock(),
}))

vi.mock("@/features/dashboard/api/use-dashboard", () => ({
    useDashboardSummary: () => useDashboardSummaryMock(),
}))

vi.mock("../brain-runtime", () => ({
    useBrainRuntime: (...args: unknown[]) => useBrainRuntimeMock(...args),
}))

vi.mock("@/brain", () => ({
    BRAIN_MATURITY_SAMPLE_TARGET: 120,
}))

function ts(isoDate: string): number {
    return new Date(isoDate).getTime()
}

type TestTransaction = {
    id: string
    type: "income" | "expense"
    amountCents: number
    categoryId: string
    description: string
    timestamp: number
    isSuperfluous?: boolean
}

function HookHarness({
    onValue,
    mode
}: {
    onValue: (value: AIAdvisorResult) => void
    mode?: "active" | "readonly"
}) {
    const value = useAIAdvisor(mode ? { mode } : undefined)

    useEffect(() => {
        onValue(value)
    }, [onValue, value])

    return null
}

const transactionsFixture = [
    { id: "t1", type: "income" as const, amountCents: 300000, categoryId: "income", description: "Stipendio", timestamp: ts("2025-12-03T09:00:00.000Z") },
    { id: "t2", type: "expense" as const, amountCents: 170000, categoryId: "rent", description: "Affitto Casa", timestamp: ts("2025-12-05T09:00:00.000Z") },
    { id: "t2b", type: "expense" as const, amountCents: 30000, categoryId: "food", description: "Spesa Fine Mese", timestamp: ts("2025-12-26T09:00:00.000Z") },
    { id: "t3", type: "income" as const, amountCents: 305000, categoryId: "income", description: "Stipendio", timestamp: ts("2026-01-03T09:00:00.000Z") },
    { id: "t4", type: "expense" as const, amountCents: 180000, categoryId: "rent", description: "Affitto Casa", timestamp: ts("2026-01-05T09:00:00.000Z") },
    { id: "t4b", type: "expense" as const, amountCents: 40000, categoryId: "food", description: "Spesa Fine Mese", timestamp: ts("2026-01-24T09:00:00.000Z") },
    { id: "t5", type: "income" as const, amountCents: 310000, categoryId: "income", description: "Stipendio", timestamp: ts("2026-02-03T09:00:00.000Z") },
    { id: "t6", type: "expense" as const, amountCents: 50000, categoryId: "food", description: "Spesa Supermercato", timestamp: ts("2026-02-05T09:00:00.000Z") },
    { id: "t7", type: "expense" as const, amountCents: 50000, categoryId: "food", description: "Spesa Supermercato", timestamp: ts("2026-02-10T09:00:00.000Z") },
    { id: "t8", type: "expense" as const, amountCents: 50000, categoryId: "fun", description: "Tempo Libero", timestamp: ts("2026-02-14T09:00:00.000Z") },
]

const transactionsCategoryShiftFixture: TestTransaction[] = transactionsFixture.map((tx) =>
    tx.id === "t6"
        ? {
            ...tx,
            categoryId: "fun",
            isSuperfluous: true,
        }
        : tx
)

const categoriesFixture = [
    { id: "rent", spendingNature: "essential" as const },
    { id: "food", spendingNature: "comfort" as const },
    { id: "fun", spendingNature: "superfluous" as const },
    { id: "income", spendingNature: "essential" as const },
]

function buildBrainEvolution(overrides: Record<string, unknown> = {}) {
    return {
        reason: "trained",
        snapshot: null,
        datasetFingerprint: "brain-v2-test",
        didTrain: true,
        epochsRun: 4,
        sampleCount: 18,
        monthsAnalyzed: 3,
        averageLoss: 0.08,
        prediction: null,
        inferencePeriod: "2026-02",
        currentIncomeCents: 310000,
        currentExpensesCents: 150000,
        predictedExpensesNextMonthCents: 170000,
        predictedCurrentMonthRemainingExpensesCents: 60000,
        currentMonthNowcastConfidence: 0.78,
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

function buildBrainRuntimeValue(overrides: Record<string, unknown> = {}) {
    const evolution = (overrides.evolution as ReturnType<typeof buildBrainEvolution> | null | undefined)
        ?? buildBrainEvolution()
    const snapshot = (overrides.snapshot as Record<string, unknown> | null | undefined)
        ?? evolution?.snapshot
        ?? null
    const preferredPeriod = (overrides.preferredPeriod as string | undefined) ?? "2026-02"
    const mode = (overrides.mode as "active" | "readonly" | undefined) ?? "active"

    return {
        snapshot,
        adaptivePolicy: DEFAULT_BRAIN_ADAPTIVE_POLICY,
        training: {
            isTraining: false,
            epoch: 0,
            totalEpochs: 0,
            progress: 0,
            currentLoss: 0,
            sampleCount: 0,
            lastCompletedAt: null,
        },
        timeline: [],
        evolutionHistory: [],
        transactionsCount: 0,
        categoriesCount: 0,
        periods: {},
        preferredPeriod,
        mode,
        stage: {
            id: "adapting",
            label: "Attivo",
            summary: "Il Brain è attivo.",
            badgeVariant: "secondary",
        },
        periodState: {
            preferredPeriod,
            inputSignature: "sig-current",
            evolutionSignature: "sig-current",
            evolution,
            isLoading: false,
            error: null,
            mode,
        },
        evolution,
        isInitialized: snapshot !== null,
        isLoading: false,
        initialize: vi.fn(),
        reset: vi.fn(),
        runEvolution: vi.fn(),
        ...overrides,
    }
}

describe("useAIAdvisor", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.useFakeTimers()
        vi.setSystemTime(new Date("2026-02-15T10:00:00.000Z"))

        useTransactionsMock.mockReturnValue({
            data: transactionsFixture,
            isLoading: false,
        })
        useCategoriesMock.mockReturnValue({
            data: categoriesFixture,
            isLoading: false,
        })
        useDashboardSummaryMock.mockReturnValue({
            data: { netBalanceCents: 500000 },
            isLoading: false,
        })
        useBrainRuntimeMock.mockReturnValue(buildBrainRuntimeValue())
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it("uses canonical dashboard balance and Brain nowcast when ready", async () => {
        useBrainRuntimeMock.mockReturnValue(buildBrainRuntimeValue({
            evolution: buildBrainEvolution({
                prediction: {
                    predictedExpenseRatio: 0.62,
                    riskScore: 0.44,
                    confidence: 0.78,
                    contributors: [],
                },
            }),
        }))

        let latest: AIAdvisorResult | null = null

        render(<HookHarness onValue={(value) => { latest = value }} />)

        await act(async () => {
            await Promise.resolve()
            await Promise.resolve()
        })

        const value = latest as AIAdvisorResult | null

        expect(value?.isLoading).toBe(false)
        expect(value?.forecast?.primarySource).toBe("brain")
        expect(value?.forecast?.baseBalanceCents).toBe(500000)
        expect(value?.forecast?.predictedRemainingCurrentMonthExpensesCents).toBe(60000)
        expect(value?.forecast?.predictedTotalEstimatedBalanceCents).toBe(440000)
        expect(value?.brainSignal.isReady).toBe(true)
        expect(value?.brainSignal.source).toBe("brain")
    })

    it("falls back to run-rate when Brain nowcast is not ready", async () => {
        useBrainRuntimeMock.mockReturnValue(buildBrainRuntimeValue({
            evolution: buildBrainEvolution({
                currentMonthNowcastReady: false,
                predictedCurrentMonthRemainingExpensesCents: 999999,
            }),
        }))

        let latest: AIAdvisorResult | null = null

        render(<HookHarness onValue={(value) => { latest = value }} />)

        await act(async () => {
            await Promise.resolve()
            await Promise.resolve()
        })

        const value = latest as AIAdvisorResult | null

        expect(value?.isLoading).toBe(false)
        expect(value?.forecast?.primarySource).toBe("fallback")
        expect(value?.forecast?.predictedRemainingCurrentMonthExpensesCents).toBe(35000)
        expect(value?.forecast?.predictedTotalEstimatedBalanceCents).toBe(465000)
        expect(value?.brainSignal.isReady).toBe(false)
        expect(value?.brainSignal.source).toBe("fallback")
    })

    it("falls back when Brain confidence is below quality threshold", async () => {
        useBrainRuntimeMock.mockReturnValue(buildBrainRuntimeValue({
            evolution: buildBrainEvolution({
                currentMonthNowcastReady: true,
                currentMonthNowcastConfidence: 0.61,
                predictedCurrentMonthRemainingExpensesCents: 120000,
                prediction: {
                    predictedExpenseRatio: 0.7,
                    riskScore: 0.45,
                    confidence: 0.61,
                    contributors: [],
                },
            }),
        }))

        let latest: AIAdvisorResult | null = null

        render(<HookHarness onValue={(value) => { latest = value }} />)

        await act(async () => {
            await Promise.resolve()
            await Promise.resolve()
        })

        const value = latest as AIAdvisorResult | null

        expect(value?.isLoading).toBe(false)
        expect(value?.forecast?.primarySource).toBe("fallback")
        expect(value?.forecast?.predictedRemainingCurrentMonthExpensesCents).toBe(35000)
        expect(value?.brainSignal.isReady).toBe(false)
        expect(value?.brainSignal.source).toBe("fallback")
    })

    it("falls back when Brain nowcast is an outlier vs historical anchor", async () => {
        useBrainRuntimeMock.mockReturnValue(buildBrainRuntimeValue({
            evolution: buildBrainEvolution({
                currentMonthNowcastReady: true,
                currentMonthNowcastConfidence: 0.84,
                predictedCurrentMonthRemainingExpensesCents: 150000,
                prediction: {
                    predictedExpenseRatio: 1.1,
                    riskScore: 0.76,
                    confidence: 0.84,
                    contributors: [],
                },
            }),
        }))

        let latest: AIAdvisorResult | null = null

        render(<HookHarness onValue={(value) => { latest = value }} />)

        await act(async () => {
            await Promise.resolve()
            await Promise.resolve()
        })

        const value = latest as AIAdvisorResult | null

        expect(value?.isLoading).toBe(false)
        expect(value?.forecast?.primarySource).toBe("fallback")
        expect(value?.forecast?.predictedRemainingCurrentMonthExpensesCents).toBe(35000)
        expect(value?.forecast?.predictedTotalEstimatedBalanceCents).toBe(465000)
        expect(value?.brainSignal.isReady).toBe(false)
        expect(value?.brainSignal.source).toBe("fallback")
    })

    it("keeps Brain as primary on outlier when confidence and maturity are both high", async () => {
        const highMaturitySnapshot = {
            version: 2,
            featureSchemaVersion: 2,
            weights: [0, 0, 0, 0, 0, 0, 0, 0],
            bias: 0,
            learningRate: 0.03,
            trainedSamples: 160,
            lossEma: 0.08,
            absErrorEma: 0.12,
            currentMonthHead: {
                weights: [0, 0, 0, 0, 0, 0, 0, 0],
                bias: 0,
                learningRate: 0.03,
                trainedSamples: 160,
                lossEma: 0.08,
                absErrorEma: 0.12,
            },
            dataFingerprint: "brain-v2-test-high-maturity",
            updatedAt: "2026-02-15T10:00:00.000Z",
        }

        useBrainRuntimeMock.mockReturnValue(buildBrainRuntimeValue({
            snapshot: highMaturitySnapshot,
            evolution: buildBrainEvolution({
                currentMonthNowcastReady: true,
                currentMonthNowcastConfidence: 0.95,
                predictedCurrentMonthRemainingExpensesCents: 170000,
                prediction: {
                    predictedExpenseRatio: 1.2,
                    riskScore: 0.84,
                    confidence: 0.95,
                    contributors: [],
                },
                snapshot: highMaturitySnapshot,
            }),
        }))

        let latest: AIAdvisorResult | null = null

        render(<HookHarness onValue={(value) => { latest = value }} />)

        await act(async () => {
            await Promise.resolve()
            await Promise.resolve()
        })

        const value = latest as AIAdvisorResult | null

        expect(value?.isLoading).toBe(false)
        expect(value?.forecast?.primarySource).toBe("brain")
        expect(value?.forecast?.predictedRemainingCurrentMonthExpensesCents).toBe(132200)
        expect(value?.brainSignal.isReady).toBe(true)
        expect(value?.brainSignal.source).toBe("brain")
    })

    it("recomputes derived output when transaction classification changes", async () => {
        let latest: AIAdvisorResult | null = null
        let currentTransactions: TestTransaction[] = transactionsFixture

        useTransactionsMock.mockImplementation(() => ({
            data: currentTransactions,
            isLoading: false,
        }))
        useBrainRuntimeMock.mockReturnValue(buildBrainRuntimeValue({
            evolution: buildBrainEvolution({ currentMonthNowcastReady: false }),
        }))

        const view = render(<HookHarness onValue={(value) => { latest = value }} />)

        await act(async () => {
            await Promise.resolve()
            await Promise.resolve()
        })

        const first = latest as AIAdvisorResult | null
        expect(first?.subscriptions.length).toBe(0)

        currentTransactions = transactionsCategoryShiftFixture
        view.rerender(<HookHarness onValue={(value) => { latest = value }} />)

        await act(async () => {
            await Promise.resolve()
            await Promise.resolve()
        })

        const second = latest as AIAdvisorResult | null
        expect(second?.isLoading).toBe(false)
        expect(second?.forecast?.predictedRemainingCurrentMonthExpensesCents).toBe(35000)
    })

    it("passes readonly mode through to the Brain runtime", async () => {
        let latest: AIAdvisorResult | null = null

        render(<HookHarness mode="readonly" onValue={(value) => { latest = value }} />)

        await act(async () => {
            await Promise.resolve()
            await Promise.resolve()
        })

        expect((latest as AIAdvisorResult | null)?.isLoading).toBe(false)
        expect(useBrainRuntimeMock).toHaveBeenCalledWith({
            mode: "readonly",
            preferredPeriod: "2026-02",
        })
    })
})
