"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CategorySummary } from "@/features/dashboard/api/types"
import { CategoryIcon } from "@/features/categories/components/category-icon"
import { getCategoryById } from "@/features/categories/config"
import { useCategories } from "@/features/categories/api/use-categories"
import { StateMessage } from "@/components/ui/state-message"
import { EChartsWrapper } from "./echarts-wrapper"
import type { EChartsOption } from "echarts"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { useCurrency } from "@/features/settings/api/use-currency"
import { formatEuroNumber } from "@/domain/money"

interface CategoryDistributionEChartProps {
    data: CategorySummary[]
    isLoading?: boolean
}

export function CategoryDistributionEChart({ data, isLoading: isExternalLoading }: CategoryDistributionEChartProps) {
    const router = useRouter()
    const { currency, locale } = useCurrency()
    const { data: categories = [], isLoading: isCategoriesLoading } = useCategories()
    const isLoading = isExternalLoading || isCategoriesLoading

    const preparedData = useMemo(() => {
        if (!data || data.length === 0) return []
        const sorted = [...data].sort((a, b) => b.value - a.value)
        if (sorted.length > 5) {
            const top4 = sorted.slice(0, 4)
            const others = sorted.slice(4)
            const otherValue = others.reduce((acc, curr) => acc + curr.value, 0)
            return [
                ...top4,
                {
                    name: "Altro",
                    id: "altro",
                    value: otherValue,
                    color: "hsl(var(--muted))"
                }
            ]
        }
        return sorted
    }, [data])

    const option: EChartsOption = useMemo(() => {
        return {
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                padding: [10, 15],
                textStyle: {
                    color: '#1e293b',
                    fontSize: 12
                },
                formatter: (params: unknown) => {
                    const p = params as { value: number; name: string; percent: number; color: string }
                    const val = formatEuroNumber(p.value, currency, locale)
                    return `
                        <div style="font-family: inherit;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${p.color};"></div>
                                <div style="font-weight: 500;">${p.name}</div>
                            </div>
                            <div style="font-weight: 600; font-size: 14px; margin-top: 4px;">${val} (${p.percent}%)</div>
                        </div>
                    `
                },
                extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-radius: 8px;'
            },
            series: [
                {
                    name: 'Categorie',
                    type: 'pie',
                    radius: ['60%', '85%'],
                    center: ['50%', '45%'],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    label: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: 18,
                            fontWeight: 'bold',
                            formatter: '{d}%'
                        },
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    labelLine: {
                        show: false
                    },
                    data: preparedData.map(item => {
                        const cat = getCategoryById(item.id || "", categories)
                        return {
                            value: item.value,
                            name: item.name,
                            itemStyle: {
                                color: cat ? cat.hexColor : item.color
                            }
                        }
                    })
                }
            ]
        }
    }, [preparedData, currency, locale, categories])

    if (isLoading) {
        return (
            <Card className="rounded-xl shadow-sm border-none bg-card/50">
                <CardHeader>
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[250px] w-[250px] mx-auto rounded-full" />
                </CardContent>
            </Card>
        )
    }

    const hasData = preparedData && preparedData.length > 0 && preparedData.some(d => d.value > 0)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all h-full border-none bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xl font-bold tracking-tight">Categorie</CardTitle>
                    <CardDescription>Distribuzione delle spese nel periodo</CardDescription>
                </CardHeader>
                <CardContent>
                    {hasData ? (
                        <>
                            <div className="h-[250px] w-full">
                                <EChartsWrapper
                                    option={option}
                                    onEvents={{
                                        'click': (params: unknown) => {
                                            const p = params as { name: string }
                                            const item = preparedData.find(d => d.name === p.name)
                                            if (item && item.id && item.id !== "altro") {
                                                router.push(`/transactions?category=${item.id}`)
                                            }
                                        }
                                    }}
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-1.5 mt-6 text-sm">
                                {preparedData.map((item, index) => {
                                    const cat = getCategoryById(item.id || "", categories)
                                    const color = cat ? cat.hexColor : item.color
                                    const isOther = item.id === "altro"

                                    return (
                                        <div
                                            key={`legend-${index}`}
                                            className="flex items-center justify-between group cursor-pointer p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
                                            onClick={() => {
                                                if (item.id && !isOther) {
                                                    router.push(`/transactions?category=${item.id}`)
                                                }
                                            }}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                                                <div className="flex items-center gap-2">
                                                    {!isOther && <CategoryIcon categoryName={item.name} size={14} />}
                                                    <span className="text-muted-foreground font-medium">{item.name}</span>
                                                </div>
                                            </div>
                                            <span className="font-semibold tabular-nums">
                                                {formatEuroNumber(item.value, currency, locale)}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="h-[350px] flex items-center justify-center">
                            <StateMessage
                                variant="empty"
                                title="Nessun dato"
                                description="Non ci sono spese da categorizzare"
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}
