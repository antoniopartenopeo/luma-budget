"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CategorySummary } from "@/features/dashboard/api/types"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"

interface CategoryDistributionChartProps {
    data?: CategorySummary[]
    isLoading?: boolean
}

import { StateMessage } from "@/components/ui/state-message"

export function CategoryDistributionChart({ data, isLoading }: CategoryDistributionChartProps) {
    if (isLoading) {
        return (
            <Card className="col-span-1 rounded-xl shadow-sm">
                <CardHeader>
                    <CardTitle>Categorie</CardTitle>
                    <CardDescription>Distribuzione delle spese</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-[300px]">
                        <Skeleton className="h-[200px] w-[200px] rounded-full" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    const hasData = data && data.length > 0 && data.some(item => item.value > 0)

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="col-span-1"
        >
            <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow h-full">
                <CardHeader>
                    <CardTitle>Categorie</CardTitle>
                    <CardDescription>Distribuzione delle spese</CardDescription>
                </CardHeader>
                <CardContent>
                    {hasData ? (
                        <>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data as any}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            animationDuration={1500}
                                            animationEasing="ease-out"
                                        >
                                            {data?.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            formatter={(value: number) => `€${value}`}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 flex flex-wrap justify-center gap-2">
                                {data?.map((item, index) => (
                                    <div key={index} className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                                        {item.name}
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center">
                            <StateMessage
                                variant="empty"
                                title="Distribuzione categorie non disponibile"
                                description="Aggiungi qualche spesa per vedere il dettaglio per categoria"
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}
