"use client"

import { useMemo, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Activity, ArrowRightLeft, SlidersHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

interface SignalDatum {
    feature: string
    value: number
    weight: number
    contribution: number
}

interface SignalMatrixProps {
    contributors: SignalDatum[]
}

const FEATURE_LABELS: Record<string, string> = {
    expense_income_ratio: "Rapporto tra spese ed entrate",
    superfluous_share: "Quota spese non essenziali",
    comfort_share: "Quota spese di comfort",
    txn_density: "Ritmo delle transazioni",
    expense_momentum: "Ritmo recente delle spese",
    income_momentum: "Ritmo recente delle entrate",
    discretionary_pressure: "Pressione delle spese non essenziali",
    expense_gap_ratio: "Scarto tra spese ed entrate",
}

function resolveLabel(feature: string): string {
    if (FEATURE_LABELS[feature]) return FEATURE_LABELS[feature]
    const fallback = feature.replace(/_/g, " ")
    return fallback.charAt(0).toUpperCase() + fallback.slice(1)
}

function resolveDirectionLabel(contribution: number): string {
    if (contribution > 0) return "Spinge la stima verso l'alto"
    if (contribution < 0) return "Spinge la stima verso il basso"
    return "Effetto quasi neutro"
}

function resolveDirectionBadgeLabel(contribution: number): string {
    if (contribution > 0) return "Verso l'alto"
    if (contribution < 0) return "Verso il basso"
    return "Neutro"
}

function resolveSignalColor(contribution: number): string {
    return contribution >= 0 ? "text-primary" : "text-amber-600"
}

function resolveSignalSurfaceClass(contribution: number, isSelected: boolean): string {
    if (contribution >= 0) {
        return isSelected
            ? "border-primary/30 bg-primary/10"
            : "border-primary/12 bg-primary/[0.045]"
    }

    return isSelected
        ? "border-amber-500/30 bg-amber-500/10"
        : "border-amber-500/12 bg-amber-500/[0.045]"
}

function resolveSignalBarClass(contribution: number): string {
    return contribution >= 0 ? "bg-primary/75" : "bg-amber-500/75"
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value))
}

export function SignalMatrix({ contributors }: SignalMatrixProps) {
    const prefersReducedMotion = useReducedMotion()
    const sortedSignals = useMemo(
        () => [...contributors].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution)),
        [contributors]
    )
    const [selectedFeature, setSelectedFeature] = useState<string | null>(sortedSignals[0]?.feature ?? null)

    const resolvedSelectedFeature = sortedSignals.some((signal) => signal.feature === selectedFeature)
        ? selectedFeature
        : sortedSignals[0]?.feature ?? null

    const selectedSignal = resolvedSelectedFeature
        ? sortedSignals.find((signal) => signal.feature === resolvedSelectedFeature) ?? null
        : null

    return (
        <div className="space-y-4">
            {sortedSignals.length === 0 ? (
                <p className="rounded-[1.8rem] border border-white/45 bg-white/38 px-5 py-4 text-sm font-medium text-muted-foreground shadow-[0_18px_36px_-28px_rgba(15,23,42,0.26)] dark:border-white/10 dark:bg-white/[0.04]">
                    Non ci sono ancora segnali da mostrare. Appena il Brain completa la prima analisi, li vedrai qui.
                </p>
            ) : (
                <>
                    <p className="rounded-[1.8rem] border border-white/45 bg-white/38 px-5 py-4 text-sm font-medium text-muted-foreground shadow-[0_18px_36px_-28px_rgba(15,23,42,0.26)] dark:border-white/10 dark:bg-white/[0.04]">
                        Ogni riga mostra un fattore che in questo momento sta spingendo la stima verso l&apos;alto o verso il basso.
                        Selezionalo per capire quanto conta davvero.
                    </p>

                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
                        <div className="space-y-2">
                            {sortedSignals.map((signal) => {
                                const isSelected = signal.feature === selectedSignal?.feature
                                const intensity = clamp(Math.abs(signal.contribution) * 100, 8, 100)

                                return (
                                    <motion.button
                                        key={signal.feature}
                                        type="button"
                                        aria-pressed={isSelected}
                                        onClick={() => setSelectedFeature(signal.feature)}
                                        className={cn(
                                            "group w-full rounded-[1.55rem] border px-4 py-3.5 text-left transition-[border-color,background-color,transform,box-shadow] duration-200",
                                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25",
                                            "hover:-translate-y-0.5 hover:shadow-[0_22px_40px_-28px_rgba(15,23,42,0.28)] motion-reduce:hover:translate-y-0",
                                            "backdrop-blur-xl shadow-[0_18px_32px_-28px_rgba(15,23,42,0.24)]",
                                            resolveSignalSurfaceClass(signal.contribution, isSelected)
                                        )}
                                        whileHover={prefersReducedMotion ? undefined : { scale: 0.995 }}
                                        whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={cn(
                                                "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border",
                                                isSelected ? "border-current/20 bg-background/70" : "border-current/10 bg-background/40",
                                                resolveSignalColor(signal.contribution)
                                            )}>
                                                <Activity className="h-4 w-4" />
                                            </div>

                                            <div className="min-w-0 flex-1 space-y-2">
                                                <div className="flex flex-wrap items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                                            Fattore
                                                        </p>
                                                        <p className="text-sm font-semibold text-foreground">
                                                            {resolveLabel(signal.feature)}
                                                        </p>
                                                    </div>

                                                    <div className="text-right">
                                                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                                            Impatto
                                                        </p>
                                                        <p className={cn("text-sm font-black tabular-nums", resolveSignalColor(signal.contribution))}>
                                                            {signal.contribution >= 0 ? "+" : ""}{signal.contribution.toFixed(4)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <div className="h-1.5 rounded-full bg-border/50">
                                                        <div
                                                            className={cn("h-full rounded-full transition-[width] duration-500", resolveSignalBarClass(signal.contribution))}
                                                            style={{ width: `${intensity}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-xs font-medium text-muted-foreground">
                                                        {resolveDirectionLabel(signal.contribution)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.button>
                                )
                            })}
                        </div>

                        <div
                            className="rounded-[1.9rem] border border-white/45 bg-white/38 p-5 shadow-[0_26px_48px_-34px_rgba(15,23,42,0.28)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]"
                            aria-live="polite"
                        >
                            <AnimatePresence mode="wait">
                                {selectedSignal ? (
                                    <motion.div
                                        key={selectedSignal.feature}
                                        initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                                        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                                        exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
                                        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                                        className="space-y-4"
                                    >
                                        <div className="space-y-1">
                                            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                                                Fattore selezionato
                                            </p>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="text-lg font-bold tracking-tight text-foreground">
                                                    {resolveLabel(selectedSignal.feature)}
                                                </h3>
                                                <span className={cn(
                                                    "rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em]",
                                                    selectedSignal.contribution >= 0
                                                        ? "border-primary/20 bg-primary/10 text-primary"
                                                        : "border-amber-500/20 bg-amber-500/10 text-amber-600"
                                                )}>
                                                    {resolveDirectionBadgeLabel(selectedSignal.contribution)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid gap-3 sm:grid-cols-3">
                                            <div className="rounded-[1.35rem] border border-white/45 bg-white/44 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.26)] dark:border-white/10 dark:bg-white/[0.05]">
                                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                                                    Impatto
                                                </p>
                                                <p className={cn("mt-1 text-lg font-black tabular-nums", resolveSignalColor(selectedSignal.contribution))}>
                                                    {selectedSignal.contribution >= 0 ? "+" : ""}{selectedSignal.contribution.toFixed(4)}
                                                </p>
                                            </div>
                                            <div className="rounded-[1.35rem] border border-white/45 bg-white/44 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.26)] dark:border-white/10 dark:bg-white/[0.05]">
                                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                                                    Valore osservato
                                                </p>
                                                <p className="mt-1 text-lg font-black tabular-nums text-foreground">
                                                    {selectedSignal.value.toFixed(4)}
                                                </p>
                                            </div>
                                            <div className="rounded-[1.35rem] border border-white/45 bg-white/44 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.26)] dark:border-white/10 dark:bg-white/[0.05]">
                                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                                                    Importanza interna
                                                </p>
                                                <p className="mt-1 text-lg font-black tabular-nums text-foreground">
                                                    {selectedSignal.weight.toFixed(4)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="rounded-[1.5rem] border border-white/40 bg-white/34 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] dark:border-white/10 dark:bg-white/[0.035]">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background/70 text-muted-foreground">
                                                    <SlidersHorizontal className="h-4 w-4" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-semibold text-foreground">
                                                        Come interpretarlo
                                                    </p>
                                                    <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                                                        Il <strong className="text-foreground">valore osservato</strong> è il dato rilevato,
                                                        l&apos;<strong className="text-foreground">importanza interna</strong> dice quanto il Brain
                                                        lo considera rilevante, e l&apos;<strong className="text-foreground">impatto</strong> mostra
                                                        l&apos;effetto finale sulla stima.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3 text-sm font-medium leading-relaxed text-muted-foreground">
                                            <ArrowRightLeft className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                            <p>
                                                Un impatto positivo o negativo non significa che il fattore sia buono o cattivo:
                                                indica solo se sta spingendo la stima verso l&apos;alto o verso il basso.
                                            </p>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.p
                                        key="signal-empty"
                                        initial={prefersReducedMotion ? false : { opacity: 0 }}
                                        animate={prefersReducedMotion ? undefined : { opacity: 1 }}
                                        exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                                        className="text-sm font-medium text-muted-foreground"
                                    >
                                        Seleziona un fattore per vedere il dettaglio.
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
