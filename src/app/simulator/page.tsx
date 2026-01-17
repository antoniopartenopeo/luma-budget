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

    // Render Helpers
    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Caricamento simulatore...</div>
    }

    // Top categories (spend > 0)
    const activeCategories = categoriesList.filter(c => c.averageAmount > 0)

    return (
        <div className="space-y-6 pb-20 md:pb-6">
            <PageHeader
                title="Simulatore"
                description="Prova a ridurre le tue spese per vedere quanto potresti risparmiare ogni mese."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT COL: Controls */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Compact Toolbar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 border-b">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-slate-500">Analisi basata su:</span>
                            <Select value={period.toString()} onValueChange={(v) => setPeriod(parseInt(v) as SimulationPeriod)}>
                                <SelectTrigger className="w-[180px] h-9 text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="3">Ultimi 3 Mesi</SelectItem>
                                    <SelectItem value="6">Ultimi 6 Mesi (Default)</SelectItem>
                                    <SelectItem value="12">Ultimo Anno</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleReset}
                            disabled={Object.keys(savingsMap).length === 0}
                            className="text-slate-500 hover:text-red-500 hover:bg-red-50 h-9"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Resetta Simulazione
                        </Button>
                    </div>

                    {/* Categories List */}
                    <div className="space-y-3">
                        {activeCategories.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl">
                                Nessuna spesa trovata nel periodo selezionato.
                            </div>
                        ) : (
                            activeCategories.map(cat => {
                                const currentSaving = savingsMap[cat.id] || 0
                                const simulatedAmount = Math.round(cat.averageAmount * (1 - currentSaving / 100))

                                return (
                                    <Card key={cat.id} className={cn(
                                        "overflow-hidden transition-all duration-300 border shadow-sm",
                                        currentSaving > 0
                                            ? "bg-white/80 border-primary/20 ring-1 ring-primary/10 shadow-md"
                                            : "bg-white border-slate-200/60"
                                    )}>
                                        <div className="p-4 flex flex-col gap-3">
                                            {/* Row 1: Header Info */}
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                                                        currentSaving > 0 ? "bg-primary/10" : "bg-slate-100"
                                                    )}>
                                                        <CategoryIcon categoryId={cat.id} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-sm text-slate-900">{cat.label}</h4>
                                                        <div className="text-xs text-slate-500">
                                                            Media reale: <span className="font-medium text-slate-700">{formatEuroNumber(cat.averageAmount, currency, locale)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className={cn("text-lg font-bold transition-colors", currentSaving > 0 ? "text-primary" : "text-slate-900")}>
                                                        {formatEuroNumber(simulatedAmount, currency, locale)}
                                                    </div>
                                                    {currentSaving > 0 && (
                                                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mt-1">
                                                            -{formatEuroNumber(cat.averageAmount - simulatedAmount, currency, locale)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Row 2: Slider */}
                                            <div className="flex items-center gap-3 pt-1">
                                                <div className="text-xs font-medium w-10 text-slate-400">0%</div>
                                                <Slider
                                                    value={[currentSaving]}
                                                    max={100}
                                                    step={5}
                                                    onValueChange={(v: number[]) => handleSliderChange(cat.id, v)}
                                                    className="flex-1"
                                                />
                                                <div className={cn(
                                                    "text-xs font-bold w-12 text-right",
                                                    currentSaving > 0 ? "text-primary" : "text-slate-400"
                                                )}>
                                                    -{currentSaving}%
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* RIGHT COL: Sticky Results ("White Glass" Variant) */}
                <div className="lg:col-span-1">
                    <div className="sticky top-6">
                        <Card className="relative overflow-hidden rounded-[2rem] border border-white/40 shadow-xl bg-white/40 backdrop-blur-3xl p-6">

                            {/* Ambient Glows */}
                            <div className="absolute top-[-50%] right-[-50%] w-[150%] h-[150%] bg-gradient-to-br from-white/50 to-transparent pointer-events-none" />
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full pointer-events-none" />

                            <CardHeader className="p-0 pb-4 relative z-10">
                                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
                                    <Calculator className="h-5 w-5 text-primary" />
                                    Risultati
                                </CardTitle>
                                <p className="text-xs text-slate-500 font-medium">Stima basata sulle medie storiche.</p>
                            </CardHeader>

                            <CardContent className="space-y-6 p-0 relative z-10">

                                {/* Baseline vs Simulated */}
                                <div className="space-y-2 bg-white/50 rounded-xl p-4 border border-white/50 shadow-sm">
                                    <div className="flex justify-between text-sm text-slate-500 font-medium">
                                        <span>Spesa Attuale</span>
                                        <span>{formatEuroNumber(simulationResult.baselineTotal, currency, locale)}</span>
                                    </div>
                                    <Separator className="bg-slate-200/50" />
                                    <div className="flex justify-between text-xl font-bold text-slate-900 items-baseline">
                                        <span>Nuova Spesa</span>
                                        <span>{formatEuroNumber(simulationResult.simulatedTotal, currency, locale)}</span>
                                    </div>
                                </div>

                                {/* Savings Big KPI */}
                                {simulationResult.savingsAmount > 0 ? (
                                    <div className="bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 rounded-2xl p-5 text-center transform transition-all hover:scale-[1.02]">
                                        <div className="text-xs uppercase tracking-wider font-bold text-emerald-100 mb-1">
                                            Risparmio Mensile
                                        </div>
                                        <div className="text-3xl font-extrabold">
                                            {formatEuroNumber(simulationResult.savingsAmount, currency, locale)}
                                        </div>
                                        <div className="text-sm font-semibold text-emerald-100 mt-1">
                                            -{simulationResult.savingsPercent}% del totale
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-slate-100 rounded-2xl p-5 text-center text-slate-400">
                                        <div className="text-sm font-medium">Nessuna modifica</div>
                                        <div className="text-xs mt-1">Muovi gli slider per simulare</div>
                                    </div>
                                )}

                                {/* Info Footer */}
                                <div className="text-[10px] text-slate-400 text-center leading-relaxed px-2">
                                    I calcoli sono approssimativi e si basano sulle medie dei mesi passati selezionati.
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
