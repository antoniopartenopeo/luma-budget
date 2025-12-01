"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const data = [
    { name: "Casa", value: 800, color: "hsl(var(--chart-1))" },
    { name: "Cibo", value: 400, color: "hsl(var(--chart-2))" },
    { name: "Trasporti", value: 300, color: "hsl(var(--chart-3))" },
    { name: "Svago", value: 200, color: "hsl(var(--chart-4))" },
    { name: "Altro", value: 100, color: "hsl(var(--chart-5))" },
]

export function CategoryDistributionChart() {
    return (
        <Card className="col-span-1 rounded-xl shadow-sm">
            <CardHeader>
                <CardTitle>Categorie</CardTitle>
                <CardDescription>Distribuzione spese per categoria</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
