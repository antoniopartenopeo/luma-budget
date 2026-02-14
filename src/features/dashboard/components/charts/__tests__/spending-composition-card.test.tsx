import { act, render, screen } from "@testing-library/react"
import type { EChartsOption, PieSeriesOption, SeriesOption } from "echarts"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { CategorySummary } from "@/features/dashboard/api/types"
import { SYNTHETIC_ALTRI_ID } from "@/features/dashboard/utils/spending-composition"
import { SpendingCompositionCard } from "../spending-composition-card"

const settingsState = {
    theme: "light" as "light" | "dark" | "system"
}

vi.mock("@/features/settings/api/use-currency", () => ({
    useCurrency: () => ({ currency: "EUR", locale: "it-IT" })
}))

vi.mock("@/features/settings/api/use-settings", () => ({
    useSettings: () => ({ data: { theme: settingsState.theme } })
}))

type PremiumSectionMockProps = {
    title: string
    description?: string
    option: EChartsOption
    isLoading?: boolean
    hasData?: boolean
    children?: React.ReactNode
    showChart?: boolean
    onEvents?: Record<string, (params: unknown) => void>
}

let lastPremiumProps: PremiumSectionMockProps | null = null

vi.mock("../premium-chart-section", () => ({
    PremiumChartSection: (props: PremiumSectionMockProps) => {
        lastPremiumProps = props

        return (
            <section>
                <h2>{props.title}</h2>
                <p>{props.description}</p>
                <div data-testid="chart-state">{props.isLoading ? "loading" : props.hasData ? "data" : "empty"}</div>
                <div data-testid="chart-visible">{props.showChart ? "visible" : "hidden"}</div>
                {props.children}
            </section>
        )
    }
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

const reorderedSummaryFixture: CategorySummary[] = [
    { id: "affitto_mutuo", name: "Affitto o Mutuo", valueCents: 92000, value: 920, color: "#4f46e5" },
    { id: "cibo", name: "Spesa Alimentare", valueCents: 27500, value: 275, color: "#ea580c" },
    { id: "ristoranti", name: "Ristoranti & Take-away", valueCents: 18900, value: 189, color: "#f97316" },
    { id: "abbonamenti", name: "Streaming & Media", valueCents: 7600, value: 76, color: "#3b82f6" },
    { id: "trasporti", name: "Mezzi Pubblici", valueCents: 40500, value: 405, color: "#2563eb" },
    { id: "bar_caffe", name: "Bar & Caffetteria", valueCents: 3300, value: 33, color: "#f59e0b" }
]

function getLastOption(): EChartsOption {
    expect(lastPremiumProps?.option).toBeDefined()
    return lastPremiumProps!.option
}

function getPieSeries(option: EChartsOption): PieSeriesOption {
    const series = option.series as SeriesOption[]
    return series[0] as PieSeriesOption
}

function getConnectorSeries(option: EChartsOption): Record<string, unknown> {
    const series = option.series as SeriesOption[]
    return series[1] as unknown as Record<string, unknown>
}

describe("SpendingCompositionCard", () => {
    let originalMatchMedia: typeof window.matchMedia | undefined

    beforeEach(() => {
        settingsState.theme = "light"
        localStorage.clear()
        lastPremiumProps = null
        originalMatchMedia = window.matchMedia
    })

    afterEach(() => {
        if (originalMatchMedia) {
            window.matchMedia = originalMatchMedia
        }
    })

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

    it("uses fallback subtitle when period label is missing", () => {
        render(
            <SpendingCompositionCard
                isLoading={false}
                categoriesSummary={summaryFixture}
            />
        )

        expect(screen.getByText("Come si distribuiscono le spese nel periodo selezionato.")).toBeInTheDocument()
    })

    it("builds desktop-only pie option and color fallbacks for empty category colors", () => {
        render(
            <SpendingCompositionCard
                isLoading={false}
                categoriesSummary={noColorSummaryFixture}
                periodLabel="Febbraio 2026"
            />
        )

        const option = getLastOption()
        const pieSeries = getPieSeries(option)
        const pieData = pieSeries.data as Array<Record<string, unknown>>
        const syntheticSlice = pieData.find((datum) => datum.id === SYNTHETIC_ALTRI_ID)
        const firstNonSynthetic = pieData.find((datum) => datum.id === "cibo")
        const firstNonSyntheticGradient = (firstNonSynthetic?.itemStyle as {
            color: { colorStops: Array<{ color: string }> }
        }).color
        const syntheticGradient = (syntheticSlice?.itemStyle as {
            color: { colorStops: Array<{ color: string }> }
        }).color

        expect(option.tooltip).toMatchObject({
            show: false,
            trigger: "none"
        })
        expect(pieSeries.radius).toEqual(["47%", "68%"])
        expect(pieSeries.center).toEqual(["50%", "43%"])
        expect(pieSeries.labelLine).toMatchObject({ length: 13, length2: 12 })
        expect(firstNonSyntheticGradient.colorStops[0].color).toBe("#6366f1")
        expect(syntheticGradient.colorStops[0].color).toBe("#94a3b8")
    })

    it("adapts pie text colors for system dark theme", () => {
        settingsState.theme = "system"
        Object.defineProperty(window, "matchMedia", {
            configurable: true,
            writable: true,
            value: vi.fn().mockImplementation((query: string) => ({
                matches: query.includes("prefers-color-scheme: dark"),
                media: query,
                onchange: null,
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                addListener: vi.fn(),
                removeListener: vi.fn(),
                dispatchEvent: vi.fn()
            }))
        })

        render(
            <SpendingCompositionCard
                isLoading={false}
                categoriesSummary={summaryFixture}
                periodLabel="Febbraio 2026"
            />
        )

        const option = getLastOption()
        const pieSeries = getPieSeries(option)
        const richText = (pieSeries.label as Record<string, unknown>).rich as Record<string, Record<string, unknown>>

        expect(pieSeries.itemStyle).toMatchObject({
            borderColor: "rgba(15, 23, 42, 0.9)"
        })
        expect(richText.value).toMatchObject({
            color: "#f8fafc"
        })
    })

    it("reacts live to OS theme changes when theme is system", () => {
        settingsState.theme = "system"
        let changeListener: ((event: MediaQueryListEvent) => void) | null = null
        const addEventListenerSpy = vi.fn((event: string, listener: (event: MediaQueryListEvent) => void) => {
            if (event === "change") {
                changeListener = listener
            }
        })
        const removeEventListenerSpy = vi.fn()

        Object.defineProperty(window, "matchMedia", {
            configurable: true,
            writable: true,
            value: vi.fn().mockImplementation((query: string) => ({
                matches: false,
                media: query,
                onchange: null,
                addEventListener: addEventListenerSpy,
                removeEventListener: removeEventListenerSpy,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                dispatchEvent: vi.fn()
            }))
        })

        const { unmount } = render(
            <SpendingCompositionCard
                isLoading={false}
                categoriesSummary={summaryFixture}
                periodLabel="Febbraio 2026"
            />
        )

        const lightOption = getLastOption()
        expect(getPieSeries(lightOption).itemStyle).toMatchObject({
            borderColor: "rgba(248, 250, 252, 0.95)"
        })

        act(() => {
            changeListener?.({ matches: true } as MediaQueryListEvent)
        })

        const darkOption = getLastOption()
        expect(getPieSeries(darkOption).itemStyle).toMatchObject({
            borderColor: "rgba(15, 23, 42, 0.9)"
        })

        unmount()
        expect(addEventListenerSpy).toHaveBeenCalledWith("change", expect.any(Function))
        expect(removeEventListenerSpy).toHaveBeenCalledWith("change", expect.any(Function))
    })

    it("animates connector line only for hovered slices and resets on downplay/globalout", () => {
        render(
            <SpendingCompositionCard
                isLoading={false}
                categoriesSummary={summaryFixture}
                periodLabel="Febbraio 2026"
            />
        )

        const initialOption = getLastOption()
        const initialConnectorSeries = getConnectorSeries(initialOption)

        expect(initialConnectorSeries.data).toEqual([])

        act(() => {
            lastPremiumProps?.onEvents?.mouseover?.({ seriesType: "pie", dataIndex: 1 })
        })

        const hoveredOption = getLastOption()
        const hoveredConnectorSeries = getConnectorSeries(hoveredOption)

        expect(hoveredConnectorSeries.data).toEqual([{ dataIndex: 1, color: "#ea580c" }])

        act(() => {
            lastPremiumProps?.onEvents?.downplay?.({ seriesType: "pie" })
        })

        const downplayedOption = getLastOption()
        expect(getConnectorSeries(downplayedOption).data).toEqual([])

        act(() => {
            lastPremiumProps?.onEvents?.highlight?.({ seriesType: "pie", dataIndex: 0 })
        })

        const highlightedOption = getLastOption()
        expect(getConnectorSeries(highlightedOption).data).toEqual([{ dataIndex: 0, color: "#4f46e5" }])

        act(() => {
            lastPremiumProps?.onEvents?.globalout?.({})
        })

        const globalOutOption = getLastOption()
        expect(getConnectorSeries(globalOutOption).data).toEqual([])
    })

    it("keeps hover focus stable when chart data reorder changes slice indexes", () => {
        const { rerender } = render(
            <SpendingCompositionCard
                isLoading={false}
                categoriesSummary={summaryFixture}
                periodLabel="Febbraio 2026"
            />
        )

        act(() => {
            lastPremiumProps?.onEvents?.mouseover?.({ seriesType: "pie", dataIndex: 4 })
        })

        expect(getConnectorSeries(getLastOption()).data).toEqual([{ dataIndex: 4, color: "#2563eb" }])

        rerender(
            <SpendingCompositionCard
                isLoading={false}
                categoriesSummary={reorderedSummaryFixture}
                periodLabel="Febbraio 2026"
            />
        )

        expect(getConnectorSeries(getLastOption()).data).toEqual([{ dataIndex: 1, color: "#2563eb" }])
    })

    it("updates connector geometry only when label layout points are available", () => {
        render(
            <SpendingCompositionCard
                isLoading={false}
                categoriesSummary={summaryFixture}
                periodLabel="Febbraio 2026"
            />
        )

        act(() => {
            lastPremiumProps?.onEvents?.mouseover?.({ seriesType: "pie", dataIndex: 0 })
        })

        const hoveredOption = getLastOption()
        const pieSeries = getPieSeries(hoveredOption)
        const connectorSeries = getConnectorSeries(hoveredOption)
        const labelLayout = pieSeries.labelLayout as ((params: unknown) => { hideOverlap: boolean })
        const renderItem = connectorSeries.renderItem as (() => unknown)

        expect(renderItem()).toBeNull()
        expect(labelLayout({
            dataIndex: 0,
            labelLinePoints: [[1, 2], [3, 4], [5, 6], [7, 8]]
        })).toEqual({ hideOverlap: true })

        const renderedConnector = renderItem() as {
            type: string
            children: Array<{ type?: string; shape?: { points?: number[][] } }>
        }
        const markerCount = renderedConnector.children.filter((child) => child.type === "circle").length

        expect(renderedConnector.type).toBe("group")
        expect(markerCount).toBe(1)
        expect(renderedConnector.children[0].shape?.points).toEqual([[1, 2], [3, 4], [5, 6]])

        labelLayout({ dataIndex: 0, labelLinePoints: [] })
        expect(renderItem()).toBeNull()
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
