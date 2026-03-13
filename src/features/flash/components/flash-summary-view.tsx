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
import { formatCents } from "@/domain/money"
import { calculateSharePct } from "@/domain/money"
import { narrateSnapshot, deriveSnapshotState, SnapshotFacts } from "@/domain/narration"
import { getDaysElapsedInMonth, getDaysInMonth } from "@/lib/date-ranges"
import { InteractiveCardGhostIcon } from "@/components/patterns/interactive-card-ghost-icon"
import { resolveInteractiveSurfaceStyle, withAlpha } from "@/components/patterns/interactive-surface"
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
        totalIncomeCents,
        totalExpensesCents,
        netBalanceCents,
        uselessSpendPercent,
        categoriesSummary
    } = data

    const expensePressurePct = totalIncomeCents > 0
        ? Math.max(0, calculateSharePct(totalExpensesCents, totalIncomeCents))
        : 0

    // Core facts derived from data
    const top3Categories = [...categoriesSummary].sort((a, b) => b.valueCents - a.valueCents).slice(0, 3)
    const isSuperfluousOver = (uselessSpendPercent ?? 0) > superfluousTarget
    const savingsRatePercent = totalIncomeCents > 0
        ? calculateSharePct(netBalanceCents, totalIncomeCents)
        : undefined

    // Calculate pacing facts (BUDGET-2 Skill: B1-B6)
    const daysElapsed = getDaysElapsedInMonth(period, new Date())
    const daysInMonth = getDaysInMonth(period)
    const elapsedRatio = daysElapsed / daysInMonth

    const isProjectedOverrun = false

    // Rule B6: Data Integrity flag
    const isDataIncomplete = categoriesSummary.length === 0 && daysElapsed > 2

    const snapshotFacts: SnapshotFacts = {
        snapshotId: `flash-${period}`,
        periodLabel: formatPeriodLabel(period),
        incomeFormatted: formatCents(totalIncomeCents, currency, locale),
        expensesFormatted: formatCents(totalExpensesCents, currency, locale),
        balanceFormatted: formatCents(netBalanceCents, currency, locale),
        balanceCents: netBalanceCents,
        budgetFormatted: undefined,
        utilizationPercent: undefined,
        superfluousPercent: uselessSpendPercent ?? undefined,
        superfluousTargetPercent: superfluousTarget,
        savingsRatePercent,
        incomeCents: totalIncomeCents,
        elapsedRatio,
        isProjectedOverrun,
        isDataIncomplete
    }

    // Derive state and generate narrative
    const snapshotState = deriveSnapshotState(snapshotFacts)
    const narration = narrateSnapshot(snapshotFacts, snapshotState)

    const blurClass = isPrivate
        ? "blur-xl select-none opacity-50 transition-[filter,opacity] duration-500"
        : "transition-[filter,opacity] duration-500"

    const themeColor = netBalanceCents >= 0 ? "#10b981" : "#f43f5e" // Emerald for positive, Rose for negative
    const interactiveStyle = resolveInteractiveSurfaceStyle(themeColor, "active")
    const containerStyle = {
        backgroundColor: interactiveStyle.backgroundColor,
        borderColor: interactiveStyle.borderColor,
        backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%), ${interactiveStyle.backgroundImage}`,
        boxShadow: interactiveStyle.boxShadow,
    }
    const glareStyle = {
        backgroundImage: `linear-gradient(90deg, transparent, ${withAlpha(themeColor, 0.6)}, transparent)`,
    }
    const expensePressureBarStyle = {
        backgroundColor: expensePressurePct > 90 ? "#f43f5e" : "var(--foreground)",
        opacity: expensePressurePct > 90 ? 1 : 0.8,
    }
    const superfluousBarStyle = {
        backgroundColor: isSuperfluousOver ? "#f43f5e" : "var(--foreground)",
        opacity: isSuperfluousOver ? 1 : 0.8,
    }

    const containerVariants: Variants = {
        hidden: { opacity: 0, scale: 0.98 },
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
        hidden: { opacity: 0, scale: 0.98 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
        }
    }

    return (
        <div className="w-full h-full flex items-center justify-center overflow-auto py-6 sm:py-8 px-4">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative w-full max-w-[22rem] overflow-hidden rounded-[2.15rem] border shadow-2xl"
                style={containerStyle}
            >
                {/* Glare effect at the top */}
                <div
                    className="pointer-events-none absolute inset-x-[15%] top-0 h-px"
                    style={glareStyle}
                />

                <InteractiveCardGhostIcon
                    visibility="always"
                    isActive={true}
                    className="absolute -right-16 top-1/2 -translate-y-1/2 opacity-[0.12]"
                    wrapperClassName="h-96 w-96"
                    tintStyle={{ color: "var(--foreground)" }}
                    icon={netBalanceCents >= 0 ? TrendingUp : TrendingDown}
                />

                <div className="relative z-10 flex flex-col p-6 sm:p-7 space-y-6">
                    {/* Header */}
                    <motion.div variants={itemVariants} className="flex items-start justify-between">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 font-black uppercase tracking-[0.2em] text-[10px] text-foreground">
                                <Sparkles className="h-3 w-3" />
                                Numa Flash
                            </div>
                            <h2 className="text-[12px] font-bold text-foreground/70 tracking-wide uppercase">
                                {formatPeriodLabel(period)}
                            </h2>
                        </div>
                        {onClose && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="h-8 w-8 rounded-full -mr-2 -mt-1 hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </motion.div>

                    {/* Main KPI */}
                    <motion.div variants={itemVariants} className="flex flex-col">
                        <span className="mb-1 text-[10px] font-black uppercase tracking-[0.22em] text-foreground/80">Saldo Netto</span>
                        <div className={cn("text-[2.75rem] leading-[1.1] font-black tabular-nums tracking-tighter text-foreground", blurClass)}>
                            {netBalanceCents >= 0 ? "+" : ""}
                            {formatCents(netBalanceCents, currency, locale).replace(",00", "")}
                        </div>
                        <div className="flex items-center gap-3 mt-3">
                            <div className="flex items-center gap-1.5 opacity-90">
                                <TrendingUp className="h-3.5 w-3.5 text-foreground" />
                                <span className={cn("text-xs font-bold tabular-nums text-foreground", blurClass)}>
                                    {formatCents(totalIncomeCents, currency, locale).replace(",00", "")}
                                </span>
                            </div>
                            <div className="w-px h-3 bg-foreground/20" />
                            <div className="flex items-center gap-1.5 opacity-90">
                                <TrendingDown className="h-3.5 w-3.5 text-foreground" />
                                <span className={cn("text-xs font-bold tabular-nums text-foreground", blurClass)}>
                                    {formatCents(totalExpensesCents, currency, locale).replace(",00", "")}
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Pressure & Superfluous Grid */}
                    <motion.div variants={itemVariants} className="grid grid-cols-2 gap-5 pt-1">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-[0.22em] mb-1.5 text-foreground/80">Pressione</span>
                            <div className={cn("text-2xl font-black tabular-nums tracking-tighter text-foreground mb-2", blurClass)}>{expensePressurePct}%</div>
                            <div className="h-[3px] rounded-full overflow-hidden w-2/3 bg-foreground/[0.16]">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(expensePressurePct, 100)}%` }}
                                    className="h-full rounded-full"
                                    style={expensePressureBarStyle}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-[0.22em] mb-1.5 text-foreground/80">Superfluo</span>
                            <div className={cn("text-2xl font-black tabular-nums tracking-tighter text-foreground mb-2", blurClass)}>{uselessSpendPercent ?? 0}%</div>
                            <div className="h-[3px] rounded-full overflow-hidden w-2/3 bg-foreground/[0.16]">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(uselessSpendPercent ?? 0, 100)}%` }}
                                    className="h-full rounded-full"
                                    style={superfluousBarStyle}
                                />
                            </div>
                        </div>
                    </motion.div>

                    <div className="h-px w-full bg-foreground/15" />

                    {/* Top Categories */}
                    <motion.div variants={itemVariants} className="flex flex-col space-y-3.5">
                        <span className="text-[10px] font-black uppercase tracking-[0.22em] text-foreground/80">Top categorie</span>
                        <div className="flex flex-col space-y-3">
                            {top3Categories.map((cat, idx) => (
                                <div key={cat.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div
                                            className="flex h-4 w-4 items-center justify-center rounded-sm text-[9px] font-black bg-foreground/15 text-foreground"
                                        >
                                            <span className="opacity-100">{idx + 1}</span>
                                        </div>
                                        <span className="text-[11px] font-bold text-foreground/80 tracking-wide uppercase truncate max-w-[130px] sm:max-w-[160px]">{cat.name}</span>
                                    </div>
                                    <div className={cn("text-xs font-black tabular-nums text-foreground", blurClass)}>
                                        {formatCents(cat.valueCents, currency, locale).replace(",00", "")}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <div className="h-px w-full bg-foreground/15" />

                    {/* Insight Text */}
                    <motion.div variants={itemVariants} className="flex flex-col space-y-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-foreground/80">
                            Numa Insight
                        </div>
                        <p className={cn("text-sm font-medium leading-relaxed text-foreground/90", blurClass)}>
                            {narration.text}
                        </p>
                    </motion.div>

                    {/* Privacy Toggle */}
                    <motion.div variants={itemVariants} className="flex justify-center pt-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsPrivate(!isPrivate)}
                            className="h-8 gap-1.5 rounded-full px-4 text-[10px] font-black uppercase tracking-[0.2em] transition-colors bg-foreground/10 text-foreground"
                        >
                            {isPrivate ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                            {isPrivate ? "Mostra" : "Nascondi"}
                        </Button>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    )
}
