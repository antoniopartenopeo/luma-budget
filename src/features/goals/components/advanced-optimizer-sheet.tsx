"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Settings2, RefreshCw, Calculator } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { GoalScenarioResult } from "@/VAULT/goals/types"
import { formatCents } from "@/domain/money"
import { useCurrency } from "@/features/settings/api/use-currency"

interface AdvancedOptimizerSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentResult: GoalScenarioResult
    onApply: (savings: { superfluous: number; comfort: number }) => void
}

export function AdvancedOptimizerSheet({
    open,
    onOpenChange,
    currentResult,
    onApply
}: AdvancedOptimizerSheetProps) {
    const { currency, locale } = useCurrency()

    // Local State for "What-if"
    const [superfluous, setSuperfluous] = useState(0)
    const [comfort, setComfort] = useState(0)

    // Sync state when opening with current values from the passed result
    // We try to infer current sliders from the applicationMap of the passed result
    useEffect(() => {
        if (open) {
            // Heuristic: Check one distinct category ID or use a known convention?
            // Since we don't have category IDs here easily, we rely on the fact that
            // in our generator we map all 'superfluous' cats to the same %.
            // We'll trust the parent to pass a clean config or just default to 0.
            // A better way is to pass the "current preset values" explicitly.
            // For now, let's grab from the config payload if available.

            // NOTE: This is a simplification. In a real app we might want to iterate the map.
            // We'll interpret the "ApplicationMap" values.
            // However, the `applicationMap` keys are IDs. 
            // We will just defaulting to 0 if we can't guess, or better:
            // The sheet is "Advanced", maybe we start from fresh or last custom?
            // Let's safe default to the "Balanced" rhythm values if we are not custom?
            // No, that's confusing.

            // Let's initialize with 0 for now as "Custom Offset" logic is safer to not guess.
        }
    }, [open])

    const handleApply = () => {
        onApply({ superfluous, comfort })
        onOpenChange(false)
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-lg p-0 overflow-hidden flex flex-col border-none">
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

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
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

                    <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/50 p-4 border border-border/50 space-y-3">
                        <div className="flex items-center gap-2">
                            <Calculator className="h-3 w-3 text-primary" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Nota Metodologica</span>
                        </div>
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
