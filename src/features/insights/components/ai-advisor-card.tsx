"use client"

import { Sparkles, TrendingUp, Lightbulb, ArrowRight, Wallet } from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAIAdvisor } from "../use-ai-advisor"
import { useOrchestratedInsights } from "../use-orchestrated-insights"
import { useCurrency } from "@/features/settings/api/use-currency"
import { formatEuroNumber } from "@/domain/money"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function AIAdvisorCard() {
    const { forecast, subscriptions, isLoading: aiLoading } = useAIAdvisor()
    const { orchestration, isLoading: orchestratorLoading } = useOrchestratedInsights()
    const { currency, locale } = useCurrency()

    const isLoading = aiLoading || orchestratorLoading

    if (isLoading) {
        return <Skeleton className="h-[240px] w-full rounded-2xl" />
    }

    if (!forecast && (!orchestration || !orchestration.primary)) {
        return (
            <Card className="rounded-2xl border-none bg-gradient-to-br from-muted/50 via-card to-card shadow-sm overflow-hidden">
                <CardContent className="flex flex-col items-center justify-center text-center p-8 gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                        <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Tutto tranquillo</h3>
                        <p className="text-sm text-muted-foreground max-w-[300px]">L&apos;IA non ha rilevato anomalie o suggerimenti urgenti per il momento.</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const { primary, secondary } = orchestration || {}

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            <Card className="relative overflow-hidden rounded-[2.5rem] glass-panel p-1 border-none shadow-xl">
                {/* Visual Glass Reflection Accent */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 dark:from-white/5 to-transparent pointer-events-none" />

                {/* Ambient Glows */}
                <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none opacity-60" />
                <div className="absolute bottom-[-20%] left-[-20%] w-[400px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none opacity-40" />

                <CardHeader className="relative pb-2 z-10 px-8 pt-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-background/80 dark:bg-slate-800 border border-border/50 flex items-center justify-center shadow-sm">
                                <Sparkles className="h-6 w-6 text-primary fill-primary/20" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
                                    Numa AI Advisor
                                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[10px] px-2 h-6 font-bold uppercase">BETA</Badge>
                                </CardTitle>
                                <CardDescription className="text-muted-foreground text-sm font-bold uppercase tracking-widest mt-1">Financial Intelligence</CardDescription>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="relative z-10 pt-6 px-8 pb-8 flex flex-col gap-6">

                    {/* 1. Proiezione */}
                    {forecast && (
                        <div className="relative group rounded-3xl glass-card hover:bg-white/70 dark:hover:bg-white/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                                "px-4 py-2 rounded-2xl text-xs font-black border self-start md:self-auto",
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
                        <div className="rounded-3xl glass-card hover:bg-white/70 dark:hover:bg-white/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
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
                        <div className="rounded-3xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/10 p-6 relative overflow-hidden shadow-inner">
                            <div className="flex items-center gap-2 text-xs font-black text-indigo-600 dark:text-indigo-400 mb-4 uppercase tracking-widest">
                                <Lightbulb className="h-4 w-4 fill-current" />
                                SMART ADVICE
                            </div>

                            <div className="space-y-4">
                                <p className="text-lg leading-relaxed text-foreground/90 font-bold tracking-tight">
                                    &quot;{primary.narration.text}&quot;
                                </p>

                                {secondary && secondary.length > 0 && (
                                    <div className="space-y-2 pt-4 border-t border-indigo-500/10">
                                        {secondary.map((s, idx) => (
                                            <p key={idx} className="text-xs leading-relaxed text-muted-foreground/80 font-medium italic">
                                                <span className="font-black uppercase not-italic mr-2 text-indigo-500/40 text-[10px] tracking-widest">Contesto:</span>
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
                </CardContent>
            </Card>
        </motion.div>
    )
}
