"use client"

import { useMemo, useState } from "react"
import { useCurrency } from "@/features/settings/api/use-currency"
import { formatEuroNumber } from "@/domain/money"
import { EChartsWrapper } from "./echarts-wrapper"
import type { EChartsOption } from "echarts"
import { motion, AnimatePresence, Variants } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { StateMessage } from "@/components/ui/state-message"
import { getCategoryById } from "@/features/categories/config"
import { useCategories } from "@/features/categories/api/use-categories"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { Transaction } from "@/features/transactions/api/types"
import { DashboardTimeFilter } from "../../api/types"
import { MacroSection } from "@/components/patterns/macro-section"

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
const SYNTHETIC_ALTRI_ID = "__altri__"

const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
    }
}

export function SpendingCompositionCard({ transactions, filter, isLoading: isExternalLoading }: SpendingCompositionCardProps) {
    const { currency, locale } = useCurrency()
    const { data: categories = [], isLoading: isCategoriesLoading } = useCategories()
    const isLoading = isExternalLoading || isCategoriesLoading

    const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
    const [highlightedCategory, setHighlightedCategory] = useState<string | null>(null)

    const { chartData, allCategories, periodBreakdown } = useMemo(() => {
        if (!transactions || transactions.length === 0) {
            return { chartData: [], allCategories: [], periodBreakdown: [] }
        }

        const endDate = new Date(filter.period + "-01")
        endDate.setMonth(endDate.getMonth() + 1)
        endDate.setDate(0)

        const startDate = new Date(filter.period + "-01")
        if (filter.mode === "range" && filter.months) {
            startDate.setMonth(startDate.getMonth() - (filter.months - 1))
        }
        startDate.setDate(1)

        const expenses = transactions.filter(t => {
            const d = new Date(t.timestamp)
            return t.type === "expense" && d >= startDate && d <= endDate
        })

        if (expenses.length === 0) {
            return { chartData: [], allCategories: [], periodBreakdown: [] }
        }

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

        expenses.forEach(tx => {
            const tDate = new Date(tx.timestamp)
            const mLabel = new Intl.DateTimeFormat("it-IT", { month: "short" }).format(tDate)
            const label = mLabel.charAt(0).toUpperCase() + mLabel.slice(1)
            if (!matrix[label]) return
            const current = matrix[label][tx.categoryId] || 0
            matrix[label][tx.categoryId] = current + (tx.amountCents || 0) / 100
        })

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
                color: "#94a3b8"
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

        const pb: PeriodBreakdownItem[] = seriesCategories.map(cat => {
            let total = 0
            if (cat.id === SYNTHETIC_ALTRI_ID) {
                total = othersCatIds.reduce((acc, id) => acc + (periodCategoryTotals[id] || 0), 0)
            } else {
                total = periodCategoryTotals[cat.id] || 0
            }
            return { ...cat, value: total }
        })

        const pbSorted = pb.sort((a, b) => {
            if (a.id === SYNTHETIC_ALTRI_ID) return 1
            if (b.id === SYNTHETIC_ALTRI_ID) return -1
            return b.value - a.value
        })

        return { chartData, allCategories: seriesCategories, periodBreakdown: pbSorted }
    }, [transactions, filter, categories])

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
                formatter: (params: any) => {
                    const pArray = params as any[]
                    const total = pArray.reduce((acc, p) => acc + (p.value || 0), 0)
                    let res = `<div style="font-weight: 700; font-size: 14px; margin-bottom: 10px; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; display: flex; justify-content: space-between; align-items: center; gap: 24px;">
                        <span>${pArray[0].name}</span>
                        <span style="color: #0f172a;">${formatEuroNumber(total, currency, locale)}</span>
                    </div>`
                    const sortedParams = [...pArray].sort((a, b) => {
                        if (a.seriesId === SYNTHETIC_ALTRI_ID) return 1
                        if (b.seriesId === SYNTHETIC_ALTRI_ID) return -1
                        return b.value - a.value
                    })
                    sortedParams.forEach((p) => {
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
                    })
                    return res
                },
                extraCssText: 'box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border-radius: 12px;'
            },
            legend: { show: false },
            grid: { left: '2%', right: '2%', bottom: '2%', top: '2%', containLabel: true },
            xAxis: {
                type: 'category',
                data: chartData.map(d => d.name),
                axisLine: { show: true, lineStyle: { color: '#e2e8f0' } },
                axisTick: { show: false },
                axisLabel: { color: '#64748b', fontSize: 11, margin: 12, fontWeight: 500 }
            },
            yAxis: {
                type: 'value',
                splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9', opacity: 0.8 } },
                axisLine: { show: false },
                axisLabel: {
                    color: '#94a3b8',
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
                itemStyle: {
                    color: cat.color,
                    borderRadius: cat.id === allCategories[allCategories.length - 1].id ? [4, 4, 0, 0] : [0, 0, 0, 0],
                    opacity: highlightedCategory ? (highlightedCategory === cat.id ? 1 : 0.15) : (selectedMonth ? 1 : 0.85)
                },
                data: chartData.map(d => Number(d[cat.id]) || 0),
                animationDuration: 800
            }))
        }
    }, [chartData, allCategories, highlightedCategory, selectedMonth, currency, locale])

    const handleReset = () => {
        setSelectedMonth(null)
        setHighlightedCategory(null)
    }

    if (isLoading) {
        return (
            <MacroSection title="Composizione Spese" description="Caricamento in corso..." className="w-full">
                <div className="h-[400px]">
                    <Skeleton className="h-full w-full rounded-2xl" />
                </div>
            </MacroSection>
        )
    }

    const hasData = chartData.length > 0

    return (
        <MacroSection
            title="Composizione Spese"
            description="Andamento mensile suddiviso per categoria"
            className="w-full"
        >
            {!hasData ? (
                <div className="h-[400px] flex items-center justify-center">
                    <StateMessage
                        variant="empty"
                        title="Nessun dato"
                        description="Le tue spese appariranno qui suddivise per categoria"
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start py-4">
                    <div className="lg:col-span-3 h-[400px] relative">
                        <EChartsWrapper
                            option={option}
                            onEvents={{
                                'click': (params: any) => {
                                    if (params.componentType === 'series' || params.componentType === 'xAxis') {
                                        setSelectedMonth(prev => prev === params.name ? null : params.name)
                                    }
                                }
                            }}
                        />
                    </div>

                    <div className="lg:col-span-1">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xs font-black text-foreground/80 uppercase tracking-wider">
                                {selectedMonth ? `Dettaglio ${selectedMonth}` : "Dettaglio Periodo"}
                            </h4>
                            {(selectedMonth || highlightedCategory) && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleReset}
                                    className="h-5 w-5 rounded-full hover:bg-primary/5 transition-colors"
                                >
                                    <RotateCcw className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                        <div className="space-y-2">
                            {currentBreakdown.map((item, idx) => {
                                const percent = totalInView > 0 ? (item.value / totalInView) * 100 : 0
                                return (
                                    <motion.div
                                        key={`${item.id}-${idx}`}
                                        layout
                                        variants={itemVariants}
                                        className={cn(
                                            "group relative p-3 rounded-2xl transition-all cursor-pointer border border-transparent",
                                            highlightedCategory === item.id
                                                ? "bg-muted/40 border-border shadow-sm ring-1 ring-primary/10"
                                                : "hover:bg-muted/30 hover:border-border/50",
                                            highlightedCategory && highlightedCategory !== item.id && "opacity-30"
                                        )}
                                        onClick={() => setHighlightedCategory(prev => prev === item.id ? null : item.id)}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2.5">
                                                <div
                                                    className="h-2.5 w-2.5 rounded-full shadow-sm"
                                                    style={{ backgroundColor: item.color }}
                                                />
                                                <span className="text-sm font-bold text-foreground tracking-tight">
                                                    {item.name}
                                                </span>
                                            </div>
                                            <span className="text-sm font-black tabular-nums text-foreground">
                                                {formatEuroNumber(item.value, currency, locale)}
                                            </span>
                                        </div>
                                        <div className="relative h-1.5 bg-muted/60 rounded-full overflow-hidden">
                                            <motion.div
                                                className="absolute inset-y-0 left-0 rounded-full"
                                                style={{ backgroundColor: item.color }}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percent}%` }}
                                                transition={{ duration: 0.5, ease: "easeOut" }}
                                            />
                                        </div>
                                        <div className="flex justify-end mt-1">
                                            <span className="text-[10px] font-bold text-muted-foreground/60 tabular-nums">
                                                {Math.round(percent)}%
                                            </span>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}
        </MacroSection>
    )
}
