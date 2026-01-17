"use client"

import { Sparkles, TrendingUp, Lightbulb, ArrowRight, Wallet } from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAIAdvisor } from "../use-ai-advisor"
import { useCurrency } from "@/features/settings/api/use-currency"
import { formatEuroNumber } from "@/lib/currency-utils"
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
            <Card className="relative overflow-hidden rounded-3xl border-none shadow-xl bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white">
                {/* Background Effects */}
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

                <CardHeader className="relative pb-2 z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10 shadow-inner">
                                <Sparkles className="h-5 w-5 text-yellow-300" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                                    Luma AI
                                    <Badge variant="secondary" className="bg-white/10 text-white/90 hover:bg-white/20 border-white/5 text-[10px] px-1.5 h-5">BETA</Badge>
                                </CardTitle>
                                <CardDescription className="text-blue-200/70 text-xs font-medium uppercase tracking-wider">Financial Intelligence</CardDescription>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="relative z-10 pt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                    {/* 1. Proiezione (Hero Metric) */}
                    {forecast && (
                        <div className="relative group rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300 p-5 backdrop-blur-sm">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />

                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2 text-sm font-medium text-blue-200/80">
                                    <TrendingUp className="h-4 w-4" />
                                    <span>Proiezione <span className="opacity-50">/ Mese</span></span>
                                </div>
                                <div className={cn(
                                    "px-2 py-0.5 rounded-full text-[10px] font-bold border",
                                    forecast.confidence === "high"
                                        ? "bg-green-500/20 text-green-300 border-green-500/30"
                                        : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                                )}>
                                    {forecast.confidence === "high" ? "ALTA AFFIDABILITÀ" : "MEDIA AFFIDABILITÀ"}
                                </div>
                            </div>

                            <div className="space-y-1 relative">
                                <div className="text-3xl sm:text-4xl font-bold tracking-tighter text-white">
                                    {formatEuroNumber(forecast.predictedSavings, currency, locale)}
                                </div>
                                <p className="text-xs text-blue-200/60 font-medium">
                                    Risparmio stimato basato sui trend attuali.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* 2. Subscriptions */}
                    {subscriptions.length > 0 && (
                        <div className="rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300 p-5 backdrop-blur-sm flex flex-col justify-between">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm font-medium text-blue-200/80">
                                    <Wallet className="h-4 w-4" />
                                    <span>Abbonamenti Rilevati</span>
                                </div>

                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-white">{subscriptions.length}</span>
                                    <span className="text-sm text-blue-200/60">attivi questo mese</span>
                                </div>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {subscriptions.slice(0, 3).map((sub, i) => (
                                    <div key={i} className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-xs text-blue-100">
                                        {/* Placeholder names, ideally use sub.name if available */}
                                        Servizio #{i + 1}
                                    </div>
                                ))}
                                {subscriptions.length > 3 && (
                                    <div className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-xs text-blue-100">
                                        +{subscriptions.length - 3}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 3. Smart Tip */}
                    {tips.length > 0 && (
                        <div className="md:col-span-2 lg:col-span-1 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 p-5 backdrop-blur-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[50px] rounded-full pointer-events-none" />

                            <div className="flex items-center gap-2 text-sm font-bold text-indigo-300 mb-3">
                                <Lightbulb className="h-4 w-4" />
                                SMART TIP
                            </div>

                            <p className="text-sm md:text-base leading-relaxed text-blue-50 font-medium">
                                &quot;{tips[0]}&quot;
                            </p>

                            <div className="mt-4 flex justify-end">
                                <Button variant="ghost" size="sm" className="h-8 text-xs text-white/70 hover:text-white hover:bg-white/10">
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
