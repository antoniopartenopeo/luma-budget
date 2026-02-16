import { render, screen } from "@testing-library/react"
import { describe, expect, test, vi } from "vitest"

import { GoalScenarioResult } from "@/VAULT/goals/types"

import { SimulatorResultsPanel } from "../simulator-results-panel"

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
            canReach: true,
            realtimeOverlayApplied: true,
            realtimeCapacityFactor: 0.9,
            realtimeWindowMonths: 3
        },
        sustainability: {
            isSustainable: true,
            status: "secure",
            reason: null,
            safeBufferRequired: 10000,
            remainingBuffer: 30000
        },
        simulatedExpenses: 150000,
        monthlyGoalCapacityCents: 16000,
        planBasis: "brain_overlay",
        ...overrides
    }
}

describe("SimulatorResultsPanel", () => {
    test("shows conversational breakdown with realtime correction", () => {
        render(
            <SimulatorResultsPanel
                scenario={createScenario()}
                simulatedSurplusBase={50000}
                simulatedSurplus={45000}
                realtimeCapacityFactor={0.9}
                goalMonthlyCapacityRealtime={13600}
                realtimeWindowMonths={3}
                savingsPercent={10}
                likelyMonthsForCopy={3.8}
                hasInsufficientData={false}
            />
        )

        expect(screen.getByText("Come nasce la quota")).toBeInTheDocument()
        expect(screen.getByText("Qui vedi, passo per passo, come arriviamo alla tua quota mensile.")).toBeInTheDocument()
        expect(screen.getByText("1) Margine base storico")).toBeInTheDocument()
        expect(screen.getByText("2) Correzione live (3 mesi)")).toBeInTheDocument()
        expect(screen.getByText("3) In pratica")).toBeInTheDocument()
        expect(screen.getByText("Tenuta del piano")).toBeInTheDocument()
        expect(screen.getByText("Molto solido")).toBeInTheDocument()
        expect(screen.getByText(/-50,00 €/i)).toBeInTheDocument()
        expect(screen.getByText(/Margine aggiornato:/i)).toBeInTheDocument()
        expect(screen.getByText(/450,00 €\/mese/i)).toBeInTheDocument()
        expect(screen.getAllByText(/136,00 €\/mese/i).length).toBeGreaterThan(0)
        expect(screen.queryByText(/Margine realtime \(primi/i)).not.toBeInTheDocument()
        expect(screen.queryByText("Quando arrivi")).not.toBeInTheDocument()
        expect(screen.queryByText("Sostenibilita")).not.toBeInTheDocument()
    })

    test("shows neutral realtime step when overlay is not active", () => {
        render(
            <SimulatorResultsPanel
                scenario={createScenario({
                    projection: {
                        ...createScenario().projection,
                        realtimeOverlayApplied: false,
                        realtimeCapacityFactor: 1,
                        realtimeWindowMonths: 0
                    }
                })}
                simulatedSurplusBase={50000}
                simulatedSurplus={50000}
                realtimeCapacityFactor={1}
                goalMonthlyCapacityRealtime={16000}
                realtimeWindowMonths={0}
                savingsPercent={10}
                likelyMonthsForCopy={3.8}
                hasInsufficientData={false}
            />
        )

        expect(screen.getByText("2) Correzione live")).toBeInTheDocument()
        expect(screen.getByText("Nessuna correzione live attiva: usiamo solo la base storica.")).toBeInTheDocument()
        expect(screen.getByText(/Margine aggiornato:/i)).toBeInTheDocument()
        expect(screen.queryByText(/2\) Correzione live \(3 mesi\)/i)).not.toBeInTheDocument()
        expect(screen.getByText("0,00 €")).toBeInTheDocument()
    })
})
