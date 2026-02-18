import { render } from "@testing-library/react"
import type { EChartsOption } from "echarts"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { TrendAnalysisCard } from "../components/trend-analysis-card"
import type { AIForecast, AISubscription } from "../use-ai-advisor"
import type { TrendDataItem } from "../use-trend-data"

const useTrendDataMock = vi.fn()
const useCurrencyMock = vi.fn()
const useSettingsMock = vi.fn()

type PremiumSectionMockProps = {
    option: EChartsOption
}

let lastPremiumProps: PremiumSectionMockProps | null = null

vi.mock("framer-motion", () => ({
    useReducedMotion: () => false
}))

vi.mock("../use-trend-data", () => ({
    useTrendData: () => useTrendDataMock(),
}))

vi.mock("@/features/settings/api/use-currency", () => ({
    useCurrency: () => useCurrencyMock(),
}))

vi.mock("@/features/settings/api/use-settings", () => ({
    useSettings: () => useSettingsMock(),
}))

vi.mock("@/domain/narration", () => ({
    deriveTrendState: () => "default",
    narrateTrend: () => ({ text: "Trend stabile." })
}))

vi.mock("@/features/dashboard/components/charts/premium-chart-section", () => ({
    PremiumChartSection: (props: PremiumSectionMockProps) => {
        lastPremiumProps = props
        return <div data-testid="trend-analysis-card" />
    }
}))

function getLastOption(): EChartsOption {
    expect(lastPremiumProps?.option).toBeDefined()
    return lastPremiumProps!.option
}

function getXAxisData(option: EChartsOption): string[] {
    const xAxis = option.xAxis as { data?: Array<string | number> }
    return (xAxis.data ?? []).map(String)
}

function getSeriesByName(option: EChartsOption, name: string): Record<string, unknown> | undefined {
    const series = (option.series ?? []) as Array<Record<string, unknown>>
    return series.find((item) => item.name === name)
}

function getTooltipFormatter(option: EChartsOption): (params: unknown) => string {
    const tooltip = option.tooltip as { formatter?: (params: unknown) => string }
    expect(typeof tooltip.formatter).toBe("function")
    return tooltip.formatter as (params: unknown) => string
}

function createTrendMonth(overrides: Partial<TrendDataItem>): TrendDataItem {
    return {
        month: "Feb",
        yearMonth: "2026-02",
        incomeCents: 120000,
        expensesCents: 90000,
        income: 1200,
        expenses: 900,
        hasTransactions: true,
        savingsRate: 25,
        savingsRateLabel: "25.0%",
        ...overrides
    }
}

function createForecast(overrides: Partial<AIForecast> = {}): AIForecast {
    return {
        baseBalanceCents: 500000,
        predictedRemainingCurrentMonthExpensesCents: 60000,
        predictedTotalEstimatedBalanceCents: 440000,
        primarySource: "brain",
        confidence: "high",
        ...overrides
    }
}

function createSubscription(overrides: Partial<AISubscription> = {}): AISubscription {
    return {
        id: "sub-1",
        description: "Streaming",
        amountCents: 1299,
        frequency: "monthly",
        occurrences: 3,
        lastChargeTimestamp: new Date(2026, 1, 10, 9, 0, 0, 0).getTime(),
        categoryId: "entertainment",
        categoryLabel: "Intrattenimento",
        charges: [],
        ...overrides
    }
}

describe("TrendAnalysisCard", () => {
    beforeEach(() => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date("2026-02-15T10:00:00.000Z"))
        useCurrencyMock.mockReturnValue({ currency: "EUR", locale: "it-IT" })
        useSettingsMock.mockReturnValue({ data: { theme: "light" } })
        useTrendDataMock.mockReturnValue({
            isLoading: false,
            data: [createTrendMonth({ month: "Feb", yearMonth: "2026-02", expenses: 900 })]
        })
        lastPremiumProps = null
    })

    afterEach(() => {
        vi.useRealTimers()
        vi.clearAllMocks()
    })

    it("escapes untrusted milestone description inside tooltip html", () => {
        const payload = "<img src=x onerror=alert(1)>"
        render(
            <TrendAnalysisCard
                advisorSubscriptions={[createSubscription({ description: payload })]}
            />
        )

        const option = getLastOption()
        const xAxisData = getXAxisData(option)
        const timelineKey = xAxisData.find((item) => item.includes("#"))
        expect(timelineKey).toBeDefined()

        const formatter = getTooltipFormatter(option)
        const html = formatter({
            name: timelineKey!,
            dataIndex: xAxisData.indexOf(timelineKey!),
            seriesName: "Prossimi addebiti",
            value: 0.08
        })

        expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;")
        expect(html).not.toContain(payload)
    })

    it("anchors projection to current month and disables it when current month is missing", () => {
        useTrendDataMock.mockReturnValueOnce({
            isLoading: false,
            data: [
                createTrendMonth({ month: "Gen", yearMonth: "2026-01", expenses: 800, income: 1400 }),
                createTrendMonth({ month: "Feb", yearMonth: "2026-02", expenses: 900, income: 1500 })
            ]
        })

        render(
            <TrendAnalysisCard
                advisorForecast={createForecast({ predictedRemainingCurrentMonthExpensesCents: 60000 })}
            />
        )

        const withCurrentMonthOption = getLastOption()
        const projectionSeries = getSeriesByName(withCurrentMonthOption, "Uscite stimate fine mese")
        expect(projectionSeries).toBeDefined()

        const withCurrentMonthXAxis = getXAxisData(withCurrentMonthOption)
        const febIndex = withCurrentMonthXAxis.indexOf("Feb")
        const projectionEndIndex = withCurrentMonthXAxis.indexOf("__projection_end__")
        const projectionData = (projectionSeries?.data ?? []) as Array<number | null>

        expect(febIndex).toBeGreaterThanOrEqual(0)
        expect(projectionEndIndex).toBeGreaterThanOrEqual(0)
        expect(projectionData[febIndex]).toBe(900)
        expect(projectionData[projectionEndIndex]).toBe(1500)

        useTrendDataMock.mockReturnValueOnce({
            isLoading: false,
            data: [
                createTrendMonth({ month: "Gen", yearMonth: "2026-01", expenses: 800, income: 1400 }),
                createTrendMonth({ month: "Feb", yearMonth: "2026-02", hasTransactions: false, income: 0, expenses: 0, incomeCents: 0, expensesCents: 0 })
            ]
        })

        render(
            <TrendAnalysisCard
                advisorForecast={createForecast({ predictedRemainingCurrentMonthExpensesCents: 60000 })}
            />
        )

        const missingCurrentMonthOption = getLastOption()
        expect(getSeriesByName(missingCurrentMonthOption, "Uscite stimate fine mese")).toBeUndefined()
        expect(getXAxisData(missingCurrentMonthOption)).not.toContain("__projection_end__")
    })

    it("orders future milestones by real timestamp", () => {
        render(
            <TrendAnalysisCard
                advisorForecast={createForecast({ predictedRemainingCurrentMonthExpensesCents: 60000 })}
                advisorSubscriptions={[
                    createSubscription({
                        id: "sub-early",
                        lastChargeTimestamp: new Date(2026, 0, 20, 9, 0, 0, 0).getTime()
                    }),
                    createSubscription({
                        id: "sub-late",
                        lastChargeTimestamp: new Date(2026, 1, 10, 9, 0, 0, 0).getTime()
                    })
                ]}
            />
        )

        const option = getLastOption()
        const xAxisData = getXAxisData(option)
        const dateFormatter = new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "short" })
        const firstTimelineKey = `${dateFormatter.format(new Date(2026, 1, 20))}#1`
        const secondTimelineKey = `${dateFormatter.format(new Date(2026, 2, 10))}#1`

        expect(xAxisData.indexOf(firstTimelineKey)).toBeGreaterThanOrEqual(0)
        expect(xAxisData.indexOf("__projection_end__")).toBeGreaterThanOrEqual(0)
        expect(xAxisData.indexOf(secondTimelineKey)).toBeGreaterThanOrEqual(0)
        expect(xAxisData.indexOf(firstTimelineKey)).toBeLessThan(xAxisData.indexOf("__projection_end__"))
        expect(xAxisData.indexOf("__projection_end__")).toBeLessThan(xAxisData.indexOf(secondTimelineKey))
    })

    it("clamps 31st monthly charges to the last valid day of target month", () => {
        render(
            <TrendAnalysisCard
                advisorSubscriptions={[
                    createSubscription({
                        id: "sub-31",
                        lastChargeTimestamp: new Date(2026, 0, 31, 9, 0, 0, 0).getTime()
                    })
                ]}
            />
        )

        const option = getLastOption()
        const xAxisData = getXAxisData(option)
        const dateFormatter = new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "short" })
        const feb28Key = `${dateFormatter.format(new Date(2026, 1, 28))}#1`
        const mar03Key = `${dateFormatter.format(new Date(2026, 2, 3))}#1`

        expect(xAxisData).toContain(feb28Key)
        expect(xAxisData).not.toContain(mar03Key)
    })
})
