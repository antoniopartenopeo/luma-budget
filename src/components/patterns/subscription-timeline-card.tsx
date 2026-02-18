"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { CalendarClock } from "lucide-react"

export interface SubscriptionTimelineItem {
    id: string
    description: string
    amountCents: number
    nextChargeDate: Date
    daysUntilCharge: number
}

interface SubscriptionTimelineCardProps {
    items: SubscriptionTimelineItem[]
    windowDays: number
    formatAmount: (amountCents: number) => string
    formatDate: (date: Date) => string
    formatDueLabel: (daysUntilCharge: number) => string
    getDuePillClass: (daysUntilCharge: number) => string
}

/**
 * Reusable milestone timeline for upcoming subscription charges.
 */
export function SubscriptionTimelineCard({
    items,
    windowDays,
    formatAmount,
    formatDate,
    formatDueLabel,
    getDuePillClass
}: SubscriptionTimelineCardProps) {
    return (
        <section className="space-y-3">
            <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-foreground/80">
                <CalendarClock className="h-3 w-3 text-primary" />
                Timeline addebiti prossimi ({windowDays}g)
            </div>

            {items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-3 py-4 text-sm leading-snug text-muted-foreground">
                    Nessun addebito previsto in questa finestra temporale.
                </div>
            ) : (
                <div className="relative rounded-xl border border-border/50 bg-background/85 p-4">
                    <div className="absolute left-4 right-4 top-12 h-[2px] rounded-full bg-gradient-to-r from-primary/20 via-primary/50 to-primary/20" />
                    <div className={cn(
                        "relative flex items-start gap-2",
                        items.length === 1 ? "justify-center" : "justify-between"
                    )}>
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className={cn(
                                    "min-w-0 flex flex-col items-center text-center",
                                    items.length === 1 ? "max-w-56" : "flex-1"
                                )}
                            >
                                <p className="text-sm font-black tracking-tight tabular-nums text-foreground">
                                    {formatAmount(item.amountCents)}
                                </p>
                                <p className={cn(
                                    "mt-1 inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider",
                                    getDuePillClass(item.daysUntilCharge)
                                )}>
                                    {formatDueLabel(item.daysUntilCharge)}
                                </p>
                                <div className="mt-2 h-5 w-5 rounded-full bg-primary ring-4 ring-primary/20 shadow-md" />
                                <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-primary">
                                    {formatDate(item.nextChargeDate)}
                                </p>
                                <p className="mt-1 truncate w-full px-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    )
}
