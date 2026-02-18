"use client"

import { useMemo } from "react"
import { useReducedMotion } from "framer-motion"
import { PremiumChartSection } from "@/features/dashboard/components/charts/premium-chart-section"
import { useSettings } from "@/features/settings/api/use-settings"
import { useTrendData } from "../use-trend-data"
import { useCurrency } from "@/features/settings/api/use-currency"
import { formatEuroNumber } from "@/domain/money"
import { narrateTrend, deriveTrendState, type TrendFacts, type OrchestrationContext } from "@/domain/narration"
import { SUBSCRIPTION_ACTIVE_WINDOW_DAYS } from "../subscription-detection"
import type { AIForecast, AISubscription } from "../use-ai-advisor"
import type { EChartsOption } from "echarts"

interface TrendAnalysisCardProps {
    hasHighSeverityCurrentIssue?: boolean
    advisorForecast?: AIForecast | null
    advisorSubscriptions?: AISubscription[]
}

interface TrendProjectionState {
    enabled: boolean
    sourceLabel: "Brain" | "Storico"
    remainingExpenses: number
    projectedEndExpenses: number
}

interface UpcomingChargeMilestone {
    axisKey: string
    axisLabel: string
    description: string
    amountCents: number
    daysUntilCharge: number
}

const DAY_MS = 24 * 60 * 60 * 1000
const TIMELINE_MAX_ITEMS = 5

function estimateNextMonthlyCharge(lastChargeTimestamp: number, now: Date): Date {
    const nextCharge = new Date(lastChargeTimestamp)
    nextCharge.setHours(0, 0, 0, 0)

    let guard = 0
    while (nextCharge.getTime() < now.getTime() && guard < 24) {
        nextCharge.setMonth(nextCharge.getMonth() + 1)
        guard += 1
    }

    return nextCharge
}

function formatDueLabel(daysUntilCharge: number): string {
    if (daysUntilCharge <= 0) return "oggi"
    if (daysUntilCharge === 1) return "tra 1 giorno"
    return `tra ${daysUntilCharge} giorni`
}

export function TrendAnalysisCard({
    hasHighSeverityCurrentIssue = false,
    advisorForecast = null,
    advisorSubscriptions = [],
}: TrendAnalysisCardProps) {
    const { data, isLoading } = useTrendData()
    const prefersReducedMotion = useReducedMotion()
    const { currency, locale } = useCurrency()
    const { data: settings } = useSettings()
    const isDarkMode = settings?.theme === "dark" || (settings?.theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches)
    const activeData = useMemo(() => data.filter((item) => item.hasTransactions), [data])

    const chartStatus = useMemo(() => {
        if (activeData.length < 3) return "default"
        const last3 = activeData.slice(-3)
        const avgSavingsRate = last3.reduce((sum, d) => sum + d.savingsRate, 0) / 3

        if (avgSavingsRate < 0) return "critical"
        if (avgSavingsRate < 10) return "warning"
        return "default"
    }, [activeData])

    const milestones = useMemo(() => {
        if (data.length === 0 || activeData.length === 0) return { bestIndex: -1 }
        let bestIdx = 0

        data.forEach((d, i) => {
            if (!d.hasTransactions) return
            if (!data[bestIdx].hasTransactions || d.savingsRate > data[bestIdx].savingsRate) bestIdx = i
        })

        return { bestIndex: bestIdx }
    }, [activeData, data])

    const trendNarration = useMemo(() => {
        if (activeData.length < 2) return null

        const current = activeData[activeData.length - 1]
        const previous = activeData[activeData.length - 2]

        const facts: TrendFacts = {
            metricType: "savings_rate",
            metricId: "savings_rate",
            currentValueFormatted: current.savingsRateLabel,
            savingsRateValue: current.savingsRate / 100,
            isSavingsRateNegative: current.savingsRate < 0,
            changePercent: current.savingsRate - previous.savingsRate,
            direction: current.savingsRate > previous.savingsRate ? "up" :
                current.savingsRate < previous.savingsRate ? "down" : "flat"
        }

        const state = deriveTrendState(facts)
        const context: OrchestrationContext | undefined = hasHighSeverityCurrentIssue
            ? { hasHighSeverityCurrentIssue: true }
            : undefined
        return narrateTrend(facts, state, context).text
    }, [activeData, hasHighSeverityCurrentIssue])

    const projection = useMemo<TrendProjectionState>(() => {
        if (!advisorForecast || activeData.length === 0) {
            return {
                enabled: false,
                sourceLabel: "Storico",
                remainingExpenses: 0,
                projectedEndExpenses: 0,
            }
        }

        const currentMonth = activeData[activeData.length - 1]
        const remainingExpenses = Math.max(0, advisorForecast.predictedRemainingCurrentMonthExpensesCents / 100)
        const projectedEndExpenses = Math.max(
            currentMonth.expenses,
            currentMonth.expenses + remainingExpenses
        )

        return {
            enabled: Number.isFinite(projectedEndExpenses),
            sourceLabel: advisorForecast.primarySource === "brain" ? "Brain" : "Storico",
            remainingExpenses,
            projectedEndExpenses,
        }
    }, [advisorForecast, activeData])

    const upcomingChargeMilestones = useMemo<UpcomingChargeMilestone[]>(() => {
        if (advisorSubscriptions.length === 0) return []

        const now = new Date()
        const windowEndTs = now.getTime() + (SUBSCRIPTION_ACTIVE_WINDOW_DAYS * DAY_MS)
        const dateFormatter = new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short" })
        const labelCountByDate = new Map<string, number>()

        return advisorSubscriptions
            .map((subscription) => {
                const nextChargeDate = estimateNextMonthlyCharge(subscription.lastChargeTimestamp, now)
                const daysUntilCharge = Math.max(0, Math.ceil((nextChargeDate.getTime() - now.getTime()) / DAY_MS))
                return {
                    nextChargeDate,
                    description: subscription.description,
                    amountCents: subscription.amountCents,
                    daysUntilCharge
                }
            })
            .filter((item) => item.nextChargeDate.getTime() <= windowEndTs)
            .sort((a, b) => {
                if (a.nextChargeDate.getTime() !== b.nextChargeDate.getTime()) {
                    return a.nextChargeDate.getTime() - b.nextChargeDate.getTime()
                }
                return b.amountCents - a.amountCents
            })
            .slice(0, TIMELINE_MAX_ITEMS)
            .map((item) => {
                const baseDateLabel = dateFormatter.format(item.nextChargeDate)
                const sequence = (labelCountByDate.get(baseDateLabel) || 0) + 1
                labelCountByDate.set(baseDateLabel, sequence)
                const axisKey = `${baseDateLabel}#${sequence}`
                const axisLabel = sequence === 1 ? baseDateLabel : `${baseDateLabel}*`

                return {
                    axisKey,
                    axisLabel,
                    description: item.description,
                    amountCents: item.amountCents,
                    daysUntilCharge: item.daysUntilCharge
                }
            })
    }, [advisorSubscriptions, locale])

    const option = useMemo<EChartsOption>(() => {
        if (!activeData.length) return {}

        const baseMonths = activeData.map((d) => d.month)
        const timelineAxisKeys = upcomingChargeMilestones.map((item) => item.axisKey)
        const hasTimelineMilestones = timelineAxisKeys.length > 0
        const axisLabelByKey = new Map<string, string>(upcomingChargeMilestones.map((item) => [item.axisKey, item.axisLabel]))
        const xAxisData = [
            ...baseMonths,
            ...(projection.enabled ? ["Fine mese"] : []),
            ...timelineAxisKeys
        ]

        const incomeSeriesData: Array<number | null> = activeData.map((d) => d.income)
        const expensesSeriesData: Array<number | null> = activeData.map((d) => d.expenses)
        const trailingSlots = (projection.enabled ? 1 : 0) + timelineAxisKeys.length
        for (let index = 0; index < trailingSlots; index += 1) {
            incomeSeriesData.push(null)
            expensesSeriesData.push(null)
        }

        const projectionSeriesData: Array<number | null> = xAxisData.map(() => null)
        if (projection.enabled) {
            projectionSeriesData[activeData.length - 1] = activeData[activeData.length - 1].expenses
            projectionSeriesData[activeData.length] = projection.projectedEndExpenses
        }

        const timelineSeriesData: Array<number | null> = xAxisData.map(() => null)
        if (hasTimelineMilestones) {
            const timelineStartIndex = xAxisData.length - timelineAxisKeys.length
            upcomingChargeMilestones.forEach((_, index) => {
                timelineSeriesData[timelineStartIndex + index] = 0.08
            })
        }

        const legendData = [
            "Entrate",
            "Uscite",
            ...(projection.enabled ? ["Uscite stimate fine mese"] : []),
            ...(hasTimelineMilestones ? ["Prossimi addebiti"] : [])
        ]
        const timelineMilestoneByAxisKey = new Map(
            upcomingChargeMilestones.map((item) => [item.axisKey, item] as const)
        )

        const buildLinearGradient = (startColor: string, endColor: string) => ({
            type: "linear" as const,
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
                { offset: 0, color: startColor },
                { offset: 1, color: endColor }
            ]
        })

        return {
            backgroundColor: "transparent",
            animation: !prefersReducedMotion,
            animationDuration: prefersReducedMotion ? 0 : 900,
            animationDurationUpdate: prefersReducedMotion ? 0 : 400,
            animationEasing: "cubicOut",
            tooltip: {
                trigger: "axis",
                axisPointer: {
                    type: "shadow",
                    shadowStyle: {
                        color: isDarkMode ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)"
                    },
                    label: {
                        show: false,
                        backgroundColor: isDarkMode ? "#1e293b" : "#f8fafc",
                        color: isDarkMode ? "#f8fafc" : "#1e293b",
                        padding: [4, 8],
                        borderRadius: 4,
                        fontSize: 10,
                        fontWeight: "bold"
                    }
                },
                backgroundColor: isDarkMode ? "rgba(15, 23, 42, 0.9)" : "rgba(255, 255, 255, 0.95)",
                borderColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
                borderWidth: 1,
                padding: [12, 16],
                textStyle: { color: isDarkMode ? "#f8fafc" : "#1e293b", fontSize: 13 },
                extraCssText: "box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.25); border-radius: 12px; backdrop-filter: blur(8px);",
                formatter: (params: unknown) => {
                    const rows = (Array.isArray(params) ? params : [params]) as Array<{
                        name: string
                        value: unknown
                        dataIndex: number
                        seriesName: string
                    }>

                    if (rows.length === 0) return ""

                    const index = rows[0].dataIndex
                    const title = rows[0].name || xAxisData[index] || "Periodo"
                    const timelineMilestone = timelineMilestoneByAxisKey.get(title)
                    const isProjectionEnd = projection.enabled && index === activeData.length
                    const monthStats = index < activeData.length ? activeData[index] : null
                    const hasMonthTransactions = monthStats?.hasTransactions ?? false

                    const valueBySeries = new Map<string, number>()
                    for (const row of rows) {
                        if (typeof row.value === "number" && Number.isFinite(row.value)) {
                            valueBySeries.set(row.seriesName, row.value)
                        }
                    }

                    if (timelineMilestone) {
                        return `
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <div style="display: flex; justify-content: space-between; gap: 24px;">
                <span style="color: #94a3b8; font-size: 12px;">Addebito previsto</span>
                <span style="font-weight: 700; color: #0f766e; font-size: 13px;">${formatEuroNumber(timelineMilestone.amountCents / 100, currency, locale)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; gap: 24px;">
                <span style="color: #94a3b8; font-size: 12px;">Voce</span>
                <span style="font-weight: 700; color: ${isDarkMode ? "#e2e8f0" : "#1e293b"}; font-size: 13px;">${timelineMilestone.description}</span>
              </div>
              <div style="display: flex; justify-content: space-between; gap: 24px; margin-top: 4px; padding-top: 4px; border-top: 1px dashed rgba(128,128,128,0.2);">
                <span style="color: #94a3b8; font-size: 12px;">Quando</span>
                <span style="font-weight: 700; color: #0f766e; font-size: 13px;">${formatDueLabel(timelineMilestone.daysUntilCharge)}</span>
              </div>
            </div>
          `
                    }

                    if (isProjectionEnd) {
                        return `
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 8px; border-bottom: 1px solid rgba(128,128,128,0.2); padding-bottom: 4px;">
              ${title}
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <div style="display: flex; justify-content: space-between; gap: 24px;">
                <span style="color: #94a3b8; font-size: 12px;">Uscite stimate</span>
                <span style="font-weight: 700; color: #f59e0b; font-size: 13px;">${formatEuroNumber(projection.projectedEndExpenses, currency, locale)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; gap: 24px;">
                <span style="color: #94a3b8; font-size: 12px;">Spese residue previste</span>
                <span style="font-weight: 700; color: #f59e0b; font-size: 13px;">${formatEuroNumber(projection.remainingExpenses, currency, locale)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; gap: 24px; margin-top: 4px; padding-top: 4px; border-top: 1px dashed rgba(128,128,128,0.2);">
                <span style="color: #94a3b8; font-size: 12px;">Fonte</span>
                <span style="font-weight: 700; color: #3b82f6; font-size: 13px;">${projection.sourceLabel}</span>
              </div>
            </div>
          `
                    }

                    const incomeValue = valueBySeries.get("Entrate") ?? 0
                    const expensesValue = valueBySeries.get("Uscite") ?? 0
                    const savingsRate = monthStats?.savingsRateLabel ?? "0.0%"
                    if (!hasMonthTransactions) {
                        return `
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 8px; border-bottom: 1px solid rgba(128,128,128,0.2); padding-bottom: 4px;">
              ${title}
            </div>
            <div style="color: #94a3b8; font-size: 12px;">Nessun movimento registrato in questo mese.</div>
          `
                    }
                    const projectionNote = projection.enabled && index === activeData.length - 1
                        ? `
              <div style="display: flex; justify-content: space-between; gap: 24px; margin-top: 4px; padding-top: 4px; border-top: 1px dashed rgba(128,128,128,0.2);">
                <span style="color: #94a3b8; font-size: 12px;">Fine mese stimata</span>
                <span style="font-weight: 700; color: #f59e0b; font-size: 13px;">${formatEuroNumber(projection.projectedEndExpenses, currency, locale)} (${projection.sourceLabel})</span>
              </div>
            `
                        : ""

                    return `
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 8px; border-bottom: 1px solid rgba(128,128,128,0.2); padding-bottom: 4px;">
              ${title}
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <div style="display: flex; justify-content: space-between; gap: 24px;">
                <span style="color: #94a3b8; font-size: 12px;">Entrate</span>
                <span style="font-weight: 700; color: #10b981; font-size: 13px;">${formatEuroNumber(incomeValue, currency, locale)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; gap: 24px;">
                <span style="color: #94a3b8; font-size: 12px;">Uscite</span>
                <span style="font-weight: 700; color: #f43f5e; font-size: 13px;">${formatEuroNumber(expensesValue, currency, locale)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; gap: 24px; margin-top: 4px; padding-top: 4px; border-top: 1px dashed rgba(128,128,128,0.2);">
                <span style="color: #94a3b8; font-size: 12px;">Risparmio</span>
                <span style="font-weight: 700; color: #3b82f6; font-size: 13px;">${savingsRate}</span>
              </div>
              ${projectionNote}
            </div>
          `
                }
            },
            legend: {
                data: legendData,
                bottom: 0,
                itemWidth: 12,
                itemHeight: 4,
                itemGap: 24,
                textStyle: {
                    color: isDarkMode ? "#94a3b8" : "#64748b",
                    fontSize: 12,
                    fontWeight: 600
                }
            },
            grid: {
                left: "3%",
                right: "4%",
                bottom: "10%",
                top: "12%",
                containLabel: true
            },
            xAxis: {
                type: "category",
                boundaryGap: false,
                data: xAxisData,
                axisLine: { lineStyle: { color: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" } },
                axisLabel: {
                    color: isDarkMode ? "#64748b" : "#94a3b8",
                    fontSize: 11,
                    fontWeight: 600,
                    margin: 16,
                    formatter: (value: string | number) => axisLabelByKey.get(String(value)) || String(value)
                },
                axisTick: { show: false }
            },
            yAxis: [
                {
                    type: "value",
                    splitLine: {
                        lineStyle: {
                            type: "dashed",
                            color: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"
                        }
                    },
                    axisLabel: {
                        color: isDarkMode ? "#475569" : "#94a3b8",
                        fontSize: 10,
                        fontWeight: 600,
                        formatter: (value: number) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value.toString()
                    }
                },
                {
                    type: "value",
                    min: 0,
                    max: 1,
                    show: false,
                    splitLine: { show: false },
                    axisLabel: { show: false },
                    axisLine: { show: false },
                    axisTick: { show: false }
                }
            ],
            series: [
                {
                    name: "Entrate",
                    type: "line" as const,
                    smooth: 0.4,
                    showSymbol: false,
                    symbol: "circle",
                    symbolSize: 8,
                    animationDelay: prefersReducedMotion ? 0 : (idx) => idx * 25,
                    areaStyle: {
                        color: buildLinearGradient("rgba(16, 185, 129, 0.15)", "rgba(16, 185, 129, 0)")
                    },
                    itemStyle: { color: "#10b981" },
                    lineStyle: {
                        width: 3,
                        shadowBlur: 12,
                        shadowColor: "rgba(16, 185, 129, 0.22)",
                        shadowOffsetY: 4
                    },
                    markPoint: {
                        data: milestones.bestIndex !== -1 ? [
                            {
                                type: "max",
                                name: "Record",
                                label: {
                                    show: true,
                                    formatter: "RECORD",
                                    fontSize: 9,
                                    fontWeight: "bold",
                                    backgroundColor: "#10b981",
                                    color: "#fff",
                                    padding: [3, 6],
                                    borderRadius: 4,
                                    offset: [0, -20]
                                },
                                itemStyle: { color: "#10b981" }
                            }
                        ] : []
                    },
                    data: incomeSeriesData
                },
                {
                    name: "Uscite",
                    type: "line" as const,
                    smooth: 0.4,
                    showSymbol: false,
                    symbol: "rect",
                    symbolSize: 8,
                    animationDelay: prefersReducedMotion ? 0 : (idx) => idx * 25 + 120,
                    areaStyle: {
                        color: buildLinearGradient("rgba(244, 63, 94, 0.15)", "rgba(244, 63, 94, 0)")
                    },
                    itemStyle: { color: "#f43f5e" },
                    lineStyle: {
                        width: 3,
                        shadowBlur: 12,
                        shadowColor: "rgba(244, 63, 94, 0.22)",
                        shadowOffsetY: 4
                    },
                    markLine: {
                        silent: true,
                        symbol: "none",
                        label: { show: false },
                        lineStyle: {
                            type: "dashed" as const,
                            color: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                            width: 1
                        },
                        data: [{ yAxis: 0 }]
                    },
                    data: expensesSeriesData
                },
                ...(projection.enabled
                    ? [{
                        name: "Uscite stimate fine mese",
                        type: "line" as const,
                        smooth: false,
                        showSymbol: true,
                        symbol: "circle",
                        symbolSize: 9,
                        connectNulls: false,
                        itemStyle: { color: "#f59e0b" },
                        lineStyle: {
                            width: 3,
                            type: "dashed" as const,
                            color: "#f59e0b",
                            shadowBlur: 10,
                            shadowColor: "rgba(245, 158, 11, 0.2)",
                            shadowOffsetY: 3
                        },
                        areaStyle: {
                            color: buildLinearGradient("rgba(245, 158, 11, 0.12)", "rgba(245, 158, 11, 0)")
                        },
                        z: 6,
                        data: projectionSeriesData
                    }]
                    : [])
                ,
                ...(hasTimelineMilestones
                    ? [{
                        name: "Prossimi addebiti",
                        type: "line" as const,
                        yAxisIndex: 1,
                        smooth: false,
                        showSymbol: true,
                        symbol: "circle",
                        symbolSize: 11,
                        connectNulls: false,
                        itemStyle: {
                            color: "#0f766e",
                            borderColor: "#ccfbf1",
                            borderWidth: 2
                        },
                        lineStyle: {
                            width: 2,
                            type: "dashed" as const,
                            color: "rgba(15, 118, 110, 0.55)"
                        },
                        z: 8,
                        data: timelineSeriesData
                    }]
                    : [])
            ]
        }
    }, [activeData, currency, locale, isDarkMode, milestones, projection, prefersReducedMotion, upcomingChargeMilestones])
    const hasUpcomingTimeline = upcomingChargeMilestones.length > 0

    return (
        <PremiumChartSection
            title="Andamento entrate e uscite"
            description={trendNarration
                ? `${trendNarration}${projection.enabled ? ` Proiezione fine mese (${projection.sourceLabel}).` : ""}${hasUpcomingTimeline ? ` Prossimi addebiti integrati (${SUBSCRIPTION_ACTIVE_WINDOW_DAYS}g).` : ""}`
                : `Confronto mese per mese tra entrate e uscite.${projection.enabled ? " Include la proiezione di fine mese." : ""}${hasUpcomingTimeline ? ` Include i prossimi addebiti (${SUBSCRIPTION_ACTIVE_WINDOW_DAYS}g).` : ""}`}
            option={option}
            isLoading={isLoading}
            status={chartStatus}
            hasData={activeData.length > 0}
            chartHeight={400}
            backgroundType="cartesian"
            showBackground={false}
        />
    )
}
