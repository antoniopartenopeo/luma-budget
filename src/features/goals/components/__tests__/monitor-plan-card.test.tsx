import { render, screen } from "@testing-library/react"
import { describe, expect, test, vi } from "vitest"

import { QuotaScenarioResult } from "@/VAULT/goals/types"

import { MonitorPlanCard } from "../monitor-plan-card"

vi.mock("@/features/settings/api/use-currency", () => ({
    useCurrency: () => ({
        currency: "EUR",
        locale: "it-IT"
    })
}))

function createScenario(overrides: Partial<QuotaScenarioResult> = {}): QuotaScenarioResult {
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
        simulatedExpenses: 150000,
        quota: {
            baseMonthlyMarginCents: 50000,
            realtimeMonthlyMarginCents: 47000,
            baseMonthlyCapacityCents: 14000,
            realtimeMonthlyCapacityCents: 13200,
            realtimeOverlayApplied: true,
            realtimeCapacityFactor: 0.94,
            realtimeWindowMonths: 3
        },
        planBasis: "historical",
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
                monthlyQuotaCents={50000}
                hasInsufficientData={false}
            />
        )

        expect(screen.getByText("Fonte Storico")).toBeInTheDocument()

        view.rerender(
            <MonitorPlanCard
                scenario={createScenario({ planBasis: "brain_overlay" })}
                savingsPercent={10}
                monthlyQuotaCents={50000}
                hasInsufficientData={false}
            />
        )

        expect(screen.getByText("Fonte Brain")).toBeInTheDocument()
    })

    test("renders critical sustainability message path", () => {
        const scenario = createScenario({
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
                monthlyQuotaCents={0}
                hasInsufficientData={false}
            />
        )

        expect(screen.getByText(/Quota non sostenibile/i)).toBeInTheDocument()
    })
})
