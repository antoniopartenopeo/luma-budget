"use client"

import Link from "next/link"
import { AlertTriangle, TrendingUp, Zap, ExternalLink, Activity } from "lucide-react"
import { motion, Variants } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatCents } from "@/domain/money"
import { Insight, InsightSeverity } from "../types"

interface InsightCardProps {
    insight: Insight
}

const severityConfig: Record<InsightSeverity, {
    color: string
    bgColor: string
    borderColor: string
    label: string
}> = {
    high: {
        color: "text-rose-600 dark:text-rose-400",
        bgColor: "bg-rose-500/10",
        borderColor: "border-rose-500",
        label: "ALTA PRIORITA",
    },
    medium: {
        color: "text-amber-600 dark:text-amber-400",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500",
        label: "ATTENZIONE",
    },
    low: {
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500",
        label: "INFO",
    },
}

const kindIcons = {
    "budget-risk": AlertTriangle,
    "category-spike": TrendingUp,
    "top-drivers": Zap,
}

const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
    }
}

import { ExpandableCard } from "@/components/patterns/expandable-card"

export function InsightCard({ insight }: InsightCardProps) {
    const config = severityConfig[insight.severity]
    const Icon = kindIcons[insight.kind] || Activity

    return (
        <motion.div variants={itemVariants}>
            <ExpandableCard
                indicatorColor={cn(config.bgColor.replace("/10", ""))}
                icon={<Icon className={cn("h-5 w-5 sm:h-6 sm:w-6", config.color)} />}
                title={
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base sm:text-lg lg:text-xl leading-tight tracking-tight break-words">
                            {insight.title}
                        </h3>
                        {/* Mobile Badge */}
                        <Badge variant="secondary" className={cn("xs:hidden text-[10px] px-1.5 h-5", config.bgColor, config.color)}>
                            {config.label}
                        </Badge>
                    </div>
                }
                description={
                    <div className="flex items-center gap-3">
                        {/* Desktop Badge */}
                        <Badge variant="secondary" className={cn("hidden xs:flex h-6", config.bgColor, config.color)}>
                            {config.label}
                        </Badge>
                        <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest block">
                            Spiegazione
                        </span>
                    </div>
                }
                expandedContent={
                    <div className="pl-0 sm:pl-[64px] space-y-5">
                        {/* Metrics Grid */}
                        {insight.metrics && (
                            <div className="grid grid-cols-2 xs:grid-cols-3 gap-3">
                                {insight.metrics.currentCents !== undefined && (
                                    <div className="p-3 rounded-xl glass-card bg-white/40 dark:bg-white/5 space-y-1">
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-wider">Attuale</span>
                                        <div className="font-mono text-sm sm:text-base font-black tracking-tighter tabular-nums">
                                            {formatCents(insight.metrics.currentCents)}
                                        </div>
                                    </div>
                                )}
                                {insight.metrics.baselineCents !== undefined && insight.metrics.baselineCents > 0 && (
                                    <div className="p-3 rounded-xl glass-card bg-white/40 dark:bg-white/5 space-y-1">
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-wider">Media</span>
                                        <div className="font-mono text-sm sm:text-base font-black tracking-tighter tabular-nums text-muted-foreground">
                                            {formatCents(insight.metrics.baselineCents)}
                                        </div>
                                    </div>
                                )}
                                {insight.metrics.deltaCents !== undefined && (
                                    <div className={cn(
                                        "p-3 rounded-xl glass-card border-none space-y-1",
                                        insight.metrics.deltaCents > 0 ? "bg-rose-500/5 ring-1 ring-rose-500/20" : "bg-emerald-500/5 ring-1 ring-emerald-500/20"
                                    )}>
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-wider">Variazione</span>
                                        <div className={cn(
                                            "font-mono text-sm sm:text-base font-black tracking-tighter tabular-nums",
                                            insight.metrics.deltaCents > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                                        )}>
                                            {insight.metrics.deltaCents > 0 ? "+" : ""}
                                            {formatCents(insight.metrics.deltaCents)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Drivers List */}
                        {insight.drivers && insight.drivers.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Voci principali</h4>
                                <div className="space-y-2">
                                    {insight.drivers.map((driver) => {
                                        const maxAmount = Math.max(...(insight.drivers?.map(d => d.amountCents) || [1]))
                                        const impactPct = (driver.amountCents / maxAmount) * 100

                                        return (
                                            <div key={driver.id} className="group/driver relative overflow-hidden p-3 rounded-2xl glass-card border-white/10 hover:bg-white/60 dark:hover:bg-white/10 transition-all duration-300">
                                                {/* Impact Bar Background */}
                                                <div
                                                    className={cn(
                                                        "absolute left-0 top-0 bottom-0 opacity-[0.08] transition-all duration-1000 ease-out",
                                                        insight.severity === 'high' ? "bg-rose-500" : insight.severity === 'medium' ? "bg-amber-500" : "bg-primary"
                                                    )}
                                                    style={{ width: `${impactPct}%` }}
                                                />

                                                <div className="relative z-10 flex items-center justify-between gap-4">
                                                    <div className="flex flex-col gap-0.5 min-w-0">
                                                        <span className="font-bold text-sm text-foreground/90 truncate">{driver.label}</span>
                                                        <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                                                            Peso sul totale
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                                        <span className="font-mono text-sm font-black tabular-nums">{formatCents(driver.amountCents)}</span>
                                                        {driver.deltaCents !== undefined && driver.deltaCents !== 0 && (
                                                            <div className={cn(
                                                                "px-1.5 py-0.5 rounded text-[10px] font-black tabular-nums",
                                                                driver.deltaCents > 0 ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                            )}>
                                                                {driver.deltaCents > 0 ? "+" : ""}{formatCents(driver.deltaCents)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        {insight.actions.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {insight.actions.map((action, index) => (
                                    <Button
                                        key={index}
                                        variant="default"
                                        size="sm"
                                        asChild
                                        onClick={(e) => e.stopPropagation()}
                                        className="rounded-xl h-9 gap-2 shadow-sm"
                                    >
                                        <Link href={action.href}>
                                            {action.label}
                                            <ExternalLink className="h-3 w-3 opacity-70" />
                                        </Link>
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>
                }
            >
                <p className="text-sm text-muted-foreground leading-snug">
                    {insight.summary}
                </p>
            </ExpandableCard>
        </motion.div>
    )
}
