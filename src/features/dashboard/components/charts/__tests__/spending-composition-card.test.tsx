import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { CategorySummary } from "@/features/dashboard/api/types"
import { SpendingCompositionCard } from "../spending-composition-card"

vi.mock("@/features/settings/api/use-currency", () => ({
    useCurrency: () => ({ currency: "EUR", locale: "it-IT" })
}))

vi.mock("@/features/settings/api/use-settings", () => ({
    useSettings: () => ({ data: { theme: "light" } })
}))

vi.mock("../premium-chart-section", () => ({
    PremiumChartSection: ({ title, description, isLoading, hasData, children, showChart }: {
        title: string
        description?: string
        isLoading?: boolean
        hasData?: boolean
        children?: React.ReactNode
        showChart?: boolean
    }) => (
        <section>
            <h2>{title}</h2>
            <p>{description}</p>
            <div data-testid="chart-state">{isLoading ? "loading" : hasData ? "data" : "empty"}</div>
            <div data-testid="chart-visible">{showChart ? "visible" : "hidden"}</div>
            {children}
        </section>
    )
}))

const summaryFixture: CategorySummary[] = [
    { id: "affitto_mutuo", name: "Affitto o Mutuo", valueCents: 92000, value: 920, color: "#4f46e5" },
    { id: "cibo", name: "Spesa Alimentare", valueCents: 27500, value: 275, color: "#ea580c" },
    { id: "ristoranti", name: "Ristoranti & Take-away", valueCents: 18900, value: 189, color: "#f97316" },
    { id: "abbonamenti", name: "Streaming & Media", valueCents: 7600, value: 76, color: "#3b82f6" },
    { id: "trasporti", name: "Mezzi Pubblici", valueCents: 5400, value: 54, color: "#2563eb" },
    { id: "bar_caffe", name: "Bar & Caffetteria", valueCents: 3300, value: 33, color: "#f59e0b" }
]

describe("SpendingCompositionCard", () => {
    it("renders loading state", () => {
        render(
            <SpendingCompositionCard
                isLoading
                categoriesSummary={[]}
                periodLabel="Febbraio 2026"
            />
        )

        expect(screen.getByTestId("chart-state")).toHaveTextContent("loading")
    })

    it("renders empty state when no summary data is provided", () => {
        render(
            <SpendingCompositionCard
                isLoading={false}
                categoriesSummary={[]}
                periodLabel="Febbraio 2026"
            />
        )

        expect(screen.getByTestId("chart-state")).toHaveTextContent("empty")
    })

    it("renders complete legend and keeps values visible even with privacy mode enabled", () => {
        localStorage.setItem("numa-privacy-storage", JSON.stringify({ state: { isPrivacyMode: true }, version: 0 }))

        render(
            <SpendingCompositionCard
                isLoading={false}
                categoriesSummary={summaryFixture}
                periodLabel="Febbraio 2026"
            />
        )

        expect(screen.getByTestId("chart-state")).toHaveTextContent("data")
        expect(screen.getByText("Affitto o Mutuo")).toBeInTheDocument()
        expect(screen.getByText("Spesa Alimentare")).toBeInTheDocument()
        expect(screen.getByText("Ristoranti & Take-away")).toBeInTheDocument()
        expect(screen.getByText("Altri")).toBeInTheDocument()
        expect(screen.getByText(/920,00/)).toBeInTheDocument()
        expect(screen.getByText(/59\.47%/)).toBeInTheDocument()
        expect(screen.getByText(/Come si distribuiscono le spese in Febbraio 2026/)).toBeInTheDocument()
    })

    it("hides pie chart on mobile and keeps legend visible", () => {
        const originalWidth = window.innerWidth
        try {
            Object.defineProperty(window, "innerWidth", { value: 390, configurable: true })

            render(
                <SpendingCompositionCard
                    isLoading={false}
                    categoriesSummary={summaryFixture}
                    periodLabel="Febbraio 2026"
                />
            )

            expect(screen.getByTestId("chart-visible")).toHaveTextContent("hidden")
            expect(screen.getByText("Affitto o Mutuo")).toBeInTheDocument()
        } finally {
            Object.defineProperty(window, "innerWidth", { value: originalWidth, configurable: true })
        }
    })
})
