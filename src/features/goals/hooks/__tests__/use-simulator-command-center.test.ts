import { renderHook, act } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

import { Category } from "@/domain/categories"
import { MonthlyAveragesResult } from "@/features/simulator/utils"
import { GoalScenarioResult, RealtimeOverlaySignal } from "@/VAULT/goals/types"

import { useSimulatorCommandCenter } from "../use-simulator-command-center"

const useGoalScenariosMock = vi.fn()
const useAIAdvisorMock = vi.fn()

vi.mock("@tanstack/react-query", () => ({
    useQueryClient: () => ({
        invalidateQueries: vi.fn()
    })
}))

vi.mock("sonner", () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        info: vi.fn()
    }
}))

vi.mock("@/lib/feature-flags", () => ({
    isFinancialLabRealtimeOverlayEnabled: () => true
}))

vi.mock("../use-goal-portfolio", () => ({
    useGoalPortfolio: () => ({
        portfolio: {
            mainGoalId: "goal-1",
            goals: [
                {
                    id: "goal-1",
                    title: "Test Goal",
                    targetCents: 50000,
                    createdAt: "2026-01-01T00:00:00.000Z"
                }
            ]
        },
        isLoading: false,
        refreshPortfolio: vi.fn(),
        addGoal: vi.fn(),
        setMainGoal: vi.fn(),
        updateGoal: vi.fn(),
        removeGoal: vi.fn()
    })
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
    useAIAdvisor: () => useAIAdvisorMock()
}))

vi.mock("../use-goal-scenarios", () => ({
    useGoalScenarios: (...args: unknown[]) => useGoalScenariosMock(...args)
}))

function createScenario(overrides: Partial<GoalScenarioResult> = {}): GoalScenarioResult {
    const baseDate = new Date("2026-06-01T12:00:00.000Z")
    return {
        key: "baseline",
        config: {
            type: "baseline",
            label: "Nessun Ritmo",
            description: "Scenario test",
            applicationMap: {},
            savingsMap: { superfluous: 0, comfort: 0 }
        },
        projection: {
            minMonths: 3,
            likelyMonths: 4,
            maxMonths: 5,
            minMonthsPrecise: 3.3,
            likelyMonthsPrecise: 3.8,
            maxMonthsPrecise: 5.2,
            likelyMonthsComparable: 3.8,
            minDate: baseDate,
            likelyDate: baseDate,
            maxDate: baseDate,
            canReach: true,
            realtimeOverlayApplied: false,
            realtimeCapacityFactor: 1,
            realtimeWindowMonths: 0
        },
        sustainability: {
            isSustainable: true,
            status: "secure",
            reason: null,
            safeBufferRequired: 10000,
            remainingBuffer: 30000
        },
        simulatedExpenses: 140000,
        monthlyGoalCapacityCents: 14000,
        planBasis: "historical",
        ...overrides
    }
}

describe("useSimulatorCommandCenter", () => {
    beforeEach(() => {
        vi.useFakeTimers()
        useGoalScenariosMock.mockReset()
        useAIAdvisorMock.mockReset()

        useGoalScenariosMock.mockImplementation((params: { realtimeOverlay?: RealtimeOverlaySignal | null }) => {
            const realtimeOverlay = params?.realtimeOverlay
            const realtimeOverlayApplied = Boolean(realtimeOverlay?.enabled)
            const realtimeCapacityFactor = realtimeOverlayApplied ? realtimeOverlay?.capacityFactor || 1 : 1
            const realtimeWindowMonths = realtimeOverlayApplied ? realtimeOverlay?.shortTermMonths || 2 : 0
            return {
                scenarios: [
                    createScenario({
                        projection: {
                            ...createScenario().projection,
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

        const baseSurplus = 60000
        expect(result.current.simulatedSurplus).toBe(baseSurplus)
        expect(result.current.goalMonthlyCapacityRealtime).toBe(14000)
        expect(result.current.realtimeWindowMonths).toBe(0)

        act(() => {
            vi.advanceTimersByTime(700)
        })

        const projection = result.current.currentScenario?.projection
        expect(projection?.realtimeOverlayApplied).toBe(true)
        expect(result.current.realtimeWindowMonths).toBe(3)

        const realtimeFactor = projection?.realtimeCapacityFactor || 1
        expect(result.current.simulatedSurplus).toBe(Math.round(baseSurplus * realtimeFactor))
        expect(result.current.goalMonthlyCapacityRealtime).toBe(Math.round(14000 * realtimeFactor))
    })
})
