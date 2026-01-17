"use client"

import { useState } from "react"
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    PiggyBank,
    Target,
    AlertTriangle,
    Eye,
    EyeOff,
    Sparkles
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useDashboardSummary } from "@/features/dashboard/api/use-dashboard"
import { useSettings } from "@/features/settings/api/use-settings"
import { useCurrency } from "@/features/settings/api/use-currency"
import { getCurrentPeriod, formatPeriodLabel } from "@/features/insights/utils"
import { formatEuroNumber } from "@/lib/currency-utils"
import { cn } from "@/lib/utils"

export function FlashSummaryView() {
    const [isPrivate, setIsPrivate] = useState(false)
    const period = getCurrentPeriod()

    const { data: settings } = useSettings()
    const { currency, locale } = useCurrency()
    const { data, isLoading } = useDashboardSummary({ mode: "month", period })

    const superfluousTarget = settings?.superfluousTargetPercent ?? 10

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-6 flex items-center justify-center">
                <Skeleton className="h-[600px] w-full max-w-sm rounded-3xl" />
            </div>
        )
    }

    if (!data) return null

    const {
        totalIncome,
        totalExpenses,
        netBalance,
        budgetTotal,
        budgetRemaining,
        uselessSpendPercent,
        categoriesSummary
    } = data

    const budgetUsedPct = budgetTotal > 0 ? Math.round(((budgetTotal - budgetRemaining) / budgetTotal) * 100) : 0
    const top3Categories = [...categoriesSummary].sort((a, b) => b.value - a.value).slice(0, 3)
    const isSuperfluousOver = (uselessSpendPercent ?? 0) > superfluousTarget

    // Deterministic insight
    const generateInsight = (): string => {
        if (isSuperfluousOver) {
            return `Spese superflue al ${uselessSpendPercent}%, sopra il target del ${superfluousTarget}%.`
        }
        if (budgetUsedPct > 90) {
            return `Attenzione: hai usato il ${budgetUsedPct}% del budget mensile.`
        }
        if (netBalance > 0 && totalIncome > 0) {
            const savingsRate = Math.round((netBalance / totalIncome) * 100)
            return `Ottimo! Stai risparmiando circa il ${savingsRate}% delle entrate.`
        }
        return "Tutto sotto controllo questo mese."
    }

    const blurClass = isPrivate ? "blur-md select-none" : ""

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white p-4 sm:p-6 flex flex-col items-center">
            <div className="w-full max-w-sm space-y-5">

                {/* Header */}
                <div className="text-center space-y-1 pt-2">
                    <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-400">
                        <Sparkles className="h-3.5 w-3.5" />
                        LUMA · Flash
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">{formatPeriodLabel(period)}</h1>
                </div>

                {/* KPI Grid */}
                <Card className="bg-white/5 border-white/10 rounded-2xl backdrop-blur-sm">
                    <CardContent className="p-5 grid grid-cols-3 gap-4 text-center">
                        {/* Entrate */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-center gap-1 text-emerald-400">
                                <TrendingUp className="h-4 w-4" />
                            </div>
                            <div className={cn("text-lg font-bold text-emerald-400", blurClass)}>
                                {formatEuroNumber(totalIncome, currency, locale)}
                            </div>
                            <div className="text-[10px] uppercase tracking-wider text-white/50 font-medium">Entrate</div>
                        </div>

                        {/* Uscite */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-center gap-1 text-rose-400">
                                <TrendingDown className="h-4 w-4" />
                            </div>
                            <div className={cn("text-lg font-bold text-rose-400", blurClass)}>
                                {formatEuroNumber(totalExpenses, currency, locale)}
                            </div>
                            <div className="text-[10px] uppercase tracking-wider text-white/50 font-medium">Uscite</div>
                        </div>

                        {/* Saldo */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-center gap-1 text-blue-400">
                                <Wallet className="h-4 w-4" />
                            </div>
                            <div className={cn("text-lg font-bold", netBalance >= 0 ? "text-blue-400" : "text-orange-400", blurClass)}>
                                {netBalance >= 0 ? "+" : ""}{formatEuroNumber(netBalance, currency, locale)}
                            </div>
                            <div className="text-[10px] uppercase tracking-wider text-white/50 font-medium">Saldo</div>
                        </div>
                    </CardContent>
                </Card>

                {/* Budget Section */}
                <Card className="bg-white/5 border-white/10 rounded-2xl backdrop-blur-sm">
                    <CardContent className="p-5 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
                                <PiggyBank className="h-4 w-4 text-yellow-400" />
                                Budget Mensile
                            </div>
                            <div className={cn("text-xs font-mono text-white/60", blurClass)}>
                                Resto: {formatEuroNumber(budgetRemaining, currency, locale)}
                            </div>
                        </div>
                        <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all",
                                    budgetUsedPct > 90 ? "bg-rose-500" : budgetUsedPct > 70 ? "bg-yellow-500" : "bg-emerald-500"
                                )}
                                style={{ width: `${Math.min(budgetUsedPct, 100)}%` }}
                            />
                        </div>
                        <div className="text-xs text-white/50 text-center">
                            {budgetTotal > 0 ? `${budgetUsedPct}% utilizzato` : "Budget non impostato"}
                        </div>
                    </CardContent>
                </Card>

                {/* Superfluous Section */}
                <Card className="bg-white/5 border-white/10 rounded-2xl backdrop-blur-sm">
                    <CardContent className="p-5 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
                                <Target className="h-4 w-4 text-indigo-400" />
                                Spese Superflue
                            </div>
                            <div className={cn(
                                "text-xs font-bold px-2 py-0.5 rounded-full",
                                isSuperfluousOver
                                    ? "bg-rose-500/20 text-rose-300"
                                    : "bg-emerald-500/20 text-emerald-300"
                            )}>
                                {uselessSpendPercent ?? 0}% / {superfluousTarget}%
                            </div>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all",
                                    isSuperfluousOver ? "bg-rose-500" : "bg-indigo-500"
                                )}
                                style={{ width: `${Math.min(uselessSpendPercent ?? 0, 100)}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Top 3 Categories */}
                <Card className="bg-white/5 border-white/10 rounded-2xl backdrop-blur-sm">
                    <CardContent className="p-5 space-y-3">
                        <div className="text-sm font-semibold text-white/80">Top Categorie</div>
                        <div className="space-y-2">
                            {top3Categories.map((cat, i) => (
                                <div key={cat.id} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-white/40 font-mono text-xs">{i + 1}.</span>
                                        <span className="text-white/90 font-medium truncate max-w-[140px]">{cat.name}</span>
                                    </div>
                                    <span className={cn("font-mono text-white/70", blurClass)}>
                                        {formatEuroNumber(cat.value, currency, locale)}
                                    </span>
                                </div>
                            ))}
                            {top3Categories.length === 0 && (
                                <div className="text-xs text-white/40 text-center py-2">Nessuna spesa</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Insight */}
                <Card className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-white/10 rounded-2xl backdrop-blur-sm">
                    <CardContent className="p-5 flex items-start gap-3">
                        <div className="bg-white/10 p-2 rounded-lg">
                            <AlertTriangle className="h-4 w-4 text-yellow-300" />
                        </div>
                        <p className="text-sm text-white/90 leading-relaxed flex-1">
                            {generateInsight()}
                        </p>
                    </CardContent>
                </Card>

                {/* Privacy Toggle */}
                <div className="flex justify-center pt-2 pb-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsPrivate(!isPrivate)}
                        className="text-white/60 hover:text-white hover:bg-white/10 gap-2 rounded-full px-4"
                    >
                        {isPrivate ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        {isPrivate ? "Mostra Importi" : "Nascondi Importi"}
                    </Button>
                </div>

            </div>
        </div>
    )
}
