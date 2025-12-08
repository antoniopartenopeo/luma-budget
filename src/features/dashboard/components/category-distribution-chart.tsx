"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CategorySummary } from "@/features/dashboard/api/types"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"
import { StateMessage } from "@/components/ui/state-message"
import { CategoryIcon } from "@/features/categories/components/category-icon"

import { CATEGORIES } from "@/features/categories/config"

interface CategoryDistributionChartProps {
    data?: CategorySummary[]
    isLoading?: boolean
}

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

    // Assign colors from palette if not already present or override
    const coloredData = data?.map((item) => {
        // Find category in config to get the correct hex color
        const categoryConfig = CATEGORIES.find(c => c.label === item.name)
        return {
            ...item,
            // Use config hex color or fallback to slate
            color: categoryConfig?.hexColor || "#64748b"
        }
    })

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
                                            data={coloredData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            animationDuration={1500}
                                            animationEasing="ease-out"
                                        >
                                            {coloredData?.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            formatter={(value: number, name: string, props: any) => {
                                                const total = coloredData?.reduce((acc, item) => acc + item.value, 0) || 0
                                                const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0
                                                return [`€${value} (${percent}%)`, name]
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 flex flex-wrap justify-center gap-3">
                                {coloredData?.map((item, index) => (
                                    <div key={index} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                        <CategoryIcon categoryName={item.name} size={14} className="text-muted-foreground mr-1" />
                                        <span>{item.name}</span>
                                        <span className="text-foreground">€{item.value}</span>
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
