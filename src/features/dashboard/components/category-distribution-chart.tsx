"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"
import { CategorySummary } from "@/features/dashboard/api/types"
import { CategoryIcon } from "@/features/categories/components/category-icon"
import { getCategoryById } from "@/features/categories/config"
import { StateMessage } from "@/components/ui/state-message"

// Recharts specific types - simplified to match what Recharts passes
interface LegendPayloadEntry {
    value: string;
    id?: string;
    type?: string;
    color?: string;
    payload?: {
        name: string;
        value: number;
        id: string;
        color: string;
    };
}

interface CategoryDistributionChartProps {
    data: CategorySummary[]
    isLoading?: boolean
}

export function CategoryDistributionChart({ data, isLoading }: CategoryDistributionChartProps) {
    const router = useRouter()

    const preparedData = useMemo(() => {
        if (!data || data.length === 0) return []

        // 1. Sort by value descending
        const sorted = [...data].sort((a, b) => b.value - a.value)

        // 2. Group after top 4
        if (sorted.length > 5) {
            const top4 = sorted.slice(0, 4)
            const others = sorted.slice(4)
            const otherValue = others.reduce((acc, curr) => acc + curr.value, 0)

            return [
                ...top4,
                {
                    name: "Altro",
                    id: "altro", // fallback ID for others
                    value: otherValue,
                    color: "hsl(var(--muted))" // Grey color for others
                }
            ]
        }
        return sorted

    }, [data])

    // Enhanced Custom Legend
    const renderLegend = (props: unknown) => {
        const { payload } = props as { payload?: LegendPayloadEntry[] }
        if (!payload) return null

        return (
            <div className="grid grid-cols-1 gap-2 mt-4 text-sm">
                {payload.map((entry, index) => {
                    const payloadData = entry.payload
                    if (!payloadData) return null

                    const cat = getCategoryById(payloadData.id || "")
                    // Use the category config for consistent colors, or fallback to chart color
                    const hexColor = cat ? cat.hexColor : entry.color
                    // Fallback check if it's "Altro" manual group or a real category
                    const isOther = payloadData.id === "altro"

                    return (
                        <div
                            key={`item-${index}`}
                            className="flex items-center justify-between group cursor-pointer p-1 rounded-md hover:bg-muted/50 transition-colors"
                            onClick={() => {
                                // Navigate filter
                                if (payloadData.id) {
                                    router.push(`/transactions?category=${payloadData.id}`)
                                }
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: hexColor }} />
                                {isOther ? (
                                    <span className="text-muted-foreground font-medium">Altro</span>
                                ) : (
                                    <div className="flex items-center gap-1.5">
                                        <CategoryIcon categoryName={entry.value} size={14} />
                                        <span className="text-muted-foreground">{entry.value}</span>
                                    </div>
                                )}
                            </div>
                            <span className="font-semibold">
                                {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(payloadData.value)}
                            </span>
                        </div>
                    )
                })}
            </div>
        )
    }

    if (isLoading) {
        return (
            <Card className="rounded-xl shadow-sm">
                <CardHeader>
                    <CardTitle>Categorie</CardTitle>
                    <CardDescription>Distribuzione delle spese</CardDescription>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[300px] w-[300px] mx-auto rounded-full" />
                </CardContent>
            </Card>
        )
    }

    const hasData = preparedData && preparedData.length > 0 && preparedData.some(d => d.value > 0)

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
        >
            <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow h-full">
                <CardHeader>
                    <CardTitle>Categorie</CardTitle>
                    <CardDescription>Dove stai spendendo di più nel periodo selezionato</CardDescription>
                </CardHeader>
                <CardContent>
                    {hasData ? (
                        <ResponsiveContainer width="100%" height={400}>
                            <PieChart margin={{ top: 0, right: 0, bottom: 20, left: 0 }}>
                                <Pie
                                    data={preparedData as unknown as Record<string, string | number>[]} // Recharts typing workaround
                                    cx="50%"
                                    cy="40%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={3}
                                    dataKey="value"
                                    onClick={(data) => {
                                        if (data && data.payload && data.payload.id) {
                                            router.push(`/transactions?category=${data.payload.id}`)
                                        }
                                    }}
                                    cursor="pointer"
                                >
                                    {preparedData.map((entry, index) => {
                                        const cat = getCategoryById(entry.id || "")
                                        const color = cat ? cat.hexColor : entry.color
                                        return <Cell key={`cell-${index}`} fill={color} strokeWidth={0} />
                                    })}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value)}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Legend content={renderLegend} verticalAlign="bottom" height={160} style={{ width: '100%' }} />
                            </PieChart>
                        </ResponsiveContainer>
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
