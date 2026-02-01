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
import { usePrivacyStore } from "@/features/privacy/privacy.store"
import { getPrivacyClass } from "@/features/privacy/privacy-utils"

// Smart Context Integration
import { generateSmartContext } from "@/features/smart-context/logic/context-engine"
import { SmartKpiCard } from "@/features/smart-context/components/smart-kpi-card"

interface DashboardKpiGridProps {
    totalSpent?: number
    netBalance?: number
    budgetTotal?: number
    budgetRemaining?: number
    uselessSpendPercent?: number | null
    isLoading?: boolean
    filter?: DashboardTimeFilter
    headerActions?: React.ReactNode
}

export function DashboardKpiGrid({
    totalSpent,
    netBalance,
    budgetTotal,
    budgetRemaining,
    uselessSpendPercent,
    isLoading,
    filter,
    headerActions
}: DashboardKpiGridProps) {
    const router = useRouter()
    const { currency, locale } = useCurrency()
    const { data: settings } = useSettings()
    const { isPrivacyMode } = usePrivacyStore()

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

    const buildNarration = (kpiId: KPIFacts["kpiId"], value: number | string, tone: KpiTone, percent?: number) => {
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

    // --- SMART CONTEXT GENERATION ---
    // We reconstruct a partial summary object for the engine logic
    const smartContext = generateSmartContext({
        summary: {
            // These properties must match DashboardSummary structure roughly or what the engine expects
            // The engine expects: netBalance, budgetRemaining, budgetTotal, totalSpent, uselessSpendPercent
            // We pass 0 or defaults for missing non-critical ones, but here we have everything needed.
            netBalance: netBalance || 0,
            budgetRemaining: budgetRemaining || 0,
            budgetTotal: budgetTotal || 0,
            totalSpent: totalSpent || 0,
            uselessSpendPercent: uselessSpendPercent || null,
            // Mocking the rest as they are not used by current rules
            totalIncome: 0,
            totalExpenses: totalSpent || 0,
            categoriesSummary: [],
            usefulVsUseless: { useful: 0, useless: 0 },
            monthlyExpenses: []
        }
    })

    return (
        <MacroSection
            title="Overview Performance"
            description={contextText}
            headerActions={headerActions}
            className="w-full"
        >
            {/* Animated Grid Container for Soft Transitions */}
            <div
                key={filter?.period || "default"}
                className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4 pt-4 animate-enter-up"
            >
                <SmartKpiCard
                    title="Saldo"
                    value={isLoading ? 0 : formatValue(netBalance || 0)}
                    valueClassName={getPrivacyClass(isPrivacyMode)}
                    comparisonLabel="Totale storico"
                    tone={saldoTone}
                    icon={CreditCard}
                    isLoading={isLoading}
                    description={isLoading ? undefined : buildNarration("balance", netBalance || 0, saldoTone)}
                    context={smartContext['netBalance']} // Engine uses 'netBalance' key? Wait, check engine. 
                // Logic check: engine keys were: 'budgetRemaining', 'totalSpent', 'uselessSpendPercent'
                // For Logic Rule 3 (Safe Harbor), engine sets 'budgetRemaining'.
                // Does it set anything for balance? No.
                // Let's re-verify engine keys.
                />
                <SmartKpiCard
                    title="Spesa"
                    value={isLoading ? 0 : formatValue(totalSpent || 0)}
                    valueClassName={getPrivacyClass(isPrivacyMode)}
                    icon={Wallet}
                    isLoading={isLoading}
                    onClick={() => router.push("/transactions")}
                    description={isLoading ? undefined : buildNarration("expenses", totalSpent || 0, spesaTone)}
                    context={smartContext['totalSpent']}
                />
                <SmartKpiCard
                    title="Budget Rimanente"
                    value={isLoading ? 0 : (isMonthlyView ? formatValue(budgetRemaining || 0) : "—")}
                    valueClassName={getPrivacyClass(isPrivacyMode)}
                    change={isLoading ? "" : (isMonthlyView && hasBudget ? `${budgetPercent}%` : "")}
                    trend={!isMonthlyView || !hasBudget ? "neutral" : (budgetTone === "positive" ? "up" : "down")}
                    comparisonLabel={!isMonthlyView ? "Solo in vista Mensile" : (hasBudget ? "Rimanenti nel periodo" : "Imposta un budget")}
                    tone={budgetTone}
                    icon={DollarSign}
                    isLoading={isLoading}
                    onClick={isMonthlyView && !hasBudget ? () => router.push("/goals/lab") : undefined}
                    description={isLoading ? undefined : buildNarration("budget", budgetRemaining || 0, budgetTone, budgetPercent)}
                    context={smartContext['budgetRemaining']}
                />
                <SmartKpiCard
                    title="Spese Superflue"
                    value={isLoading ? 0 : (uselessSpendPercent !== null ? `${uselessSpendPercent}%` : "—")}
                    // Note: percentages are not monetary, usually OK to show, but can blur if desired. Keeping visible for now.
                    change={`Target ${superfluousTarget}%`}
                    trend={superflueTone === "positive" ? "up" : superflueTone === "negative" ? "down" : "neutral"}
                    tone={superflueTone}
                    icon={AlertTriangle}
                    isLoading={isLoading}
                    onClick={() => router.push("/transactions?filter=wants")}
                    description={isLoading ? undefined : buildNarration("superfluous", uselessSpendPercent !== null ? `${uselessSpendPercent}%` : "—", superflueTone, uselessSpendPercent ?? undefined)}
                    context={smartContext['uselessSpendPercent']}
                />
            </div>
        </MacroSection>
    )
}
