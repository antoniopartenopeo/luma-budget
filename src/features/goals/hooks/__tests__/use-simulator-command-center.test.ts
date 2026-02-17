import { renderHook, act } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

import { Category } from "@/domain/categories"
import { MonthlyAveragesResult } from "@/features/simulator/utils"
import { GoalScenarioResult, RealtimeOverlaySignal } from "@/VAULT/goals/types"

import { useSimulatorCommandCenter } from "../use-simulator-command-center"

const useGoalScenariosMock = vi.fn()
const useAIAdvisorMock = vi.fn()
const resetFinancialLabLegacyStateMock = vi.fn()
const invalidateQueriesMock = vi.fn()

vi.mock("@tanstack/react-query", () => ({
    useQueryClient: () => ({
        invalidateQueries: invalidateQueriesMock
    })
}))

vi.mock("sonner", () => ({
    toast: {
        info: vi.fn()
    }
}))

vi.mock("@/lib/feature-flags", () => ({
    isFinancialLabRealtimeOverlayEnabled: () => true
}))

vi.mock("@/features/simulator/hooks", () => ({
    useMonthlyAverages: () => {
        const categories: Category[] = [
            { id: "rent", label: "Rent", kind: "expense", spendingNature: "essential", color: "slate", hexColor: "#0f172a", iconName: "home" },
            { id: "dining", label: "Dining", kind: "expense", spendingNature: "comfort", color: "amber", hexColor: "#f59e0b", iconName: "utensils" },
            { id: "extra", label: "Extra", kind: "expense", spendingNature: "superfluous", color: "rose", hexColor: "#f43f5e", iconName: "film" }
        ]
        const averages: MonthlyAveragesResult = {
            incomeCents: 200000,
            categories: {
                rent: { categoryId: "rent", averageAmount: 100000, totalInPeriod: 300000, monthCount: 3 },
                dining: { categoryId: "dining", averageAmount: 25000, totalInPeriod: 75000, monthCount: 3 },
                extra: { categoryId: "extra", averageAmount: 15000, totalInPeriod: 45000, monthCount: 3 }
            }
        }

        return {
            data: categories,
            rawAverages: averages,
            transactions: [],
            isLoading: false
        }
    }
}))

vi.mock("@/features/insights/use-ai-advisor", () => ({
    useAIAdvisor: (...args: unknown[]) => useAIAdvisorMock(...args)
}))

vi.mock("../use-goal-scenarios", () => ({
    useGoalScenarios: (...args: unknown[]) => useGoalScenariosMock(...args)
}))

vi.mock("../../utils/reset-financial-lab-legacy", () => ({
    resetFinancialLabLegacyState: () => resetFinancialLabLegacyStateMock()
}))

function createScenario(overrides: Partial<GoalScenarioResult> = {}): GoalScenarioResult {
    return {
        key: "baseline",
        config: {
            type: "baseline",
            label: "Nessun Ritmo",
            description: "Scenario test",
            applicationMap: {},
            savingsMap: { superfluous: 0, comfort: 0 }
        },
        sustainability: {
            isSustainable: true,
            status: "secure",
            reason: null,
            safeBufferRequired: 10000,
            remainingBuffer: 30000
        },
        simulatedExpenses: 140000,
        quota: {
            baseMonthlyMarginCents: 60000,
            realtimeMonthlyMarginCents: 60000,
            baseMonthlyCapacityCents: 14000,
            realtimeMonthlyCapacityCents: 14000,
            realtimeOverlayApplied: false,
            realtimeCapacityFactor: 1,
            realtimeWindowMonths: 0
        },
        planBasis: "historical",
        ...overrides
    }
}

describe("useSimulatorCommandCenter", () => {
    beforeEach(() => {
        vi.useFakeTimers()
        invalidateQueriesMock.mockReset()
        useGoalScenariosMock.mockReset()
        useAIAdvisorMock.mockReset()
        resetFinancialLabLegacyStateMock.mockReset()
        resetFinancialLabLegacyStateMock.mockResolvedValue(false)

        useGoalScenariosMock.mockImplementation((params: { realtimeOverlay?: RealtimeOverlaySignal | null }) => {
            const realtimeOverlay = params?.realtimeOverlay
            const realtimeOverlayApplied = Boolean(realtimeOverlay?.enabled)
            const realtimeCapacityFactor = realtimeOverlayApplied ? realtimeOverlay?.capacityFactor || 1 : 1
            const realtimeWindowMonths = realtimeOverlayApplied ? realtimeOverlay?.shortTermMonths || 2 : 0
            return {
                scenarios: [
                    createScenario({
                        quota: {
                            baseMonthlyMarginCents: 60000,
                            realtimeMonthlyMarginCents: Math.round(60000 * realtimeCapacityFactor),
                            baseMonthlyCapacityCents: 14000,
                            realtimeMonthlyCapacityCents: Math.round(14000 * realtimeCapacityFactor),
                            realtimeOverlayApplied,
                            realtimeCapacityFactor,
                            realtimeWindowMonths
                        },
                        planBasis: !realtimeOverlayApplied
                            ? "historical"
                            : (realtimeOverlay?.source === "brain" ? "brain_overlay" : "fallback_overlay")
                    })
                ],
                baselineMetrics: {
                    averageMonthlyIncome: 200000,
                    averageMonthlyExpenses: 140000,
                    averageEssentialExpenses: 100000,
                    averageSuperfluousExpenses: 15000,
                    averageComfortExpenses: 25000,
                    expensesStdDev: 5000,
                    freeCashFlowStdDev: 5000,
                    monthsAnalyzed: 6,
                    activeMonths: 6,
                    activityCoverageRatio: 1
                },
                isLoading: false
            }
        })

        useAIAdvisorMock.mockReturnValue({
            facts: {
                baseBalanceCents: 300000,
                predictedRemainingCurrentMonthExpensesCents: 60000,
                predictedTotalEstimatedBalanceCents: 240000,
                primarySource: "brain",
                historicalMonthsCount: 4,
                subscriptionCount: 2,
                subscriptionTotalYearlyCents: 120000
            },
            forecast: {
                baseBalanceCents: 300000,
                predictedRemainingCurrentMonthExpensesCents: 60000,
                predictedTotalEstimatedBalanceCents: 240000,
                primarySource: "brain",
                confidence: "high"
            },
            subscriptions: [],
            brainSignal: {
                isReady: true,
                source: "brain",
                riskScore: 0.8,
                confidenceScore: 0.9
            },
            isLoading: false
        })
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    test("runs legacy reset check on mount", () => {
        renderHook(() => useSimulatorCommandCenter())
        expect(resetFinancialLabLegacyStateMock).toHaveBeenCalledTimes(1)
        expect(useAIAdvisorMock).toHaveBeenCalledWith({ mode: "readonly" })
    })

    test("applies debounced realtime overlay and extends to 3 months only for strong brain signal", () => {
        renderHook(() => useSimulatorCommandCenter())

        const initialCall = useGoalScenariosMock.mock.calls[0]?.[0]
        expect(initialCall).toBeDefined()
        expect(initialCall.realtimeOverlay).toBeNull()

        act(() => {
            vi.advanceTimersByTime(700)
        })

        const latestCall = useGoalScenariosMock.mock.calls[useGoalScenariosMock.mock.calls.length - 1]?.[0]
        expect(latestCall.realtimeOverlay).toBeTruthy()
        expect(latestCall.realtimeOverlay.enabled).toBe(true)
        expect(latestCall.realtimeOverlay.source).toBe("brain")
        expect(latestCall.realtimeOverlay.shortTermMonths).toBe(3)
    })

    test("remodulates realtime margin and quota for the short-term window", () => {
        const { result } = renderHook(() => useSimulatorCommandCenter())

        expect(result.current.simulatedSurplus).toBe(60000)
        expect(result.current.goalMonthlyCapacityRealtime).toBe(14000)
        expect(result.current.realtimeWindowMonths).toBe(0)

        act(() => {
            vi.advanceTimersByTime(700)
        })

        const quota = result.current.currentScenario?.quota
        expect(quota?.realtimeOverlayApplied).toBe(true)
        expect(result.current.realtimeWindowMonths).toBe(3)

        const realtimeFactor = quota?.realtimeCapacityFactor || 1
        expect(result.current.simulatedSurplus).toBe(Math.round(60000 * realtimeFactor))
        expect(result.current.goalMonthlyCapacityRealtime).toBe(Math.round(14000 * realtimeFactor))
    })
})
