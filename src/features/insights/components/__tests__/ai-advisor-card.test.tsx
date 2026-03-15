import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AIAdvisorCard } from "../ai-advisor-card"

const useAIAdvisorMock = vi.fn()
const useCurrencyMock = vi.fn()

vi.mock("../../use-ai-advisor", () => ({
    useAIAdvisor: () => useAIAdvisorMock(),
}))

vi.mock("@/features/settings/api/use-currency", () => ({
    useCurrency: () => useCurrencyMock(),
}))

describe("AIAdvisorCard", () => {
    beforeEach(() => {
        useCurrencyMock.mockReturnValue({
            currency: "EUR",
            locale: "it-IT",
        })

        useAIAdvisorMock.mockReturnValue({
            isLoading: false,
            facts: {
                baseBalanceCents: 500000,
                predictedRemainingCurrentMonthExpensesCents: 125000,
                predictedTotalEstimatedBalanceCents: 375000,
                primarySource: "brain" as const,
                historicalMonthsCount: 3,
                subscriptionCount: 0,
                subscriptionTotalYearlyCents: 0,
            },
            forecast: {
                baseBalanceCents: 500000,
                predictedRemainingCurrentMonthExpensesCents: 125000,
                predictedTotalEstimatedBalanceCents: 375000,
                primarySource: "brain" as const,
                confidence: "high" as const,
            },
            subscriptions: [],
        })
    })

    it("renders saldo totale stimato as primary metric with brain source badge", () => {
        render(<AIAdvisorCard />)

        expect(screen.getByText("Saldo totale stimato")).toBeInTheDocument()
        expect(screen.getByText("Fonte Brain")).toBeInTheDocument()
        expect(screen.getByText("Saldo base totale meno spesa residua stimata del mese.")).toBeInTheDocument()
        expect(
            screen.getByText((text) => text.includes("3.750") || text.includes("3750"))
        ).toBeInTheDocument()
    })
})
