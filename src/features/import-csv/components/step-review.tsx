"use client"

import { useMemo, useState } from "react"
import {
    ArrowLeft,
    ArrowRight,
    Filter,
    AlertTriangle,
    ListChecks,
    PlusCircle,
    Copy,
    CircleAlert,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Accordion } from "@/components/ui/accordion"
import { KpiCard } from "@/components/patterns/kpi-card"
import { ImportState, Override, Group, Subgroup } from "../core/types"
import { resolveCategory } from "../core/overrides"
import { getIncludedGroups } from "../core/filters"
import { cn } from "@/lib/utils"
import { ReviewResult } from "./csv-import-wizard"
import { brainCategorizer } from "@/brain/categorizer"

// Sub-components
import {
    ThresholdPresetSelector,
    MerchantGroupCard,
} from "./review"

// ============================================
// Types
// ============================================

interface ImportStepReviewProps {
    initialState: ImportState
    initialOverrides: Override[]
    thresholdCents: number
    onThresholdChange: (cents: number) => void
    onBack: () => void
    onContinue: (result: ReviewResult) => void
}

// ============================================
// Main Component
// ============================================

export function ImportStepReview({
    initialState,
    initialOverrides,
    thresholdCents,
    onThresholdChange,
    onBack,
    onContinue
}: ImportStepReviewProps) {
    const [overrides, setOverrides] = useState<Override[]>(initialOverrides)

    const { groups, rows } = initialState
    const rowsById = useMemo(() => new Map(rows.map((row) => [row.id, row])), [rows])

    // Use shared filter function for consistency with step-summary
    const { includedGroups: filteredGroups, excludedGroupIds } = useMemo(
        () => getIncludedGroups(groups, thresholdCents),
        [groups, thresholdCents]
    )

    const parseErrorsCount = initialState.summary.parseErrors.length

    const importVisibility = useMemo(() => {
        let duplicatesConfirmed = 0
        let duplicatesSuspected = 0

        rows.forEach((row) => {
            if (row.duplicateStatus === "confirmed") duplicatesConfirmed++
            if (row.duplicateStatus === "suspected") duplicatesSuspected++
        })

        return {
            totalValidRows: initialState.summary.totalRows,
            importableRows: initialState.summary.selectedRows,
            duplicatesTotal: duplicatesConfirmed + duplicatesSuspected,
            duplicatesConfirmed,
            duplicatesSuspected
        }
    }, [rows, initialState.summary.totalRows, initialState.summary.selectedRows])

    const groupsByDirection = useMemo(() => {
        const expenses: Group[] = []
        const incomes: Group[] = []
        const mixed: Group[] = []

        filteredGroups.forEach((group) => {
            let hasIncome = false
            let hasExpense = false

            for (const subgroup of group.subgroups) {
                for (const rowId of subgroup.rowIds) {
                    const row = rowsById.get(rowId)
                    if (!row) continue
                    if (row.amountCents > 0) hasIncome = true
                    if (row.amountCents < 0) hasExpense = true
                    if (hasIncome && hasExpense) break
                }
                if (hasIncome && hasExpense) break
            }

            if (hasIncome && hasExpense) mixed.push(group)
            else if (hasIncome) incomes.push(group)
            else expenses.push(group)
        })

        return { expenses, incomes, mixed }
    }, [filteredGroups, rowsById])

    // ============================================
    // Override Handlers
    // ============================================

    const setGroupCategory = (groupId: string, categoryId: string) => {
        setOverrides(prev => {
            const others = prev.filter(o => !(o.targetId === groupId && o.level === "group"))
            return [...others, { targetId: groupId, level: "group", categoryId }]
        })
    }

    const setSubgroupCategory = (subgroupId: string, categoryId: string) => {
        setOverrides(prev => {
            const others = prev.filter(o => !(o.targetId === subgroupId && o.level === "subgroup"))
            return [...others, { targetId: subgroupId, level: "subgroup", categoryId }]
        })
    }

    // ============================================
    // Category Resolution Helpers
    // ============================================

    const getGroupEffectiveCategory = (group: Group) => {
        const groupOverride = overrides.find(o => o.targetId === group.id && o.level === "group")
        if (groupOverride) return groupOverride.categoryId
        return group.categoryId
    }

    const getSubgroupEffectiveCategory = (subgroup: Subgroup, group: Group) => {
        const subgroupOverride = overrides.find(o => o.targetId === subgroup.id && o.level === "subgroup")
        if (subgroupOverride) return subgroupOverride.categoryId
        return getGroupEffectiveCategory(group) || subgroup.categoryId
    }

    // ============================================
    // Stats (Memoized)
    // ============================================

    const stats = useMemo(() => {
        let assigned = 0
        let total = 0

        filteredGroups.forEach((g: Group) => {
            g.subgroups.forEach((sg: Subgroup) => {
                sg.rowIds.forEach((rid: string) => {
                    const row = rowsById.get(rid)
                    if (row && row.isSelected) {
                        total++
                        const catId = resolveCategory(row, sg, g, overrides)

                        if (catId) {
                            assigned++
                        }
                    }
                })
            })
        })

        return { assigned, total }
    }, [filteredGroups, rowsById, overrides])
    const getRowById = (id: string) => rowsById.get(id)
    const getGroupSuggestedCategory = (group: Group) => {
        const firstGroupRowId = group.subgroups[0]?.rowIds[0]
        const firstGroupRow = firstGroupRowId ? rowsById.get(firstGroupRowId) : undefined
        return getGroupEffectiveCategory(group) || group.subgroups[0]?.categoryId || firstGroupRow?.suggestedCategoryId || null
    }

    const directionSections = [
        { key: "expenses", title: "Uscite", groups: groupsByDirection.expenses },
        { key: "incomes", title: "Entrate", groups: groupsByDirection.incomes },
        { key: "mixed", title: "Misti", groups: groupsByDirection.mixed },
    ] as const

    // ============================================
    // Render Helpers
    // ============================================

    // ============================================
    // Main Render
    // ============================================

    const handleContinue = () => {
        // Online Learning Feedback Loop
        // We train the Brain Categorizer with the FINAL confirmed categories 
        // to adapt to the user's specific choices instantly.
        filteredGroups.forEach((g: Group) => {
            g.subgroups.forEach((sg: Subgroup) => {
                sg.rowIds.forEach((rid: string) => {
                    const row = rowsById.get(rid)
                    if (row && row.isSelected) {
                        const finalCatId = resolveCategory(row, sg, g, overrides)
                        if (finalCatId) {
                            // The Brain learns from the original string what category was actually chosen
                            brainCategorizer.learn(row.description, finalCatId)
                        }
                    }
                })
            })
        })

        // Proceed to next step
        onContinue({ overrides, excludedGroupIds })
    }

    const footer = (
        <div className="flex w-full justify-between items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="h-12 px-5 gap-1.5 text-sm">
                <ArrowLeft className="h-4 w-4" /> Indietro
            </Button>
            <Button
                onClick={handleContinue}
                className={cn(
                    "h-12 gap-1.5 rounded-xl px-6 text-sm shadow-lg transition-[transform,box-shadow,background-color,border-color,color] duration-200 hover:-translate-y-[1px]",
                    stats.total > stats.assigned && "border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200"
                )}
                variant={stats.total > stats.assigned ? "outline" : "default"}
            >
                Continua
                <ArrowRight className="h-4 w-4" />
            </Button>
        </div>
    )

    return (
        <div className="flex flex-col gap-6">
            {/* Header Area */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                        Controlla i movimenti
                    </h2>
                    <p className="text-sm font-medium text-muted-foreground">
                        Rivedi gruppi, categorie e duplicati prima di salvare.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <KpiCard
                    compact
                    title="Movimenti letti"
                    value={importVisibility.totalValidRows}
                    icon={ListChecks}
                    tone="neutral"
                    className="h-full"
                    valueClassName="text-2xl sm:text-3xl lg:text-4xl text-foreground"
                />
                <KpiCard
                    compact
                    title="Pronti da importare"
                    value={importVisibility.importableRows}
                    icon={PlusCircle}
                    tone="positive"
                    className="h-full"
                    valueClassName="text-2xl sm:text-3xl lg:text-4xl text-emerald-700 dark:text-emerald-300"
                />
                <KpiCard
                    compact
                    title="Già presenti"
                    value={importVisibility.duplicatesTotal}
                    icon={Copy}
                    tone="warning"
                    className="h-full"
                    valueClassName="text-2xl sm:text-3xl lg:text-4xl text-amber-700 dark:text-amber-300"
                    description={
                        importVisibility.duplicatesTotal > 0
                            ? `${importVisibility.duplicatesConfirmed} certi + ${importVisibility.duplicatesSuspected} da controllare`
                            : undefined
                    }
                />
                <KpiCard
                    compact
                    title="Non letti"
                    value={parseErrorsCount}
                    icon={CircleAlert}
                    tone="negative"
                    className="h-full"
                    valueClassName="text-2xl sm:text-3xl lg:text-4xl text-rose-700 dark:text-rose-300"
                />
            </div>

            <section>
                <ThresholdPresetSelector
                    thresholdCents={thresholdCents}
                    onCommit={onThresholdChange}
                />
            </section>

            {parseErrorsCount > 0 && (
                <div className="rounded-xl border border-amber-300/50 bg-amber-50/60 dark:bg-amber-950/20 p-4 text-amber-900 dark:text-amber-200 shadow-sm backdrop-blur-md">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
                        <div className="text-sm">
                            Alcune righe non sono state lette in modo corretto (<strong>{parseErrorsCount}</strong>).
                            I movimenti validi sono già pronti nell'elenco qui sotto.
                        </div>
                    </div>
                </div>
            )}

            {filteredGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center rounded-[2rem] border border-border/50 bg-background/50">
                    <Filter className="h-10 w-10 text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground font-medium">Con il filtro attuale non vedo gruppi disponibili</p>
                    <Button variant="secondary" size="sm" className="mt-4 h-9 rounded-xl px-4" onClick={() => onThresholdChange(0)}>
                        Mostra tutti
                    </Button>
                </div>
            ) : (
                <div className="space-y-8">
                    {directionSections.map((section) => (
                        section.groups.length > 0 ? (
                            <div key={section.key} className="space-y-4">
                                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                                    <h4 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                                        {section.title}
                                        <Badge variant="outline" className="font-semibold text-muted-foreground border-border/50 bg-transparent">
                                            {section.groups.length}
                                        </Badge>
                                    </h4>
                                </div>
                                <Accordion type="multiple" className="space-y-3">
                                    {section.groups.map((group, index) => (
                                        <div key={group.id} className="rounded-2xl border border-border/50 bg-background/50 shadow-sm overflow-hidden">
                                            <MerchantGroupCard
                                                group={group}
                                                index={index}
                                                totalGroups={section.groups.length}
                                                effectiveCategoryId={getGroupSuggestedCategory(group)}
                                                onGroupCategoryChange={setGroupCategory}
                                                onSubgroupCategoryChange={setSubgroupCategory}
                                                getSubgroupEffectiveCategory={(sg) => getSubgroupEffectiveCategory(sg, group)}
                                                getRowById={getRowById}
                                            />
                                        </div>
                                    ))}
                                </Accordion>
                            </div>
                        ) : null
                    ))}
                </div>
            )}

            {/* Footer Actions */}
            <div className="mt-6 flex w-full items-center justify-between border-t border-border/40 pt-6">
                <Button variant="ghost" onClick={onBack} className="h-12 rounded-xl px-5 text-muted-foreground hover:bg-muted/50 hover:text-foreground">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Indietro
                </Button>
                <Button
                    onClick={() => onContinue({ overrides, excludedGroupIds })}
                    className={cn(
                        "h-12 gap-2 rounded-xl px-8 font-semibold shadow-lg transition-all duration-200",
                        stats.total > stats.assigned
                            ? "border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100 border hover:shadow-amber-500/10 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200"
                            : "hover:-translate-y-[1px] hover:shadow-primary/25"
                    )}
                    variant={stats.total > stats.assigned ? "outline" : "default"}
                >
                    Continua
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
