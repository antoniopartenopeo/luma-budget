"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EChartsWrapper } from "@/features/dashboard/components/charts/echarts-wrapper"
import { useTrendData } from "../use-trend-data"
import { useCurrency } from "@/features/settings/api/use-currency"
import { formatEuroNumber } from "@/lib/currency-utils"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart3 } from "lucide-react"
import type { EChartsOption } from "echarts"

export function TrendAnalysisCard() {
    const { data, isLoading } = useTrendData()
    const { currency, locale } = useCurrency()

    const option: EChartsOption = useMemo(() => {
        if (!data.length) return {}

        return {
            tooltip: {
                trigger: "axis",
                axisPointer: { type: "cross" },
                backgroundColor: "rgba(255, 255, 255, 0.98)",
                borderColor: "#f1f5f9",
                borderWidth: 1,
                padding: [12, 16],
                textStyle: { color: "#1e293b", fontSize: 13 },
                extraCssText: "box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border-radius: 12px;",
                formatter: (params: unknown) => {
                    const p = params as { name: string, value: number, dataIndex: number, color: string }[]
                    const [income, expenses] = p
                    const index = income.dataIndex
                    const sRate = data[index].savingsRateLabel
                    return `
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 8px; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px;">
              ${income.name}
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <div style="display: flex; justify-content: space-between; gap: 24px;">
                <span style="color: #64748b;">Entrate:</span>
                <span style="font-weight: 700; color: #10b981;">${formatEuroNumber(income.value, currency, locale)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; gap: 24px;">
                <span style="color: #64748b;">Uscite:</span>
                <span style="font-weight: 700; color: #f43f5e;">${formatEuroNumber(expenses.value, currency, locale)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; gap: 24px; margin-top: 4px; padding-top: 4px; border-top: 1px dashed #f1f5f9;">
                <span style="color: #64748b;">Risparmio:</span>
                <span style="font-weight: 700; color: #3b82f6;">${sRate}</span>
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
                textStyle: { color: "#64748b", fontSize: 12 }
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
                axisLine: { lineStyle: { color: "#f1f5f9" } },
                axisLabel: { color: "#94a3b8", fontSize: 11 }
            },
            yAxis: {
                type: "value",
                splitLine: { lineStyle: { type: "dashed", color: "#f8fafc" } },
                axisLabel: {
                    color: "#cbd5e1",
                    fontSize: 10,
                    formatter: (value: number) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value.toString()
                }
            },
            series: [
                {
                    name: "Entrate",
                    type: "line",
                    smooth: true,
                    showSymbol: false,
                    areaStyle: {
                        color: {
                            type: "linear",
                            x: 0, y: 0, x2: 0, y2: 1,
                            colorStops: [
                                { offset: 0, color: "rgba(16, 185, 129, 0.2)" },
                                { offset: 1, color: "rgba(16, 185, 129, 0)" }
                            ]
                        }
                    },
                    itemStyle: { color: "#10b981" },
                    lineStyle: { width: 3 },
                    data: data.map(d => d.income)
                },
                {
                    name: "Uscite",
                    type: "line",
                    smooth: true,
                    showSymbol: false,
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
                    lineStyle: { width: 3 },
                    data: data.map(d => d.expenses)
                }
            ]
        }
    }, [data, currency, locale])

    if (isLoading) {
        return (
            <Card className="rounded-2xl border-none bg-card/50 backdrop-blur-sm shadow-sm">
                <CardHeader>
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="h-[350px]">
                    <Skeleton className="h-full w-full rounded-xl" />
                </CardContent>
            </Card>
        )
    }

    if (!data.length) {
        return (
            <Card className="rounded-2xl border-none bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-xl font-bold tracking-tight">Velocità Finanziaria (12 Mesi)</CardTitle>
                    <CardDescription>Confronto tra entrate e uscite storiche</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px] flex items-center justify-center text-center p-8">
                    <div className="max-w-[280px] space-y-2">
                        <div className="bg-muted/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BarChart3 className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold">Dati insufficienti</h3>
                        <p className="text-sm text-muted-foreground">
                            Non ci sono abbastanza transazioni negli ultimi 12 mesi per generare il grafico.
                        </p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="rounded-2xl border-none bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
            <CardHeader>
                <CardTitle className="text-xl font-bold tracking-tight">Velocità Finanziaria (12 Mesi)</CardTitle>
                <CardDescription>Confronto tra entrate e uscite storiche</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full">
                    <EChartsWrapper option={option} />
                </div>
            </CardContent>
        </Card>
    )
}
