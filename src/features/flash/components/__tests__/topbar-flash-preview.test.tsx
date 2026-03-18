import { fireEvent, render, screen, waitFor, waitForElementToBeRemoved } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { TopbarFlashPreview } from "../topbar-flash-preview"

const useDashboardSummaryMock = vi.fn()
const useSettingsMock = vi.fn()
const useCurrencyMock = vi.fn()
const usePrivacyStoreMock = vi.fn()

vi.mock("@/features/dashboard/api/use-dashboard", () => ({
    useDashboardSummary: () => useDashboardSummaryMock()
}))

vi.mock("@/features/settings/api/use-settings", () => ({
    useSettings: () => useSettingsMock()
}))

vi.mock("@/features/settings/api/use-currency", () => ({
    useCurrency: () => useCurrencyMock()
}))

vi.mock("@/features/privacy/privacy.store", () => ({
    usePrivacyStore: () => usePrivacyStoreMock()
}))

vi.mock("@/features/insights/utils", () => ({
    getCurrentPeriod: () => "2026-03"
}))

function renderPreview() {
    return render(
        <div data-testid="topbar-action-cluster">
            <TopbarFlashPreview />
        </div>
    )
}

describe("TopbarFlashPreview", () => {
    beforeEach(() => {
        useDashboardSummaryMock.mockReset()
        useSettingsMock.mockReset()
        useCurrencyMock.mockReset()
        usePrivacyStoreMock.mockReset()

        useDashboardSummaryMock.mockReturnValue({
            data: {
                totalIncomeCents: 100000,
                totalExpensesCents: 68000,
                netBalanceCents: 32000,
                uselessSpendPercent: 12,
            },
            isLoading: false,
        })
        useSettingsMock.mockReturnValue({
            data: { superfluousTargetPercent: 10 }
        })
        useCurrencyMock.mockReturnValue({
            currency: "EUR",
            locale: "it-IT"
        })
        usePrivacyStoreMock.mockReturnValue({
            isPrivacyMode: false
        })
    })

    it("mostra i tre KPI principali nella preview inline", async () => {
        renderPreview()

        fireEvent.click(screen.getByTestId("topbar-flash-trigger"))

        await waitFor(() => {
            expect(screen.getByTestId("topbar-flash-panel")).toBeInTheDocument()
        })

        expect(screen.getByText("Flash")).toBeInTheDocument()
        expect(screen.getByText("Saldo")).toBeInTheDocument()
        expect(screen.getByText("Pressione")).toBeInTheDocument()
        expect(screen.getByText("Superfluo")).toBeInTheDocument()
        expect(screen.getByTestId("topbar-flash-pressure")).toHaveTextContent("68%")
        expect(screen.getByTestId("topbar-flash-superfluous")).toHaveTextContent("12%")
        expect(screen.getByTestId("topbar-flash-balance")).not.toHaveTextContent("—")
    })

    it("rispetta la privacy globale sfocando i valori", async () => {
        usePrivacyStoreMock.mockReturnValue({
            isPrivacyMode: true
        })

        renderPreview()

        fireEvent.click(screen.getByTestId("topbar-flash-trigger"))

        await waitFor(() => {
            expect(screen.getByTestId("topbar-flash-panel")).toBeInTheDocument()
        })

        expect(screen.getByTestId("topbar-flash-balance").className).toContain("blur-sm")
        expect(screen.getByTestId("topbar-flash-pressure").className).toContain("blur-sm")
        expect(screen.getByTestId("topbar-flash-superfluous").className).toContain("blur-sm")
    })

    it("chiude la preview con Escape", async () => {
        renderPreview()

        const trigger = screen.getByTestId("topbar-flash-trigger")
        fireEvent.click(trigger)

        await waitFor(() => {
            expect(screen.getByTestId("topbar-flash-panel")).toBeInTheDocument()
        })

        fireEvent.keyDown(document, { key: "Escape" })

        await waitForElementToBeRemoved(() => screen.queryByTestId("topbar-flash-panel"))
        expect(trigger).toHaveAttribute("aria-expanded", "false")
    })
})
