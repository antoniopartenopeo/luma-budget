"use client"

import { TransactionSummary } from "../utils/transactions-logic"
import { formatCents } from "@/domain/money"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Wallet, Hash, type LucideIcon } from "lucide-react"
import { usePrivacyStore } from "@/features/privacy/privacy.store"
import { getPrivacyClass } from "@/features/privacy/privacy-utils"
import { KpiCard } from "@/components/patterns/kpi-card"

interface TransactionsSummaryBarProps {
    summary: TransactionSummary
    isLoading?: boolean
}

type SummaryKpiTone = "neutral" | "positive" | "negative"

interface SummaryItem {
    label: string
    value: string
    icon: LucideIcon
    tone: SummaryKpiTone
    valueClassName: string
    isMoney: boolean
}

export function TransactionsSummaryBar({ summary, isLoading }: TransactionsSummaryBarProps) {
    const { isPrivacyMode } = usePrivacyStore()
    const netBalanceTone: SummaryKpiTone = summary.netBalance >= 0 ? "positive" : "negative"

    const items: SummaryItem[] = [
        {
            label: "Operazioni",
            value: summary.totalCount.toString(),
            icon: Hash,
            tone: "neutral",
            valueClassName: "text-primary",
            isMoney: false
        },
        {
            label: "Entrate",
            value: formatCents(summary.totalIncome),
            icon: TrendingUp,
            tone: "positive",
            valueClassName: "text-emerald-600 dark:text-emerald-400",
            isMoney: true
        },
        {
            label: "Uscite",
            value: formatCents(summary.totalExpense),
            icon: TrendingDown,
            tone: "negative",
            valueClassName: "text-rose-600 dark:text-rose-400",
            isMoney: true
        },
        {
            label: "Bilancio",
            value: formatCents(summary.netBalance),
            icon: Wallet,
            tone: netBalanceTone,
            valueClassName: netBalanceTone === "positive"
                ? "text-emerald-700 dark:text-emerald-300"
                : "text-rose-700 dark:text-rose-300",
            isMoney: true
        },
    ]

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {items.map((item) => (
                <KpiCard
                    key={item.label}
                    compact
                    title={item.label}
                    value={item.value}
                    icon={item.icon}
                    tone={item.tone}
                    isLoading={isLoading}
                    className="h-full"
                    valueClassName={cn(
                        "text-xl sm:text-2xl lg:text-3xl",
                        item.valueClassName,
                        item.isMoney && getPrivacyClass(isPrivacyMode)
                    )}
                />
            ))}
        </div>
    )
}
