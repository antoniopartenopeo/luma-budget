"use client"

import { EnrichedRow } from "../../core/types"
import { cn } from "@/lib/utils"
import { formatCents } from "@/domain/money"
import { Badge } from "@/components/ui/badge"

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
            variant === "flat" && "rounded-lg border border-border/60 bg-background/60"
        )}>
            {rows.map(r => (
                <div key={r.id} className="flex items-center justify-between p-3 transition-colors hover:bg-muted/20">
                    <div className="flex flex-col min-w-0 flex-1">
                        <span className="truncate text-sm font-medium text-foreground">{r.description}</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{r.date}</span>
                            {r.duplicateStatus === "confirmed" && (
                                <Badge
                                    variant="outline"
                                    className="h-5 rounded-full border-amber-500/35 bg-amber-500/10 px-2 text-[10px] font-semibold normal-case tracking-normal text-amber-700 dark:text-amber-300"
                                >
                                    Duplicato
                                </Badge>
                            )}
                            {r.duplicateStatus === "suspected" && (
                                <Badge
                                    variant="outline"
                                    className="h-5 rounded-full border-amber-500/35 bg-amber-500/10 px-2 text-[10px] font-semibold normal-case tracking-normal text-amber-700 dark:text-amber-300"
                                >
                                    Possibile duplicato
                                </Badge>
                            )}
                        </div>
                    </div>
                    <div className={cn(
                        "ml-2 shrink-0 text-sm font-semibold tabular-nums",
                        r.amountCents >= 0
                            ? "text-emerald-600 dark:text-emerald-300"
                            : "text-rose-600 dark:text-rose-300"
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
