"use client"

import { useRouter } from "next/navigation"
import { DollarSign, Wallet, CreditCard, AlertTriangle } from "lucide-react"
import { useCurrency } from "@/features/settings/api/use-currency"
import { formatEuroNumber } from "@/domain/money"
import { DashboardTimeFilter } from "../api/types"
import { useSettings } from "@/features/settings/api/use-settings"
import { KpiTone } from "@/components/patterns/kpi-card"
import { narrateKPI, deriveKPIState, KPIFacts } from "@/domain/narration"
import { MacroSection } from "@/components/patterns/macro-section"
import { getBalanceTone, getBudgetTone, getSuperfluousTone } from "../utils/kpi-logic"
import { usePrivacyStore } from "@/features/privacy/privacy.store"
import { getPrivacyClass } from "@/features/privacy/privacy-utils"
import { motion } from "framer-motion"
import { StaggerContainer } from "@/components/patterns/stagger-container"
import { macroItemVariants } from "@/components/patterns/macro-section"

// Smart Context Integration
import { generateSmartContext } from "@/features/smart-context/logic/context-engine"
import { SmartKpiCard } from "@/features/smart-context/components/smart-kpi-card"

import { NumaEngineCard } from "@/components/patterns/numa-engine-card"
import { Sparkles, BrainCircuit, ShieldCheck, Hourglass, TrendingUp, PiggyBank, Zap } from "lucide-react"

interface DashboardKpiGridProps {
    totalSpent?: number
    netBalance?: number
    budgetTotal?: number
    budgetRemaining?: number
    uselessSpendPercent?: number | null
    isLoading?: boolean
    filter?: DashboardTimeFilter
    headerActions?: React.ReactNode
    activeRhythm?: {
        type: string
        label: string
        intensity: number
    }
}

export function DashboardKpiGrid({
    totalSpent,
    netBalance,
    budgetTotal,
    budgetRemaining,
    uselessSpendPercent,
    isLoading,
    filter,
    headerActions,
    activeRhythm
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
            description={isLoading ? undefined : contextText}
            headerActions={headerActions}
            className="w-full"
        >
            {/* Animated Grid Container for Soft Transitions */}
            <StaggerContainer
                key={filter?.period || "default"}
                className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4 pt-4"
            >
                <motion.div variants={macroItemVariants} className="h-full">
                    <SmartKpiCard
                        title="Saldo"
                        value={isLoading ? 0 : formatValue(netBalance || 0)}
                        animatedValue={netBalance || 0}
                        formatFn={formatValue}
                        valueClassName={getPrivacyClass(isPrivacyMode)}
                        comparisonLabel="Totale storico"
                        tone={saldoTone}
                        icon={CreditCard}
                        isLoading={isLoading}
                        description={isLoading ? undefined : buildNarration("balance", netBalance || 0, saldoTone)}
                        context={smartContext['netBalance']}
                    />
                </motion.div>
                <motion.div variants={macroItemVariants} className="h-full">
                    <SmartKpiCard
                        title="Spesa"
                        value={isLoading ? 0 : formatValue(totalSpent || 0)}
                        animatedValue={totalSpent || 0}
                        formatFn={formatValue}
                        valueClassName={getPrivacyClass(isPrivacyMode)}
                        icon={Wallet}
                        isLoading={isLoading}
                        onClick={() => router.push("/transactions")}
                        description={isLoading ? undefined : buildNarration("expenses", totalSpent || 0, spesaTone)}
                        context={smartContext['totalSpent']}
                    />
                </motion.div>
                <motion.div variants={macroItemVariants} className="h-full">
                    <SmartKpiCard
                        title="Pacing Temporale"
                        value={isLoading ? 0 : (isMonthlyView ? formatValue(budgetRemaining || 0) : "—")}
                        animatedValue={isMonthlyView ? (budgetRemaining || 0) : undefined}
                        formatFn={formatValue}
                        valueClassName={getPrivacyClass(isPrivacyMode)}
                        change={isLoading ? "" : (isMonthlyView && hasBudget ? `${budgetPercent}%` : "")}
                        trend={!isMonthlyView || !hasBudget ? "neutral" : (budgetTone === "positive" ? "up" : "down")}
                        comparisonLabel={!isMonthlyView ? "Solo in vista Mensile" : (hasBudget ? "Rimanente nel periodo" : "Imposta un ritmo")}
                        tone={budgetTone}
                        icon={DollarSign}
                        isLoading={isLoading}
                        onClick={isMonthlyView && !hasBudget ? () => router.push("/goals/lab") : undefined}
                        description={isLoading ? undefined : buildNarration("budget", budgetRemaining || 0, budgetTone, budgetPercent)}
                        context={smartContext['budgetRemaining']}
                        badge={activeRhythm && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                </span>
                                {activeRhythm.label}
                            </span>
                        )}
                    />
                </motion.div>
                <motion.div variants={macroItemVariants} className="h-full">
                    <SmartKpiCard
                        title="Spese Extra"
                        value={isLoading ? 0 : (uselessSpendPercent !== null ? `${uselessSpendPercent}%` : "—")}
                        animatedValue={uselessSpendPercent ?? undefined}
                        formatFn={(v) => `${Math.round(v)}%`}
                        change={`Target ${superfluousTarget}%`}
                        trend={superflueTone === "positive" ? "up" : superflueTone === "negative" ? "down" : "neutral"}
                        tone={superflueTone}
                        icon={AlertTriangle}
                        isLoading={isLoading}
                        onClick={() => router.push("/transactions?filter=wants")}
                        description={isLoading ? undefined : buildNarration("superfluous", uselessSpendPercent !== null ? `${uselessSpendPercent}%` : "—", superflueTone, uselessSpendPercent ?? undefined)}
                        context={smartContext['uselessSpendPercent']}
                    />
                </motion.div>
            </StaggerContainer>

            {/* NUMA ENGINE (Transparency Context) */}
            <div className="mt-8">
                <NumaEngineCard
                    title="Logica Finanziaria Attiva"
                    icon={BrainCircuit}
                    className="w-full"
                    steps={[
                        {
                            icon: DollarSign,
                            colorClass: "text-emerald-500",
                            bgClass: "bg-emerald-500/10",
                            stepLabel: "Il Ritmo",
                            title: "Pacing Dinamico",
                            description: `La disponibilità mostrata in "Pacing Temporale" non è un limite statico: deriva direttamente dal Piano ${activeRhythm?.label || "Attivo"} scelto nel Laboratorio.`
                        },
                        {
                            icon: PiggyBank,
                            colorClass: "text-amber-500",
                            bgClass: "bg-amber-500/10",
                            stepLabel: "Il Silenzio",
                            title: "Rilevamento Implicito",
                            description: "Non serve accantonare fondi manualmente. Se l'andamento delle Spese Extra rallenta, il margine residuo accelera automaticamente il tuo traguardo."
                        },
                        {
                            icon: Hourglass,
                            colorClass: "text-indigo-500",
                            bgClass: "bg-indigo-500/10",
                            stepLabel: "La Proiezione",
                            title: "Velocità Reale",
                            description: "La data traguardo non è fissa: si ricalcola ogni giorno in base alla tua reale velocità di crociera e sostenibilità attuale."
                        }
                    ]}
                    auditStats={[
                        { label: "Piano Attivo", value: activeRhythm?.label || "Standard", subValue: "Configurazione attuale del pacing.", icon: TrendingUp },
                        { label: "Logica Core", value: "Matematica", subValue: "Algoritmo v2.4 (Deterministico).", icon: BrainCircuit },
                        { label: "Privacy", value: "Shield On", subValue: "Analisi locale al 100%.", icon: ShieldCheck },
                        { label: "Analisi", value: "Real-Time", subValue: "Ricalcolo dinamico sui movimenti.", icon: Zap },
                    ]}
                    transparencyNote="Numa non utilizza logiche di 'risparmio' punitivo. Osserva il tuo andamento: meno spendi in 'Extra', più la tua velocità aumenta e il traguardo si avvicina in modo naturale."
                    auditLabel="Dettagli Logica"
                    certificationTitle="Motore Deterministico"
                    certificationSubtitle="Analisi basata su Matematica e Privacy"
                />
            </div>
        </MacroSection>
    )
}
