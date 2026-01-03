import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"
import { useCurrency } from "@/features/settings/api/use-currency"
import { formatEuroNumber } from "@/lib/currency-utils"

import { StateMessage } from "@/components/ui/state-message"

interface MonthlyExpensesChartProps {
    data?: { name: string; total: number }[]
    isLoading?: boolean
    isError?: boolean
    onRetry?: () => void
}

export function MonthlyExpensesChart({ data, isLoading, isError, onRetry }: MonthlyExpensesChartProps) {
    const { currency, locale } = useCurrency()

    const formatValue = (value: number) => {
        return formatEuroNumber(value, currency, locale)
    }

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

    const hasData = data && data.length > 0 && data.some(item => item.total > 0)

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
                            Andamento nel periodo selezionato
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="pl-2">
                    {hasData ? (
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={data}>
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
                                    tickFormatter={(value) => formatValue(value)}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    labelFormatter={(label) => `${label} ${new Date().getFullYear()}`}
                                    formatter={(value: number) => [formatValue(value), "Spese"]}
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
