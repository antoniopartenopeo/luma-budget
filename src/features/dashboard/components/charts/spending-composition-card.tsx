"use client"

import { useMemo, useState } from "react"
import { useCurrency } from "@/features/settings/api/use-currency"
import { formatCents } from "@/domain/money/currency"
import { PremiumChartSection } from "./premium-chart-section"
import * as echarts from "echarts"
import { getCategoryById } from "@/features/categories/config"
import { useCategories } from "@/features/categories/api/use-categories"
import { useSettings } from "@/features/settings/api/use-settings"
import { Transaction } from "@/features/transactions/api/types"
import { DashboardTimeFilter } from "../../api/types"

interface SpendingCompositionCardProps {
    transactions: Transaction[]
    filter: DashboardTimeFilter
    isLoading?: boolean
}

const TOP_N_CATEGORIES = 5
const SYNTHETIC_ALTRI_ID = "altro-synthetic"

interface EChartsPieParam {
    name: string
    value: number
    percent: number
    color: string | { colorStops: { color: string }[] }
    data: { id: string }
}

export function SpendingCompositionCard({ transactions, filter, isLoading: isExternalLoading }: SpendingCompositionCardProps) {
    const { currency, locale } = useCurrency()
    const { data: categories = [], isLoading: isCategoriesLoading } = useCategories()
    const { data: settings } = useSettings()
    const isDarkMode = settings?.theme === "dark" || (settings?.theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches)
    const isLoading = isExternalLoading || isCategoriesLoading

    const [highlightedCategory, setHighlightedCategory] = useState<string | null>(null)

    const chartData = useMemo(() => {
        if (!transactions || transactions.length === 0) return []

        const periodTransactions = transactions.filter(t => {
            const date = new Date(t.timestamp)
            const startDate = new Date(filter.period + "-01")
            startDate.setDate(1)

            const endDate = new Date(filter.period + "-01")
            endDate.setMonth(endDate.getMonth() + 1)
            endDate.setDate(0)

            if (filter.mode === "range" && filter.months) {
                startDate.setMonth(startDate.getMonth() - (filter.months - 1))
            }

            return t.type === "expense" && date >= startDate && date <= endDate
        })

        const periodCategoryTotals: Record<string, number> = {}
        periodTransactions.forEach(t => {
            const val = Math.abs(t.amountCents)
            periodCategoryTotals[t.categoryId] = (periodCategoryTotals[t.categoryId] || 0) + val
        })

        const sortedCategories = Object.entries(periodCategoryTotals)
            .sort(([, a], [, b]) => b - a)

        const topCats = sortedCategories.slice(0, TOP_N_CATEGORIES)
        const othersSum = sortedCategories.slice(TOP_N_CATEGORIES)
            .reduce((acc, [, val]) => acc + val, 0)

        const data = topCats.map(([id, value]) => {
            const config = getCategoryById(id, categories)
            return {
                id,
                name: config?.label || "Sconosciuta",
                value,
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: config?.hexColor || "#6366f1" },
                        { offset: 1, color: (config?.hexColor || "#6366f1") + "88" }
                    ])
                }
            }
        })

        if (othersSum > 0) {
            data.push({
                id: SYNTHETIC_ALTRI_ID,
                name: "Altri",
                value: othersSum,
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: "#94a3b8" },
                        { offset: 1, color: "#94a3b888" }
                    ])
                }
            })
        }

        return data
    }, [transactions, filter, categories])

    const option: echarts.EChartsOption = useMemo(() => {
        if (!chartData.length) return {}
        return {
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                padding: [12, 16],
                textStyle: { color: '#f8fafc', fontSize: 13 },
                formatter: (params: unknown) => {
                    const p = params as EChartsPieParam
                    const color = typeof p.color === 'string' ? p.color : p.color.colorStops?.[0]?.color
                    return `
                        <div style=\"display: flex; flex-direction: column; gap: 4px;\">
                            <div style=\"display: flex; align-items: center; gap: 8px;\">
                                <div style=\"width: 8px; height: 8px; border-radius: 50%; background: ${color};\"></div>
                                <span style=\"font-weight: 700; opacity: 0.8; text-transform: uppercase; font-size: 10px; tracking: 0.1em; color: #94a3b8;\">${p.name}</span>
                            </div>
                            <div style=\"display: flex; justify-content: space-between; align-items: baseline; gap: 24px;\">
                                <span style=\"font-size: 16px; font-weight: 900; letter-spacing: -0.02em; color: #ffffff;\">${formatCents(p.value, currency, locale)}</span>
                                <span style=\"font-size: 11px; font-weight: 700; color: #6366f1;\">${p.percent}%</span>
                            </div>
                        </div>
                    `
                }
            },
            series: [
                {
                    name: 'Composizione Spese',
                    type: 'pie',
                    radius: ['55%', '78%'],
                    center: ['50%', '50%'],
                    avoidLabelOverlap: true,
                    itemStyle: {
                        borderRadius: 16,
                        borderColor: 'transparent',
                        borderWidth: 4,
                        shadowBlur: 30,
                        shadowColor: 'rgba(0,0,0,0.25)'
                    },
                    label: {
                        show: true,
                        position: 'outside',
                        padding: [0, -35],
                        formatter: (params: unknown) => {
                            const p = params as EChartsPieParam
                            return `{name|${p.name.toUpperCase()}}\\n{value|${formatCents(p.value, currency, locale)}}\\n{percent|${p.percent}%}`
                        },
                        rich: {
                            name: {
                                color: '#94a3b8',
                                fontSize: 9,
                                fontWeight: 800,
                                padding: [0, 0, 4, 0],
                                align: 'center'
                            },
                            value: {
                                color: isDarkMode ? '#f8fafc' : '#1e293b',
                                fontSize: 13,
                                fontWeight: 900,
                                padding: [0, 0, 2, 0],
                                align: 'center'
                            },
                            percent: {
                                color: '#6366f1',
                                fontSize: 10,
                                fontWeight: 800,
                                align: 'center'
                            }
                        }
                    },
                    emphasis: {
                        scale: true,
                        scaleSize: 15,
                        focus: 'self',
                        itemStyle: {
                            shadowBlur: 65,
                            shadowColor: 'rgba(99, 102, 241, 0.65)'
                        },
                        label: {
                            show: true,
                            rich: {
                                name: {
                                    fontSize: 12,
                                    fontWeight: 900,
                                    padding: [0, 0, 8, 0],
                                    color: isDarkMode ? '#f8fafc' : '#1e293b'
                                },
                                value: {
                                    fontSize: 18,
                                    fontWeight: 900,
                                    padding: [0, 0, 4, 0]
                                },
                                percent: {
                                    fontSize: 13,
                                    fontWeight: 900
                                }
                            }
                        }
                    },
                    blur: {
                        label: {
                            show: false
                        },
                        itemStyle: {
                            opacity: 0.15,
                            shadowBlur: 0
                        },
                        labelLine: {
                            show: false
                        }
                    },
                    data: chartData,
                    animationType: 'scale',
                    animationEasing: 'cubicOut',
                    animationDuration: 1200
                }
            ],
            graphic: []
        }
    }, [chartData, currency, locale, isDarkMode])

    return (
        <PremiumChartSection
            title="Composizione Spese"
            description="Visualizzazione immersiva dell'andamento mensile"
            option={option}
            isLoading={isLoading}
            hasData={chartData.length > 0}
            onEvents={{
                'mouseover': (params: unknown) => setHighlightedCategory((params as EChartsPieParam).data.id),
                'mouseout': () => setHighlightedCategory(null)
            }}
        >
            <div className="mt-4 flex flex-wrap justify-center gap-12">
                {chartData.slice(0, 3).map((item, idx) => (
                    <div key={item.id} className="flex flex-col items-center gap-1.5 group cursor-default">
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/40 group-hover:text-primary transition-colors">
                            TOP {idx + 1}
                        </span>
                        <span className="text-sm font-bold text-foreground">
                            {item.name}
                        </span>
                        <div
                            className="h-[3px] w-12 rounded-full transition-all duration-300 group-hover:w-16"
                            style={{
                                background: typeof item.itemStyle?.color === 'string'
                                    ? item.itemStyle.color
                                    : (item.itemStyle?.color as { colorStops: { color: string }[] })?.colorStops?.[0]?.color
                            }}
                        />
                    </div>
                ))}
            </div>
        </PremiumChartSection>
    )
}
