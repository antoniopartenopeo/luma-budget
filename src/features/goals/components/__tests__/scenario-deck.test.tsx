import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, test, vi } from "vitest"

import { QuotaScenarioResult } from "@/VAULT/goals/types"

import { ScenarioDeck } from "../scenario-deck"

vi.mock("@/features/settings/api/use-currency", () => ({
    useCurrency: () => ({
        currency: "EUR",
        locale: "it-IT"
    })
}))

function createScenario(partial: Partial<QuotaScenarioResult> & Pick<QuotaScenarioResult, "key">): QuotaScenarioResult {
    return {
        key: partial.key,
        config: partial.config || {
            type: partial.key === "aggressive" ? "aggressive" : partial.key === "balanced" ? "balanced" : "baseline",
            label: partial.key === "aggressive" ? "Aggressivo" : partial.key === "balanced" ? "Equilibrato" : "Nessun Ritmo",
            description: "Scenario test",
            applicationMap: {},
            savingsMap: { superfluous: 20, comfort: 5 },
            calibration: {
                elasticityIndex: 0.5,
                stabilityFactor: 0.9,
                volatilityCents: 12000
            }
        },
        sustainability: partial.sustainability || {
            isSustainable: true,
            status: "secure",
            reason: null,
            safeBufferRequired: 10000,
            remainingBuffer: 30000
        },
        simulatedExpenses: partial.simulatedExpenses ?? 140000,
        quota: partial.quota || {
            baseMonthlyMarginCents: 50000,
            realtimeMonthlyMarginCents: 48000,
            baseMonthlyCapacityCents: 14500,
            realtimeMonthlyCapacityCents: 13600,
            realtimeOverlayApplied: true,
            realtimeCapacityFactor: 0.94,
            realtimeWindowMonths: 3
        },
        planBasis: partial.planBasis ?? "historical"
    }
}

describe("ScenarioDeck", () => {
    test("renders quota as primary KPI in scenario cards", () => {
        const scenarios: QuotaScenarioResult[] = [
            createScenario({
                key: "baseline",
                quota: {
                    baseMonthlyMarginCents: 50000,
                    realtimeMonthlyMarginCents: 45000,
                    baseMonthlyCapacityCents: 15000,
                    realtimeMonthlyCapacityCents: 13600,
                    realtimeOverlayApplied: true,
                    realtimeCapacityFactor: 0.9,
                    realtimeWindowMonths: 3
                }
            }),
            createScenario({
                key: "balanced",
                quota: {
                    baseMonthlyMarginCents: 52000,
                    realtimeMonthlyMarginCents: 50000,
                    baseMonthlyCapacityCents: 16200,
                    realtimeMonthlyCapacityCents: 14900,
                    realtimeOverlayApplied: true,
                    realtimeCapacityFactor: 0.92,
                    realtimeWindowMonths: 3
                }
            }),
            createScenario({
                key: "aggressive",
                quota: {
                    baseMonthlyMarginCents: 54000,
                    realtimeMonthlyMarginCents: 52000,
                    baseMonthlyCapacityCents: 17100,
                    realtimeMonthlyCapacityCents: 15800,
                    realtimeOverlayApplied: true,
                    realtimeCapacityFactor: 0.92,
                    realtimeWindowMonths: 3
                }
            })
        ]

        render(
            <ScenarioDeck
                scenarios={scenarios}
                activeKey="baseline"
                onSelect={() => undefined}
            />
        )

        expect(screen.getAllByText(/136,00/i).length).toBeGreaterThan(0)
        expect(screen.getByText(/149,00/i)).toBeInTheDocument()
        expect(screen.getAllByText("/mese").length).toBeGreaterThan(0)
        expect(screen.getByText("Ogni scenario mostra la quota mensile sostenibile, non il saldo finale del mese.")).toBeInTheDocument()
        const baselineButton = screen.getByRole("button", { name: /Nessun Ritmo/i })
        expect(baselineButton).toBeInTheDocument()
        expect(screen.queryByTestId("scenario-step-baseline-margin")).not.toBeInTheDocument()
        expect(screen.queryByTestId("scenario-step-baseline-live")).not.toBeInTheDocument()
        expect(screen.queryByTestId("scenario-step-baseline-quota")).not.toBeInTheDocument()

        fireEvent.click(baselineButton)

        const marginStep = screen.getByTestId("scenario-step-baseline-margin")
        const liveStep = screen.getByTestId("scenario-step-baseline-live")
        const quotaStep = screen.getByTestId("scenario-step-baseline-quota")
        expect(marginStep.compareDocumentPosition(liveStep) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
        expect(liveStep.compareDocumentPosition(quotaStep) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
        expect(screen.getByText("Correzione live")).toBeInTheDocument()
        expect(screen.queryByText(/Correzione live \(\d+ mesi\)/i)).not.toBeInTheDocument()
        expect(screen.getAllByText(/Tenuta quota: Molto solida/i).length).toBeGreaterThan(0)
        expect(screen.queryByText(/Tempo stimato/i)).not.toBeInTheDocument()
        expect(screen.queryByText(/Quando puoi arrivare/i)).not.toBeInTheDocument()
        expect(screen.queryByText(/3\) In pratica/i)).not.toBeInTheDocument()
        expect(screen.queryByText("Personalizzato")).not.toBeInTheDocument()
        expect(screen.queryByText(/Apri configurazione/i)).not.toBeInTheDocument()
    })

    test("shows sustainability status label in each scenario card", () => {
        const scenario = createScenario({
            key: "baseline",
            sustainability: {
                isSustainable: true,
                status: "fragile",
                reason: null,
                safeBufferRequired: 10000,
                remainingBuffer: 3000
            }
        })

        render(
            <ScenarioDeck
                scenarios={[scenario]}
                activeKey="baseline"
                onSelect={() => undefined}
            />
        )

        expect(screen.getByText(/Tenuta quota: Delicata/i)).toBeInTheDocument()
    })

    test("shows coherent overlay audit copy when realtime overlay is disabled", () => {
        const scenario = createScenario({
            key: "baseline",
            planBasis: "historical",
            quota: {
                baseMonthlyMarginCents: 50000,
                realtimeMonthlyMarginCents: 50000,
                baseMonthlyCapacityCents: 14500,
                realtimeMonthlyCapacityCents: 14500,
                realtimeOverlayApplied: false,
                realtimeCapacityFactor: 1,
                realtimeWindowMonths: 0
            }
        })

        render(
            <ScenarioDeck
                scenarios={[scenario]}
                activeKey="baseline"
                onSelect={() => undefined}
            />
        )

        fireEvent.click(screen.getByRole("button", { name: /Vedi Audit Tecnico/i }))
        expect(screen.getByText("Nessun aggiornamento live attivo. Fonte Storico.")).toBeInTheDocument()
    })
})
