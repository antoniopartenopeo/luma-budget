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

    const trendNarration = useMemo(() => {
        if (!data || data.length < 2) return null

        // Calculate trend facts based on last 2 months for simplicity in this V3 step
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
        // Pass context to narrator
        return narrateTrend(facts, state, context).text
    }, [data, context])

    const option: EChartsOption = useMemo(() => {
        if (!data.length) return {}

        return {
            tooltip: {
                trigger: "axis",
                axisPointer: { type: "cross", label: { backgroundColor: '#6a7985' } },
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                padding: [12, 16],
                textStyle: { color: '#f8fafc', fontSize: 13 },
                extraCssText: "box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.25); border-radius: 12px; backdrop-filter: blur(8px);",
                formatter: (params: unknown) => {
                    const p = params as { name: string, value: number, dataIndex: number, color: string }[]
                    const [income, expenses] = p
                    const index = income.dataIndex
                    const sRate = data[index].savingsRateLabel
                    return `
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px; color: #f8fafc;">
              ${income.name}
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <div style="display: flex; justify-content: space-between; gap: 24px;">
                <span style="color: #94a3b8; font-size: 12px;">Entrate</span>
                <span style="font-weight: 700; color: #34d399; font-size: 13px;">${formatEuroNumber(income.value, currency, locale)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; gap: 24px;">
                <span style="color: #94a3b8; font-size: 12px;">Uscite</span>
                <span style="font-weight: 700; color: #f87171; font-size: 13px;">${formatEuroNumber(expenses.value, currency, locale)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; gap: 24px; margin-top: 4px; padding-top: 4px; border-top: 1px dashed rgba(255,255,255,0.1);">
                <span style="color: #94a3b8; font-size: 12px;">Risparmio</span>
                <span style="font-weight: 700; color: #60a5fa; font-size: 13px;">${sRate}</span>
              </div>
            </div>
          `
                }
            },
            legend: {
                data: ["Entrate", "Uscite"],
                bottom: 0,
                itemWidth: 10,
                itemHeight: 10,
                textStyle: {
                    color: isDarkMode ? "#94a3b8" : "#64748b",
                    fontSize: 12,
                    fontWeight: 600
                },
                itemGap: 24
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
                axisLine: { lineStyle: { color: isDarkMode ? "#334155" : "#e2e8f0" } },
                axisLabel: {
                    color: isDarkMode ? "#94a3b8" : "#64748b",
                    fontSize: 11,
                    fontWeight: 600
                },
                axisTick: { show: false }
            },
            yAxis: {
                type: "value",
                splitLine: {
                    lineStyle: {
                        type: "dashed",
                        color: isDarkMode ? "#334155" : "#e2e8f0",
                        opacity: 0.5
                    }
                },
                axisLabel: {
                    color: isDarkMode ? "#64748b" : "#94a3b8",
                    fontSize: 10,
                    fontWeight: 600,
                    formatter: (value: number) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value.toString()
                }
            },
            series: [
                {
                    name: "Entrate",
                    type: "line",
                    smooth: true,
                    showSymbol: false,
                    symbolSize: 8,
                    areaStyle: {
                        color: {
                            type: "linear",
                            x: 0, y: 0, x2: 0, y2: 1,
                            colorStops: [
                                { offset: 0, color: "rgba(16, 185, 129, 0.25)" },
                                { offset: 1, color: "rgba(16, 185, 129, 0)" }
                            ]
                        }
                    },
                    itemStyle: {
                        color: "#10b981",
                        shadowBlur: 10,
                        shadowColor: "rgba(16, 185, 129, 0.4)"
                    },
                    lineStyle: {
                        width: 3,
                        shadowBlur: 10,
                        shadowColor: "rgba(16, 185, 129, 0.2)",
                        shadowOffsetY: 5
                    },
                    data: data.map(d => d.income)
                },
                {
                    name: "Uscite",
                    type: "line",
                    smooth: true,
                    showSymbol: false,
                    symbolSize: 8,
                    areaStyle: {
                        color: {
                            type: "linear",
                            x: 0, y: 0, x2: 0, y2: 1,
                            colorStops: [
                                { offset: 0, color: "rgba(244, 63, 94, 0.25)" },
                                { offset: 1, color: "rgba(244, 63, 94, 0)" }
                            ]
                        }
                    },
                    itemStyle: {
                        color: "#f43f5e",
                        shadowBlur: 10,
                        shadowColor: "rgba(244, 63, 94, 0.4)"
                    },
                    lineStyle: {
                        width: 3,
                        shadowBlur: 10,
                        shadowColor: "rgba(244, 63, 94, 0.2)",
                        shadowOffsetY: 5
                    },
                    data: data.map(d => d.expenses)
                }
            ]
        }
    }, [data, currency, locale, isDarkMode])

    // Pass using standard props pattern for PremiumChartSection
    return (
        <PremiumChartSection
            title="Velocità Finanziaria (12 Mesi)"
            description={trendNarration || "Confronto tra entrate e uscite storiche"}
            option={option}
            isLoading={isLoading}
            hasData={data.length > 0}
            chartHeight={400} // Custom height for line chart
            backgroundType="cartesian"
        />
    )
}
