"use client"

import { useState } from "react"
import {
    TrendingUp,
    TrendingDown,
    PiggyBank,
    Target,
    Eye,
    EyeOff,
    Sparkles,
    X
} from "lucide-react"
import { motion, Variants } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useDashboardSummary } from "@/features/dashboard/api/use-dashboard"
import { useSettings } from "@/features/settings/api/use-settings"
import { useCurrency } from "@/features/settings/api/use-currency"
import { getCurrentPeriod, formatPeriodLabel } from "@/features/insights/utils"
import { formatEuroNumber } from "@/lib/currency-utils"
import { calculateUtilizationPct, calculateSharePct } from "@/lib/financial-math"
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

    // Use centralized calculation (inputs in EUR units, convert to cents equivalent for ratio)
    const budgetSpentUnits = budgetTotal - budgetRemaining
    const budgetUsedPct = calculateUtilizationPct(budgetSpentUnits * 100, budgetTotal * 100)
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
            // Use centralized calculation (convert EUR to cents equivalent)
            const savingsRate = calculateSharePct(netBalance * 100, totalIncome * 100)
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
                className="relative w-full max-w-md overflow-hidden rounded-[2rem] glass-panel shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] flex flex-col p-6"
            >
                {/* Visual Glass Reflection Accent */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 dark:from-white/5 to-transparent pointer-events-none" />

                {/* Header Branding & Close */}
                <motion.div variants={itemVariants} className="relative z-10 flex items-start justify-between mb-4">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-foreground font-bold tracking-tight text-lg">
                            <Sparkles className="h-4 w-4 fill-primary text-primary" />
                            Luma Flash
                        </div>
                        <h2 className="text-sm font-medium text-muted-foreground">
                            {formatPeriodLabel(period)}
                        </h2>
                    </div>
                    {onClose && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground h-8 w-8"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </motion.div>

                {/* Main Bento Grid */}
                <div className="relative z-10 grid grid-cols-2 gap-3 mb-3">
                    {/* Primary Balance Card - Big Square */}
                    <motion.div variants={itemVariants} className="col-span-2 glass-card rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1">Saldo Netto</span>
                        <div className={cn("text-3xl font-extrabold text-foreground tracking-tight", blurClass)}>
                            {netBalance >= 0 ? "+" : ""}
                            {formatEuroNumber(netBalance, currency, locale).replace(",00", "")}
                        </div>
                        <div className="flex items-center gap-4 mt-3 w-full justify-center">
                            <div className="flex items-center gap-1.5">
                                <div className="p-1 rounded-full bg-emerald-100/50 dark:bg-emerald-900/30">
                                    <TrendingUp className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <span className={cn("text-xs font-semibold text-emerald-700 dark:text-emerald-400", blurClass)}>
                                    {formatEuroNumber(totalIncome, currency, locale).replace(",00", "")}
                                </span>
                            </div>
                            <div className="w-px h-3 bg-border" />
                            <div className="flex items-center gap-1.5">
                                <div className="p-1 rounded-full bg-rose-100/50 dark:bg-rose-900/30">
                                    <TrendingDown className="h-3 w-3 text-rose-600 dark:text-rose-400" />
                                </div>
                                <span className={cn("text-xs font-semibold text-rose-700 dark:text-rose-400", blurClass)}>
                                    {formatEuroNumber(totalExpenses, currency, locale).replace(",00", "")}
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Budget & Goal - Half width */}
                    <motion.div variants={itemVariants} className="glass-card rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-3">
                            <PiggyBank className="h-4 w-4 text-muted-foreground" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Budget</span>
                        </div>
                        <div className={cn("text-lg font-bold text-foreground", blurClass)}>{budgetUsedPct}%</div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-2">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(budgetUsedPct, 100)}%` }}
                                className={cn("h-full", budgetUsedPct > 90 ? "bg-rose-500" : "bg-blue-500")}
                            />
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="glass-card rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-3">
                            <Target className="h-4 w-4 text-muted-foreground" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Superfluo</span>
                        </div>
                        <div className={cn("text-lg font-bold text-foreground", blurClass)}>{uselessSpendPercent ?? 0}%</div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-2">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(uselessSpendPercent ?? 0, 100)}%` }}
                                className={cn("h-full", isSuperfluousOver ? "bg-rose-500" : "bg-indigo-500")}
                            />
                        </div>
                    </motion.div>
                </div>

                {/* Top Categories - Compact List */}
                <motion.div variants={itemVariants} className="relative z-10 glass-card rounded-2xl p-4 mb-3">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Top Categories</h3>
                    </div>
                    <div className="space-y-2">
                        {top3Categories.map((cat, idx) => (
                            <div key={cat.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-5 w-5 rounded-md bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-[10px] font-bold text-muted-foreground shadow-sm">
                                        {idx + 1}
                                    </div>
                                    <span className="text-xs font-semibold text-foreground/80">{cat.name}</span>
                                </div>
                                <div className={cn("text-xs font-bold text-foreground", blurClass)}>
                                    {formatEuroNumber(cat.value, currency, locale).replace(",00", "")}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Insight - Clean Text */}
                <motion.div variants={itemVariants} className="relative z-10 mt-auto bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-100/50 dark:border-indigo-500/20 rounded-2xl p-4">
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-indigo-500 dark:text-indigo-400 mb-1.5 uppercase tracking-widest">
                        <Sparkles className="h-3 w-3" />
                        AI Insight
                    </div>
                    <p className="text-xs font-medium text-foreground/90 leading-snug">
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
