"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCurrency } from "@/features/settings/api/use-currency"
import { formatEuroNumber } from "@/domain/money"
import { EChartsWrapper } from "./echarts-wrapper"
import type { EChartsOption } from "echarts"
import { motion, AnimatePresence } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { StateMessage } from "@/components/ui/state-message"
import { getCategoryById } from "@/features/categories/config"
import { useCategories } from "@/features/categories/api/use-categories"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { Transaction } from "@/features/transactions/api/types"
import { DashboardTimeFilter } from "../../api/types"

interface SpendingCompositionCardProps {
    transactions: Transaction[]
    filter: DashboardTimeFilter
    isLoading?: boolean
}

type PeriodBreakdownItem = {
    id: string
    name: string
    color: string
    value: number
}

const TOP_N_CATEGORIES = 4
// Unique ID for synthetic "Altro" category to avoid collision with real categories
const SYNTHETIC_ALTRI_ID = "__altri__"

export function SpendingCompositionCard({ transactions, filter, isLoading: isExternalLoading }: SpendingCompositionCardProps) {
    const { currency, locale } = useCurrency()
    const { data: categories = [], isLoading: isCategoriesLoading } = useCategories()

    const isLoading = isExternalLoading || isCategoriesLoading

    const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
    const [highlightedCategory, setHighlightedCategory] = useState<string | null>(null)

    // 1. Data Shaping Logic
    const { chartData, allCategories, periodBreakdown } = useMemo(() => {
        if (!transactions || transactions.length === 0) {
            return { chartData: [], allCategories: [], periodBreakdown: [] }
        }

        // Determine range
        const endDate = new Date(filter.period + "-01")
        endDate.setMonth(endDate.getMonth() + 1)
        endDate.setDate(0)

        const startDate = new Date(filter.period + "-01")
        if (filter.mode === "range" && filter.months) {
            startDate.setMonth(startDate.getMonth() - (filter.months - 1))
        }
        startDate.setDate(1)

        // Filter valid expenses
        const expenses = transactions.filter(t => {
            const d = new Date(t.timestamp)
            return t.type === "expense" && d >= startDate && d <= endDate
        })

        if (expenses.length === 0) {
            return { chartData: [], allCategories: [], periodBreakdown: [] }
        }

        // Build Matrix: Month -> Category -> Amount
        const matrix: Record<string, Record<string, number>> = {}
        const months: string[] = []

        const iterDate = new Date(startDate)
        while (iterDate <= endDate) {
            const mLabel = new Intl.DateTimeFormat("it-IT", { month: "short" }).format(iterDate)
            const label = mLabel.charAt(0).toUpperCase() + mLabel.slice(1)
            months.push(label)
            matrix[label] = {}
            iterDate.setMonth(iterDate.getMonth() + 1)
        }

        // Populate Matrix
        expenses.forEach(tx => {
            const tDate = new Date(tx.timestamp)
            const mLabel = new Intl.DateTimeFormat("it-IT", { month: "short" }).format(tDate)
            const label = mLabel.charAt(0).toUpperCase() + mLabel.slice(1)

            if (!matrix[label]) return

            const current = matrix[label][tx.categoryId] || 0
            matrix[label][tx.categoryId] = current + (tx.amountCents || 0) / 100
        })

        // Identify Top Categories across the whole period
        const periodCategoryTotals: Record<string, number> = {}
        expenses.forEach(tx => {
            const current = periodCategoryTotals[tx.categoryId] || 0
            periodCategoryTotals[tx.categoryId] = current + (tx.amountCents || 0) / 100
        })

        const sortedCategories = Object.entries(periodCategoryTotals)
            .sort(([, a], [, b]) => b - a)
            .map(([id, value]) => ({ id, value }))

        const topCatIds = sortedCategories.slice(0, TOP_N_CATEGORIES).map(c => c.id)
        const othersCatIds = sortedCategories.slice(TOP_N_CATEGORIES).map(c => c.id)

        // Build Final Series structure for ECharts
        const seriesCategories = topCatIds.map(id => {
            const config = getCategoryById(id, categories)
            return {
                id,
                name: config?.label || "Sconosciuta",
                color: config?.hexColor || "hsl(var(--primary))"
            }
        })

        if (othersCatIds.length > 0) {
            seriesCategories.push({
                id: SYNTHETIC_ALTRI_ID,
                name: "Altri",
                color: "#94a3b8" // Muted gray
            })
        }

        const chartData = months.map(month => {
            const row: Record<string, string | number> = { name: month }
            let othersSum = 0

            topCatIds.forEach(id => {
                row[id] = matrix[month][id] || 0
            })

            othersCatIds.forEach(id => {
                othersSum += matrix[month][id] || 0
            })

            if (othersCatIds.length > 0) {
                row[SYNTHETIC_ALTRI_ID] = othersSum
            }

            return row
        })

        // Build Period-wide breakdown
        const pb: PeriodBreakdownItem[] = seriesCategories.map(cat => {
            let total = 0
            if (cat.id === SYNTHETIC_ALTRI_ID) {
                total = othersCatIds.reduce((acc, id) => acc + (periodCategoryTotals[id] || 0), 0)
            } else {
                total = periodCategoryTotals[cat.id] || 0
            }
            return { ...cat, value: total }
        })
        // Sort: top categories first, Altro ALWAYS last
        const pbSorted = pb.sort((a, b) => {
            if (a.id === SYNTHETIC_ALTRI_ID) return 1
            if (b.id === SYNTHETIC_ALTRI_ID) return -1
            return b.value - a.value
        })

        return {
            chartData,
            allCategories: seriesCategories,
            periodBreakdown: pbSorted
        }
    }, [transactions, filter, categories])

    // Contextual breakdown based on selection
    const currentBreakdown = useMemo<PeriodBreakdownItem[]>(() => {
        if (!selectedMonth || !chartData.length) return periodBreakdown

        const monthRow = chartData.find(d => d.name === selectedMonth)
        if (!monthRow) return periodBreakdown

        return allCategories.map(cat => ({
            ...cat,
            value: Number(monthRow[cat.id]) || 0
        })).sort((a, b) => {
            if (a.id === SYNTHETIC_ALTRI_ID) return 1
            if (b.id === SYNTHETIC_ALTRI_ID) return -1
            return b.value - a.value
        })
    }, [selectedMonth, chartData, periodBreakdown, allCategories])

    const totalInView = currentBreakdown.reduce((acc, curr) => acc + curr.value, 0)

    const option: EChartsOption = useMemo(() => {
        if (!chartData.length) return {}

        return {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                borderColor: '#f1f5f9',
                borderWidth: 1,
                padding: [12, 16],
                textStyle: { color: '#1e293b', fontSize: 13 },
                formatter: (params: unknown) => {
                    const pArray = params as { name: string; seriesId: string; seriesName: string; color: string; value: number }[]
                    const total = pArray.reduce((acc, p) => acc + (p.value || 0), 0)

                    let res = `<div style="font-weight: 700; font-size: 14px; margin-bottom: 10px; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; display: flex; justify-content: space-between; align-items: center; gap: 24px;">
                        <span>${pArray[0].name}</span>
                        <span style="color: #0f172a;">${formatEuroNumber(total, currency, locale)}</span>
                    </div>`

                    // Sort items by value for tooltip, but maybe keep Altro last?
                    const sortedParams = [...pArray].sort((a, b) => {
                        if (a.seriesId === SYNTHETIC_ALTRI_ID) return 1
                        if (b.seriesId === SYNTHETIC_ALTRI_ID) return -1
                        return b.value - a.value
                    })

                    sortedParams.forEach((p) => {
                        if (p.value >= 0) { // Also show 0 values if we want consistency, or > 0 for brevity
                            const percent = total > 0 ? Math.round((p.value / total) * 100) : 0
                            const isHighlighted = highlightedCategory && highlightedCategory !== p.seriesId
                            res += `
                                <div style="display: flex; align-items: center; justify-content: space-between; gap: 32px; margin-bottom: 6px; opacity: ${isHighlighted ? 0.3 : 1}">
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        <div style="width: 10px; height: 10px; border-radius: 3px; background-color: ${p.color};"></div>
                                        <span style="color: #64748b; font-weight: 500;">${p.seriesName}</span>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 12px;">
                                        <span style="color: #94a3b8; font-size: 11px; font-weight: 600; min-width: 28px; text-align: right;">${percent}%</span>
                                        <span style="font-weight: 700; color: #334155; min-width: 60px; text-align: right;">${formatEuroNumber(p.value, currency, locale)}</span>
                                    </div>
                                </div>
                            `
                        }
                    })
                    return res
                },
                extraCssText: 'box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); border-radius: 12px;'
            },
            legend: { show: false },
            grid: { left: '2%', right: '2%', bottom: '2%', top: '2%', containLabel: true },
            xAxis: {
                type: 'category',
                data: chartData.map(d => d.name),
                axisLine: { show: true, lineStyle: { color: '#f1f5f9' } },
                axisTick: { show: false },
                axisLabel: { color: '#94a3b8', fontSize: 11, margin: 12 }
            },
            yAxis: {
                type: 'value',
                splitLine: { lineStyle: { type: 'dashed', color: '#f8fafc', opacity: 0.6 } },
                axisLine: { show: false },
                axisLabel: {
                    color: '#cbd5e1',
                    fontSize: 10,
                    margin: 8,
                    formatter: (val: number) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val.toString()
                }
            },
            series: allCategories.map(cat => ({
                id: cat.id,
                name: cat.name,
                type: 'bar',
                stack: 'total',
                barWidth: '40%',
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(0,0,0,0.1)'
                    }
                },
                itemStyle: {
                    color: cat.color,
                    borderRadius: cat.id === allCategories[allCategories.length - 1].id ? [4, 4, 0, 0] : [0, 0, 0, 0],
                    opacity: highlightedCategory ? (highlightedCategory === cat.id ? 1 : 0.15) :
                        (selectedMonth ? 1 : 0.85) // Slight opacity boost when nothing selected
                },
                data: chartData.map(d => Number(d[cat.id]) || 0),
                animationDuration: 800,
                animationEasing: 'exponentialOut'
            }))
        }
    }, [chartData, allCategories, highlightedCategory, selectedMonth, currency, locale])

    const handleReset = () => {
        setSelectedMonth(null)
        setHighlightedCategory(null)
    }

    if (isLoading) {
        return (
            <Card className="col-span-3 rounded-2xl shadow-sm border-none bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="h-[400px]">
                    <Skeleton className="h-full w-full rounded-xl" />
                </CardContent>
            </Card>
        )
    }

    const hasData = chartData.length > 0

    return (
        <Card className="col-span-3 rounded-2xl shadow-sm border-none bg-card/50 backdrop-blur-sm group overflow-hidden gap-2">
            <CardHeader className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-0">
                <div className="space-y-1">
                    <CardTitle className="text-xl font-bold tracking-tight">Composizione Spese</CardTitle>
                    <CardDescription>Andamento mensile suddiviso per categoria</CardDescription>
                </div>
            </CardHeader>

            <CardContent>
                {!hasData ? (
                    <div className="h-[400px] flex items-center justify-center">
                        <StateMessage
                            variant="empty"
                            title="Nessun dato"
                            description="Le tue spese appariranno qui suddivise per categoria"
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
                        {/* CHART SECTION */}
                        <div className="lg:col-span-3 h-[400px] relative">
                            <EChartsWrapper
                                option={option}
                                onEvents={{
                                    'click': (params: unknown) => {
                                        const p = params as { componentType: string; seriesId: string; name: string }
                                        if (p.componentType === 'series' || p.componentType === 'xAxis') {
                                            // Toggle month selection on click
                                            setSelectedMonth(prev => prev === p.name ? null : p.name)
                                        }
                                    }
                                }}
                            />
                        </div>

                        {/* BREAKDOWN SECTION */}
                        <div className="lg:col-span-1">
                            {/* Section header aligned with chart */}
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                                    {selectedMonth ? `Dettaglio ${selectedMonth}` : "Dettaglio Periodo"}
                                </h4>
                                <AnimatePresence>
                                    {(selectedMonth || highlightedCategory) && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                        >
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={handleReset}
                                                className="h-5 w-5 rounded-full hover:bg-primary/5 transition-colors"
                                                title="Reset filtri"
                                            >
                                                <RotateCcw className="h-3 w-3" />
                                            </Button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <div className="space-y-2">
                                {currentBreakdown
                                    .sort((a, b) => b.value - a.value)
                                    .map((item, idx) => {
                                        const percent = totalInView > 0 ? (item.value / totalInView) * 100 : 0
                                        return (
                                            <motion.div
                                                key={`${item.id}-${idx}`}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className={cn(
                                                    "group relative p-3 rounded-xl transition-all cursor-pointer",
                                                    highlightedCategory === item.id
                                                        ? "bg-background shadow-lg ring-1 ring-primary/20"
                                                        : "hover:bg-muted/50",
                                                    highlightedCategory && highlightedCategory !== item.id && "opacity-30"
                                                )}
                                                onClick={() => setHighlightedCategory(prev => prev === item.id ? null : item.id)}
                                            >
                                                {/* Top row: name + amount */}
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2.5">
                                                        <div
                                                            className="h-2.5 w-2.5 rounded-full ring-2 ring-white/50 ring-offset-1 ring-offset-background"
                                                            style={{ backgroundColor: item.color }}
                                                        />
                                                        <span className="text-sm font-semibold text-foreground">
                                                            {item.name}
                                                        </span>
                                                        {idx < 3 && (
                                                            <span className={cn(
                                                                "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                                                                idx === 0 && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                                                                idx === 1 && "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
                                                                idx === 2 && "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                                                            )}>
                                                                #{idx + 1}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-bold tabular-nums text-foreground">
                                                        {formatEuroNumber(item.value, currency, locale)}
                                                    </span>
                                                </div>

                                                {/* Progress bar */}
                                                <div className="relative h-1.5 bg-muted/60 rounded-full overflow-hidden">
                                                    <motion.div
                                                        className="absolute inset-y-0 left-0 rounded-full"
                                                        style={{ backgroundColor: item.color }}
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${percent}%` }}
                                                        transition={{ duration: 0.5, ease: "easeOut", delay: idx * 0.05 }}
                                                    />
                                                </div>

                                                {/* Percentage label */}
                                                <div className="flex justify-end mt-1">
                                                    <span className="text-[10px] font-semibold text-muted-foreground tabular-nums">
                                                        {Math.round(percent)}%
                                                    </span>
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                            </div>

                            {selectedMonth && (
                                <div className="mt-8 pt-6 border-t border-dashed border-muted/60">
                                    <span className="text-[11px] text-muted-foreground font-semibold italic flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-primary/40" />
                                        Filtro attivo su <strong>{selectedMonth}</strong>
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
