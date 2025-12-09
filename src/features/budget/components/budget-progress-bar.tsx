"use client"

import { cn } from "@/lib/utils"

interface BudgetProgressBarProps {
    spent: number
    budget: number
    className?: string
    showLabel?: boolean
}

export function BudgetProgressBar({ spent, budget, className, showLabel = true }: BudgetProgressBarProps) {
    const percentage = budget > 0 ? Math.min((spent / budget) * 100, 150) : 0
    const displayPercentage = Math.round(percentage)
    const isOverBudget = percentage > 100
    const isNearLimit = percentage >= 80 && percentage <= 100

    return (
        <div className={cn("space-y-1", className)}>
            {showLabel && (
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{displayPercentage}% utilizzato</span>
                    {isOverBudget && (
                        <span className="text-rose-600 font-medium">Superato</span>
                    )}
                </div>
            )}
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                    className={cn(
                        "h-full rounded-full transition-all duration-500",
                        isOverBudget
                            ? "bg-rose-500"
                            : isNearLimit
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                    )}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                />
            </div>
        </div>
    )
}
