"use client"

import * as React from "react"
import { useState, useEffect, useMemo } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Settings2, Sparkles, ShieldCheck, ShieldAlert, Shield } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { GoalScenarioResult } from "@/VAULT/goals/types"
import { formatCents } from "@/domain/money"
import { useCurrency } from "@/features/settings/api/use-currency"
import { BaselineMetrics } from "@/VAULT/goals/logic/financial-baseline"
import { CategoryAverage } from "@/features/simulator/utils"
import { calculateScenario } from "@/VAULT/goals/logic/scenario-calculator"
import { cn } from "@/lib/utils"
import { Category } from "@/features/categories/config"

interface AdvancedOptimizerSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentResult: GoalScenarioResult
    onApply: (savings: { superfluous: number; comfort: number }) => void
    // Data for real-time preview
    baselineMetrics: BaselineMetrics | null
    categories: Array<Category & { averageAmount: number }>
    goalTargetCents: number
    initialSavings: { superfluous: number; comfort: number }
}

/**
 * Builds the application map and category averages from slider values.
 * Shared logic extracted for reuse.
 */
function buildScenarioInputs(
    categories: Array<Category & { averageAmount: number }>,
    superfluous: number,
    comfort: number
): {
    applicationMap: Record<string, number>
    categoryAverages: Record<string, CategoryAverage>
} {
    const applicationMap: Record<string, number> = {}
    const categoryAverages: Record<string, CategoryAverage> = {}

    categories.forEach(cat => {
        // Build application map based on spending nature
        if (cat.spendingNature === 'superfluous') {
            applicationMap[cat.id] = superfluous
        } else if (cat.spendingNature === 'comfort') {
            applicationMap[cat.id] = comfort
        } else {
            applicationMap[cat.id] = 0 // Essential always 0
        }

        // Build category averages for Core calculator
        categoryAverages[cat.id] = {
            categoryId: cat.id,
            averageAmount: cat.averageAmount,
            totalInPeriod: cat.averageAmount,
            monthCount: 1
        }
    })

    return { applicationMap, categoryAverages }
}

export function AdvancedOptimizerSheet({
    open,
    onOpenChange,
    currentResult,
    onApply,
    baselineMetrics,
    categories,
    goalTargetCents,
    initialSavings
}: AdvancedOptimizerSheetProps) {
    const { currency, locale } = useCurrency()

    // Local State for "What-if" - initialized from parent
    const [superfluous, setSuperfluous] = useState(initialSavings.superfluous)
    const [comfort, setComfort] = useState(initialSavings.comfort)

    // Sync state when opening with current values from parent
    useEffect(() => {
        if (open) {
            setSuperfluous(initialSavings.superfluous)
            setComfort(initialSavings.comfort)
        }
    }, [open, initialSavings])

    // Real-time preview using Core calculateScenario (UNIFIED LOGIC)
    const preview = useMemo(() => {
        if (!baselineMetrics || categories.length === 0) {
            return null
        }

        const { applicationMap, categoryAverages } = buildScenarioInputs(categories, superfluous, comfort)

        // Use the SAME Core function as the Page
        const scenarioResult = calculateScenario({
            key: "custom",
            baseline: baselineMetrics,
            averages: categoryAverages,
            config: {
                type: "manual",
                label: "Personalizzato",
                description: "Configurazione manuale avanzata",
                applicationMap,
                savingsMap: { superfluous, comfort }
            },
            goalTargetCents,
            customApplicationMap: applicationMap
        })

        // Calculate extra savings for UI boost display
        const surplus = baselineMetrics.averageMonthlyIncome - scenarioResult.simulatedExpenses
        const extraSavings = surplus - (baselineMetrics.averageMonthlyIncome - baselineMetrics.averageMonthlyExpenses)

        return {
            surplus,
            extraSavings,
            months: scenarioResult.projection.likelyMonths,
            canReach: scenarioResult.projection.canReach,
            sustainability: scenarioResult.sustainability
        }
    }, [superfluous, comfort, baselineMetrics, categories, goalTargetCents])

    const handleApply = () => {
        onApply({ superfluous, comfort })
        onOpenChange(false)
    }

    // Sustainability display helpers
    const getSustainabilityDisplay = () => {
        if (!preview) return { label: "—", icon: Shield, className: "bg-muted text-muted-foreground" }
        const status = preview.sustainability.status
        if (status === "secure" || status === "sustainable") {
            return { label: "Sostenibile", icon: ShieldCheck, className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" }
        }
        if (status === "fragile") {
            return { label: "Fragile", icon: Shield, className: "bg-amber-500/10 text-amber-600 border-amber-500/20" }
        }
        return { label: "A Rischio", icon: ShieldAlert, className: "bg-rose-500/10 text-rose-600 border-rose-500/20" }
    }

    const sustainabilityDisplay = getSustainabilityDisplay()
    const SustainabilityIcon = sustainabilityDisplay.icon

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-lg p-0 overflow-hidden flex flex-col border-none glass-chrome">
                <SheetHeader className="p-6 pb-4 border-b border-white/20 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Settings2 className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex flex-col text-left">
                            <SheetTitle className="text-xl font-bold tracking-tight">
                                Modalità Avanzata
                            </SheetTitle>
                            <SheetDescription className="text-sm font-medium text-muted-foreground/80">
                                Definisci manualmente i parametri di risparmio.
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Superfluous Slider */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[10px] uppercase font-bold tracking-wider text-rose-500 px-1">Taglio Superfluo</label>
                            <Badge variant="outline" className="font-mono text-lg bg-rose-500/5 border-rose-500/20 text-rose-600">{superfluous}%</Badge>
                        </div>
                        <Slider
                            value={[superfluous]}
                            max={100}
                            step={5}
                            onValueChange={(v) => setSuperfluous(v[0])}
                            className="py-2"
                        />
                        <p className="text-sm font-medium text-muted-foreground px-1 leading-relaxed">
                            Percentuale di riduzione applicata a tutte le spese classificate come &quot;Superflue&quot;.
                        </p>
                    </div>

                    <Separator className="opacity-50" />

                    {/* Comfort Slider */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[10px] uppercase font-bold tracking-wider text-amber-500 px-1">Taglio Benessere</label>
                            <Badge variant="outline" className="font-mono text-lg bg-amber-500/5 border-amber-500/20 text-amber-600">{comfort}%</Badge>
                        </div>
                        <Slider
                            value={[comfort]}
                            max={100}
                            step={5}
                            onValueChange={(v) => setComfort(v[0])}
                            className="py-2"
                        />
                        <p className="text-sm font-medium text-muted-foreground px-1 leading-relaxed">
                            Percentuale di riduzione applicata alle spese &quot;Comfort&quot;. Usa con cautela.
                        </p>
                    </div>

                    <Separator className="opacity-50" />

                    {/* LIVE PREVIEW */}
                    <div className="rounded-xl bg-primary/[0.03] p-5 border border-primary/10 space-y-4">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span className="text-xs font-black uppercase tracking-widest text-primary">Anteprima Live</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Risparmio/Mese</p>
                                <p className={cn(
                                    "text-2xl font-black tabular-nums tracking-tight transition-all duration-300",
                                    preview && preview.surplus > 0 ? "text-emerald-600" : "text-foreground"
                                )}>
                                    {preview ? formatCents(preview.surplus, currency, locale) : "—"}
                                </p>
                                {preview && preview.extraSavings > 0 && (
                                    <p className="text-xs font-bold text-emerald-500">
                                        +{formatCents(preview.extraSavings, currency, locale)} boost
                                    </p>
                                )}
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Tempo Obiettivo</p>
                                <p className={cn(
                                    "text-2xl font-black tabular-nums tracking-tight transition-all duration-300",
                                    preview?.canReach ? "text-primary" : "text-muted-foreground"
                                )}>
                                    {preview?.canReach && preview.months > 0 ? `~${preview.months} mesi` : "—"}
                                </p>
                                {!preview?.canReach && (
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Aumenta il risparmio
                                    </p>
                                )}
                            </div>
                        </div>
                        <Badge variant="outline" className={cn("text-[10px] font-black uppercase tracking-wider py-1", sustainabilityDisplay.className)}>
                            <SustainabilityIcon className="h-3 w-3 mr-1.5" />
                            {sustainabilityDisplay.label}
                        </Badge>
                    </div>

                    <div className="rounded-xl bg-slate-50 dark:bg-white/5 p-4 border border-border/50 space-y-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Nota Metodologica</span>
                        <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                            Questi parametri sovrascriveranno qualsiasi Ritmo predefinito. Le spese Essenziali non sono modificabili per garantire la sostenibilità.
                        </p>
                    </div>
                </div>

                <div className="shrink-0 p-6 bg-white/40 dark:bg-white/5 border-t border-white/20 backdrop-blur-md">
                    <Button onClick={handleApply} className="w-full h-12 font-bold rounded-xl shadow-lg shadow-primary/20">
                        Applica Scenario
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
