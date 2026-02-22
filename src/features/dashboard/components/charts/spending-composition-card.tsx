"use client"

import { useEffect, useMemo, useRef, useState } from "react"
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

interface PieLabelFormatterParam {
    name: string
    value: number
    percent: number
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

interface ActiveConnectorDatum {
    dataIndex: number
    color: string
}

interface PieEventParams {
    seriesType?: string
    dataIndex?: number
    data?: { id?: string }
}

type LinePoint = [number, number]

interface PieLabelLayoutParam {
    dataIndex: number
    labelLinePoints?: unknown
}

const CHART_FALLBACK_COLORS = ["#0891b2", "#0ea5a4", "#22c55e", "#f59e0b", "#f97316"] as const

function normalizeLinePoints(points: unknown): LinePoint[] {
    if (!Array.isArray(points)) return []

    const normalized = points
        .map((point) => {
            if (!Array.isArray(point) || point.length < 2) return null
            const x = Number(point[0])
            const y = Number(point[1])
            if (!Number.isFinite(x) || !Number.isFinite(y)) return null
            return [x, y] as LinePoint
        })
        .filter((point): point is LinePoint => point !== null)

    return normalized.length >= 2 ? normalized.slice(0, 3) : []
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
    const [prefersDark, setPrefersDark] = useState(() => (
        typeof window !== "undefined"
        && typeof window.matchMedia === "function"
        && window.matchMedia("(prefers-color-scheme: dark)").matches
    ))
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

    useEffect(() => {
        if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
            return
        }

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
        const handleChange = (event: MediaQueryListEvent) => {
            setPrefersDark(event.matches)
        }

        if (typeof mediaQuery.addEventListener === "function") {
            mediaQuery.addEventListener("change", handleChange)
            return () => {
                mediaQuery.removeEventListener("change", handleChange)
            }
        }

        if (typeof mediaQuery.addListener === "function") {
            mediaQuery.addListener(handleChange)
            return () => {
                mediaQuery.removeListener(handleChange)
            }
        }
    }, [])

    const isMobile = viewportWidth < 768
    const isDarkMode = settings?.theme === "dark"
        || (settings?.theme === "system"
            && prefersDark)
    const chartHeight = resolveResponsiveHeight(viewportWidth)
    const showPieChart = !isMobile
    const isLoading = Boolean(isExternalLoading)
    const [hoveredSliceId, setHoveredSliceId] = useState<string | null>(null)
    const labelLinePointsRef = useRef<Record<number, LinePoint[]>>({})

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
                : (slice.color || CHART_FALLBACK_COLORS[index % CHART_FALLBACK_COLORS.length])

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

    useEffect(() => {
        labelLinePointsRef.current = {}
    }, [chartData])

    const option: echarts.EChartsOption = useMemo(() => {
        if (!chartData.length) return {}

        const activeDataIndex = hoveredSliceId
            ? chartData.findIndex((slice) => slice.id === hoveredSliceId)
            : -1

        const activeConnector: ActiveConnectorDatum | null = activeDataIndex >= 0
            && chartData[activeDataIndex]
            ? {
                dataIndex: activeDataIndex,
                color: chartData[activeDataIndex].rawColor
            }
            : null

        const connectorSeries = {
            name: "Connector Flow",
            type: "custom",
            coordinateSystem: "none",
            silent: true,
            tooltip: { show: false },
            z: 6,
            data: activeConnector ? [activeConnector] : [],
            renderItem: () => {
                if (!activeConnector) return null

                const points = labelLinePointsRef.current[activeConnector.dataIndex]
                if (!points || points.length < 2) return null

                const p1 = points[0]
                const p2 = points[1]
                const p3 = points[2] ?? points[1]
                const segmentOneLength = Math.hypot(p2[0] - p1[0], p2[1] - p1[1])
                const segmentTwoLength = Math.hypot(p3[0] - p2[0], p3[1] - p2[1])
                const totalLength = Math.max(segmentOneLength + segmentTwoLength, 1)
                const pivot = Math.min(Math.max(segmentOneLength / totalLength, 0.2), 0.82)

                return {
                    type: "group",
                    silent: true,
                    children: [
                        {
                            type: "polyline",
                            shape: { points: [p1, p2, p3] },
                            style: {
                                fill: null,
                                stroke: echarts.color.modifyAlpha(activeConnector.color, 0.35),
                                lineWidth: 1.1,
                                opacity: 0.5
                            }
                        },
                        {
                            type: "polyline",
                            shape: { points: [p1, p2, p3] },
                            style: {
                                fill: null,
                                stroke: echarts.color.modifyAlpha(activeConnector.color, 0.92),
                                lineWidth: 1.1,
                                opacity: 0.2,
                                shadowBlur: 0,
                                shadowColor: activeConnector.color
                            },
                            keyframeAnimation: {
                                duration: 2000,
                                loop: true,
                                keyframes: [
                                    {
                                        percent: 0,
                                        style: { lineWidth: 1.1, opacity: 0.14, shadowBlur: 0 }
                                    },
                                    {
                                        percent: 0.5,
                                        style: { lineWidth: 2.2, opacity: 0.9, shadowBlur: 12 }
                                    },
                                    {
                                        percent: 1,
                                        style: { lineWidth: 1.1, opacity: 0.14, shadowBlur: 0 }
                                    }
                                ]
                            }
                        },
                        {
                            type: "circle",
                            shape: { cx: p1[0], cy: p1[1], r: 1.6 },
                            style: {
                                fill: activeConnector.color,
                                opacity: 0
                            },
                            keyframeAnimation: {
                                duration: 2000,
                                loop: true,
                                keyframes: [
                                    {
                                        percent: 0,
                                        shape: { cx: p1[0], cy: p1[1], r: 1.2 },
                                        style: { opacity: 0 }
                                    },
                                    {
                                        percent: pivot,
                                        shape: { cx: p2[0], cy: p2[1], r: 2.2 },
                                        style: { opacity: 0.92 }
                                    },
                                    {
                                        percent: 1,
                                        shape: { cx: p3[0], cy: p3[1], r: 1.4 },
                                        style: { opacity: 0 }
                                    }
                                ]
                            }
                        }
                    ]
                }
            }
        } as unknown as echarts.SeriesOption

        return {
            tooltip: {
                show: false,
                trigger: "none"
            },
            series: [
                {
                    name: "Composizione Spese",
                    type: "pie",
                    radius: ["47%", "68%"],
                    center: ["50%", "43%"],
                    avoidLabelOverlap: true,
                    minAngle: 3,
                    itemStyle: {
                        borderRadius: 14,
                        borderColor: isDarkMode ? "rgba(15, 23, 42, 0.9)" : "rgba(248, 250, 252, 0.95)",
                        borderWidth: 3,
                        shadowBlur: 12,
                        shadowColor: "rgba(15, 23, 42, 0.18)"
                    },
                    label: {
                        show: true,
                        position: "outside",
                        alignTo: "edge",
                        edgeDistance: 20,
                        bleedMargin: 6,
                        formatter: (params: unknown) => {
                            const pieParam = params as PieLabelFormatterParam
                            return `{name|${pieParam.name.toUpperCase()}}\n{value|${formatCents(pieParam.value, currency, locale)}}\n{percent|${pieParam.percent.toFixed(2)}%}`
                        },
                        rich: {
                            name: {
                                color: "#64748b",
                                fontSize: 10,
                                fontWeight: 800,
                                align: "left",
                                padding: [0, 0, 3, 0]
                            },
                            value: {
                                color: isDarkMode ? "#f8fafc" : "#0f172a",
                                fontSize: 14,
                                fontWeight: 900,
                                align: "left",
                                padding: [0, 0, 2, 0]
                            },
                            percent: {
                                color: "#2563eb",
                                fontSize: 11,
                                fontWeight: 800,
                                align: "left"
                            }
                        }
                    },
                    labelLine: {
                        show: true,
                        length: 13,
                        length2: 12,
                        lineStyle: {
                            width: 1.2,
                            color: "rgba(100, 116, 139, 0.55)"
                        }
                    },
                    labelLayout: (params: unknown) => {
                        const pieLayout = params as PieLabelLayoutParam
                        const points = normalizeLinePoints(pieLayout.labelLinePoints)

                        if (points.length >= 2) {
                            labelLinePointsRef.current[pieLayout.dataIndex] = points
                        } else {
                            delete labelLinePointsRef.current[pieLayout.dataIndex]
                        }

                        return { hideOverlap: true }
                    },
                    emphasis: {
                        scale: true,
                        scaleSize: 9,
                        focus: "self",
                        itemStyle: {
                            shadowBlur: 22,
                            shadowColor: "rgba(37, 99, 235, 0.25)"
                        },
                        labelLine: {
                            show: true,
                            lineStyle: {
                                width: 1.2,
                                color: "rgba(100, 116, 139, 0.68)"
                            }
                        }
                    },
                    blur: {
                        itemStyle: {
                            opacity: 0.4,
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
                },
                connectorSeries
            ]
        }
    }, [chartData, currency, hoveredSliceId, isDarkMode, locale])

    const onEvents = useMemo(() => ({
        mouseover: (params: unknown) => {
            const pieParams = params as PieEventParams
            if (pieParams.seriesType !== "pie") return

            const sliceId = pieParams.data?.id
                || (typeof pieParams.dataIndex === "number"
                    ? chartData[pieParams.dataIndex]?.id
                    : null)

            if (sliceId) {
                setHoveredSliceId(sliceId)
            }
        },
        highlight: (params: unknown) => {
            const pieParams = params as PieEventParams
            if (pieParams.seriesType !== "pie") return

            const sliceId = pieParams.data?.id
                || (typeof pieParams.dataIndex === "number"
                    ? chartData[pieParams.dataIndex]?.id
                    : null)

            if (sliceId) {
                setHoveredSliceId(sliceId)
            }
        },
        mouseout: (params: unknown) => {
            const pieParams = params as { seriesType?: string }
            if (pieParams.seriesType === "pie") {
                setHoveredSliceId(null)
            }
        },
        downplay: (params: unknown) => {
            const pieParams = params as { seriesType?: string }
            if (pieParams.seriesType === "pie") {
                setHoveredSliceId(null)
            }
        },
        globalout: () => {
            setHoveredSliceId(null)
        }
    }), [chartData])

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
            onEvents={onEvents}
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
