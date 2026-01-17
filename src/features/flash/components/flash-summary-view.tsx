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
    Sparkles,
    ArrowUpRight,
    LayoutDashboard
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useDashboardSummary } from "@/features/dashboard/api/use-dashboard"
import { useSettings } from "@/features/settings/api/use-settings"
import { useCurrency } from "@/features/settings/api/use-currency"
import { getCurrentPeriod, formatPeriodLabel } from "@/features/insights/utils"
import { formatEuroNumber } from "@/lib/currency-utils"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function FlashSummaryView() {
    const [isPrivate, setIsPrivate] = useState(false)
    const period = getCurrentPeriod()

    const { data: settings } = useSettings()
    const { currency, locale } = useCurrency()
    const { data, isLoading } = useDashboardSummary({ mode: "month", period })

    const superfluousTarget = settings?.superfluousTargetPercent ?? 10

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0F172A] p-6 flex items-center justify-center">
                <Skeleton className="h-[700px] w-full max-w-sm rounded-[2.5rem]" />
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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    }

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden">
            {/* Main Poster Container */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative w-full max-w-md aspect-[9/16] max-h-[90vh] sm:max-h-[850px] overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] shadow-2xl flex flex-col p-6 sm:p-8"
            >
                {/* Ambient Glows */}
                <div className="absolute top-[-10%] right-[-20%] w-[300px] h-[300px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-20%] w-[300px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute top-[30%] left-[10%] w-[150px] h-[150px] bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />

                {/* Header Branding */}
                <motion.div variants={itemVariants} className="relative z-10 flex items-center justify-between mb-8">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-primary font-bold tracking-tighter text-xl">
                            <Sparkles className="h-5 w-5 fill-primary" />
                            Luma Flash
                        </div>
                        <span className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] mt-0.5">Financial Snapshot</span>
                    </div>
                    <Link href="/">
                        <Button variant="ghost" size="icon" className="rounded-full bg-white/5 border border-white/5 hover:bg-white/10 text-white/50">
                            <LayoutDashboard className="h-4 w-4" />
                        </Button>
                    </Link>
                </motion.div>

                {/* Date & Title */}
                <motion.div variants={itemVariants} className="relative z-10 mb-8">
                    <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tighter text-white leading-tight">
                        {formatPeriodLabel(period).split(" ")[0]}
                        <span className="block text-white/30">{formatPeriodLabel(period).split(" ")[1]}</span>
                    </h2>
                </motion.div>

                {/* KPI Section - Glassmorphic Horizontal */}
                <motion.div variants={itemVariants} className="relative z-10 grid grid-cols-3 gap-3 mb-6">
                    {[
                        { label: "Entrate", value: totalIncome, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                        { label: "Uscite", value: totalExpenses, icon: TrendingDown, color: "text-rose-400", bg: "bg-rose-500/10" },
                        { label: "Saldo", value: netBalance, icon: Wallet, color: netBalance >= 0 ? "text-blue-400" : "text-orange-400", bg: "bg-blue-500/10" }
                    ].map((kpi, idx) => (
                        <div key={idx} className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                            <div className={cn("p-1.5 rounded-lg mb-2", kpi.bg)}>
                                <kpi.icon className={cn("h-4 w-4", kpi.color)} />
                            </div>
                            <div className={cn("text-sm sm:text-base font-bold text-white", blurClass)}>
                                {kpi.label === "Saldo" && kpi.value >= 0 ? "+" : ""}
                                {formatEuroNumber(kpi.value, currency, locale).replace(",00", "")}
                            </div>
                            <div className="text-[9px] uppercase font-bold tracking-wider text-white/40 mt-1">{kpi.label}</div>
                        </div>
                    ))}
                </motion.div>

                {/* Budget & Superfluous - Two Column Mini Cards */}
                <div className="relative z-10 grid grid-cols-2 gap-3 mb-6">
                    {/* Budget */}
                    <motion.div variants={itemVariants} className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-3xl p-5 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <PiggyBank className="h-5 w-5 text-yellow-500" />
                            <Badge variant="outline" className="text-[9px] border-white/10 text-white/60 px-1.5 py-0 h-4">BUDGET</Badge>
                        </div>
                        <div className="space-y-2">
                            <div className={cn("text-xl font-bold text-white", blurClass)}>{budgetUsedPct}%</div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(budgetUsedPct, 100)}%` }}
                                    transition={{ duration: 1, ease: "circOut" }}
                                    className={cn("h-full", budgetUsedPct > 90 ? "bg-rose-500" : "bg-primary")}
                                />
                            </div>
                            <p className="text-[10px] text-white/40 font-medium leading-tight">Del piano mensile utilizzato.</p>
                        </div>
                    </motion.div>

                    {/* Superfluous */}
                    <motion.div variants={itemVariants} className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-3xl p-5 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <Target className="h-5 w-5 text-indigo-400" />
                            <Badge variant="outline" className="text-[9px] border-white/10 text-white/60 px-1.5 py-0 h-4">GOAL</Badge>
                        </div>
                        <div className="space-y-2">
                            <div className={cn("text-xl font-bold text-white", blurClass)}>{uselessSpendPercent ?? 0}%</div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(uselessSpendPercent ?? 0, 100)}%` }}
                                    transition={{ duration: 1, ease: "circOut" }}
                                    className={cn("h-full", isSuperfluousOver ? "bg-rose-500" : "bg-indigo-400")}
                                />
                            </div>
                            <p className="text-[10px] text-white/40 font-medium leading-tight">Spese non essenziali rilevate.</p>
                        </div>
                    </motion.div>
                </div>

                {/* Top Categories - Clean List */}
                <motion.div variants={itemVariants} className="relative z-10 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-3xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-white/60">Top Categories</h3>
                        <ArrowUpRight className="h-4 w-4 text-white/20" />
                    </div>
                    <div className="space-y-4">
                        {top3Categories.map((cat, idx) => (
                            <div key={cat.id} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/40">
                                        0{idx + 1}
                                    </div>
                                    <span className="text-sm font-semibold text-white/80">{cat.name}</span>
                                </div>
                                <div className={cn("text-sm font-bold text-white", blurClass)}>
                                    {formatEuroNumber(cat.value, currency, locale).replace(",00", "")}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Insight - Magical Gradient Block */}
                <motion.div variants={itemVariants} className="relative z-10 mt-auto bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-white/10 rounded-3xl p-6 overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-20">
                        <AlertTriangle className="h-8 w-8 text-yellow-300" />
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-300 mb-2 uppercase tracking-widest">
                        <Sparkles className="h-3 w-3" />
                        Smart Observation
                    </div>
                    <p className="text-sm sm:text-base font-medium text-blue-50 leading-snug pr-4">
                        &quot;{generateInsight()}&quot;
                    </p>
                </motion.div>

                {/* Privacy Toggle Overlay */}
                <motion.div variants={itemVariants} className="relative z-10 mt-6 flex justify-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsPrivate(!isPrivate)}
                        className="rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/40 text-[10px] uppercase font-bold tracking-widest px-6 gap-2"
                    >
                        {isPrivate ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        {isPrivate ? "Reveals Amounts" : "Privacy On"}
                    </Button>
                </motion.div>
            </motion.div>

            {/* Hint for mobile */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ delay: 2 }}
                className="mt-6 text-[10px] uppercase font-bold tracking-[0.3em] text-white/50"
            >
                Screenshot Ready
            </motion.p>
        </div>
    )
}
