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
    const displayPercentage = Math.round(percentage)

    // Determine tone strictly from status if available (Checklist Item 2)
    const isOverBudget = status ? status === "over_budget" : percentage > 100
    const isAtRisk = status ? status === "at_risk" : (elapsedRatio !== undefined && elapsedRatio > 0 && (percentage / 100) > (elapsedRatio * 1.1))

    // No label judgments inside the progress bar (Checklist Item 1)

    return (
        <div className={cn("space-y-1", className)}>
            {showLabel && (
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{displayPercentage}% utilizzato</span>
                </div>
            )}
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                    className={cn(
                        "h-full rounded-full transition-all duration-500",
                        isOverBudget
                            ? "bg-rose-500"
                            : isAtRisk
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                    )}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                />
            </div>
        </div>
    )
}
