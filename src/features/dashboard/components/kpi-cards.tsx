"use client"

import { useRouter } from "next/navigation"
import { DollarSign, Wallet, CreditCard, AlertTriangle } from "lucide-react"
import { useCurrency } from "@/features/settings/api/use-currency"
import { formatCents } from "@/domain/money"
import { DashboardTimeFilter } from "../api/types"
import { useSettings } from "@/features/settings/api/use-settings"
import { KpiCard, KpiTone } from "@/components/patterns/kpi-card"
import { narrateKPI, deriveKPIState, KPIFacts } from "@/domain/narration"
import { MacroSection } from "@/components/patterns/macro-section"
import { getBalanceTone, getBudgetTone, getSuperfluousTone } from "../utils/kpi-logic"
import { usePrivacyStore } from "@/features/privacy/privacy.store"
import { getPrivacyClass } from "@/features/privacy/privacy-utils"
import { motion } from "framer-motion"
import { StaggerContainer } from "@/components/patterns/stagger-container"
import { macroItemVariants } from "@/components/patterns/macro-section"
import { formatPeriodLabel, getCurrentPeriod } from "@/lib/date-ranges"

import { NumaEngineCard } from "@/components/patterns/numa-engine-card"
import { BrainCircuit, ShieldCheck, Hourglass, TrendingUp, PiggyBank, Zap } from "lucide-react"

interface DashboardKpiGridProps {
    totalSpentCents?: number
    netBalanceCents?: number
    budgetTotalCents?: number
    budgetRemainingCents?: number
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
    totalSpentCents,
    netBalanceCents,
    budgetTotalCents,
    budgetRemainingCents,
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
        return formatCents(value, currency, locale)
    }

    const budgetPercent = budgetTotalCents && budgetTotalCents > 0
        ? Math.round(((budgetRemainingCents || 0) / budgetTotalCents) * 100)
        : 0

    const pivotPeriod = filter?.period || getCurrentPeriod()
    const currentDate = new Date(`${pivotPeriod}-01`)
    const capitalizedLabel = formatPeriodLabel(pivotPeriod, "it-IT")

    // Calculate previous month label
    const prevDate = new Date(currentDate)
    prevDate.setMonth(prevDate.getMonth() - 1)
    const capitalizedPrevLabel = formatPeriodLabel(getCurrentPeriod(prevDate), "it-IT")

    const contextText = filter?.mode === "month"
        ? `Periodo: ${capitalizedLabel} · Confronto: ${capitalizedPrevLabel}`
        : `Periodo: ultimi ${filter?.months || 3} mesi · Confronto: ${filter?.months || 3} mesi precedenti`

    // Semantica dei toni:
    const saldoTone = getBalanceTone((netBalanceCents || 0) / 100)
    const spesaTone: KpiTone = "neutral"

    const hasBudget = !!(budgetTotalCents && budgetTotalCents > 0)
    const isMonthlyView = filter?.mode === "month"
    const budgetTone = (!isMonthlyView) ? "neutral" : getBudgetTone((budgetRemainingCents || 0) / 100, hasBudget)

    const superflueTone = getSuperfluousTone(uselessSpendPercent ?? null, superfluousTarget)

    const buildNarration = (kpiId: KPIFacts["kpiId"], value: number | string, tone: KpiTone, percent?: number) => {
        let bufferRatio: number | undefined = undefined
        if (kpiId === "balance" && typeof value === "number" && totalSpentCents !== undefined) {
            const derivedIncome = value + totalSpentCents
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
            title="Panoramica del periodo"
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
                    <KpiCard
                        title="Saldo"
                        value={isLoading ? 0 : formatValue(netBalanceCents || 0)}
                        animatedValue={netBalanceCents || 0}
                        formatFn={formatValue}
                        valueClassName={getPrivacyClass(isPrivacyMode)}
                        comparisonLabel="Totale storico"
                        tone={saldoTone}
                        icon={CreditCard}
                        isLoading={isLoading}
                        description={isLoading ? undefined : buildNarration("balance", netBalanceCents || 0, saldoTone)}
                    />
                </motion.div>
                <motion.div variants={macroItemVariants} className="h-full">
                    <KpiCard
                        title="Spesa"
                        value={isLoading ? 0 : formatValue(totalSpentCents || 0)}
                        animatedValue={totalSpentCents || 0}
                        formatFn={formatValue}
                        valueClassName={getPrivacyClass(isPrivacyMode)}
                        icon={Wallet}
                        isLoading={isLoading}
                        onClick={() => router.push("/transactions")}
                        description={isLoading ? undefined : buildNarration("expenses", totalSpentCents || 0, spesaTone)}
                    />
                </motion.div>
                <motion.div variants={macroItemVariants} className="h-full">
                    <KpiCard
                        title="Pacing Temporale"
                        value={isLoading ? 0 : (isMonthlyView ? formatValue(budgetRemainingCents || 0) : "—")}
                        animatedValue={isMonthlyView ? (budgetRemainingCents || 0) : undefined}
                        formatFn={formatValue}
                        valueClassName={getPrivacyClass(isPrivacyMode)}
                        change={isLoading ? "" : (isMonthlyView && hasBudget ? `${budgetPercent}%` : "")}
                        trend={!isMonthlyView || !hasBudget ? "neutral" : (budgetTone === "positive" ? "up" : "down")}
                        comparisonLabel={!isMonthlyView ? "Solo in vista Mensile" : (hasBudget ? "Rimanente nel periodo" : "Imposta un ritmo")}
                        tone={budgetTone}
                        icon={DollarSign}
                        isLoading={isLoading}
                        onClick={isMonthlyView && !hasBudget ? () => router.push("/simulator") : undefined}
                        description={isLoading ? undefined : buildNarration("budget", budgetRemainingCents || 0, budgetTone, budgetPercent)}
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
                    <KpiCard
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
                    />
                </motion.div>
            </StaggerContainer>

            {/* NUMA ENGINE (Transparency Context) */}
            <div className="mt-8">
                <NumaEngineCard
                    title="Logica Finanziaria Attiva"
                    icon={BrainCircuit}
                    audienceHint="In breve"
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
