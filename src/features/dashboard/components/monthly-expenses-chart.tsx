"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const data = [
    { name: "Gen", total: 1200 },
    { name: "Feb", total: 900 },
    { name: "Mar", total: 1600 },
    { name: "Apr", total: 1100 },
    { name: "Mag", total: 2100 },
    { name: "Giu", total: 1400 },
]

export function MonthlyExpensesChart() {
    return (
        <Card className="col-span-2 rounded-xl shadow-sm">
            <CardHeader>
                <CardTitle>Spese Mensili</CardTitle>
                <CardDescription>Andamento delle spese negli ultimi 6 mesi</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
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
                            tickFormatter={(value) => `€${value}`}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
