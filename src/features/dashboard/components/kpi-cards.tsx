import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownIcon, ArrowUpIcon, DollarSign, Wallet, CreditCard, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"
import { useCurrency } from "@/features/settings/api/use-currency"
import { formatEuroNumber } from "@/lib/currency-utils"
import { DashboardTimeFilter } from "../api/types"

export type KpiTone = "positive" | "negative" | "neutral" | "warning"

interface KpiCardProps {
    title: string
    subtitle?: string
    value: string | number
    change?: string
    trend?: "up" | "down" | "neutral"
    comparisonLabel?: string
    icon: React.ElementType
    isLoading?: boolean
    tone?: KpiTone
    onClick?: () => void
}

export function KpiCard({ title, subtitle, value, change, trend, comparisonLabel, icon: Icon, isLoading, tone = "neutral", onClick }: KpiCardProps) {
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
                    <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center transition-colors duration-300",
                        tone === "positive" && "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400",
                        tone === "negative" && "bg-rose-500/10 text-rose-500 dark:text-rose-400",
                        tone === "warning" && "bg-amber-500/10 text-amber-500 dark:text-amber-400",
                        tone === "neutral" && "bg-muted text-muted-foreground"
                    )}>
                        <Icon className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{value}</div>
                    {(change || comparisonLabel) && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            {change && (
                                <span
                                    className={cn(
                                        "flex items-center font-medium",
                                        trend === "up" ? "text-emerald-600" : trend === "down" ? "text-rose-600" : "text-muted-foreground"
                                    )}
                                >
                                    {trend === "up" ? <ArrowUpIcon className="h-3 w-3 mr-0.5" /> : trend === "down" ? <ArrowDownIcon className="h-3 w-3 mr-0.5" /> : null}
                                    {change}
                                </span>
                            )}
                            <span className="text-muted-foreground/60">{comparisonLabel}</span>
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
    filter?: DashboardTimeFilter
}

export function DashboardKpiGrid({ totalSpent, netBalance, budgetTotal, budgetRemaining, uselessSpendPercent, isLoading, filter }: DashboardKpiGridProps) {
    const router = useRouter()
    const { currency, locale } = useCurrency()

    const formatValue = (value: number) => {
        return formatEuroNumber(value, currency, locale)
    }

    const budgetPercent = budgetTotal && budgetTotal > 0
        ? Math.round(((budgetRemaining || 0) / budgetTotal) * 100)
        : 0

    const currentDate = new Date((filter?.period || new Date().toISOString().slice(0, 7)) + "-01")
    const periodLabel = new Intl.DateTimeFormat("it-IT", { month: "long", year: "numeric" }).format(currentDate)
    const capitalizedLabel = periodLabel.charAt(0).toUpperCase() + periodLabel.slice(1)

    // Calculate previous month label
    const prevDate = new Date(currentDate)
    prevDate.setMonth(prevDate.getMonth() - 1)
    const prevMonthLabel = new Intl.DateTimeFormat("it-IT", { month: "long", year: "numeric" }).format(prevDate)
    const capitalizedPrevLabel = prevMonthLabel.charAt(0).toUpperCase() + prevMonthLabel.slice(1)

    const contextText = filter?.mode === "month"
        ? `Periodo: ${capitalizedLabel} · Confronto: ${capitalizedPrevLabel}`
        : `Periodo: ultimi ${filter?.months || 3} mesi · Confronto: ${filter?.months || 3} mesi precedenti`

    // Semantica dei toni:
    // Saldo: >0 positivo, <0 negativo, 0 neutro
    const saldoTone: KpiTone = netBalance && netBalance > 0 ? "positive" : netBalance && netBalance < 0 ? "negative" : "neutral"

    // Spesa: SEMPRE neutral (metrica descrittiva)
    const spesaTone: KpiTone = "neutral"

    // Budget: piano non configurato -> neutro, >=0 positivo, <0 negativo
    const hasBudget = budgetTotal && budgetTotal > 0
    const budgetTone: KpiTone = !hasBudget ? "neutral" : ((budgetRemaining || 0) >= 0 ? "positive" : "negative")

    // Superflue: <=10% positivo, >10% negativo
    const superflueTone: KpiTone = uselessSpendPercent !== undefined ? (uselessSpendPercent <= 10 ? "positive" : "negative") : "neutral"

    return (
        <div className="space-y-4">
            <div className="px-1">
                <p className="text-xs text-muted-foreground/80 font-medium">
                    {contextText}
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                    title="Saldo"
                    value={isLoading ? 0 : formatValue(netBalance || 0)}
                    comparisonLabel="Totale storico"
                    tone={saldoTone}
                    icon={CreditCard}
                    isLoading={isLoading}
                />
                <KpiCard
                    title="Spesa"
                    value={isLoading ? 0 : formatValue(totalSpent || 0)}
                    change="Uscite"
                    trend="neutral"
                    tone={spesaTone}
                    icon={Wallet}
                    isLoading={isLoading}
                    onClick={() => router.push("/transactions")}
                />
                <KpiCard
                    title="Budget Rimanente"
                    value={isLoading ? 0 : formatValue(budgetRemaining || 0)}
                    change={isLoading ? "" : (hasBudget ? `${budgetPercent}%` : "")}
                    trend={!hasBudget ? "neutral" : (budgetTone === "positive" ? "up" : "down")}
                    comparisonLabel={hasBudget ? "Rimanenti nel periodo" : "Imposta un budget"}
                    tone={budgetTone}
                    icon={DollarSign}
                    isLoading={isLoading}
                    onClick={hasBudget ? undefined : () => router.push("/budget")}
                />
                <KpiCard
                    title="Spese Superflue"
                    value={isLoading ? 0 : `${uselessSpendPercent}%`}
                    change="Target 10%"
                    trend={superflueTone === "positive" ? "up" : "down"}
                    tone={superflueTone}
                    icon={AlertTriangle}
                    isLoading={isLoading}
                    onClick={() => router.push("/transactions?filter=wants")}
                />
            </div>
        </div>
    )
}
