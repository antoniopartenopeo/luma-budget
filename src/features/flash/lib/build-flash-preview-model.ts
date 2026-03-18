import { formatCents, calculateSharePct } from "@/domain/money"
import type { DashboardSummary } from "@/features/dashboard/api/types"

export type FlashPreviewTone = "positive" | "negative" | "neutral"

export interface FlashPreviewModel {
    balanceFormatted: string
    balanceTone: FlashPreviewTone
    expensePressurePct: number | null
    expensePressureFormatted: string
    superfluousPct: number | null
    superfluousFormatted: string
    isSuperfluousOverTarget: boolean
}

interface BuildFlashPreviewModelParams {
    currency: string
    data?: DashboardSummary
    locale: string
    superfluousTargetPercent: number
}

export function buildFlashPreviewModel({
    currency,
    data,
    locale,
    superfluousTargetPercent,
}: BuildFlashPreviewModelParams): FlashPreviewModel {
    if (!data) {
        return {
            balanceFormatted: "—",
            balanceTone: "neutral",
            expensePressurePct: null,
            expensePressureFormatted: "—",
            superfluousPct: null,
            superfluousFormatted: "—",
            isSuperfluousOverTarget: false,
        }
    }

    const expensePressurePct = data.totalIncomeCents > 0
        ? Math.max(0, calculateSharePct(data.totalExpensesCents, data.totalIncomeCents))
        : null
    const superfluousPct = data.uselessSpendPercent

    return {
        balanceFormatted: formatCents(data.netBalanceCents, currency, locale).replace(",00", ""),
        balanceTone: data.netBalanceCents > 0 ? "positive" : data.netBalanceCents < 0 ? "negative" : "neutral",
        expensePressurePct,
        expensePressureFormatted: expensePressurePct === null ? "—" : `${expensePressurePct}%`,
        superfluousPct,
        superfluousFormatted: superfluousPct === null ? "—" : `${superfluousPct}%`,
        isSuperfluousOverTarget: superfluousPct !== null && superfluousPct > superfluousTargetPercent,
    }
}
