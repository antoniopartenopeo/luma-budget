"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, ChevronUp, AlertTriangle, TrendingUp, Zap, ExternalLink } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
        borderColor: "border-rose-500/20",
        label: "Alta priorità",
    },
    medium: {
        color: "text-amber-600 dark:text-amber-400",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/20",
        label: "Attenzione",
    },
    low: {
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/20",
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
    const Icon = kindIcons[insight.kind]

    const hasDrivers = insight.drivers && insight.drivers.length > 0

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className={cn(
                "rounded-2xl shadow-sm hover:shadow-md transition-all duration-300",
                config.borderColor,
                "border-l-4"
            )}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                    <div className="flex items-start gap-3">
                        <div className={cn(
                            "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                            config.bgColor
                        )}>
                            <Icon className={cn("h-5 w-5", config.color)} />
                        </div>
                        <div>
                            <CardTitle className="text-base font-bold tracking-tight">
                                {insight.title}
                            </CardTitle>
                            <Badge
                                variant="secondary"
                                className={cn(
                                    "text-[10px] px-1.5 py-0 h-5 mt-1 font-semibold",
                                    config.bgColor,
                                    config.color,
                                    "border-none"
                                )}
                            >
                                {config.label}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Summary */}
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {insight.summary}
                    </p>

                    {/* Metrics Pills */}
                    {insight.metrics && (
                        <div className="flex flex-wrap gap-2">
                            {insight.metrics.currentCents !== undefined && (
                                <div className="px-3 py-1.5 rounded-lg bg-muted/50 text-xs font-medium">
                                    Attuale: {formatCents(insight.metrics.currentCents)}
                                </div>
                            )}
                            {insight.metrics.baselineCents !== undefined && insight.metrics.baselineCents > 0 && (
                                <div className="px-3 py-1.5 rounded-lg bg-muted/50 text-xs font-medium">
                                    Baseline: {formatCents(insight.metrics.baselineCents)}
                                </div>
                            )}
                            {insight.metrics.deltaCents !== undefined && (
                                <div className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-bold",
                                    insight.metrics.deltaCents > 0
                                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                )}>
                                    {insight.metrics.deltaCents > 0 ? "+" : ""}
                                    {formatCents(insight.metrics.deltaCents)}
                                    {insight.metrics.deltaPct !== undefined && ` (${insight.metrics.deltaPct > 0 ? "+" : ""}${insight.metrics.deltaPct}%)`}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Expandable Drivers Section */}
                    {hasDrivers && (
                        <div>
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {isExpanded ? (
                                    <ChevronUp className="h-3.5 w-3.5" />
                                ) : (
                                    <ChevronDown className="h-3.5 w-3.5" />
                                )}
                                Perché?
                            </button>

                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="mt-3 space-y-2 pl-1 border-l-2 border-muted ml-1">
                                            {insight.drivers?.map((driver) => (
                                                <div
                                                    key={driver.id}
                                                    className="pl-3 py-1 text-xs"
                                                >
                                                    <span className="font-medium">{driver.label}</span>
                                                    <span className="text-muted-foreground ml-2">
                                                        {formatCents(driver.amountCents)}
                                                    </span>
                                                    {driver.deltaCents !== undefined && driver.deltaCents > 0 && (
                                                        <span className="text-rose-500 ml-1">
                                                            (+{formatCents(driver.deltaCents)})
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Actions */}
                    {insight.actions.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                            {insight.actions.map((action, index) => (
                                <Button
                                    key={index}
                                    variant="secondary"
                                    size="sm"
                                    asChild
                                    className="rounded-lg font-semibold text-xs h-8 gap-1.5"
                                >
                                    <Link href={action.href}>
                                        {action.label}
                                        <ExternalLink className="h-3 w-3" />
                                    </Link>
                                </Button>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}
