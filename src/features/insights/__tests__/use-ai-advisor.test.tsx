import { useEffect } from "react"
import { act, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useAIAdvisor, type AIAdvisorResult } from "../use-ai-advisor"

const useTransactionsMock = vi.fn()
const useCategoriesMock = vi.fn()
const useDashboardSummaryMock = vi.fn()
const initializeBrainMock = vi.fn()
const evolveBrainFromHistoryMock = vi.fn()

vi.mock("@/features/transactions/api/use-transactions", () => ({
    useTransactions: () => useTransactionsMock(),
}))

vi.mock("@/features/categories/api/use-categories", () => ({
    useCategories: () => useCategoriesMock(),
}))

vi.mock("@/features/dashboard/api/use-dashboard", () => ({
    useDashboardSummary: () => useDashboardSummaryMock(),
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
    initializeBrain: (...args: unknown[]) => initializeBrainMock(...args),
    evolveBrainFromHistory: (...args: unknown[]) => evolveBrainFromHistoryMock(...args),
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

function buildBrainResult(overrides: Record<string, unknown> = {}) {
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
        ...overrides,
    }
}

describe("useAIAdvisor", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.useFakeTimers()
        vi.setSystemTime(new Date("2026-02-15T10:00:00.000Z"))
        window.localStorage.clear()

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
        initializeBrainMock.mockImplementation(() => undefined)
        evolveBrainFromHistoryMock.mockResolvedValue(buildBrainResult())
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it("uses canonical dashboard balance and Brain nowcast when ready", async () => {
        let latest: AIAdvisorResult | null = null

        render(<HookHarness onValue={(value) => { latest = value }} />)

        await act(async () => {
            await Promise.resolve()
            await Promise.resolve()
        })

        const value = latest as AIAdvisorResult | null

        expect(value?.isLoading).toBe(false)
        expect(evolveBrainFromHistoryMock).toHaveBeenCalledTimes(1)
        expect(value?.forecast?.primarySource).toBe("brain")
        expect(value?.forecast?.baseBalanceCents).toBe(500000)
        expect(value?.forecast?.predictedRemainingCurrentMonthExpensesCents).toBe(60000)
        expect(value?.forecast?.predictedTotalEstimatedBalanceCents).toBe(440000)
        expect(value?.brainSignal.isReady).toBe(true)
        expect(value?.brainSignal.source).toBe("brain")
    })

    it("falls back to run-rate when Brain nowcast is not ready", async () => {
        evolveBrainFromHistoryMock.mockResolvedValue(
            buildBrainResult({
                currentMonthNowcastReady: false,
                predictedCurrentMonthRemainingExpensesCents: 999999,
            })
        )

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
        evolveBrainFromHistoryMock.mockResolvedValue(
            buildBrainResult({
                currentMonthNowcastReady: true,
                currentMonthNowcastConfidence: 0.61,
                predictedCurrentMonthRemainingExpensesCents: 120000,
                prediction: {
                    predictedExpenseRatio: 0.7,
                    riskScore: 0.45,
                    confidence: 0.61,
                    contributors: []
                },
            })
        )

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
        evolveBrainFromHistoryMock.mockResolvedValue(
            buildBrainResult({
                currentMonthNowcastReady: true,
                currentMonthNowcastConfidence: 0.84,
                predictedCurrentMonthRemainingExpensesCents: 150000,
                prediction: {
                    predictedExpenseRatio: 1.1,
                    riskScore: 0.76,
                    confidence: 0.84,
                    contributors: []
                },
            })
        )

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
        evolveBrainFromHistoryMock.mockResolvedValue(
            buildBrainResult({
                currentMonthNowcastReady: true,
                currentMonthNowcastConfidence: 0.95,
                predictedCurrentMonthRemainingExpensesCents: 170000,
                prediction: {
                    predictedExpenseRatio: 1.2,
                    riskScore: 0.84,
                    confidence: 0.95,
                    contributors: []
                },
                snapshot: {
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
                    updatedAt: "2026-02-15T10:00:00.000Z"
                }
            })
        )

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

    it("re-runs evolution when transaction classification changes", async () => {
        let latest: AIAdvisorResult | null = null
        let currentTransactions: TestTransaction[] = transactionsFixture

        useTransactionsMock.mockImplementation(() => ({
            data: currentTransactions,
            isLoading: false,
        }))

        const view = render(<HookHarness onValue={(value) => { latest = value }} />)

        await act(async () => {
            await Promise.resolve()
            await Promise.resolve()
        })

        const value = latest as AIAdvisorResult | null
        expect(value?.isLoading).toBe(false)
        expect(evolveBrainFromHistoryMock).toHaveBeenCalledTimes(1)

        currentTransactions = transactionsCategoryShiftFixture
        view.rerender(<HookHarness onValue={(value) => { latest = value }} />)

        await act(async () => {
            await Promise.resolve()
            await Promise.resolve()
        })

        expect(evolveBrainFromHistoryMock).toHaveBeenCalledTimes(2)
    })

    it("supports read-only mode without training side effects", async () => {
        let latest: AIAdvisorResult | null = null

        render(<HookHarness mode="readonly" onValue={(value) => { latest = value }} />)

        await act(async () => {
            await Promise.resolve()
            await Promise.resolve()
        })

        const value = latest as AIAdvisorResult | null
        expect(value?.isLoading).toBe(false)
        expect(initializeBrainMock).not.toHaveBeenCalled()
        expect(evolveBrainFromHistoryMock).toHaveBeenCalledTimes(1)
        expect(evolveBrainFromHistoryMock).toHaveBeenLastCalledWith(
            expect.any(Array),
            expect.any(Array),
            expect.objectContaining({
                allowTraining: false
            })
        )
    })
})
