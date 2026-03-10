"use client"

import { motion, useTransform } from "framer-motion"
import { CreditCard, Wifi } from "lucide-react"
import { InteractiveCardGhostIcon } from "@/components/patterns/interactive-card-ghost-icon"
import {
    INTERACTIVE_CARD_HOVER_STATE,
    INTERACTIVE_CARD_TRANSITION,
    resolveInteractiveSurfaceStyle,
    resolveInteractiveTileLayoutClass,
    useInteractiveTilt,
    withAlpha
} from "@/components/patterns/interactive-surface"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { getPrivacyClass } from "@/features/privacy/privacy-utils"
import { DashboardCardUsage } from "../api/types"

interface UsedCardsKpiDeckProps {
    cards: DashboardCardUsage[]
    isLoading?: boolean
    isPrivacyMode?: boolean
    emptyLabel?: string
    showHeader?: boolean
    className?: string
}

const CARD_RATIO_CLASS = "aspect-[1.586]"

function resolveCardAccentColor(card: DashboardCardUsage): string {
    const network = card.network.toLowerCase()

    if (network.includes("master")) return "#f97316"
    if (network.includes("visa")) return "#2563eb"
    if (network.includes("amex")) return "#0891b2"

    return "#0ea5a8"
}

function resolveConfidenceLabel(confidence: DashboardCardUsage["confidence"]): string {
    if (confidence === "high") return "Alta fiducia"
    if (confidence === "medium") return "Fiducia media"
    return "Fiducia bassa"
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
            className: "border-primary/20 bg-primary/10 text-primary"
        }
    }

    return {
        label: "Non recente",
        className: "border-slate-400/25 bg-slate-400/10 text-slate-700 dark:text-slate-300"
    }
}

function buildMaskedCardNumber(last4: string): string {
    return `•••• ${last4}`
}

function UsedCardTile({
    card,
    index,
    total,
    isPrivacyMode
}: {
    card: DashboardCardUsage
    index: number
    total: number
    isPrivacyMode: boolean
}) {
    const rawColor = resolveCardAccentColor(card)
    const status = renderStatusLabel(card)
    const confidenceLabel = resolveConfidenceLabel(card.confidence)
    const {
        depthX,
        depthY,
        isInteractive,
        isPrimed,
        handlePointerEnter,
        handlePointerMove,
        handlePointerLeave
    } = useInteractiveTilt({
        pointerSpring: { damping: 24, stiffness: 250, mass: 0.42 },
        depthSpring: { damping: 28, stiffness: 300, mass: 0.34 }
    })
    const surfaceStyle = resolveInteractiveSurfaceStyle(rawColor, isPrimed ? "active" : "rest", "neutral")
    const rotateX = useTransform(depthY, [-0.5, 0.5], [9.2, -9.2])
    const rotateY = useTransform(depthX, [-0.5, 0.5], [-10.4, 10.4])
    const contentShiftX = useTransform(depthX, [-0.5, 0.5], [-5, 5])
    const contentShiftY = useTransform(depthY, [-0.5, 0.5], [-4, 4])

    return (
        <motion.article
            data-testid="used-card-item"
            className={cn(
                "group/card relative min-h-[9.75rem] overflow-hidden rounded-[1.9rem] border px-5 py-4 [transform-style:preserve-3d]",
                resolveInteractiveTileLayoutClass(index, total)
            )}
            style={{
                ...surfaceStyle,
                ...(isInteractive ? { rotateX, rotateY } : {})
            }}
            onMouseEnter={handlePointerEnter}
            onMouseMove={handlePointerMove}
            onMouseLeave={handlePointerLeave}
            whileHover={isInteractive ? INTERACTIVE_CARD_HOVER_STATE : undefined}
            transition={INTERACTIVE_CARD_TRANSITION}
        >
            <div className="pointer-events-none absolute inset-[1px] rounded-[calc(1.9rem-1px)] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02)_34%,transparent_62%)] opacity-80" />

            <InteractiveCardGhostIcon
                icon={CreditCard}
                isActive={isPrimed}
                floatDelay={index * 0.08}
                tintStyle={{ color: withAlpha(rawColor, isPrimed ? 0.26 : 0.2) }}
                className="bottom-[-0.35rem] right-[0.35rem] inset-y-auto"
                wrapperClassName="h-32 w-32 sm:h-36 sm:w-36"
                iconClassName="h-24 w-24 sm:h-28 sm:w-28"
            />

            <motion.div
                className="relative z-10 flex h-full flex-col justify-between gap-4"
                style={isInteractive ? { x: contentShiftX, y: contentShiftY } : undefined}
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 max-w-[72%] space-y-1">
                        <p
                            className="text-[10px] font-black uppercase tracking-[0.2em]"
                            style={{ color: withAlpha(rawColor, 0.82) }}
                        >
                            {card.network}
                        </p>
                        <p className="text-xs font-medium text-muted-foreground/85">
                            {card.walletProvider !== "Unknown" ? card.walletProvider : confidenceLabel}
                        </p>
                    </div>

                    <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-bold", status.className)}>
                        {status.label}
                    </span>
                </div>

                <div className="space-y-4">
                    <p
                        data-testid={`used-card-last4-${card.cardId}`}
                        className={cn(
                            "max-w-[74%] text-[clamp(1.3rem,3.8vw,1.85rem)] font-black tracking-[0.14em] text-foreground tabular-nums",
                            getPrivacyClass(isPrivacyMode)
                        )}
                    >
                        {buildMaskedCardNumber(card.last4)}
                    </p>

                    <div className="flex items-end justify-between gap-3">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/78">
                                Ultimo uso
                            </p>
                            <p className="text-xs font-semibold text-foreground/88">{formatLastSeenDate(card.lastSeen)}</p>
                        </div>

                        <div className="flex items-center gap-2">
                            {card.walletProvider !== "Unknown" ? (
                                <span
                                    className="rounded-full border px-2 py-0.5 text-[10px] font-bold"
                                    style={{
                                        borderColor: withAlpha(rawColor, 0.18),
                                        backgroundColor: withAlpha(rawColor, 0.1),
                                        color: withAlpha(rawColor, 0.92)
                                    }}
                                >
                                    {card.walletProvider}
                                </span>
                            ) : null}
                            <div
                                className="rounded-full border p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]"
                                style={{
                                    borderColor: withAlpha(rawColor, 0.18),
                                    backgroundColor: withAlpha(rawColor, 0.12)
                                }}
                            >
                                <Wifi className="h-3.5 w-3.5 rotate-90 text-foreground/72" aria-hidden />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.article>
    )
}

function UsedCardsLoadingState() {
    return (
        <div className="grid auto-rows-[minmax(9.75rem,auto)] grid-flow-dense grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1].map((index) => (
                <div
                    key={index}
                    data-testid="used-cards-skeleton"
                    className={cn(
                        CARD_RATIO_CLASS,
                        "glass-card rounded-[1.9rem] p-5",
                        resolveInteractiveTileLayoutClass(index, 2)
                    )}
                >
                    <div className="space-y-3">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-6 w-28" />
                        <Skeleton className="h-3 w-24" />
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
    emptyLabel = "Nessuna carta rilevata nello storico movimenti.",
    showHeader = true,
    className
}: UsedCardsKpiDeckProps) {
    const cappedCards = cards.slice(0, 6)

    return (
        <section className={cn("space-y-4", className)} aria-label="Carte utilizzate">
            {showHeader && (
                <div className="flex items-center justify-between gap-2">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Carte Utilizzate</h3>
                    {!isLoading && cappedCards.length > 0 && (
                        <span className="text-xs font-semibold text-muted-foreground">
                            {cappedCards.length} {cappedCards.length === 1 ? "rilevata" : "rilevate"}
                        </span>
                    )}
                </div>
            )}

            {isLoading ? (
                <UsedCardsLoadingState />
            ) : cappedCards.length === 0 ? (
                <div className="rounded-[2rem] glass-card p-4 shadow-[0_20px_44px_-28px_rgba(15,23,42,0.32)] sm:p-5">
                    <p className="text-sm font-medium text-muted-foreground">{emptyLabel}</p>
                </div>
            ) : (
                <div className="grid auto-rows-[minmax(9.75rem,auto)] grid-flow-dense grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {cappedCards.map((card, index) => (
                        <UsedCardTile
                            key={card.cardId}
                            card={card}
                            index={index}
                            total={cappedCards.length}
                            isPrivacyMode={isPrivacyMode}
                        />
                    ))}
                </div>
            )}
        </section>
    )
}

export type { UsedCardsKpiDeckProps }
