"use client"

import { cn } from "@/lib/utils"
import { BudgetState } from "@/domain/narration"

interface BudgetProgressBarProps {
    spent: number
    budget: number
    className?: string
    showLabel?: boolean
    elapsedRatio?: number
    status?: BudgetState
}

export function BudgetProgressBar({ spent, budget, className, showLabel = true, elapsedRatio, status }: BudgetProgressBarProps) {
    const percentage = budget > 0 ? (spent / budget) * 100 : 0
    const clampedPercentage = Math.min(percentage, 100)

    // Determine gradient manually based on logic if status implies risk, or generic percentage
    const isOverBudget = status === "over_budget" || percentage > 100
    const isAtRisk = status === "at_risk"

    // Dynamic Gradient Classes
    let gradientClass = "bg-gradient-to-r from-emerald-500 to-emerald-400"
    let glowClass = "shadow-[0_0_10px_rgba(16,185,129,0.3)]"

    if (isOverBudget) {
        gradientClass = "bg-gradient-to-r from-rose-500 to-rose-600"
        glowClass = "shadow-[0_0_15px_rgba(244,63,94,0.4)]"
    } else if (isAtRisk) {
        gradientClass = "bg-gradient-to-r from-amber-500 to-amber-400"
        glowClass = "shadow-[0_0_10px_rgba(245,158,11,0.3)]"
    }

    // Pacing Marker Position (clamp to 0-100)
    const pacingLeft = elapsedRatio ? Math.min(Math.max(elapsedRatio * 100, 0), 100) : null

    return (
        <div className={cn("space-y-2", className)}>
            {showLabel && (
                <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Utilizzo
                    </span>
                    <span className={cn(
                        "text-xs font-bold tabular-nums",
                        isOverBudget ? "text-rose-600" : "text-foreground"
                    )}>
                        {Math.round(percentage)}%
                    </span>
                </div>
            )}

            <div className="relative h-3 w-full bg-muted/50 rounded-full overflow-hidden ring-1 ring-inset ring-black/5 dark:ring-white/5">
                {/* Background Pacing Hint (Stripes up to expected pacing?) - Optional visual aid */}

                {/* Main Progress Bar */}
                <div
                    className={cn(
                        "h-full rounded-full transition-all duration-700 ease-out",
                        gradientClass,
                        glowClass
                    )}
                    style={{ width: `${clampedPercentage}%` }}
                />

                {/* Pacing Marker (Today) */}
                {pacingLeft !== null && (
                    <div
                        className="absolute top-0 bottom-0 w-0.5 bg-foreground/80 z-10 cursor-help group/marker"
                        style={{ left: `${pacingLeft}%` }}
                        title={`Oggi (${Math.round(pacingLeft)}%)`}
                    >
                        {/* Tick Head */}
                        <div className="absolute -top-1 -translate-x-[calc(50%-0.5px)] w-1.5 h-1.5 rounded-full bg-foreground shadow-sm group-hover/marker:scale-125 transition-transform" />
                    </div>
                )}
            </div>
        </div>
    )
}
