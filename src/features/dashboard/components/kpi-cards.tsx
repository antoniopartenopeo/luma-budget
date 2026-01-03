import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownIcon, ArrowUpIcon, DollarSign, Wallet, CreditCard, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"
import { useCurrency } from "@/features/settings/api/use-currency"
import { formatEuroNumber } from "@/lib/currency-utils"

interface KpiCardProps {
    title: string
    subtitle?: string
    value: string | number
    change?: string
    trend?: "up" | "down" | "neutral"
    icon: React.ElementType
    isLoading?: boolean
    onClick?: () => void
}

export function KpiCard({ title, subtitle, value, change, trend, icon: Icon, isLoading, onClick }: KpiCardProps) {
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
            className="h-full"
        >
            <Card
                className={cn(
                    "rounded-xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 h-full",
                    onClick && "cursor-pointer active:scale-[0.98] ring-primary/5 hover:ring-2"
                )}
                onClick={onClick}
            >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {title}
                        </CardTitle>
                        {subtitle && <p className="text-xs text-muted-foreground/70 mt-0.5">{subtitle}</p>}
                    </div>
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
    netBalance?: number
    budgetTotal?: number
    budgetRemaining?: number
    uselessSpendPercent?: number
    isLoading?: boolean
}

export function DashboardKpiGrid({ totalSpent, netBalance, budgetTotal, budgetRemaining, uselessSpendPercent, isLoading }: DashboardKpiGridProps) {
    const router = useRouter()
    const { currency, locale } = useCurrency()

    const formatValue = (value: number) => {
        return formatEuroNumber(value, currency, locale)
    }

    const budgetPercent = budgetTotal && budgetTotal > 0
        ? Math.round(((budgetRemaining || 0) / budgetTotal) * 100)
        : 0

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KpiCard
                title="Saldo"
                subtitle="Totale (lifetime)"
                value={isLoading ? 0 : formatValue(netBalance || 0)}
                change={netBalance && netBalance >= 0 ? "In positivo" : "In negativo"}
                trend={netBalance && netBalance >= 0 ? "up" : "down"}
                icon={CreditCard}
                isLoading={isLoading}
            />
            <KpiCard
                title="Spesa"
                subtitle="Nel periodo selezionato"
                value={isLoading ? 0 : formatValue(totalSpent || 0)}
                change="Uscite"
                trend="down"
                icon={Wallet}
                isLoading={isLoading}
                onClick={() => router.push("/transactions")}
            />
            <KpiCard
                title="Budget Rimanente"
                subtitle={budgetTotal && budgetTotal > 0 ? "Fine periodo" : "Piano non impostato"}
                value={isLoading ? 0 : formatValue(budgetRemaining || 0)}
                change={isLoading ? "" : (budgetTotal && budgetTotal > 0 ? `${budgetPercent}% rimanente` : "Pianifica ora")}
                trend="neutral"
                icon={DollarSign}
                isLoading={isLoading}
                onClick={budgetTotal && budgetTotal > 0 ? undefined : () => router.push("/budget")}
            />
            <KpiCard
                title="Spese Superflue"
                subtitle="Target < 10% del totale"
                value={isLoading ? 0 : `${uselessSpendPercent}%`}
                // change="Target < 10%" // Removed as requested to move to subtitle or just redundant
                // Keeping original change prop logic or replacing? User said "Mantieni o migliora l’indicazione del confronto".
                // I'll keep the trend indicator but maybe simplify the text if subtitle covers it.
                // Actually the subtitle is static, the change text was relative to target. Best to keep change text as trend context.
                change="Rispetto al target"
                trend={uselessSpendPercent && uselessSpendPercent > 10 ? "down" : "up"}
                icon={AlertTriangle}
                isLoading={isLoading}
                onClick={() => router.push("/transactions?filter=wants")}
            />
        </div>
    )
}
