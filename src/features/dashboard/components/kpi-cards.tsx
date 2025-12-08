import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownIcon, ArrowUpIcon, DollarSign, Wallet, CreditCard, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"

interface KpiCardProps {
    title: string
    value: string | number
    change?: string
    trend?: "up" | "down" | "neutral"
    icon: React.ElementType
    isLoading?: boolean
}

export function KpiCard({ title, value, change, trend, icon: Icon, isLoading }: KpiCardProps) {
    if (isLoading) {
        return (
            <Card className="rounded-xl shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-[120px] mb-2" />
                    <Skeleton className="h-3 w-[150px]" />
                </CardContent>
            </Card>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="rounded-xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {title}
                    </CardTitle>
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-primary" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{value}</div>
                    {change && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <span
                                className={cn(
                                    "flex items-center font-medium",
                                    trend === "up" ? "text-emerald-600" : trend === "down" ? "text-rose-600" : "text-muted-foreground"
                                )}
                            >
                                {trend === "up" ? <ArrowUpIcon className="h-3 w-3 mr-0.5" /> : trend === "down" ? <ArrowDownIcon className="h-3 w-3 mr-0.5" /> : null}
                                {change}
                            </span>
                            rispetto al mese scorso
                        </p>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}

interface DashboardKpiGridProps {
    totalSpent?: number
    budgetRemaining?: number
    uselessSpendPercent?: number
    isLoading?: boolean
}

export function DashboardKpiGrid({ totalSpent, budgetRemaining, uselessSpendPercent, isLoading }: DashboardKpiGridProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value)
    }

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <KpiCard
                title="Spesa Totale"
                value={isLoading ? 0 : formatCurrency(totalSpent || 0)} // Mock static balance for now or derive
                change="+2.5%"
                trend="up"
                icon={Wallet}
                isLoading={isLoading}
            />
            <KpiCard
                title="Budget Rimanente"
                value={isLoading ? 0 : formatCurrency(budgetRemaining || 0)}
                change={isLoading ? "" : `${Math.round(((budgetRemaining || 0) / 2000) * 100)}% del budget`}
                trend="neutral"
                icon={DollarSign}
                isLoading={isLoading}
            />
            <KpiCard
                title="Spese Superflue"
                value={isLoading ? 0 : `${uselessSpendPercent}%`}
                change="Target < 10%"
                trend={uselessSpendPercent && uselessSpendPercent > 10 ? "down" : "up"}
                icon={AlertTriangle}
                isLoading={isLoading}
            />
        </div>
    )
}
