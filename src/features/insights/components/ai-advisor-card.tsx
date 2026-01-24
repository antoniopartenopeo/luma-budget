"use client"

import { Sparkles, TrendingUp, Lightbulb, ArrowRight, Wallet } from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAIAdvisor } from "../use-ai-advisor"
import { useCurrency } from "@/features/settings/api/use-currency"
import { formatEuroNumber } from "@/domain/money"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function AIAdvisorCard() {
    const { forecast, subscriptions, tips, isLoading } = useAIAdvisor()
    const { currency, locale } = useCurrency()

    if (isLoading) {
        return <Skeleton className="h-[240px] w-full rounded-2xl" />
    }

    if (!forecast && tips.length === 0) {
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

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            <Card className="relative overflow-hidden rounded-[2rem] glass-panel p-1">
                {/* Visual Glass Reflection Accent */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 dark:from-white/5 to-transparent pointer-events-none" />

                {/* Ambient Glows - Subtle Light Theme */}
                <div className="absolute top-[-20%] right-[-20%] w-[400px] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none opacity-60" />
                <div className="absolute bottom-[-20%] left-[-20%] w-[400px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none opacity-40" />

                <CardHeader className="relative pb-2 z-10 px-6 pt-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-background/80 dark:bg-slate-800 border border-border/50 flex items-center justify-center shadow-sm">
                                <Sparkles className="h-5 w-5 text-primary fill-primary/20" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                                    Numa AI
                                    <Badge variant="secondary" className="bg-secondary/80 text-muted-foreground hover:bg-secondary border-border/40 text-[10px] px-1.5 h-5 shadow-sm">BETA</Badge>
                                </CardTitle>
                                <CardDescription className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Financial Intelligence</CardDescription>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="relative z-10 pt-6 px-6 pb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                    {/* 1. Proiezione (Hero Metric) */}
                    {forecast && (
                        <div className="relative group rounded-2xl glass-card hover:bg-white/70 dark:hover:bg-white/10 p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                    <TrendingUp className="h-4 w-4" />
                                    <span>Proiezione <span className="opacity-50">/ Mese</span></span>
                                </div>
                                <div className={cn(
                                    "px-2 py-0.5 rounded-full text-[10px] font-bold border",
                                    forecast.confidence === "high"
                                        ? "bg-emerald-100/50 text-emerald-700 border-emerald-200"
                                        : "bg-amber-100/50 text-amber-700 border-amber-200"
                                )}>
                                    {forecast.confidence === "high" ? "ALTA AFFIDABILITÀ" : "MEDIA AFFIDABILITÀ"}
                                </div>
                            </div>

                            <div className="space-y-1 relative">
                                <div className="text-3xl sm:text-4xl font-extrabold tracking-tighter text-foreground">
                                    {formatEuroNumber(forecast.predictedSavings, currency, locale)}
                                </div>
                                <p className="text-xs text-muted-foreground font-medium">
                                    Risparmio stimato basato sui trend attuali.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* 2. Subscriptions */}
                    {subscriptions.length > 0 && (
                        <div className="rounded-2xl glass-card hover:bg-white/70 dark:hover:bg-white/10 p-5 flex flex-col justify-between">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                    <Wallet className="h-4 w-4" />
                                    <span>Abbonamenti Rilevati</span>
                                </div>

                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-extrabold text-foreground">{subscriptions.length}</span>
                                    <span className="text-sm text-muted-foreground">attivi questo mese</span>
                                </div>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {subscriptions.slice(0, 3).map((sub, i) => (
                                    <div key={i} className="px-2 py-1 rounded-md bg-background/80 dark:bg-slate-800 border border-border/50 text-xs font-medium text-muted-foreground shadow-sm">
                                        Servizio #{i + 1}
                                    </div>
                                ))}
                                {subscriptions.length > 3 && (
                                    <div className="px-2 py-1 rounded-md bg-white border border-slate-100 text-xs font-medium text-slate-500 shadow-sm">
                                        +{subscriptions.length - 3}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 3. Smart Tip */}
                    {tips.length > 0 && (
                        <div className="md:col-span-2 lg:col-span-1 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-100/50 dark:border-indigo-500/20 p-5 relative overflow-hidden shadow-sm">
                            <div className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-3 uppercase tracking-wider">
                                <Lightbulb className="h-4 w-4 fill-current" />
                                SMART TIP
                            </div>

                            <p className="text-sm md:text-base leading-relaxed text-foreground/90 font-medium">
                                &quot;{tips[0]}&quot;
                            </p>

                            <div className="mt-4 flex justify-end">
                                <Button variant="ghost" size="sm" className="h-8 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/30 -mr-2">
                                    Tutti i consigli <ArrowRight className="ml-1 h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}
