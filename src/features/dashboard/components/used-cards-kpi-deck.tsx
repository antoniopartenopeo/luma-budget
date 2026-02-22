"use client"

import { DashboardCardUsage } from "../api/types"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { getPrivacyClass } from "@/features/privacy/privacy-utils"
import { Wifi } from "lucide-react"

interface UsedCardsKpiDeckProps {
    cards: DashboardCardUsage[]
    isLoading?: boolean
    isPrivacyMode?: boolean
    emptyLabel?: string
    showHeader?: boolean
    className?: string
}

const CARD_RATIO_CLASS = "aspect-[1.586]"

type CardTheme = {
    surface: string
    glow: string
    chip: string
}

function resolveCardTheme(): CardTheme {
    return {
        surface: "bg-gradient-to-br from-slate-100/75 via-white/45 to-primary/10 dark:from-slate-900/70 dark:via-slate-900/55 dark:to-primary/10",
        glow: "bg-primary/20 dark:bg-primary/15",
        chip: "border-white/55 bg-gradient-to-br from-white/90 to-slate-100/55 dark:border-white/20 dark:from-slate-200/18 dark:to-slate-100/8"
    }
}

function formatLastSeenDate(value: string): string {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "—"

    return new Intl.DateTimeFormat("it-IT", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).format(date)
}

function renderStatusLabel(card: DashboardCardUsage) {
    if (card.status === "active") {
        return {
            label: "Attiva",
            className: "border-primary/25 bg-primary/10 text-primary"
        }
    }

    return {
        label: "Non recente",
        className: "border-slate-400/25 bg-slate-400/10 text-slate-700 dark:text-slate-300"
    }
}

function buildMaskedCardNumber(last4: string): string {
    return `•••• •••• •••• ${last4}`
}

function UsedCardItem({ card, isPrivacyMode }: { card: DashboardCardUsage, isPrivacyMode: boolean }) {
    const status = renderStatusLabel(card)
    const theme = resolveCardTheme()

    return (
        <article
            data-testid="used-card-item"
            className={cn(
                CARD_RATIO_CLASS,
                "relative overflow-hidden rounded-2xl glass-card shadow-xl hover:shadow-xl p-5 flex flex-col justify-between",
                theme.surface
            )}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/5 to-transparent dark:from-white/[0.08] dark:via-white/[0.02] dark:to-transparent pointer-events-none" />
            <div className={cn("absolute -right-10 -top-10 h-32 w-32 rounded-full blur-2xl pointer-events-none", theme.glow)} />
            <div className="absolute -left-16 -bottom-14 h-40 w-40 rounded-full bg-white/20 dark:bg-white/[0.05] blur-3xl pointer-events-none" />

            <div className="relative z-10 flex items-start justify-between gap-3">
                <div className="space-y-1">
                    <p className="text-[10px] font-black tracking-[0.2em] uppercase text-foreground/65">Numa</p>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                        {card.network}
                    </p>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-1.5">
                    {card.walletProvider !== "Unknown" && (
                        <span className="rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                            {card.walletProvider}
                        </span>
                    )}
                    <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-bold", status.className)}>
                        {status.label}
                    </span>
                </div>
            </div>

            <div className="relative z-10 mt-1 flex items-center justify-between">
                <div className={cn("relative h-10 w-14 rounded-lg border p-[2px] shadow-sm", theme.chip)}>
                    <div className="absolute inset-[2px] rounded-[0.45rem] border border-white/45 dark:border-white/15 bg-gradient-to-br from-white/60 to-white/20 dark:from-white/25 dark:to-transparent" />
                    <div className="absolute left-1/2 top-[3px] bottom-[3px] w-px -translate-x-1/2 bg-white/45 dark:bg-white/20" />
                    <div className="absolute inset-x-[10px] top-1/2 h-px -translate-y-1/2 bg-white/40 dark:bg-white/20" />
                </div>
                <div className="rounded-full border border-white/40 dark:border-white/15 bg-white/35 dark:bg-white/[0.06] p-1.5">
                    <Wifi className="h-4 w-4 rotate-90 text-foreground/65" aria-hidden />
                </div>
            </div>

            <div className="relative z-10 mt-1">
                <p
                    data-testid={`used-card-last4-${card.cardId}`}
                    className={cn(
                        "text-[clamp(1.08rem,3.6vw,1.35rem)] font-black tracking-[0.11em] tabular-nums text-foreground",
                        getPrivacyClass(isPrivacyMode)
                    )}
                >
                    {buildMaskedCardNumber(card.last4)}
                </p>
            </div>

            <div className="relative z-10 pt-1">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Ultimo uso</p>
                    <p className="text-xs font-semibold text-foreground/90">{formatLastSeenDate(card.lastSeen)}</p>
                </div>
            </div>
        </article>
    )
}

function UsedCardsLoadingState() {
    return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1].map((index) => (
                <div
                    key={index}
                    data-testid="used-cards-skeleton"
                    className={cn(CARD_RATIO_CLASS, "rounded-2xl glass-card shadow-xl p-4 flex flex-col justify-between")}
                >
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-6 w-28" />
                    </div>
                    <div className="space-y-1.5">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>
            ))}
        </div>
    )
}

export function UsedCardsKpiDeck({
    cards,
    isLoading = false,
    isPrivacyMode = false,
    emptyLabel = "Nessuna carta rilevata nel periodo selezionato.",
    showHeader = true,
    className
}: UsedCardsKpiDeckProps) {
    return (
        <section className={cn("space-y-4", className)} aria-label="Carte utilizzate">
            {showHeader && (
                <div className="flex items-center justify-between gap-2">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Carte Utilizzate</h3>
                    {!isLoading && cards.length > 0 && (
                        <span className="text-xs font-semibold text-muted-foreground">
                            {cards.length} {cards.length === 1 ? "rilevata" : "rilevate"}
                        </span>
                    )}
                </div>
            )}

            {isLoading ? (
                <UsedCardsLoadingState />
            ) : cards.length === 0 ? (
                <div className="rounded-2xl glass-card shadow-xl p-4 sm:p-5">
                    <p className="text-sm font-medium text-muted-foreground">{emptyLabel}</p>
                </div>
            ) : (
                <>
                    <div className="sm:hidden -mx-1 px-1 overflow-x-auto">
                        <div className="flex gap-3 snap-x snap-mandatory pb-1">
                            {cards.map((card) => (
                                <div key={card.cardId} className="snap-start shrink-0 w-[82%] max-w-[21rem]">
                                    <UsedCardItem card={card} isPrivacyMode={isPrivacyMode} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="hidden sm:grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {cards.map((card) => (
                            <UsedCardItem key={card.cardId} card={card} isPrivacyMode={isPrivacyMode} />
                        ))}
                    </div>
                </>
            )}
        </section>
    )
}

export type { UsedCardsKpiDeckProps }
