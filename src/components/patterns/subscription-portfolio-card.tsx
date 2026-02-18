"use client"

import * as React from "react"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ExpandableCard } from "@/components/patterns/expandable-card"

export interface SubscriptionPortfolioItem {
    id: string
    description: string
    categoryLabel: string
    amountCents: number
    occurrences: number
    impactPct: number
    transactionsHref: string
}

interface SubscriptionPortfolioCardProps {
    items: SubscriptionPortfolioItem[]
    hiddenCount: number
    formatAmount: (amountCents: number) => string
}

/**
 * Reusable subscriptions portfolio card using the centralized ExpandableCard UI pattern.
 */
export function SubscriptionPortfolioCard({
    items,
    hiddenCount,
    formatAmount
}: SubscriptionPortfolioCardProps) {
    return (
        <section className="space-y-3">
            <div className="space-y-3">
                {items.map((item) => (
                    <ExpandableCard
                        key={item.id}
                        title={
                            <h3 className="font-bold text-base sm:text-lg lg:text-xl leading-tight tracking-tight break-words">
                                {item.description}
                            </h3>
                        }
                        description={
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                                    {item.categoryLabel}
                                </span>
                                <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest block">
                                    {item.occurrences} addebiti rilevati
                                </span>
                            </div>
                        }
                        extraHeaderActions={
                            <div className="text-right shrink-0">
                                <p className="text-sm sm:text-base font-black tracking-tighter tabular-nums text-foreground">
                                    {formatAmount(item.amountCents)}/mese
                                </p>
                                <p className="text-[10px] font-bold uppercase tracking-wider tabular-nums text-muted-foreground/70">
                                    {item.impactPct}% del totale
                                </p>
                            </div>
                        }
                        expandedContent={
                            <div className="pl-0 sm:pl-[64px] space-y-5">
                                <p className="text-sm text-muted-foreground leading-snug">
                                    Apri la sezione transazioni con filtro gia applicato su questa voce periodica.
                                </p>
                                <Button
                                    asChild
                                    size="sm"
                                    className="rounded-xl h-9 gap-2 shadow-sm"
                                    onClick={(event) => event.stopPropagation()}
                                >
                                    <Link href={item.transactionsHref}>
                                        Apri transazioni filtrate
                                        <ExternalLink className="h-3 w-3 opacity-70" />
                                    </Link>
                                </Button>
                            </div>
                        }
                    >
                        <p className="text-sm text-muted-foreground leading-snug">
                            Espandi per aprire i movimenti correlati.
                        </p>
                    </ExpandableCard>
                ))}
            </div>

            {hiddenCount > 0 && (
                <div className="rounded-xl border border-border/50 bg-muted/40 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    +{hiddenCount} piani aggiuntivi rilevati
                </div>
            )}
        </section>
    )
}
