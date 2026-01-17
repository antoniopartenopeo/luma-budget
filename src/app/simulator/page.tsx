"use client"

import { useState, useMemo } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calculator, RefreshCw, TrendingDown, Wallet, ArrowRight } from "lucide-react"
import { useMonthlyAverages } from "@/features/simulator/hooks"
import { applySavings, SimulationPeriod } from "@/features/simulator/utils"
import { CategoryIcon } from "@/features/categories/components/category-icon"
import { useCurrency } from "@/features/settings/api/use-currency"
import { formatEuroNumber } from "@/lib/currency-utils"
import { cn } from "@/lib/utils"

export default function SimulatorPage() {
    // 1. Local Read-Only State
    const [period, setPeriod] = useState<SimulationPeriod>(6)
    const [savingsMap, setSavingsMap] = useState<Record<string, number>>({})

    // 2. Data Fetching
    const { data: categoriesList, isLoading, rawAverages } = useMonthlyAverages(period)
    const { currency, locale } = useCurrency()

    // 3. Derived Computation (Real-time)
    const simulationResult = useMemo(() => {
        return applySavings(rawAverages, savingsMap)
    }, [rawAverages, savingsMap])

    // Handlers
    const handleSliderChange = (catId: string, val: number[]) => {
        setSavingsMap(prev => ({
            ...prev,
            [catId]: val[0]
        }))
    }

    const handleReset = () => setSavingsMap({})

    const handleApplyPreset = (percent: number) => {
        const newMap: Record<string, number> = {}
        categoriesList.forEach(c => {
            if (c.averageAmount > 0) newMap[c.id] = percent
        })
        setSavingsMap(newMap)
    }

    // Render Helpers
    if (isLoading) {
        return <div className="p-8">Caricamento simulatore...</div>
    }

    // Top categories (spend > 0)
    const activeCategories = categoriesList.filter(c => c.averageAmount > 0)

    return (
        <div className="space-y-6 pb-20 md:pb-6">
            <PageHeader
                title="Simulatore"
                subtitle="Prova a ridurre le tue spese per vedere quanto potresti risparmiare ogni mese."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT COL: Controls */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Toolbar */}
                    <Card className="border-none bg-muted/40 shadow-sm">
                        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Basato su ultimi:</span>
                                <Select value={period.toString()} onValueChange={(v) => setPeriod(parseInt(v) as SimulationPeriod)}>
                                    <SelectTrigger className="w-[140px] bg-white dark:bg-black/20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="3">3 Mesi</SelectItem>
                                        <SelectItem value="6">6 Mesi (Default)</SelectItem>
                                        <SelectItem value="12">12 Mesi</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Button variant="outline" size="sm" onClick={() => handleApplyPreset(10)} className="flex-1 sm:flex-none text-xs">
                                    -10% Tutti
                                </Button>
                                <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground hover:text-foreground">
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Reset
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Categories List */}
                    <div className="space-y-4">
                        {activeCategories.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                Nessuna spesa trovata nel periodo selezionato.
                            </div>
                        ) : (
                            activeCategories.map(cat => {
                                const currentSaving = savingsMap[cat.id] || 0
                                const simulatedAmount = Math.round(cat.averageAmount * (1 - currentSaving / 100))

                                return (
                                    <Card key={cat.id} className={cn("overflow-hidden transition-all border-none shadow-sm", currentSaving > 0 ? "bg-primary/5 ring-1 ring-primary/20" : "bg-card")}>
                                        <div className="p-4 sm:p-5 flex flex-col gap-4">
                                            {/* Row 1: Header Info */}
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full flex items-center justify-center bg-muted">
                                                        <CategoryIcon categoryId={cat.id} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-sm">{cat.label}</h4>
                                                        <div className="text-xs text-muted-foreground">
                                                            Media mensile: <span className="font-medium text-foreground">{formatEuroNumber(cat.averageAmount, currency, locale)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className={cn("text-lg font-bold", currentSaving > 0 ? "text-primary" : "text-foreground")}>
                                                        {formatEuroNumber(simulatedAmount, currency, locale)}
                                                    </div>
                                                    {currentSaving > 0 && (
                                                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                                                            -{formatEuroNumber(cat.averageAmount - simulatedAmount, currency, locale)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Row 2: Slider */}
                                            <div className="flex items-center gap-4">
                                                <span className="text-xs font-medium w-12 text-muted-foreground">{currentSaving}%</span>
                                                <Slider
                                                    value={[currentSaving]}
                                                    max={100}
                                                    step={5}
                                                    onValueChange={(v: number[]) => handleSliderChange(cat.id, v)}
                                                    className="flex-1"
                                                />
                                                <span className="text-xs font-medium w-12 text-right text-muted-foreground">-100%</span>
                                            </div>
                                        </div>
                                    </Card>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* RIGHT COL: Sticky Results */}
                <div className="lg:col-span-1">
                    <div className="sticky top-6">
                        <Card className="border-none shadow-lg bg-gradient-to-br from-indigo-900 to-slate-900 text-white overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Calculator className="h-5 w-5 text-indigo-300" />
                                    Risultato Simulazione
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-4">

                                {/* Baseline vs Simulated */}
                                <div className="space-y-1">
                                    <div className="flex justify-between text-sm text-indigo-200">
                                        <span>Spesa Media Attuale</span>
                                        <span>{formatEuroNumber(simulationResult.baselineTotal, currency, locale)}</span>
                                    </div>
                                    <div className="flex justify-between text-2xl font-bold">
                                        <span>Nuova Spesa</span>
                                        <span className="text-white">{formatEuroNumber(simulationResult.simulatedTotal, currency, locale)}</span>
                                    </div>
                                </div>

                                <Separator className="bg-white/10" />

                                {/* Savings Big KPI */}
                                <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-2xl p-4 text-center">
                                    <div className="text-xs uppercase tracking-wider font-bold text-emerald-300 mb-1">
                                        Risparmio Mensile
                                    </div>
                                    <div className="text-3xl font-extrabold text-emerald-300">
                                        {formatEuroNumber(simulationResult.savingsAmount, currency, locale)}
                                    </div>
                                    <div className="text-sm font-medium text-emerald-400/80 mt-1">
                                        -{simulationResult.savingsPercent}% del totale
                                    </div>
                                </div>

                                {/* Call to Action / Info */}
                                <div className="text-xs text-indigo-200/60 leading-relaxed text-center px-2">
                                    Questa è una simulazione in tempo reale. Nessun dato verrà modificato nel tuo budget reale.
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
