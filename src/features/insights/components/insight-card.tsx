"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, AlertTriangle, TrendingUp, Zap, ExternalLink, Activity } from "lucide-react"
import { motion, AnimatePresence, Variants } from "framer-motion"
import { Card } from "@/components/ui/card"
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
        label: "Alta priorità",
    },
    medium: {
        color: "text-amber-600 dark:text-amber-400",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500",
        label: "Attenzione",
    },
    low: {
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500",
        label: "Info",
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
                        <span className="text-muted-foreground text-xs font-bold uppercase tracking-widest block">
                            Insight Analysis
                        </span>
                    </div>
                }
                expandedContent={
                    <div className="pl-0 sm:pl-[64px] space-y-5">
                        {/* Metrics Grid */}
                        {insight.metrics && (
                            <div className="grid grid-cols-2 xs:grid-cols-3 gap-3">
                                {insight.metrics.currentCents !== undefined && (
                                    <div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-1">
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-wider">Attuale</span>
                                        <div className="font-mono text-sm sm:text-base font-semibold">
                                            {formatCents(insight.metrics.currentCents)}
                                        </div>
                                    </div>
                                )}
                                {insight.metrics.baselineCents !== undefined && insight.metrics.baselineCents > 0 && (
                                    <div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-1">
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-wider">Media</span>
                                        <div className="font-mono text-sm sm:text-base font-semibold text-muted-foreground">
                                            {formatCents(insight.metrics.baselineCents)}
                                        </div>
                                    </div>
                                )}
                                {insight.metrics.deltaCents !== undefined && (
                                    <div className={cn(
                                        "p-3 rounded-xl border border-border/50 space-y-1",
                                        insight.metrics.deltaCents > 0 ? "bg-rose-500/5" : "bg-emerald-500/5"
                                    )}>
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-wider">Variazione</span>
                                        <div className={cn(
                                            "font-mono text-sm sm:text-base font-bold",
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
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dettagli / Cause</h4>
                                <div className="space-y-1">
                                    {insight.drivers.map((driver) => (
                                        <div key={driver.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors text-sm">
                                            <span className="font-medium text-foreground/80">{driver.label}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-muted-foreground font-mono">{formatCents(driver.amountCents)}</span>
                                                {driver.deltaCents !== undefined && driver.deltaCents > 0 && (
                                                    <span className="text-rose-500 text-xs font-bold bg-rose-500/10 px-1.5 py-0.5 rounded">
                                                        +{formatCents(driver.deltaCents)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
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

