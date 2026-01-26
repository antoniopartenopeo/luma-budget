"use client"

import { useRouter } from "next/navigation"
import { DollarSign, Wallet, CreditCard, AlertTriangle } from "lucide-react"
import { useCurrency } from "@/features/settings/api/use-currency"
import { formatEuroNumber } from "@/domain/money"
import { DashboardTimeFilter } from "../api/types"
import { useSettings } from "@/features/settings/api/use-settings"
import { KpiCard, KpiTone } from "@/components/patterns/kpi-card"
import { narrateKPI, deriveKPIState, KPIFacts } from "@/domain/narration"
import { MacroSection } from "@/components/patterns/macro-section"
import { getBalanceTone, getBudgetTone, getSuperfluousTone } from "../utils/kpi-logic"

interface DashboardKpiGridProps {
    totalSpent?: number
    netBalance?: number
    budgetTotal?: number
    budgetRemaining?: number
    uselessSpendPercent?: number | null
    isLoading?: boolean
    filter?: DashboardTimeFilter
}

export function DashboardKpiGrid({
    totalSpent,
    netBalance,
    budgetTotal,
    budgetRemaining,
    uselessSpendPercent,
    isLoading,
    filter
}: DashboardKpiGridProps) {
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
    const saldoTone = getBalanceTone(netBalance || 0)
    const spesaTone: KpiTone = "neutral"

    const hasBudget = !!(budgetTotal && budgetTotal > 0)
    const isMonthlyView = filter?.mode === "month"
    const budgetTone = (!isMonthlyView) ? "neutral" : getBudgetTone(budgetRemaining || 0, hasBudget)

    const superflueTone = getSuperfluousTone(uselessSpendPercent ?? null, superfluousTarget)

    const buildNarration = (kpiId: KPIFacts["kpiId"], value: number | string, tone: any, percent?: number) => {
        let bufferRatio: number | undefined = undefined
        if (kpiId === "balance" && typeof value === "number" && totalSpent !== undefined) {
            const derivedIncome = value + totalSpent
            if (derivedIncome > 0) {
                bufferRatio = value / derivedIncome
            }
        }

        const facts: KPIFacts = {
            kpiId,
            valueFormatted: typeof value === "number" ? formatValue(value) : value,
            tone,
            percent: percent ?? undefined,
            targetPercent: kpiId === "superfluous" ? superfluousTarget : undefined,
            bufferRatio
        }
        const state = deriveKPIState(facts)
        return narrateKPI(facts, state).text
    }

    return (
        <MacroSection
            title="Overview Performance"
            description={contextText}
            className="w-full"
        >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 pt-4">
                <KpiCard
                    title="Saldo"
                    value={isLoading ? 0 : formatValue(netBalance || 0)}
                    comparisonLabel="Totale storico"
                    tone={saldoTone}
                    icon={CreditCard}
                    isLoading={isLoading}
                    description={isLoading ? undefined : buildNarration("balance", netBalance || 0, saldoTone)}
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
                    description={isLoading ? undefined : buildNarration("expenses", totalSpent || 0, spesaTone)}
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
                    description={isLoading ? undefined : buildNarration("budget", budgetRemaining || 0, budgetTone, budgetPercent)}
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
                    description={isLoading ? undefined : buildNarration("superfluous", uselessSpendPercent !== null ? `${uselessSpendPercent}%` : "—", superflueTone, uselessSpendPercent ?? undefined)}
                />
            </div>
        </MacroSection>
    )
}
