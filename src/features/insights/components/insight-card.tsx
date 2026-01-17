"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, AlertTriangle, TrendingUp, Zap, ExternalLink, Activity } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatCents } from "@/lib/currency-utils"
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

export function InsightCard({ insight }: InsightCardProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const config = severityConfig[insight.severity]
    const Icon = kindIcons[insight.kind] || Activity

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <Card
                className={cn(
                    "group relative overflow-hidden rounded-2xl border bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-md cursor-pointer",
                    isExpanded ? "ring-2 ring-primary/5 shadow-lg bg-card" : "hover:bg-accent/5"
                )}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                {/* Visual Indicator Stripe (Left) */}
                <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", config.bgColor.replace("/10", ""))} />

                <div className="p-4 sm:p-5">
                    {/* Header Row (Always Visible) */}
                    <div className="flex items-center gap-4">
                        {/* Icon Box */}
                        <div className={cn(
                            "h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                            isExpanded ? config.bgColor : "bg-muted"
                        )}>
                            <Icon className={cn("h-5 w-5 sm:h-6 sm:w-6 transition-colors", isExpanded ? config.color : "text-muted-foreground")} />
                        </div>

                        {/* Title & Badge */}
                        <div className="flex-1 min-w-0 grid gap-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-base sm:text-lg leading-none tracking-tight truncate">
                                    {insight.title}
                                </h3>
                                {/* Mobile Badge */}
                                <Badge variant="secondary" className={cn("xs:hidden text-[10px] px-1.5 h-5", config.bgColor, config.color)}>
                                    {config.label}
                                </Badge>
                            </div>
                            <p className={cn(
                                "text-sm text-muted-foreground leading-snug transition-all",
                                isExpanded ? "whitespace-normal opacity-100" : "truncate opacity-80"
                            )}>
                                {insight.summary}
                            </p>
                        </div>

                        {/* Right Actions / Metadata */}
                        <div className="flex items-center gap-3 shrink-0">
                            {/* Desktop Badge */}
                            <Badge variant="secondary" className={cn("hidden xs:flex h-6", config.bgColor, config.color)}>
                                {config.label}
                            </Badge>

                            {/* Arrow Indicator */}
                            <div className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300",
                                isExpanded ? "bg-accent rotate-180" : "bg-transparent group-hover:bg-accent/50"
                            )}>
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>
                    </div>

                    {/* Expanded Content (Fade In/Out) */}
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                            >
                                <div className="pt-4 sm:pt-6 pl-0 sm:pl-[64px] space-y-5">
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
                                                    variant="default" // Stronger CTA
                                                    size="sm"
                                                    asChild
                                                    onClick={(e) => e.stopPropagation()} // Prevent card toggle
                                                    className="rounded-lg h-9 gap-2 shadow-sm"
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
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </Card>
        </motion.div>
    )
}
