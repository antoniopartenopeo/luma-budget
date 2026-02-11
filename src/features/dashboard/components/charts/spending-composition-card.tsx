"use client"

import { useEffect, useMemo, useState } from "react"
import { useCurrency } from "@/features/settings/api/use-currency"
import { useSettings } from "@/features/settings/api/use-settings"
import { formatCents } from "@/domain/money/currency"
import { PremiumChartSection } from "./premium-chart-section"
import * as echarts from "echarts"
import type { CategorySummary } from "../../api/types"
import {
    buildSpendingCompositionSlicesFromSummary,
    DEFAULT_TOP_SPENDING_CATEGORIES,
    SYNTHETIC_ALTRI_ID
} from "../../utils/spending-composition"

interface SpendingCompositionCardProps {
    categoriesSummary?: CategorySummary[]
    isLoading?: boolean
    periodLabel?: string
}

interface EChartsPieParam {
    name: string
    value: number
    percent: number
    color: string | { colorStops: { color: string }[] }
    dataIndex: number
}

interface ChartDatum {
    id: string
    name: string
    value: number
    rawColor: string
    itemStyle: {
        color: echarts.LinearGradientObject
    }
}

function resolveResponsiveHeight(width: number): number {
    if (width < 640) return 390
    if (width < 1024) return 470
    return 560
}

export function SpendingCompositionCard({
    categoriesSummary = [],
    isLoading: isExternalLoading,
    periodLabel
}: SpendingCompositionCardProps) {
    const { currency, locale } = useCurrency()
    const { data: settings } = useSettings()
    const [viewportWidth, setViewportWidth] = useState(
        typeof window === "undefined" ? 1280 : window.innerWidth
    )

    useEffect(() => {
        const updateViewport = () => setViewportWidth(window.innerWidth)
        updateViewport()
        window.addEventListener("resize", updateViewport)
        return () => {
            window.removeEventListener("resize", updateViewport)
        }
    }, [])

    const isMobile = viewportWidth < 768
    const isDarkMode = settings?.theme === "dark"
        || (settings?.theme === "system"
            && typeof window !== "undefined"
            && window.matchMedia("(prefers-color-scheme: dark)").matches)
    const chartHeight = resolveResponsiveHeight(viewportWidth)
    const showPieChart = !isMobile
    const isLoading = Boolean(isExternalLoading)

    const chartSlices = useMemo(
        () => buildSpendingCompositionSlicesFromSummary(
            categoriesSummary,
            DEFAULT_TOP_SPENDING_CATEGORIES
        ),
        [categoriesSummary]
    )

    const chartTotal = useMemo(
        () => chartSlices.reduce((acc, slice) => acc + slice.value, 0),
        [chartSlices]
    )

    const chartData: ChartDatum[] = useMemo(() => (
        chartSlices.map((slice, index) => {
            const baseColor = slice.id === SYNTHETIC_ALTRI_ID
                ? "#94a3b8"
                : (slice.color || ["#4f46e5", "#f97316", "#0ea5e9", "#22c55e", "#f59e0b"][index % 5])

            const gradient = new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: baseColor },
                { offset: 1, color: echarts.color.modifyAlpha(baseColor, 0.45) }
            ])

            return {
                id: slice.id,
                name: slice.name,
                value: slice.value,
                rawColor: baseColor,
                itemStyle: { color: gradient }
            }
        })
    ), [chartSlices])

    const option: echarts.EChartsOption = useMemo(() => {
        if (!chartData.length) return {}

        return {
            tooltip: {
                trigger: "item",
                backgroundColor: "rgba(15, 23, 42, 0.96)",
                borderColor: "rgba(148, 163, 184, 0.25)",
                borderWidth: 1,
                padding: [10, 12],
                extraCssText: "border-radius: 12px; box-shadow: 0 10px 30px rgba(2, 6, 23, 0.4);",
                textStyle: { color: "#f8fafc", fontSize: 12 },
                formatter: (params: unknown) => {
                    const pieParam = params as EChartsPieParam
                    const markerColor = typeof pieParam.color === "string"
                        ? pieParam.color
                        : pieParam.color.colorStops?.[0]?.color

                    // Product decision: spending composition remains fully visible in Privacy Mode.
                    const value = formatCents(pieParam.value, currency, locale)
                    const percent = `${Number(pieParam.percent).toFixed(2)}%`

                    return `
                        <div style="display:flex; flex-direction:column; gap:6px; min-width:170px;">
                            <div style="display:flex; align-items:center; gap:8px;">
                                <span style="width:8px; height:8px; border-radius:9999px; background:${markerColor};"></span>
                                <span style="font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:#cbd5e1; font-weight:800;">
                                    ${pieParam.name}
                                </span>
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:baseline; gap:12px;">
                                <span style="font-size:18px; font-weight:900; color:#f8fafc;">${value}</span>
                                <span style="font-size:11px; font-weight:800; color:#60a5fa;">${percent}</span>
                            </div>
                        </div>
                    `
                }
            },
            series: [
                {
                    name: "Composizione Spese",
                    type: "pie",
                    radius: isMobile ? ["42%", "61%"] : ["47%", "68%"],
                    center: ["50%", isMobile ? "44%" : "43%"],
                    avoidLabelOverlap: true,
                    minAngle: 3,
                    itemStyle: {
                        borderRadius: isMobile ? 10 : 14,
                        borderColor: isDarkMode ? "rgba(15, 23, 42, 0.9)" : "rgba(248, 250, 252, 0.95)",
                        borderWidth: 3,
                        shadowBlur: 12,
                        shadowColor: "rgba(15, 23, 42, 0.18)"
                    },
                    label: {
                        show: true,
                        position: "outside",
                        alignTo: "edge",
                        edgeDistance: isMobile ? 8 : 20,
                        bleedMargin: 6,
                        formatter: (params: unknown) => {
                            const pieParam = params as EChartsPieParam
                            if (isMobile && pieParam.dataIndex >= 2) return ""
                            return `{name|${pieParam.name.toUpperCase()}}\n{value|${formatCents(pieParam.value, currency, locale)}}\n{percent|${pieParam.percent.toFixed(2)}%}`
                        },
                        rich: {
                            name: {
                                color: "#64748b",
                                fontSize: isMobile ? 9 : 10,
                                fontWeight: 800,
                                align: "left",
                                padding: [0, 0, 3, 0]
                            },
                            value: {
                                color: isDarkMode ? "#f8fafc" : "#0f172a",
                                fontSize: isMobile ? 11 : 14,
                                fontWeight: 900,
                                align: "left",
                                padding: [0, 0, 2, 0]
                            },
                            percent: {
                                color: "#2563eb",
                                fontSize: isMobile ? 10 : 11,
                                fontWeight: 800,
                                align: "left"
                            }
                        }
                    },
                    labelLine: {
                        show: true,
                        length: isMobile ? 9 : 13,
                        length2: isMobile ? 6 : 12,
                        lineStyle: {
                            width: 1.2,
                            color: "rgba(100, 116, 139, 0.7)"
                        }
                    },
                    labelLayout: {
                        hideOverlap: true
                    },
                    emphasis: {
                        scale: true,
                        scaleSize: isMobile ? 8 : 11,
                        focus: "self",
                        itemStyle: {
                            shadowBlur: 22,
                            shadowColor: "rgba(37, 99, 235, 0.25)"
                        }
                    },
                    blur: {
                        itemStyle: {
                            opacity: 0.24,
                            shadowBlur: 0
                        },
                        label: {
                            show: false
                        },
                        labelLine: {
                            show: false
                        }
                    },
                    data: chartData,
                    animationType: "scale",
                    animationDuration: 900,
                    animationDurationUpdate: 350,
                    animationEasing: "cubicOut",
                    animationEasingUpdate: "cubicInOut"
                }
            ]
        }
    }, [chartData, currency, isDarkMode, isMobile, locale])

    const description = periodLabel
        ? `Come si distribuiscono le spese in ${periodLabel}.`
        : "Come si distribuiscono le spese nel periodo selezionato."

    return (
        <PremiumChartSection
            title="Composizione Spese"
            description={description}
            option={option}
            isLoading={isLoading}
            hasData={chartData.length > 0}
            chartHeight={chartHeight}
            showChart={showPieChart}
            showBackground={false}
        >
            <div className={`${showPieChart ? "mt-4" : "mt-0"} w-full px-4 pb-3`}>
                <div className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible">
                    {chartData.map((item, index) => {
                        const percent = chartTotal > 0 ? ((item.value / chartTotal) * 100).toFixed(2) : "0.00"

                        return (
                            <div
                                key={item.id}
                                className="min-w-[220px] rounded-2xl border border-border/60 bg-background/70 p-3 backdrop-blur-sm md:min-w-0"
                            >
                                <div className="flex items-center gap-2">
                                    <span
                                        className="h-2.5 w-2.5 rounded-full"
                                        style={{ backgroundColor: item.rawColor }}
                                    />
                                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">
                                        #{index + 1}
                                    </span>
                                </div>
                                <p className="mt-1 text-sm font-semibold leading-tight text-foreground">
                                    {item.name}
                                </p>
                                <div className="mt-1 flex items-baseline justify-between gap-3">
                                    <span className="text-base font-black tabular-nums tracking-tight text-foreground">
                                        {formatCents(item.value, currency, locale)}
                                    </span>
                                    <span className="text-xs font-bold tabular-nums text-primary">
                                        {percent}%
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </PremiumChartSection>
    )
}
