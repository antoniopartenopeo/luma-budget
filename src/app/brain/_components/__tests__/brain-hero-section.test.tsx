import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { BrainHeroSection } from "../brain-hero-section"

describe("BrainHeroSection", () => {
    it("renders an operational summary without the old chart surface", () => {
        render(
            <BrainHeroSection
                hwForecast={{
                    forecastCents: 200000,
                    trendCents: 22364,
                    seasonalAdjustmentCents: -30476,
                    levelCents: 180000,
                    confidenceIntervalCents: 184674,
                    dataPoints: 27,
                    method: "triple",
                }}
                currency="EUR"
                locale="it-IT"
                training={{
                    isTraining: false,
                    epoch: 0,
                    totalEpochs: 0,
                    progress: 0,
                    currentLoss: 0,
                    sampleCount: 0,
                    lastCompletedAt: null,
                }}
                isInitialized
                handleInitialize={() => {}}
                handleReset={() => {}}
                timeline={[
                    {
                        id: "event-1",
                        title: "Analisi completata",
                        detail: "Il Brain ha aggiornato la lettura del mese.",
                        at: new Date("2026-03-15T13:30:00.000Z").toISOString(),
                        tone: "positive",
                    },
                ]}
                formatClock={() => "13:30:00"}
                transactionsCount={581}
                categoriesCount={51}
                updatedAtLabel="15 mar 2026, 13:30"
                stageLabel="Attivo"
                stageSummary="Il Brain ha una base solida e continua ad aggiornarsi quando arrivano nuovi dati."
            />
        )

        expect(screen.getByText("Stato attuale")).toBeInTheDocument()
        expect(screen.getByText("Ritmo del mese")).toBeInTheDocument()
        expect(screen.getByText("Dati analizzati")).toBeInTheDocument()
        expect(screen.getByText("Azioni Brain")).toBeInTheDocument()
        expect(screen.getByText("Attività recenti")).toBeInTheDocument()
        expect(screen.queryByText("Core pronto")).not.toBeInTheDocument()
    })
})
