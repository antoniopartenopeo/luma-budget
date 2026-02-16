import { render, screen } from "@testing-library/react"
import { describe, expect, test, vi } from "vitest"

import { GoalScenarioResult } from "@/VAULT/goals/types"

import { ScenarioDeck } from "../scenario-deck"

vi.mock("@/features/settings/api/use-currency", () => ({
    useCurrency: () => ({
        currency: "EUR",
        locale: "it-IT"
    })
}))

function createScenario(partial: Partial<GoalScenarioResult> & Pick<GoalScenarioResult, "key">): GoalScenarioResult {
    const baseDate = new Date("2026-06-01T12:00:00.000Z")
    return {
        key: partial.key,
        config: partial.config || {
            type: partial.key === "aggressive" ? "aggressive" : partial.key === "balanced" ? "balanced" : "baseline",
            label: partial.key === "aggressive" ? "Aggressivo" : partial.key === "balanced" ? "Equilibrato" : "Nessun Ritmo",
            description: "Scenario test",
            applicationMap: {},
            savingsMap: { superfluous: 20, comfort: 5 }
        },
        projection: partial.projection || {
            minMonths: 3,
            likelyMonths: 4,
            maxMonths: 5,
            minMonthsPrecise: 2.9,
            likelyMonthsPrecise: 3.6,
            maxMonthsPrecise: 5.1,
            likelyMonthsComparable: 3.6,
            minDate: baseDate,
            likelyDate: baseDate,
            maxDate: baseDate,
            canReach: true,
            realtimeOverlayApplied: false,
            realtimeCapacityFactor: 1,
            realtimeWindowMonths: 0
        },
        sustainability: partial.sustainability || {
            isSustainable: true,
            status: "secure",
            reason: null,
            safeBufferRequired: 10000,
            remainingBuffer: 30000
        },
        simulatedExpenses: partial.simulatedExpenses ?? 140000,
        monthlyGoalCapacityCents: partial.monthlyGoalCapacityCents ?? 14500,
        planBasis: partial.planBasis ?? "historical"
    }
}

describe("ScenarioDeck", () => {
    test("renders comparable months and keeps cards focused on time only", () => {
        const scenarios: GoalScenarioResult[] = [
            createScenario({
                key: "baseline",
                projection: {
                    minMonths: 3,
                    likelyMonths: 4,
                    maxMonths: 5,
                    minMonthsPrecise: 3.3,
                    likelyMonthsPrecise: 3.6,
                    maxMonthsPrecise: 5.2,
                    likelyMonthsComparable: 3.6,
                    minDate: new Date("2026-05-01T12:00:00.000Z"),
                    likelyDate: new Date("2026-06-01T12:00:00.000Z"),
                    maxDate: new Date("2026-07-01T12:00:00.000Z"),
                    canReach: true,
                    realtimeOverlayApplied: false,
                    realtimeCapacityFactor: 1,
                    realtimeWindowMonths: 0
                },
                monthlyGoalCapacityCents: 14000
            }),
            createScenario({
                key: "balanced",
                projection: {
                    minMonths: 3,
                    likelyMonths: 4,
                    maxMonths: 5,
                    minMonthsPrecise: 3.1,
                    likelyMonthsPrecise: 3.9,
                    maxMonthsPrecise: 5.4,
                    likelyMonthsComparable: 3.9,
                    minDate: new Date("2026-05-01T12:00:00.000Z"),
                    likelyDate: new Date("2026-06-01T12:00:00.000Z"),
                    maxDate: new Date("2026-07-01T12:00:00.000Z"),
                    canReach: true,
                    realtimeOverlayApplied: false,
                    realtimeCapacityFactor: 1,
                    realtimeWindowMonths: 0
                },
                monthlyGoalCapacityCents: 13500
            }),
            createScenario({
                key: "aggressive",
                projection: {
                    minMonths: 3,
                    likelyMonths: 4,
                    maxMonths: 5,
                    minMonthsPrecise: 3.2,
                    likelyMonthsPrecise: 4.2,
                    maxMonthsPrecise: 5.5,
                    likelyMonthsComparable: 4.2,
                    minDate: new Date("2026-05-01T12:00:00.000Z"),
                    likelyDate: new Date("2026-06-01T12:00:00.000Z"),
                    maxDate: new Date("2026-07-01T12:00:00.000Z"),
                    canReach: true,
                    realtimeOverlayApplied: false,
                    realtimeCapacityFactor: 1,
                    realtimeWindowMonths: 0
                }
            })
        ]

        render(
            <ScenarioDeck
                scenarios={scenarios}
                activeKey="baseline"
                onSelect={() => undefined}
                onCustomConfigClick={() => undefined}
            />
        )

        expect(screen.getByText("~3,6 Mesi")).toBeInTheDocument()
        expect(screen.getByText("~3,9 Mesi")).toBeInTheDocument()
        expect(screen.queryByText(/Capacita piano/i)).not.toBeInTheDocument()
    })

    test("does not show quota/capacity text even when realtime overlay is active", () => {
        const scenario = createScenario({
            key: "baseline",
            monthlyGoalCapacityCents: 20000,
            projection: {
                minMonths: 3,
                likelyMonths: 4,
                maxMonths: 5,
                minMonthsPrecise: 3.2,
                likelyMonthsPrecise: 3.9,
                maxMonthsPrecise: 5.2,
                likelyMonthsComparable: 3.9,
                minDate: new Date("2026-05-01T12:00:00.000Z"),
                likelyDate: new Date("2026-06-01T12:00:00.000Z"),
                maxDate: new Date("2026-07-01T12:00:00.000Z"),
                canReach: true,
                realtimeOverlayApplied: true,
                realtimeCapacityFactor: 0.85,
                realtimeWindowMonths: 3
            }
        })

        render(
            <ScenarioDeck
                scenarios={[scenario]}
                activeKey="baseline"
                onSelect={() => undefined}
                onCustomConfigClick={() => undefined}
            />
        )

        expect(screen.getByText("~3,9 Mesi")).toBeInTheDocument()
        expect(screen.queryByText(/Capacita piano/i)).not.toBeInTheDocument()
    })
})
