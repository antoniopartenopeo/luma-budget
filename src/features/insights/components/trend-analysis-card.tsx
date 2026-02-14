"use client"

import { useMemo } from "react"
import { useReducedMotion } from "framer-motion"
import { PremiumChartSection } from "@/features/dashboard/components/charts/premium-chart-section"
import { useSettings } from "@/features/settings/api/use-settings"
import { useTrendData } from "../use-trend-data"
import { useCurrency } from "@/features/settings/api/use-currency"
import { formatEuroNumber } from "@/domain/money"
import { narrateTrend, deriveTrendState, type TrendFacts, type OrchestrationContext } from "@/domain/narration"
import type { AIForecast } from "../use-ai-advisor"
import type { EChartsOption } from "echarts"

interface TrendAnalysisCardProps {
    hasHighSeverityCurrentIssue?: boolean
    advisorForecast?: AIForecast | null
}

interface TrendProjectionState {
    enabled: boolean
    sourceLabel: "Brain" | "Storico"
    remainingExpenses: number
    projectedEndExpenses: number
}

export function TrendAnalysisCard({
    hasHighSeverityCurrentIssue = false,
    advisorForecast = null,
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

    const option: EChartsOption = useMemo(() => {
        if (!activeData.length) return {}

        const baseMonths = activeData.map((d) => d.month)
        const xAxisData = projection.enabled ? [...baseMonths, "Fine mese"] : baseMonths

        const incomeSeriesData: Array<number | null> = activeData.map((d) => d.income)
        const expensesSeriesData: Array<number | null> = activeData.map((d) => d.expenses)
        if (projection.enabled) {
            incomeSeriesData.push(null)
            expensesSeriesData.push(null)
        }

        const projectionSeriesData: Array<number | null> = xAxisData.map(() => null)
        if (projection.enabled) {
            projectionSeriesData[activeData.length - 1] = activeData[activeData.length - 1].expenses
            projectionSeriesData[xAxisData.length - 1] = projection.projectedEndExpenses
        }

        const legendData = projection.enabled
            ? ["Entrate", "Uscite", "Uscite stimate fine mese"]
            : ["Entrate", "Uscite"]

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
                        show: true,
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
                    const isProjectionEnd = projection.enabled && index === xAxisData.length - 1
                    const monthStats = index < activeData.length ? activeData[index] : null
                    const hasMonthTransactions = monthStats?.hasTransactions ?? false

                    const valueBySeries = new Map<string, number>()
                    for (const row of rows) {
                        if (typeof row.value === "number" && Number.isFinite(row.value)) {
                            valueBySeries.set(row.seriesName, row.value)
                        }
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
                    margin: 16
                },
                axisTick: { show: false }
            },
            yAxis: {
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
            series: [
                {
                    name: "Entrate",
                    type: "line",
                    smooth: 0.4,
                    showSymbol: false,
                    symbol: "circle",
                    symbolSize: 8,
                    animationDelay: prefersReducedMotion ? 0 : (idx) => idx * 25,
                    areaStyle: {
                        color: {
                            type: "linear",
                            x: 0, y: 0, x2: 0, y2: 1,
                            colorStops: [
                                { offset: 0, color: "rgba(16, 185, 129, 0.15)" },
                                { offset: 1, color: "rgba(16, 185, 129, 0)" }
                            ]
                        }
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
                    type: "line",
                    smooth: 0.4,
                    showSymbol: false,
                    symbol: "rect",
                    symbolSize: 8,
                    animationDelay: prefersReducedMotion ? 0 : (idx) => idx * 25 + 120,
                    areaStyle: {
                        color: {
                            type: "linear",
                            x: 0, y: 0, x2: 0, y2: 1,
                            colorStops: [
                                { offset: 0, color: "rgba(244, 63, 94, 0.15)" },
                                { offset: 1, color: "rgba(244, 63, 94, 0)" }
                            ]
                        }
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
                            color: {
                                type: "linear",
                                x: 0, y: 0, x2: 0, y2: 1,
                                colorStops: [
                                    { offset: 0, color: "rgba(245, 158, 11, 0.12)" },
                                    { offset: 1, color: "rgba(245, 158, 11, 0)" }
                                ]
                            }
                        },
                        z: 6,
                        data: projectionSeriesData
                    }]
                    : [])
            ]
        }
    }, [activeData, currency, locale, isDarkMode, milestones, projection, prefersReducedMotion])

    return (
        <PremiumChartSection
            title={projection.enabled
                ? "Andamento entrate, uscite e proiezione fine mese"
                : "Andamento entrate e uscite"}
            description={trendNarration
                ? `${trendNarration}${projection.enabled ? ` Inclusa proiezione uscite a fine mese (${projection.sourceLabel}).` : ""}`
                : "Confronto mese per mese tra entrate e uscite."}
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
