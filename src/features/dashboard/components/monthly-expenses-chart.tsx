import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { StateMessage } from "@/components/ui/state-message"

interface MonthlyExpensesChartProps {
    data?: { name: string; total: number }[]
    isLoading?: boolean
    isError?: boolean
    onRetry?: () => void
}

type Period = "3m" | "6m" | "12m"

export function MonthlyExpensesChart({ data, isLoading, isError, onRetry }: MonthlyExpensesChartProps) {
    const [period, setPeriod] = useState<Period>("6m")

    const filteredData = useMemo(() => {
        if (!data) return []

        // Data is assumed to be last 12 months coming from API
        // If API returns 12 months:
        // 3m -> take last 3
        // 6m -> take last 6
        // 12m -> take all 12

        switch (period) {
            case "3m":
                return data.slice(-3)
            case "6m":
                return data.slice(-6)
            case "12m":
                return data.slice(-12)
            default:
                return data.slice(-6)
        }
    }, [data, period])

    if (isLoading) {
        return (
            <Card className="col-span-2 rounded-xl shadow-sm">
                <CardHeader>
                    <CardTitle>Spese Mensili</CardTitle>
                    <CardDescription>Andamento delle spese</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <Skeleton className="h-[350px] w-full rounded-lg" />
                </CardContent>
            </Card>
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

    const hasData = filteredData && filteredData.length > 0 && filteredData.some(item => item.total > 0)

    const periodLabel = {
        "3m": "Ultimi 3 mesi",
        "6m": "Ultimi 6 mesi",
        "12m": "Ultimi 12 mesi",
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="col-span-2"
        >
            <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow h-full">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-6">
                    <div className="space-y-1">
                        <CardTitle>Spese Mensili</CardTitle>
                        <CardDescription>
                            Andamento delle spese nel periodo selezionato ({periodLabel[period]})
                        </CardDescription>
                    </div>

                    <div className="flex items-center p-1 bg-muted/40 rounded-lg">
                        {(["3m", "6m", "12m"] as Period[]).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={cn(
                                    "px-3 py-1 text-xs font-medium rounded-md transition-all",
                                    period === p
                                        ? "bg-white text-primary shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                                )}
                            >
                                {p === "3m" ? "3M" : p === "6m" ? "6M" : "12M"}
                            </button>
                        ))}
                    </div>
                </CardHeader>
                <CardContent className="pl-2">
                    {hasData ? (
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={filteredData}>
                                <XAxis
                                    dataKey="name"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `€${value}`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    labelFormatter={(label) => `${label} ${new Date().getFullYear()}`}
                                    formatter={(value: number) => [`€${value}`, "Totale"]}
                                />
                                <Bar
                                    dataKey="total"
                                    fill="#6366f1"
                                    radius={[4, 4, 0, 0]}
                                    animationDuration={1500}
                                    animationEasing="ease-out"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[350px] flex items-center justify-center text-center p-6">
                            <div className="max-w-[280px]">
                                <StateMessage
                                    variant="empty"
                                    title="Nessun dato nel periodo"
                                    description="Qui vedrai l'andamento delle spese quando inizierai a registrare transazioni in questo periodo."
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}
