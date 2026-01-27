"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCurrency } from "@/features/settings/api/use-currency"
import { formatEuroNumber } from "@/domain/money"
import { EChartsWrapper } from "./echarts-wrapper"
import type { EChartsOption } from "echarts"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { StateMessage } from "@/components/ui/state-message"
import { MacroSection } from "@/components/patterns/macro-section"

interface MonthlyExpensesEChartProps {
    data?: { name: string; total: number }[]
    isLoading?: boolean
    isError?: boolean
    onRetry?: () => void
}

export function MonthlyExpensesEChart({ data, isLoading, isError, onRetry }: MonthlyExpensesEChartProps) {
    const { currency, locale } = useCurrency()

    const option: EChartsOption = useMemo(() => {
        if (!data) return {}

        return {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                padding: [10, 15],
                textStyle: {
                    color: '#1e293b',
                    fontSize: 12
                },
                formatter: (params: unknown) => {
                    const paramArray = params as { value: number; name: string; color: string }[]
                    const param = paramArray[0]
                    const val = formatEuroNumber(param.value, currency, locale)
                    return `
                        <div style="font-family: inherit;">
                            <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">${param.name}</div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${param.color};"></div>
                                <div style="font-weight: 600; font-size: 14px;">${val}</div>
                            </div>
                        </div>
                    `
                },
                extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-radius: 8px;'
            },
            grid: {
                left: '2%',
                right: '2%',
                bottom: '3%',
                top: '10%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: data.map(item => item.name),
                axisTick: { show: false },
                axisLine: { show: false },
                axisLabel: {
                    color: '#94a3b8',
                    fontSize: 11,
                    margin: 15
                }
            },
            yAxis: {
                type: 'value',
                splitLine: {
                    lineStyle: {
                        type: 'dashed',
                        color: '#f1f5f9'
                    }
                },
                axisLabel: {
                    color: '#94a3b8',
                    fontSize: 11,
                    formatter: (value: number) => {
                        if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
                        return value.toString()
                    }
                }
            },
            series: [
                {
                    data: data.map(item => item.total),
                    type: 'bar',
                    barWidth: '40%',
                    itemStyle: {
                        color: '#6366f1',
                        borderRadius: [10, 10, 0, 0]
                    },
                    emphasis: {
                        itemStyle: {
                            color: '#4f46e5'
                        }
                    },
                    animationDuration: 1500,
                    animationEasing: 'cubicOut'
                }
            ]
        }
    }, [data, currency, locale])

    if (isLoading) {
        return (
            <MacroSection title="Spese Mensili" description="Caricamento in corso..." className="col-span-2">
                <div className="h-[350px]">
                    <Skeleton className="h-full w-full rounded-2xl" />
                </div>
            </MacroSection>
        )
    }

    if (isError) {
        return (
            <div className="col-span-2 h-full">
                <StateMessage
                    variant="error"
                    title="Errore caricamento grafico"
                    description="Non siamo riusciti a caricare i dati del grafico."
                    actionLabel="Riprova"
                    onActionClick={onRetry}
                />
            </div>
        )
    }

    const hasData = data && data.length > 0 && data.some(item => item.total > 0)

    return (
        <MacroSection
            title="Spese Mensili"
            description="Andamento nel periodo selezionato"
            className="col-span-2"
        >
            <div className="h-[350px] w-full py-4">
                {hasData ? (
                    <EChartsWrapper option={option} />
                ) : (
                    <div className="h-full flex items-center justify-center">
                        <StateMessage
                            variant="empty"
                            title="Nessun dato"
                            description="Inizia a registrare transazioni per vedere l'andamento"
                        />
                    </div>
                )}
            </div>
        </MacroSection>
    )
}
