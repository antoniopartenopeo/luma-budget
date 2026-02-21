"use client"

import { EnrichedRow } from "../../core/types"
import { cn } from "@/lib/utils"
import { formatCents } from "@/domain/money"

interface RowsListProps {
    rows: EnrichedRow[]
    showMore?: number
    variant?: "default" | "flat"
}

/**
 * Displays a list of transaction rows with description, date, and amount.
 * Extracted from step-review.tsx for better maintainability.
 */
export function RowsList({ rows, showMore = 0, variant = "default" }: RowsListProps) {
    if (rows.length === 0) {
        return <p className="py-2 text-center text-xs text-muted-foreground">Nessun movimento</p>
    }

    return (
        <div className={cn(
            "divide-y",
            variant === "default" && "rounded-lg border bg-background",
            variant === "flat" && "rounded-md border border-border/60 bg-muted/10"
        )}>
            {rows.map(r => (
                <div key={r.id} className="flex items-center justify-between p-2.5">
                    <div className="flex flex-col min-w-0 flex-1">
                        <span className="truncate text-sm font-medium">{r.description}</span>
                        <span className="text-xs text-muted-foreground">{r.date}</span>
                    </div>
                    <div className={cn(
                        "ml-2 shrink-0 text-sm font-semibold tabular-nums",
                        r.amountCents >= 0 ? "text-emerald-600" : "text-rose-600"
                    )}>
                        {formatCents(r.amountCents)}
                    </div>
                </div>
            ))}
            {showMore > 0 && (
                <div className="bg-muted/30 p-2 text-center text-xs text-muted-foreground">
                    ...e altri {showMore}
                </div>
            )}
        </div>
    )
}
