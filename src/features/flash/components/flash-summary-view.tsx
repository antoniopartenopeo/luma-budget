"use client"

import { useState } from "react"
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    PiggyBank,
    Target,
    Eye,
    EyeOff,
    Sparkles,
    ArrowUpRight,
    X
} from "lucide-react"
import { motion, Variants } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useDashboardSummary } from "@/features/dashboard/api/use-dashboard"
import { useSettings } from "@/features/settings/api/use-settings"
import { useCurrency } from "@/features/settings/api/use-currency"
import { getCurrentPeriod, formatPeriodLabel } from "@/features/insights/utils"
import { formatEuroNumber } from "@/lib/currency-utils"
import { cn } from "@/lib/utils"

interface FlashSummaryViewProps {
    onClose?: () => void
}

export function FlashSummaryView({ onClose }: FlashSummaryViewProps) {
    const [isPrivate, setIsPrivate] = useState(false)
    const period = getCurrentPeriod()

    const { data: settings } = useSettings()
    const { currency, locale } = useCurrency()
    const { data, isLoading } = useDashboardSummary({ mode: "month", period })

    const superfluousTarget = settings?.superfluousTargetPercent ?? 10

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-6">
                <Skeleton className="h-[600px] w-full max-w-sm rounded-[2.5rem] bg-white/5" />
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

    const generateInsight = (): string => {
        if (isSuperfluousOver) {
            return `Le tue spese superflue sono al ${uselessSpendPercent}%, oltre il target del ${superfluousTarget}%. Un piccolo taglio qui farebbe miracoli.`
        }
        if (budgetUsedPct > 90) {
            return `Attenzione! Hai eroso il ${budgetUsedPct}% del tuo budget. Prova a stringere la cinghia negli ultimi giorni.`
        }
        if (netBalance > 0 && totalIncome > 0) {
            const savingsRate = Math.round((netBalance / totalIncome) * 100)
            return `Livello di risparmio incredibile: ${savingsRate}% questo mese. Continua così!`
        }
        return "Gestione finanziaria impeccabile, non ci sono anomalie rilevanti questo mese."
    }

    const blurClass = isPrivate ? "blur-xl select-none opacity-50 transition-all duration-500" : "transition-all duration-500"

    const containerVariants: Variants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    }

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    }

    return (
        <div className="w-full h-full flex items-center justify-center overflow-auto py-8">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/40 bg-white/40 backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] flex flex-col p-6"
            >
                {/* Visual Glass Reflection Accent */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />

                {/* Header Branding & Close */}
                <motion.div variants={itemVariants} className="relative z-10 flex items-start justify-between mb-4">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-slate-900 font-bold tracking-tight text-lg">
                            <Sparkles className="h-4 w-4 fill-primary text-primary" />
                            Luma Flash
                        </div>
                        <h2 className="text-sm font-medium text-slate-500">
                            {formatPeriodLabel(period)}
                        </h2>
                    </div>
                    {onClose && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="rounded-full bg-black/5 hover:bg-black/10 text-slate-500 h-8 w-8"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </motion.div>

                {/* Main Bento Grid */}
                <div className="relative z-10 grid grid-cols-2 gap-3 mb-3">
                    {/* Primary Balance Card - Big Square */}
                    <motion.div variants={itemVariants} className="col-span-2 bg-white/50 border border-white/40 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Saldo Netto</span>
                        <div className={cn("text-3xl font-extrabold text-slate-900 tracking-tight", blurClass)}>
                            {netBalance >= 0 ? "+" : ""}
                            {formatEuroNumber(netBalance, currency, locale).replace(",00", "")}
                        </div>
                        <div className="flex items-center gap-4 mt-3 w-full justify-center">
                            <div className="flex items-center gap-1.5">
                                <div className="p-1 rounded-full bg-emerald-100/50">
                                    <TrendingUp className="h-3 w-3 text-emerald-600" />
                                </div>
                                <span className={cn("text-xs font-semibold text-emerald-700", blurClass)}>
                                    {formatEuroNumber(totalIncome, currency, locale).replace(",00", "")}
                                </span>
                            </div>
                            <div className="w-px h-3 bg-slate-200" />
                            <div className="flex items-center gap-1.5">
                                <div className="p-1 rounded-full bg-rose-100/50">
                                    <TrendingDown className="h-3 w-3 text-rose-600" />
                                </div>
                                <span className={cn("text-xs font-semibold text-rose-700", blurClass)}>
                                    {formatEuroNumber(totalExpenses, currency, locale).replace(",00", "")}
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Budget & Goal - Half width */}
                    <motion.div variants={itemVariants} className="bg-white/50 border border-white/40 rounded-2xl p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <PiggyBank className="h-4 w-4 text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Budget</span>
                        </div>
                        <div className={cn("text-lg font-bold text-slate-900", blurClass)}>{budgetUsedPct}%</div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(budgetUsedPct, 100)}%` }}
                                className={cn("h-full", budgetUsedPct > 90 ? "bg-rose-500" : "bg-blue-500")}
                            />
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white/50 border border-white/40 rounded-2xl p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <Target className="h-4 w-4 text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Superfluo</span>
                        </div>
                        <div className={cn("text-lg font-bold text-slate-900", blurClass)}>{uselessSpendPercent ?? 0}%</div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(uselessSpendPercent ?? 0, 100)}%` }}
                                className={cn("h-full", isSuperfluousOver ? "bg-rose-500" : "bg-indigo-500")}
                            />
                        </div>
                    </motion.div>
                </div>

                {/* Top Categories - Compact List */}
                <motion.div variants={itemVariants} className="relative z-10 bg-white/50 border border-white/40 rounded-2xl p-4 mb-3 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Top Categories</h3>
                    </div>
                    <div className="space-y-2">
                        {top3Categories.map((cat, idx) => (
                            <div key={cat.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-5 w-5 rounded-md bg-white border border-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 shadow-sm">
                                        {idx + 1}
                                    </div>
                                    <span className="text-xs font-semibold text-slate-700">{cat.name}</span>
                                </div>
                                <div className={cn("text-xs font-bold text-slate-900", blurClass)}>
                                    {formatEuroNumber(cat.value, currency, locale).replace(",00", "")}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Insight - Clean Text */}
                <motion.div variants={itemVariants} className="relative z-10 mt-auto bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100/50 rounded-2xl p-4">
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-indigo-500 mb-1.5 uppercase tracking-widest">
                        <Sparkles className="h-3 w-3" />
                        AI Insight
                    </div>
                    <p className="text-xs font-medium text-slate-600 leading-snug">
                        {generateInsight()}
                    </p>
                </motion.div>

                {/* Privacy Toggle */}
                <motion.div variants={itemVariants} className="relative z-10 mt-4 flex justify-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsPrivate(!isPrivate)}
                        className="rounded-full bg-white/60 hover:bg-white border border-white/50 text-slate-400 hover:text-slate-600 text-[10px] uppercase font-bold tracking-widest px-4 h-7 gap-1.5 shadow-sm transition-all"
                    >
                        {isPrivate ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        {isPrivate ? "Mostra" : "Nascondi"}
                    </Button>
                </motion.div>
            </motion.div>
        </div>
    )
}
