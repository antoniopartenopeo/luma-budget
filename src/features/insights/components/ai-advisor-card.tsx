"use client"

import { Sparkles, TrendingUp, Lightbulb, ArrowRight, Wallet } from "lucide-react"
import { MacroSection } from "@/components/patterns/macro-section"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { formatEuroNumber } from "@/domain/money"
import { useAIAdvisor } from "../use-ai-advisor"
import { useOrchestratedInsights } from "../use-orchestrated-insights"
import { useCurrency } from "@/features/settings/api/use-currency"

export function AIAdvisorCard() {
    const { forecast, subscriptions, isLoading: aiLoading } = useAIAdvisor()
    const { orchestration, isLoading: orchestratorLoading } = useOrchestratedInsights()
    const { currency, locale } = useCurrency()

    const isLoading = aiLoading || orchestratorLoading

    if (isLoading) {
        return (
            <MacroSection title="Numa AI Advisor" description="Analisi finanziaria in corso..." className="h-[auto] min-h-[240px]">
                <div className="flex flex-col items-center justify-center py-12 gap-4 animate-in fade-in duration-700">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse-soft" />
                        <div className="relative h-12 w-12 rounded-2xl bg-background/50 border border-primary/20 flex items-center justify-center shadow-lg">
                            <Sparkles className="h-6 w-6 text-primary animate-pulse-soft" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground animate-pulse">
                        Elaborazione insight...
                    </p>
                </div>
            </MacroSection>
        )
    }

    if (!forecast && (!orchestration || !orchestration.primary)) {
        return (
            <MacroSection className="opacity-80">
                <div className="flex flex-col items-center justify-center text-center py-6 gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                        <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Tutto tranquillo</h3>
                        <p className="text-sm text-muted-foreground max-w-[300px]">L&apos;IA non ha rilevato anomalie o suggerimenti urgenti per il momento.</p>
                    </div>
                </div>
            </MacroSection>
        )
    }

    const { primary, secondary } = orchestration || {}

    return (
        <MacroSection
            variant="premium"
            title={
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-background/80 dark:bg-slate-800 border border-border/50 flex items-center justify-center shadow-sm">
                        <Sparkles className="h-6 w-6 text-primary fill-primary/20" />
                    </div>
                    <div className="flex items-center gap-3">
                        Numa AI Advisor
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[10px] px-2 h-6 font-bold uppercase">BETA</Badge>
                    </div>
                </div>
            }
            description={
                <span className="text-muted-foreground text-sm font-bold uppercase tracking-widest block mt-1">
                    Financial Intelligence
                </span>
            }
        >
            <div className="flex flex-col gap-6">
                {/* 1. Proiezione */}
                {forecast && (
                    <div className="relative group rounded-2xl glass-card hover:bg-white/70 dark:hover:bg-white/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                <TrendingUp className="h-4 w-4 text-emerald-500" />
                                <span>Proiezione Mensile</span>
                            </div>
                            <div className="space-y-1">
                                <div className="text-4xl font-black tracking-tighter text-foreground tabular-nums">
                                    {formatEuroNumber(forecast.predictedSavings, currency, locale)}
                                </div>
                                <p className="text-xs text-muted-foreground font-medium">
                                    Risparmio stimato basato sui tuoi trend attuali di spesa.
                                </p>
                            </div>
                        </div>
                        <div className={cn(
                            "px-4 py-2 rounded-xl text-xs font-black border self-start md:self-auto",
                            forecast.confidence === "high"
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        )}>
                            {forecast.confidence === "high" ? "ATTENDIBILITÀ ALTA" : "ATTENDIBILITÀ MEDIA"}
                        </div>
                    </div>
                )}

                {/* 2. Subscriptions */}
                {subscriptions.length > 0 && (
                    <div className="rounded-2xl glass-card hover:bg-white/70 dark:hover:bg-white/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                <Wallet className="h-4 w-4 text-indigo-500" />
                                <span>Abbonamenti Rilevati</span>
                            </div>
                            <div className="flex items-baseline gap-3">
                                <span className="text-4xl font-black text-foreground tabular-nums">{subscriptions.length}</span>
                                <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Servizi attivi questo mese</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {subscriptions.slice(0, 3).map((sub, i) => (
                                <div key={i} className="px-3 py-1.5 rounded-xl bg-background/80 dark:bg-slate-800 border border-border/50 text-xs font-bold text-muted-foreground shadow-sm">
                                    Servizio #{i + 1}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. Smart Tip (Orchestrated) */}
                {primary && (
                    <div className="rounded-2xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/10 p-6 relative overflow-hidden shadow-inner">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-4">
                            <Lightbulb className="h-4 w-4 fill-current" />
                            SMART ADVICE
                        </div>

                        <div className="space-y-4">
                            <p className="text-sm font-medium leading-relaxed text-foreground/90">
                                &quot;{primary.narration.text}&quot;
                            </p>

                            {secondary && secondary.length > 0 && (
                                <div className="space-y-2 pt-4 border-t border-indigo-500/10">
                                    {secondary.map((s, idx) => (
                                        <p key={idx} className="text-xs leading-relaxed text-muted-foreground/80 font-medium italic">
                                            <span className="font-bold uppercase not-italic mr-2 text-indigo-500/40 text-[10px] tracking-wider">Contesto:</span>
                                            {s.narration.text}
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end">
                            <Button variant="ghost" size="sm" className="h-9 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10">
                                Approfondisci <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </MacroSection>
    )
}
