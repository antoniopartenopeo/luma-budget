"use client"

import { useMemo, useState } from "react"
import { ArrowLeft, ArrowRight, Info, CheckCircle2, HelpCircle, Tags, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ImportState, Override, Group, Subgroup } from "../core/types"
import { resolveCategory } from "../core/overrides"
import { CATEGORIES, getCategoryById } from "@/features/categories/config"
import { cn } from "@/lib/utils"

interface ImportStepReviewProps {
    initialState: ImportState
    initialOverrides: Override[]
    onBack: () => void
    onContinue: (overrides: Override[]) => void
}

export function ImportStepReview({ initialState, initialOverrides, onBack, onContinue }: ImportStepReviewProps) {
    const [overrides, setOverrides] = useState<Override[]>(initialOverrides)
    const [viewMode, setViewMode] = useState<"merchant" | "category">("merchant")

    // Resolve helper
    const getGroupEffectiveCategory = (group: Group) => {
        const groupOverride = overrides.find(o => o.targetId === group.id && o.level === "group")
        if (groupOverride) return groupOverride.categoryId
        return group.categoryId
    }

    const { groups, rows } = initialState

    const setGroupCategory = (groupId: string, categoryId: string) => {
        setOverrides(prev => {
            const others = prev.filter(o => !(o.targetId === groupId && o.level === "group"))
            return [...others, { targetId: groupId, level: "group", categoryId }]
        })
    }

    // Calculate Stats & Category Breakdown (Memoized)
    const { stats, categoryGroups } = useMemo(() => {
        let assigned = 0
        let total = 0

        // Setup Category Groups Map
        const catMap = new Map<string, {
            id: string,
            label: string,
            color: string,
            amount: number,
            count: number,
            rowIds: string[]
        }>()

        // Init unassigned
        catMap.set("unassigned", {
            id: "unassigned",
            label: "Non Categorizzato",
            color: "bg-muted text-muted-foreground",
            amount: 0,
            count: 0,
            rowIds: []
        })

        groups.forEach((g: Group) => {
            g.subgroups.forEach((sg: Subgroup) => {
                sg.rowIds.forEach((rid: string) => {
                    const row = rows.find(r => r.id === rid)
                    if (row && row.isSelected) {
                        total++
                        const catId = resolveCategory(row, sg, g, overrides)

                        if (catId) {
                            assigned++
                            const def = getCategoryById(catId)
                            if (!catMap.has(catId) && def) {
                                catMap.set(catId, {
                                    id: catId,
                                    label: def.label,
                                    color: def.color,
                                    amount: 0,
                                    count: 0,
                                    rowIds: []
                                })
                            }

                            const target = catMap.get(catId)!
                            target.amount += row.amountCents
                            target.count++
                            target.rowIds.push(row.id)
                        } else {
                            const target = catMap.get("unassigned")!
                            target.amount += row.amountCents
                            target.count++
                            target.rowIds.push(row.id)
                        }
                    }
                })
            })
        })

        // Cleanup empty unassigned if perfect
        if (catMap.get("unassigned")!.count === 0) {
            catMap.delete("unassigned")
        }

        return {
            stats: { assigned, total },
            categoryGroups: Array.from(catMap.values()).sort((a, b) => b.amount - a.amount)
        }
    }, [groups, rows, overrides])

    const completionPercent = stats.total > 0 ? (stats.assigned / stats.total) * 100 : 0

    return (
        <div className="flex flex-col h-full bg-background animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Header */}
            <div className="p-6 border-b shrink-0 bg-card z-10 shadow-sm flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                            2
                        </div>
                        <h2 className="text-xl font-bold tracking-tight">Revisione Rapida</h2>
                    </div>
                    <p className="text-muted-foreground text-sm">
                        Abbiamo raggruppato le transazioni. Controlla e conferma.
                    </p>
                </div>

                <div className="text-right hidden md:block">
                    <div className="text-2xl font-bold font-mono text-primary">
                        {stats.assigned} <span className="text-muted-foreground/40 text-lg">/ {stats.total}</span>
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">Classificate</div>
                </div>
            </div>

            {/* Consultant Advice Area */}
            <div className="px-6 pt-6 pb-2 shrink-0">
                {completionPercent < 50 ? (
                    <Alert className="bg-blue-50/50 border-blue-100 text-blue-900 [&>svg]:text-blue-600">
                        <Info className="h-4 w-4" />
                        <AlertTitle>Consiglio Rapido</AlertTitle>
                        <AlertDescription>
                            Non devi classificare tutto ora. Le voci non assegnate andranno in &quot;Non Categorizzato&quot; e potrai sistemarle dopo.
                        </AlertDescription>
                    </Alert>
                ) : completionPercent < 90 ? (
                    <Alert className="bg-emerald-50/50 border-emerald-100 text-emerald-900 [&>svg]:text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertTitle>Ottimo lavoro!</AlertTitle>
                        <AlertDescription>
                            Hai coperto la maggior parte delle transazioni.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <Alert className="bg-muted/50 border-muted text-muted-foreground">
                        <HelpCircle className="h-4 w-4" />
                        <AlertTitle>Quasi perfetto</AlertTitle>
                        <AlertDescription>
                            Hai classificato quasi tutto. Ricorda che potrai sempre modificare le categorie anche dopo l&apos;import.
                        </AlertDescription>
                    </Alert>
                )}
            </div>

            {/* Content Area with Tabs */}
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="flex-1 flex flex-col min-h-0">
                <div className="px-6 py-2 shrink-0">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="merchant" className="gap-2">
                            <Store className="h-4 w-4" /> Per Esercente
                        </TabsTrigger>
                        <TabsTrigger value="category" className="gap-2">
                            <Tags className="h-4 w-4" /> Per Categoria
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* View: Merchants (Original) */}
                <TabsContent value="merchant" className="flex-1 overflow-y-auto px-6 pb-6 min-h-0 data-[state=inactive]:hidden">
                    <div className="space-y-3">
                        {groups.map((group: Group) => {
                            const effectiveCatId = getGroupEffectiveCategory(group) || group.subgroups[0]?.categoryId || rows.find(r => r.merchantKey === group.merchantKey)?.suggestedCategoryId

                            return (
                                <div key={group.id} className="group bg-card border rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-base md:text-lg truncate" title={group.label}>
                                                {group.label}
                                            </h3>
                                            <Badge variant="secondary" className="text-xs font-mono shrink-0">
                                                {group.rowCount} tx
                                            </Badge>
                                        </div>
                                        <div className="text-xs md:text-sm text-muted-foreground flex items-center gap-2 md:gap-3 truncate">
                                            <span className="font-medium text-foreground">
                                                {(group.totalCents / 100).toLocaleString("it-IT", { style: "currency", currency: "EUR" })}
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-border shrink-0" />
                                            <span className="truncate">
                                                {group.dateRange.from} — {group.dateRange.to}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-1 md:flex-none md:w-64">
                                        <CategorySelect
                                            value={effectiveCatId || ""}
                                            onChange={(val) => setGroupCategory(group.id, val)}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </TabsContent>

                {/* View: Categories (New Drill-down) */}
                <TabsContent value="category" className="flex-1 overflow-y-auto px-6 pb-6 min-h-0 data-[state=inactive]:hidden">
                    <div className="space-y-4">
                        <Accordion type="multiple" className="w-full space-y-2">
                            {categoryGroups.map((cg) => (
                                <AccordionItem key={cg.id} value={cg.id} className="bg-card border rounded-xl px-4 shadow-sm">
                                    <AccordionTrigger className="hover:no-underline py-4">
                                        <div className="flex items-center justify-between w-full pr-4">
                                            <div className="flex items-center gap-3">
                                                {cg.id !== 'unassigned' && (
                                                    <div className={cn("w-3 h-3 rounded-full", cg.color.split(" ")[1])} />
                                                )}
                                                <span className="font-bold text-lg">{cg.label}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm">
                                                <Badge variant="outline">{cg.count}</Badge>
                                                <span className="font-mono font-medium">
                                                    {(cg.amount / 100).toLocaleString("it-IT", { style: "currency", currency: "EUR" })}
                                                </span>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-0 pb-4">
                                        <div className="rounded-lg border bg-muted/30 divide-y">
                                            {cg.rowIds.slice(0, 50).map(rid => {
                                                const r = rows.find(x => x.id === rid)
                                                if (!r) return null
                                                return (
                                                    <div key={r.id} className="flex justify-between items-center p-3 text-sm">
                                                        <div className="flex flex-col">
                                                            <span className="font-medium truncate max-w-[200px]">{r.description}</span>
                                                            <span className="text-xs text-muted-foreground">{r.date}</span>
                                                        </div>
                                                        <div className="font-mono">
                                                            {(r.amountCents / 100).toLocaleString("it-IT", { style: "currency", currency: "EUR" })}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                            {cg.rowIds.length > 50 && (
                                                <div className="p-2 text-center text-xs text-muted-foreground">
                                                    ...e altri {cg.rowIds.length - 50}
                                                </div>
                                            )}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Footer */}
            <div className="p-6 border-t bg-card shrink-0 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
                <Button variant="ghost" onClick={onBack} className="gap-2">
                    <ArrowLeft className="h-4 w-4" /> Indietro
                </Button>
                <div className="flex items-center gap-4">
                    <div className="text-xs text-muted-foreground text-right hidden lg:block">
                        {stats.total - stats.assigned} da assegnare
                    </div>
                    <Button onClick={() => onContinue(overrides)} className="gap-2 rounded-xl px-8 h-12 shadow-lg hover:translate-y-[-1px] transition-all">
                        Procedi al Riepilogo
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

function CategorySelect({ value, onChange }: { value: string, onChange: (v: string) => void }) {
    const items = CATEGORIES
    const selected = getCategoryById(value)

    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className={cn("h-10 w-full bg-muted/20 border-transparent hover:border-input transition-colors", !value && "text-muted-foreground/70")}>
                <div className="flex items-center gap-2 overflow-hidden w-full">
                    {selected ? (
                        <>
                            <span className={cn("w-2 h-2 rounded-full shrink-0", selected.color.split(" ")[1])} />
                            {/* Added explicit text-left to align */}
                            <span className="truncate flex-1 text-left">{selected.label}</span>
                        </>
                    ) : (
                        <>
                            <span className="w-3.5 h-3.5 rounded-full border border-dashed border-foreground/50 shrink-0" />
                            {/* Added explicit text-left to align */}
                            <span className="truncate flex-1 text-left opacity-70">Scegli Categoria...</span>
                        </>
                    )}
                </div>
            </SelectTrigger>
            <SelectContent>
                {items.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                        <span className="flex items-center gap-2">
                            <span className={cn("w-2 h-2 rounded-full shrink-0", c.color.split(" ")[1])} />
                            {c.label}
                        </span>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
