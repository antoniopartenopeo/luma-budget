"use client"

import { useMemo } from "react"
import { PremiumChartSection } from "@/features/dashboard/components/charts/premium-chart-section"
import { useSettings } from "@/features/settings/api/use-settings"
import { EChartsWrapper } from "@/features/dashboard/components/charts/echarts-wrapper"
import { useTrendData } from "../use-trend-data"
import { useOrchestratedInsights } from "../use-orchestrated-insights"
import { useCurrency } from "@/features/settings/api/use-currency"
import { formatEuroNumber } from "@/domain/money"
import { narrateTrend, deriveTrendState, type TrendFacts } from "@/domain/narration"
import { BarChart3 } from "lucide-react"
import type { EChartsOption } from "echarts"


export function TrendAnalysisCard() {
    const { data, isLoading } = useTrendData()
    const { currency, locale } = useCurrency()
    const { data: settings } = useSettings()
    const isDarkMode = settings?.theme === "dark" || (settings?.theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches)

    // Phase 6: Get Orchestration Context to prevent tone-deafness
    const { orchestration } = useOrchestratedInsights()
    const context = orchestration?.context

    // ATMOSPHERE: Calculate health status based on last 3 months
    const chartStatus = useMemo(() => {
        if (!data || data.length < 3) return "default"
        const last3 = data.slice(-3)
        const avgSavingsRate = last3.reduce((sum, d) => sum + d.savingsRate, 0) / 3

        if (avgSavingsRate < 0) return "critical"
        if (avgSavingsRate < 10) return "warning"
        return "default"
    }, [data])

    // MILESTONES: Find the best month and negative months
    const milestones = useMemo(() => {
        if (!data || data.length === 0) return { bestIndex: -1, negativeIndices: [] }
        let bestIdx = 0
        const negatives: number[] = []

        data.forEach((d, i) => {
            if (d.savingsRate > data[bestIdx].savingsRate) bestIdx = i
            if (d.savingsRate < 0) negatives.push(i)
        })

        return { bestIndex: bestIdx, negativeIndices: negatives }
    }, [data])

    const trendNarration = useMemo(() => {
        if (!data || data.length < 2) return null

        const current = data[data.length - 1]
        const previous = data[data.length - 2]

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
        return narrateTrend(facts, state, context).text
    }, [data, context])

    const option: EChartsOption = useMemo(() => {
        if (!data.length) return {}

        return {
            backgroundColor: 'transparent',
            // 1. REVEAL ANIMATION (Fluid Entrance)
            animationDuration: 2000,
            animationDurationUpdate: 1000,
            animationEasing: 'cubicOut',

            tooltip: {
                trigger: "axis",
                axisPointer: {
                    type: "shadow", // 3. FOCUS PULSE / SCANNER EFFECT
                    shadowStyle: {
                        color: isDarkMode ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)"
                    },
                    label: {
                        show: true,
                        backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc',
                        color: isDarkMode ? '#f8fafc' : '#1e293b',
                        padding: [4, 8],
                        borderRadius: 4,
                        fontSize: 10,
                        fontWeight: 'bold'
                    }
                },
                backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                borderWidth: 1,
                padding: [12, 16],
                textStyle: { color: isDarkMode ? '#f8fafc' : '#1e293b', fontSize: 13 },
                extraCssText: "box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.25); border-radius: 12px; backdrop-filter: blur(8px);",
                formatter: (params: unknown) => {
                    const p = params as { name: string, value: number, dataIndex: number, color: string }[]
                    const [income, expenses] = p
                    const index = income.dataIndex
                    const sRate = data[index].savingsRateLabel
                    return `
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 8px; border-bottom: 1px solid rgba(128,128,128,0.2); padding-bottom: 4px;">
              ${income.name}
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <div style="display: flex; justify-content: space-between; gap: 24px;">
                <span style="color: #94a3b8; font-size: 12px;">Entrate</span>
                <span style="font-weight: 700; color: #10b981; font-size: 13px;">${formatEuroNumber(income.value, currency, locale)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; gap: 24px;">
                <span style="color: #94a3b8; font-size: 12px;">Uscite</span>
                <span style="font-weight: 700; color: #f43f5e; font-size: 13px;">${formatEuroNumber(expenses.value, currency, locale)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; gap: 24px; margin-top: 4px; padding-top: 4px; border-top: 1px dashed rgba(128,128,128,0.2);">
                <span style="color: #94a3b8; font-size: 12px;">Risparmio</span>
                <span style="font-weight: 700; color: #3b82f6; font-size: 13px;">${sRate}</span>
              </div>
            </div>
          `
                }
            },
            legend: {
                data: ["Entrate", "Uscite"],
                bottom: 0,
                itemWidth: 12,
                itemHeight: 4,
                itemGap: 32,
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
                data: data.map(d => d.month),
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
                    symbol: 'circle',
                    symbolSize: 8,
                    // Sequential delay for drawing effect
                    animationDelay: (idx) => idx * 50,
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
                        width: 4,
                        shadowBlur: 20,
                        shadowColor: "rgba(16, 185, 129, 0.3)",
                        shadowOffsetY: 8
                    },
                    markPoint: { // 2. MILESTONE: BEST MONTH
                        data: milestones.bestIndex !== -1 ? [
                            {
                                type: 'max',
                                name: 'Record',
                                label: {
                                    show: true,
                                    formatter: 'RECORD',
                                    fontSize: 9,
                                    fontWeight: 'bold',
                                    backgroundColor: '#10b981',
                                    color: '#fff',
                                    padding: [3, 6],
                                    borderRadius: 4,
                                    offset: [0, -20]
                                },
                                itemStyle: { color: '#10b981' }
                            }
                        ] : []
                    },
                    data: data.map(d => d.income)
                },
                {
                    name: "Uscite",
                    type: "line",
                    smooth: 0.4,
                    showSymbol: false,
                    symbol: 'circle',
                    symbolSize: 8,
                    animationDelay: (idx) => idx * 50 + 200, // Slightly staggered
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
                        width: 4,
                        shadowBlur: 20,
                        shadowColor: "rgba(244, 63, 94, 0.3)",
                        shadowOffsetY: 8
                    },
                    markLine: { // 2. MILESTONE: BREAK-EVEN LINE
                        silent: true,
                        symbol: 'none',
                        label: { show: false },
                        lineStyle: {
                            type: 'dashed',
                            color: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                            width: 1
                        },
                        data: [{ yAxis: 0 }]
                    },
                    data: data.map(d => d.expenses)
                }
            ]
        }
    }, [data, currency, locale, isDarkMode, milestones])

    return (
        <PremiumChartSection
            title="Velocità Finanziaria (12 Mesi)"
            description={trendNarration || "Confronto tra entrate e uscite storiche"}
            option={option}
            isLoading={isLoading}
            status={chartStatus} // Dynamically update atmosphere
            hasData={data.length > 0}
            chartHeight={400}
            backgroundType="cartesian"
        />
    )
}
