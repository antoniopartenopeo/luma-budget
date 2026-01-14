"use client"

import { Sparkles, TrendingUp, Calendar, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAIAdvisor } from "../use-ai-advisor"
import { useCurrency } from "@/features/settings/api/use-currency"
import { formatEuroNumber } from "@/lib/currency-utils"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function AIAdvisorCard() {
    const { forecast, subscriptions, tips, isLoading } = useAIAdvisor()
    const { currency, locale } = useCurrency()

    if (isLoading) {
        return <Skeleton className="h-[200px] w-full rounded-2xl" />
    }

    if (!forecast && tips.length === 0) return null

    return (
        <Card className="rounded-2xl border-none bg-gradient-to-br from-primary/10 via-background to-background shadow-lg overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles className="h-24 w-24 text-primary" />
            </div>

            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                    <div className="bg-primary/20 p-1.5 rounded-lg">
                        <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    Luma AI Advisor
                </CardTitle>
            </CardHeader>

            <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Forecast Block */}
                {forecast && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <TrendingUp className="h-4 w-4" />
                            Proiezione Prossimo Mese
                        </div>
                        <div className="space-y-1">
                            <div className="text-2xl font-bold tracking-tight">
                                {formatEuroNumber(forecast.predictedSavings, currency, locale)}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <span className={cn(
                                    "h-1.5 w-1.5 rounded-full",
                                    forecast.confidence === "high" ? "bg-green-500" : "bg-yellow-500"
                                )} />
                                Affidabilità {forecast.confidence === "high" ? "Alta" : "Media"}
                            </div>
                        </div>
                    </div>
                )}

                {/* Subscriptions Block */}
                {subscriptions.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            Detective Abbonamenti
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <div className="bg-background/50 backdrop-blur-sm border border-primary/20 px-3 py-1.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors hover:bg-primary/5">
                                <span className="text-primary">{subscriptions.length}</span>
                                <span>Ricorrenti trovati</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tips Block */}
                {tips.length > 0 && (
                    <div className="md:col-span-2 lg:col-span-1 space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <AlertCircle className="h-4 w-4" />
                            Smart Tip
                        </div>
                        <div className="bg-primary/5 border border-primary/10 p-3 rounded-xl">
                            <p className="text-sm font-medium leading-relaxed">
                                {tips[0]}
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
