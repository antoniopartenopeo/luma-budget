import { renderHook } from "@testing-library/react"
import { describe, expect, test } from "vitest"

import { Category } from "@/domain/categories"
import { Transaction } from "@/domain/transactions"
import { MonthlyAveragesResult } from "@/features/simulator/utils"
import { BrainAssistSignal, GoalScenarioResult, RealtimeOverlaySignal } from "@/VAULT/goals/types"

import { useGoalScenarios } from "../use-goal-scenarios"

function buildDateMonthOffset(monthsAgo: number, day: number): Date {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth() - monthsAgo, day, 12, 0, 0, 0)
}

function createFixture() {
    const categories: Category[] = [
        { id: "rent", label: "Rent", kind: "expense", spendingNature: "essential", color: "slate", hexColor: "#0f172a", iconName: "home" },
        { id: "dining", label: "Dining", kind: "expense", spendingNature: "comfort", color: "amber", hexColor: "#f59e0b", iconName: "utensils" },
        { id: "netflix", label: "Netflix", kind: "expense", spendingNature: "superfluous", color: "rose", hexColor: "#f43f5e", iconName: "film" },
    ]

    const transactions: Transaction[] = [1, 2, 3].flatMap((monthsAgo) => {
        const incomeDate = buildDateMonthOffset(monthsAgo, 5)
        const rentDate = buildDateMonthOffset(monthsAgo, 7)
        const diningDate = buildDateMonthOffset(monthsAgo, 10)
        const netflixDate = buildDateMonthOffset(monthsAgo, 12)

        return [
            {
                id: `inc-${monthsAgo}`,
                amountCents: 200000,
                type: "income",
                date: incomeDate.toISOString().slice(0, 10),
                timestamp: incomeDate.getTime(),
                description: "Income",
                category: "Income",
                categoryId: "income"
            },
            {
                id: `rent-${monthsAgo}`,
                amountCents: 100000,
                type: "expense",
                date: rentDate.toISOString().slice(0, 10),
                timestamp: rentDate.getTime(),
                description: "Rent",
                category: "Rent",
                categoryId: "rent"
            },
            {
                id: `dining-${monthsAgo}`,
                amountCents: 20000,
                type: "expense",
                date: diningDate.toISOString().slice(0, 10),
                timestamp: diningDate.getTime(),
                description: "Dining",
                category: "Dining",
                categoryId: "dining"
            },
            {
                id: `netflix-${monthsAgo}`,
                amountCents: 30000,
                type: "expense",
                date: netflixDate.toISOString().slice(0, 10),
                timestamp: netflixDate.getTime(),
                description: "Netflix",
                category: "Netflix",
                categoryId: "netflix"
            }
        ]
    })

    const averages: MonthlyAveragesResult = {
        incomeCents: 200000,
        categories: {
            rent: { categoryId: "rent", averageAmount: 100000, totalInPeriod: 300000, monthCount: 3 },
            dining: { categoryId: "dining", averageAmount: 20000, totalInPeriod: 60000, monthCount: 3 },
            netflix: { categoryId: "netflix", averageAmount: 30000, totalInPeriod: 90000, monthCount: 3 },
        }
    }

    return { categories, transactions, averages }
}

interface HookProps {
    brainAssist: BrainAssistSignal | null
    realtimeOverlay?: RealtimeOverlaySignal | null
}

describe("useGoalScenarios", () => {
    test("returns quota-centric scenarios", () => {
        const { categories, transactions, averages } = createFixture()

        const { result } = renderHook<ReturnType<typeof useGoalScenarios>, HookProps>(
            ({ brainAssist, realtimeOverlay }: HookProps) => useGoalScenarios({
                simulationPeriod: 3,
                categories,
                transactions,
                averages,
                isLoading: false,
                brainAssist,
                realtimeOverlay
            }),
            {
                initialProps: { brainAssist: null, realtimeOverlay: null }
            }
        )

        expect(result.current.scenarios).toHaveLength(3)
        expect(result.current.scenarios.every((scenario: GoalScenarioResult) => scenario.quota.realtimeMonthlyCapacityCents >= 0)).toBe(true)
        expect(result.current.scenarios.every((scenario: GoalScenarioResult) => scenario.planBasis === "historical")).toBe(true)
    })

    test("applies brain prudence by not increasing base capacity under high risk signal", () => {
        const { categories, transactions, averages } = createFixture()

        const { result, rerender } = renderHook<ReturnType<typeof useGoalScenarios>, HookProps>(
            ({ brainAssist, realtimeOverlay }: HookProps) => useGoalScenarios({
                simulationPeriod: 3,
                categories,
                transactions,
                averages,
                isLoading: false,
                brainAssist,
                realtimeOverlay
            }),
            {
                initialProps: { brainAssist: null, realtimeOverlay: null }
            }
        )

        const baselineWithout = result.current.scenarios.find((scenario: GoalScenarioResult) => scenario.key === "baseline")

        rerender({
            brainAssist: { riskScore: 0.9, confidence: 0.95 },
            realtimeOverlay: null
        })

        const baselineWith = result.current.scenarios.find((scenario: GoalScenarioResult) => scenario.key === "baseline")

        expect(baselineWithout).toBeDefined()
        expect(baselineWith).toBeDefined()
        expect((baselineWith?.quota.baseMonthlyCapacityCents || 0)).toBeLessThanOrEqual(baselineWithout?.quota.baseMonthlyCapacityCents || 0)
    })

    test("marks scenarios as brain overlay when realtime signal is active", () => {
        const { categories, transactions, averages } = createFixture()

        const { result } = renderHook<ReturnType<typeof useGoalScenarios>, HookProps>(
            ({ brainAssist, realtimeOverlay }: HookProps) => useGoalScenarios({
                simulationPeriod: 3,
                categories,
                transactions,
                averages,
                isLoading: false,
                brainAssist,
                realtimeOverlay
            }),
            {
                initialProps: {
                    brainAssist: null,
                    realtimeOverlay: {
                        enabled: true,
                        source: "brain",
                        shortTermMonths: 3,
                        capacityFactor: 0.9
                    }
                }
            }
        )

        expect(result.current.scenarios.every((scenario: GoalScenarioResult) => scenario.planBasis === "brain_overlay")).toBe(true)
        expect(result.current.scenarios.every((scenario: GoalScenarioResult) => scenario.quota.realtimeOverlayApplied)).toBe(true)
    })
})
