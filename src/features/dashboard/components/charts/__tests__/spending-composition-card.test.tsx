import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { CategorySummary } from "@/features/dashboard/api/types"
import { SpendingCompositionCard } from "../spending-composition-card"

vi.mock("@/features/settings/api/use-currency", () => ({
    useCurrency: () => ({ currency: "EUR", locale: "it-IT" })
}))

vi.mock("@/features/settings/api/use-settings", () => ({
    useSettings: () => ({ data: { theme: "light" } })
}))

vi.mock("@/components/patterns/macro-section", () => ({
    MacroSection: ({
        title,
        description,
        children
    }: {
        title?: React.ReactNode
        description?: React.ReactNode
        children: React.ReactNode
    }) => (
        <section>
            {title ? <h2>{title}</h2> : null}
            {description ? <p>{description}</p> : null}
            {children}
        </section>
    )
}))

vi.mock("@/features/categories/components/category-icon", () => ({
    CategoryIcon: ({
        categoryId,
        categoryName
    }: {
        categoryId?: string
        categoryName?: string
    }) => (
        <div data-testid={`category-icon-${categoryId ?? categoryName}`}>
            {categoryId ?? categoryName}
        </div>
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

const noColorSummaryFixture: CategorySummary[] = [
    { id: "affitto_mutuo", name: "Affitto o Mutuo", valueCents: 92000, value: 920, color: "#4f46e5" },
    { id: "cibo", name: "Spesa Alimentare", valueCents: 27500, value: 275, color: "" },
    { id: "ristoranti", name: "Ristoranti & Take-away", valueCents: 18900, value: 189, color: "" },
    { id: "abbonamenti", name: "Streaming & Media", valueCents: 7600, value: 76, color: "" },
    { id: "trasporti", name: "Mezzi Pubblici", valueCents: 5400, value: 54, color: "" },
    { id: "bar_caffe", name: "Bar & Caffetteria", valueCents: 3300, value: 33, color: "" }
]

function createRect(top: number, left = 120, width = 240, height = 152): DOMRect {
    return {
        x: left,
        y: top,
        top,
        left,
        width,
        height,
        right: left + width,
        bottom: top + height,
        toJSON: () => ({})
    } as DOMRect
}

describe("SpendingCompositionCard", () => {
    it("renders loading state copy", () => {
        render(
            <SpendingCompositionCard
                isLoading
                categoriesSummary={[]}
                periodLabel="Febbraio 2026"
            />
        )

        expect(screen.getByText("Distribuzione Risorse")).toBeInTheDocument()
        expect(screen.getByText("Sto preparando la composizione del periodo...")).toBeInTheDocument()
    })

    it("renders empty state when no summary data is provided", () => {
        render(
            <SpendingCompositionCard
                isLoading={false}
                categoriesSummary={[]}
                periodLabel="Febbraio 2026"
            />
        )

        expect(screen.getByText("Nessun dato")).toBeInTheDocument()
        expect(screen.getByText("Qui vedrai la distribuzione delle spese appena saranno disponibili.")).toBeInTheDocument()
    })

    it("renders 3d category cards with grouped remainder and fallback subtitle", () => {
        render(
            <SpendingCompositionCard
                isLoading={false}
                categoriesSummary={summaryFixture}
            />
        )

        expect(screen.getByText("Come si distribuiscono le spese nel periodo selezionato.")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: /Affitto o Mutuo/i })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: /Spesa Alimentare/i })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: /Ristoranti & Take-away/i })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: /Altri/i })).toBeInTheDocument()
    })

    it("keeps values and icons hidden until the card is activated", async () => {
        render(
            <SpendingCompositionCard
                isLoading={false}
                categoriesSummary={summaryFixture}
                periodLabel="Febbraio 2026"
            />
        )

        const foodTile = screen.getByRole("button", { name: /Spesa Alimentare/i })

        expect(screen.queryByText(/275,00/)).not.toBeInTheDocument()
        expect(screen.queryByTestId("category-icon-cibo")).not.toBeInTheDocument()

        fireEvent.mouseEnter(foodTile)

        expect(screen.getByText(/275,00/)).toBeInTheDocument()
        expect(screen.getByTestId("category-icon-cibo")).toBeInTheDocument()
        expect(screen.getAllByText("18%").length).toBeGreaterThan(1)

        fireEvent.pointerMove(window, { clientX: 0, clientY: 0 })

        await waitFor(() => {
            expect(screen.queryByText(/275,00/)).not.toBeInTheDocument()
            expect(screen.queryByTestId("category-icon-cibo")).not.toBeInTheDocument()
        })
    })

    it("pins the active card on click and toggles it off on second click", async () => {
        render(
            <SpendingCompositionCard
                isLoading={false}
                categoriesSummary={summaryFixture}
                periodLabel="Febbraio 2026"
            />
        )

        const rentTile = screen.getByRole("button", { name: /Affitto o Mutuo/i })

        fireEvent.click(rentTile)
        expect(screen.getByText(/920,00/)).toBeInTheDocument()
        expect(rentTile).toHaveAttribute("aria-pressed", "true")
        expect(screen.getAllByText("59%").length).toBeGreaterThan(1)

        fireEvent.mouseLeave(rentTile)
        expect(screen.getByText(/920,00/)).toBeInTheDocument()

        fireEvent.click(rentTile)
        await waitFor(() => {
            expect(screen.queryByText(/920,00/)).not.toBeInTheDocument()
            expect(rentTile).toHaveAttribute("aria-pressed", "false")
        })
    })

    it("uses fallback colors when a category color is missing", () => {
        render(
            <SpendingCompositionCard
                isLoading={false}
                categoriesSummary={noColorSummaryFixture}
                periodLabel="Febbraio 2026"
            />
        )

        const foodTile = screen.getByRole("button", { name: /Spesa Alimentare/i })

        expect(foodTile.getAttribute("style")).toContain("rgba(99, 102, 241, 0.26)")
    })

    it("keeps the opened card anchored to its tile while the page scrolls", async () => {
        render(
            <SpendingCompositionCard
                isLoading={false}
                categoriesSummary={summaryFixture}
                periodLabel="Febbraio 2026"
            />
        )

        const foodTile = screen.getByRole("button", { name: /Spesa Alimentare/i })
        let currentTop = 220

        vi.spyOn(foodTile, "getBoundingClientRect").mockImplementation(() => createRect(currentTop))

        fireEvent.mouseEnter(foodTile, { clientX: 250, clientY: 280 })

        const overlay = await screen.findByTestId("spending-composition-overlay")
        const initialTop = overlay.style.top

        currentTop = 140
        fireEvent.scroll(window)

        await waitFor(() => {
            expect(screen.getByTestId("spending-composition-overlay").style.top).not.toBe(initialTop)
        })
    })
})
