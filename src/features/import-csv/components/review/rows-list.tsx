"use client"

import { EnrichedRow } from "../../core/types"
import { cn } from "@/lib/utils"
import { formatCents } from "@/domain/money"

interface RowsListProps {
    rows: EnrichedRow[]
    showMore?: number
}

/**
 * Displays a list of transaction rows with description, date, and amount.
 * Extracted from step-review.tsx for better maintainability.
 */
export function RowsList({ rows, showMore = 0 }: RowsListProps) {
    if (rows.length === 0) {
        return <p className="text-xs text-muted-foreground text-center py-2">Nessuna transazione</p>
    }

    return (
        <div className="rounded-lg border bg-background divide-y">
            {rows.map(r => (
                <div key={r.id} className="flex justify-between items-center p-2.5 text-xs">
                    <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-medium truncate">{r.description}</span>
                        <span className="text-[10px] text-muted-foreground">{r.date}</span>
                    </div>
                    <div className={cn(
                        "font-mono font-medium shrink-0 ml-2",
                        r.amountCents >= 0 ? "text-emerald-600" : "text-rose-600"
                    )}>
                        {formatCents(r.amountCents)}
                    </div>
                </div>
            ))}
            {showMore > 0 && (
                <div className="p-2 text-center text-[10px] text-muted-foreground bg-muted/30">
                    ...e altri {showMore}
                </div>
            )}
        </div>
    )
}
