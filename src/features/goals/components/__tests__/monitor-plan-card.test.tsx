import { render, screen } from "@testing-library/react"
import { describe, expect, test, vi } from "vitest"

import { GoalScenarioResult } from "@/VAULT/goals/types"

import { MonitorPlanCard } from "../monitor-plan-card"

vi.mock("@/features/settings/api/use-currency", () => ({
    useCurrency: () => ({
        currency: "EUR",
        locale: "it-IT"
    })
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
            canReach: true
        },
        sustainability: {
            isSustainable: true,
            status: "secure",
            reason: null,
            safeBufferRequired: 10000,
            remainingBuffer: 30000
        },
        simulatedExpenses: 150000,
        monthlyGoalCapacityCents: 14000,
        ...overrides
    }
}

describe("MonitorPlanCard", () => {
    test("shows source capsule based on active plan source", () => {
        const scenario = createScenario()
        const view = render(
            <MonitorPlanCard
                scenario={scenario}
                savingsPercent={10}
                simulatedSurplus={50000}
                monthsToGoal={3.8}
                hasInsufficientData={false}
                brainAssistApplied
            />
        )

        expect(screen.getByText("Fonte Brain")).toBeInTheDocument()

        view.rerender(
            <MonitorPlanCard
                scenario={scenario}
                savingsPercent={10}
                simulatedSurplus={50000}
                monthsToGoal={3.8}
                hasInsufficientData={false}
                brainAssistApplied={false}
            />
        )

        expect(screen.getByText("Fonte Storico")).toBeInTheDocument()
    })

    test("renders unreachable reason path in monitor narrative", () => {
        const scenario = createScenario({
            projection: {
                minMonths: 0,
                likelyMonths: 0,
                maxMonths: 0,
                minMonthsPrecise: 0,
                likelyMonthsPrecise: 0,
                maxMonthsPrecise: 0,
                likelyMonthsComparable: 0,
                minDate: new Date("2026-06-01T12:00:00.000Z"),
                likelyDate: new Date("2026-06-01T12:00:00.000Z"),
                maxDate: new Date("2026-06-01T12:00:00.000Z"),
                canReach: false,
                unreachableReason: "Capacita insufficiente"
            },
            sustainability: {
                isSustainable: false,
                status: "unsafe",
                reason: "Margine negativo",
                safeBufferRequired: 10000,
                remainingBuffer: -5000
            }
        })

        render(
            <MonitorPlanCard
                scenario={scenario}
                savingsPercent={0}
                simulatedSurplus={0}
                monthsToGoal={null}
                hasInsufficientData={false}
                brainAssistApplied={false}
            />
        )

        expect(screen.getByText(/Capacita insufficiente/i)).toBeInTheDocument()
    })
})
