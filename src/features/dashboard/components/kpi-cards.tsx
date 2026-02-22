"use client"

import { useRouter } from "next/navigation"
import { DollarSign, Wallet, CreditCard, AlertTriangle } from "lucide-react"
import { useCurrency } from "@/features/settings/api/use-currency"
import { formatCents } from "@/domain/money"
import { DashboardCardUsage, DashboardTimeFilter } from "../api/types"
import { useSettings } from "@/features/settings/api/use-settings"
import { KpiCard, KpiTone } from "@/components/patterns/kpi-card"
import { narrateKPI, deriveKPIState, KPIFacts } from "@/domain/narration"
import { MacroSection } from "@/components/patterns/macro-section"
import { getBalanceTone, getSuperfluousTone } from "../utils/kpi-logic"
import { usePrivacyStore } from "@/features/privacy/privacy.store"
import { getPrivacyClass } from "@/features/privacy/privacy-utils"
import { useAIAdvisor } from "@/features/insights/use-ai-advisor"
import { motion } from "framer-motion"
import { StaggerContainer } from "@/components/patterns/stagger-container"
import { macroItemVariants } from "@/components/patterns/macro-section"
import { formatPeriodLabel, getCurrentPeriod } from "@/lib/date-ranges"

import { NumaEngineCard } from "@/components/patterns/numa-engine-card"
import { BrainCircuit, ShieldCheck, Hourglass, TrendingUp, PiggyBank, Zap } from "lucide-react"
import { UsedCardsKpiDeck } from "./used-cards-kpi-deck"

interface DashboardKpiGridProps {
    totalSpentCents?: number
    netBalanceCents?: number
    uselessSpendPercent?: number | null
    cardsUsed?: DashboardCardUsage[]
    isLoading?: boolean
    filter?: DashboardTimeFilter
    headerActions?: React.ReactNode
}

interface BrainSignalDisplay {
    value: string
    message: string
    trend: "up" | "warning" | "down" | "neutral"
    tone: KpiTone
    confidence: string
    source: string
}

function resolveBrainSignalDisplay(advisorData: ReturnType<typeof useAIAdvisor>): BrainSignalDisplay {
    if (advisorData.isLoading) {
        return {
            value: "Analizzo",
            message: "Sto aggiornando il mese",
            trend: "neutral",
            tone: "neutral",
            confidence: "N/D",
            source: "Fonte: in aggiornamento",
        }
    }

    if (!advisorData.forecast) {
        return {
            value: "In avvio",
            message: "Servono più movimenti",
            trend: "neutral",
            tone: "warning",
            confidence: "N/D",
            source: "Fonte: storico parziale",
        }
    }

    const isBrainSource = advisorData.forecast.primarySource === "brain"
    const source = isBrainSource ? "Fonte: Core" : "Fonte: Storico"
    const confidence = advisorData.forecast.confidence === "high"
        ? "Alta"
        : advisorData.forecast.confidence === "medium"
            ? "Media"
            : "Bassa"

    if (advisorData.forecast.predictedTotalEstimatedBalanceCents < 0) {
        return {
            value: "Critico",
            message: "Possibile saldo negativo",
            trend: "down",
            tone: "negative",
            confidence,
            source,
        }
    }

    if (advisorData.forecast.predictedTotalEstimatedBalanceCents < 10000) {
        return {
            value: "Attenzione",
            message: "Margine ridotto",
            trend: "warning",
            tone: "warning",
            confidence,
            source,
        }
    }

    return {
        value: "Stabile",
        message: "Nessun allarme ora",
        trend: "up",
        tone: "positive",
        confidence,
        source,
    }
}

export function DashboardKpiGrid({
    totalSpentCents,
    netBalanceCents,
    uselessSpendPercent,
    cardsUsed,
    isLoading,
    filter,
    headerActions
}: DashboardKpiGridProps) {
    const router = useRouter()
    const { currency, locale } = useCurrency()
    const { data: settings } = useSettings()
    const { isPrivacyMode } = usePrivacyStore()
    const advisorData = useAIAdvisor()

    const superfluousTarget = settings?.superfluousTargetPercent ?? 10
    const brainSignal = resolveBrainSignalDisplay(advisorData)

    const formatValue = (value: number) => {
        return formatCents(value, currency, locale)
    }

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
        <div className="w-full space-y-6">
            <motion.div variants={macroItemVariants}>
                <NumaEngineCard
                    icon={BrainCircuit}
                    className="w-full"
                    steps={[
                        {
                            icon: DollarSign,
                            colorClass: "text-emerald-500",
                            bgClass: "bg-emerald-500/10",
                            stepLabel: "Passo 1",
                            title: "Quanto puoi spendere ora",
                            description: "Il saldo del periodo mostra quanta liquidità reale resta dopo entrate e uscite."
                        },
                        {
                            icon: PiggyBank,
                            colorClass: "text-amber-500",
                            bgClass: "bg-amber-500/10",
                            stepLabel: "Passo 2",
                            title: "Cosa fa migliorare il margine",
                            description: "Se riduci le Spese Extra, il margine residuo migliora automaticamente."
                        },
                        {
                            icon: Hourglass,
                            colorClass: "text-primary",
                            bgClass: "bg-primary/10",
                            stepLabel: "Passo 3",
                            title: "Quando si aggiorna",
                            description: "Ogni nuovo movimento aggiorna stima, velocità e direzione del mese."
                        }
                    ]}
                    auditStats={[
                        { label: "Metodo", value: "Storico comportamentale", subValue: "Base del calcolo mensile.", icon: TrendingUp },
                        { label: "Aggiornamento", value: "Automatico", subValue: "Ricalcolo a ogni nuovo movimento.", icon: Zap },
                        { label: "Dati usati", value: "Transazioni reali", subValue: "Nessuna stima manuale richiesta.", icon: BrainCircuit },
                        { label: "Privacy", value: "Locale", subValue: "I calcoli restano sul dispositivo.", icon: ShieldCheck },
                    ]}
                    transparencyNote="Questa card non inventa regole: mostra solo lo stato reale del mese usando i tuoi movimenti."
                    certificationTitle="Controllo e trasparenza"
                    certificationSubtitle="Logica chiara, dati reali, privacy locale"
                />
            </motion.div>

            <MacroSection
                title="Carte utilizzate"
                description="Carte rilevate nel periodo selezionato"
                contentClassName="pt-5"
                className="w-full"
            >
                <UsedCardsKpiDeck
                    cards={cardsUsed || []}
                    isLoading={isLoading}
                    isPrivacyMode={isPrivacyMode}
                    showHeader={false}
                />
            </MacroSection>

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
                            title="Spese Extra"
                            value={isLoading ? 0 : (uselessSpendPercent !== null ? `${uselessSpendPercent}%` : "—")}
                            animatedValue={uselessSpendPercent ?? undefined}
                            formatFn={(v) => `${Math.round(v)}%`}
                            valueMeta={isLoading ? undefined : `/ ${superfluousTarget}%`}
                            tone={superflueTone}
                            icon={AlertTriangle}
                            isLoading={isLoading}
                            onClick={() => router.push("/transactions?filter=wants")}
                            description={isLoading ? undefined : buildNarration("superfluous", uselessSpendPercent !== null ? `${uselessSpendPercent}%` : "—", superflueTone, uselessSpendPercent ?? undefined)}
                        />
                    </motion.div>
                    <motion.div variants={macroItemVariants} className="h-full">
                        <KpiCard
                            title="Segnale del mese"
                            value={brainSignal.value}
                            comparisonLabel={`${brainSignal.source} · Affidabilità ${brainSignal.confidence}`}
                            tone={brainSignal.tone}
                            icon={BrainCircuit}
                            isLoading={false}
                            onClick={() => router.push("/insights")}
                            description={brainSignal.message}
                        />
                    </motion.div>
                </StaggerContainer>

            </MacroSection>
        </div>
    )
}
