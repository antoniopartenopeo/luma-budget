import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import type { DashboardCardUsage } from "@/features/dashboard/api/types"
import { UsedCardsKpiDeck } from "../used-cards-kpi-deck"

const cardsFixture: DashboardCardUsage[] = [
    {
        cardId: "mastercard_7298",
        last4: "7298",
        network: "Mastercard",
        walletProvider: "Apple Pay",
        firstSeen: "2026-01-10T10:00:00.000Z",
        lastSeen: "2026-02-18T10:00:00.000Z",
        status: "active",
        confidence: "high"
    },
    {
        cardId: "visa_1122",
        last4: "1122",
        network: "Visa",
        walletProvider: "Unknown",
        firstSeen: "2025-10-12T10:00:00.000Z",
        lastSeen: "2025-11-15T10:00:00.000Z",
        status: "stale",
        confidence: "medium"
    }
]

describe("UsedCardsKpiDeck", () => {
    it("renders loading skeletons with card aspect ratio", () => {
        render(<UsedCardsKpiDeck cards={[]} isLoading />)

        const skeletons = screen.getAllByTestId("used-cards-skeleton")
        expect(skeletons).toHaveLength(2)
        expect(skeletons[0]).toHaveClass("aspect-[1.586]")
    })

    it("renders empty state", () => {
        render(<UsedCardsKpiDeck cards={[]} />)

        expect(screen.getByText("Nessuna carta rilevata nel periodo selezionato.")).toBeInTheDocument()
    })

    it("renders cards with wallet chip and status labels", () => {
        render(<UsedCardsKpiDeck cards={cardsFixture} />)

        expect(screen.getAllByText("Mastercard").length).toBeGreaterThan(0)
        expect(screen.getAllByText("Visa").length).toBeGreaterThan(0)
        expect(screen.getAllByText("Apple Pay").length).toBeGreaterThan(0)
        expect(screen.getAllByText("Attiva").length).toBeGreaterThan(0)
        expect(screen.getAllByText("Non recente").length).toBeGreaterThan(0)
        expect(screen.getByText("2 rilevate")).toBeInTheDocument()
    })

    it("applies privacy blur to masked last4", () => {
        render(<UsedCardsKpiDeck cards={cardsFixture.slice(0, 1)} isPrivacyMode />)

        const last4 = screen.getAllByTestId("used-card-last4-mastercard_7298")
        expect(last4.length).toBeGreaterThan(0)
        last4.forEach((node) => {
            expect(node).toHaveClass("blur-md")
        })
    })
})
