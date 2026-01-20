import { useRouter } from "next/navigation"
import { DollarSign, Wallet, CreditCard, AlertTriangle } from "lucide-react"
import { useCurrency } from "@/features/settings/api/use-currency"
import { formatEuroNumber } from "@/domain/money"
import { DashboardTimeFilter } from "../api/types"
import { useSettings } from "@/features/settings/api/use-settings"
import { KpiCard, KpiTone } from "@/components/patterns/kpi-card"



interface DashboardKpiGridProps {
    totalSpent?: number
    netBalance?: number
    budgetTotal?: number
    budgetRemaining?: number
    uselessSpendPercent?: number | null
    isLoading?: boolean
    filter?: DashboardTimeFilter
}

export function DashboardKpiGrid({ totalSpent, netBalance, budgetTotal, budgetRemaining, uselessSpendPercent, isLoading, filter }: DashboardKpiGridProps) {
    const router = useRouter()
    const { currency, locale } = useCurrency()
    const { data: settings } = useSettings()

    const superfluousTarget = settings?.superfluousTargetPercent ?? 10

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
    const isMonthlyView = filter?.mode === "month"
    const budgetTone: KpiTone = (!hasBudget || !isMonthlyView) ? "neutral" : ((budgetRemaining || 0) >= 0 ? "positive" : "negative")

    // Superflue: <=target positivo, >target negativo
    const superflueTone: KpiTone = (uselessSpendPercent !== undefined && uselessSpendPercent !== null)
        ? (uselessSpendPercent <= superfluousTarget ? "positive" : "negative")
        : "neutral"

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
                    value={isLoading ? 0 : (isMonthlyView ? formatValue(budgetRemaining || 0) : "—")}
                    change={isLoading ? "" : (isMonthlyView && hasBudget ? `${budgetPercent}%` : "")}
                    trend={!isMonthlyView || !hasBudget ? "neutral" : (budgetTone === "positive" ? "up" : "down")}
                    comparisonLabel={!isMonthlyView ? "Solo in vista Mensile" : (hasBudget ? "Rimanenti nel periodo" : "Imposta un budget")}
                    tone={budgetTone}
                    icon={DollarSign}
                    isLoading={isLoading}
                    onClick={isMonthlyView && !hasBudget ? () => router.push("/budget") : undefined}
                />
                <KpiCard
                    title="Spese Superflue"
                    value={isLoading ? 0 : (uselessSpendPercent !== null ? `${uselessSpendPercent}%` : "—")}
                    change={`Target ${superfluousTarget}%`}
                    trend={superflueTone === "positive" ? "up" : superflueTone === "negative" ? "down" : "neutral"}
                    tone={superflueTone}
                    icon={AlertTriangle}
                    isLoading={isLoading}
                    onClick={() => router.push("/transactions?filter=wants")}
                />
            </div>
        </div>
    )
}
