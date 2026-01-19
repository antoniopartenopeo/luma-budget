"use client"

/**
 * Step Preview Mobile - PR2 GroupsV2 Implementation
 * 
 * Features:
 * - Income/Expense sections
 * - Group-level selection
 * - Sheet detail with subgroups
 * - Threshold selector
 * - Floating assistant
 */

import { useState, useMemo, useTransition, useRef } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import {
    ChevronRight, ChevronDown, AlertCircle, Copy,
    Unlink, Link2, HelpCircle, TrendingDown, TrendingUp,
    Sliders, X, Check
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { formatCents } from "@/lib/currency-utils"
import { getGroupedCategories, getCategoryById } from "@/features/categories/config"
import { CategoryIcon } from "@/features/categories/components/category-icon"
import type { PreviewRow, MerchantGroupV2, AmountSubgroup } from "../types"
import { DEFAULT_SIGNIFICANCE_THRESHOLD_CENTS } from "../types"
import {
    computeGroupsV2,
    applyCategoryToGroupV2,
    splitSubgroup,
    mergeSubgroup,
    setGroupSelected
} from "../grouping-utils-v2"
import { LoadingOverlay } from "./loading-overlay"
import { cn } from "@/lib/utils"

interface StepPreviewProps {
    rows: PreviewRow[]
    onRowsChange: (rows: PreviewRow[]) => void
    onToggleRow: (rowIndex: number) => void
    onUpdateCategory: (rowIndex: number, categoryId: string) => void
    onBulkUpdateCategory?: (categoryId: string) => void
}

const TIPOLOGIA_MAP: Record<string, string> = {
    essential: "Essenziale",
    comfort: "Comfort",
    superfluous: "Superfluo"
}

export function StepPreviewMobile({
    rows,
    onRowsChange,
    onToggleRow,
    onUpdateCategory,
}: StepPreviewProps) {
    const [thresholdCents, setThresholdCents] = useState(DEFAULT_SIGNIFICANCE_THRESHOLD_CENTS)
    const [groupsV2State, setGroupsV2State] = useState<Map<string, MerchantGroupV2>>(new Map())
    const [selectedGroup, setSelectedGroup] = useState<MerchantGroupV2 | null>(null)
    const [showThreshold, setShowThreshold] = useState(false)
    const [showAssistant, setShowAssistant] = useState(false)
    const [isPending, startTransition] = useTransition()

    const detailRef = useRef<HTMLDivElement>(null)

    const expenseCatGroups = useMemo(() => getGroupedCategories("expense"), [])
    const incomeCatGroups = useMemo(() => getGroupedCategories("income"), [])

    // Compute groups
    const baseGroups = useMemo(() =>
        computeGroupsV2(rows, { thresholdCents }),
        [rows, thresholdCents]
    )

    // Apply local state
    const groups = useMemo(() => {
        const applyState = (groups: MerchantGroupV2[]) =>
            groups.map(g => groupsV2State.get(g.patternKey) || g)
        return {
            income: applyState(baseGroups.income),
            expense: applyState(baseGroups.expense),
            all: applyState(baseGroups.all)
        }
    }, [baseGroups, groupsV2State])

    // Stats
    const stats = useMemo(() => ({
        selectedRows: rows.filter(r => r.isSelected && r.isValid).length,
        significantGroups: groups.all.filter(g => g.isSignificant).length,
        lessSignificantGroups: groups.all.filter(g => !g.isSignificant).length
    }), [groups, rows])

    // Selected group rows
    const selectedGroupRows = useMemo(() => {
        if (!selectedGroup) return []
        return rows.filter(r => selectedGroup.rowIndices.includes(r.rowIndex))
    }, [selectedGroup, rows])

    // Detail virtualizer
    const detailVirtualizer = useVirtualizer({
        count: selectedGroupRows.length,
        getScrollElement: () => detailRef.current,
        estimateSize: () => 72,
        overscan: 5
    })

    // Helpers
    const getCategoryLabel = (categoryId: string): string => {
        const cat = getCategoryById(categoryId)
        return cat?.label || categoryId
    }

    // Handlers
    const handleGroupCategoryChange = (group: MerchantGroupV2, categoryId: string) => {
        startTransition(() => {
            const updatedRows = applyCategoryToGroupV2(rows, group, categoryId)
            onRowsChange(updatedRows)
        })
    }

    const handleSplitSubgroup = (group: MerchantGroupV2, amountCents: number) => {
        const updated = splitSubgroup(group, amountCents)
        setGroupsV2State(prev => new Map(prev).set(group.patternKey, updated))
        if (selectedGroup?.patternKey === group.patternKey) {
            setSelectedGroup(updated)
        }
    }

    const handleMergeSubgroup = (group: MerchantGroupV2, amountCents: number) => {
        const updated = mergeSubgroup(group, amountCents)
        setGroupsV2State(prev => new Map(prev).set(group.patternKey, updated))
        if (selectedGroup?.patternKey === group.patternKey) {
            setSelectedGroup(updated)
        }
    }

    const handleGroupSelectionChange = (group: MerchantGroupV2, selected: boolean) => {
        const updated = setGroupSelected(group, selected)
        setGroupsV2State(prev => new Map(prev).set(group.patternKey, updated))

        startTransition(() => {
            const updatedRows = rows.map(row => {
                if (group.rowIndices.includes(row.rowIndex)) {
                    return { ...row, isSelected: selected }
                }
                return row
            })
            onRowsChange(updatedRows)
        })
    }

    const handleToggleRow = (index: number) => {
        startTransition(() => onToggleRow(index))
    }

    // Render group card
    const renderGroupCard = (group: MerchantGroupV2, isLessSignificant = false) => {
        const categoryGroups = group.type === "income" ? incomeCatGroups : expenseCatGroups
        const hasSubgroups = group.subgroups.length > 0

        return (
            <div
                key={group.patternKey}
                className={cn(
                    "border rounded-lg p-3 space-y-3 bg-card shadow-sm",
                    isLessSignificant && "opacity-60"
                )}
            >
                {/* Header */}
                <div className="flex items-start gap-3">
                    <Checkbox
                        checked={group.isGroupSelected}
                        onCheckedChange={(c) => handleGroupSelectionChange(group, !!c)}
                        className="mt-1"
                    />
                    <button
                        onClick={() => setSelectedGroup(group)}
                        className="flex-1 text-left min-w-0"
                    >
                        <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm truncate">{group.displayName}</h4>
                            <Badge variant="secondary" className="shrink-0">{group.count}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {group.sampleDescriptions[0]}
                        </p>
                        {hasSubgroups && (
                            <Badge variant="outline" className="text-[9px] mt-1">
                                {group.subgroups.length} ricorrenti
                            </Badge>
                        )}
                    </button>
                    <div className={cn(
                        "font-bold font-mono text-sm shrink-0",
                        group.type === "income" && "text-green-600"
                    )}>
                        {group.type === "income" ? "+" : "-"}{formatCents(group.totalAbsCents)}
                    </div>
                </div>

                {/* Category select */}
                <Select
                    value={group.assignedCategoryId}
                    onValueChange={(v) => handleGroupCategoryChange(group, v)}
                >
                    <SelectTrigger className="h-9 w-full text-sm">
                        <div className="flex items-center gap-2 truncate">
                            <CategoryIcon
                                categoryId={group.assignedCategoryId}
                                categoryName={getCategoryLabel(group.assignedCategoryId)}
                                size={16}
                            />
                            <span className="truncate">{getCategoryLabel(group.assignedCategoryId)}</span>
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        {categoryGroups.map(catGroup => (
                            <div key={catGroup.key}>
                                <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground font-bold bg-muted/50">
                                    {catGroup.label}
                                </div>
                                {catGroup.categories.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        <div className="flex items-center gap-2">
                                            <CategoryIcon categoryId={cat.id} categoryName={cat.label} size={16} />
                                            {cat.label}
                                        </div>
                                    </SelectItem>
                                ))}
                            </div>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        )
    }

    // Render section
    const renderSection = (type: "expense" | "income", sectionGroups: MerchantGroupV2[]) => {
        const significant = sectionGroups.filter(g => g.isSignificant)
        if (significant.length === 0) return null

        const Icon = type === "expense" ? TrendingDown : TrendingUp
        const label = type === "expense" ? "Uscite" : "Entrate"
        const total = significant.reduce((s, g) => s + g.totalAbsCents, 0)

        return (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Icon className={cn("h-4 w-4", type === "income" && "text-green-600")} />
                        <span className="font-semibold text-sm">{label}</span>
                        <Badge variant="secondary" className="text-xs">{significant.length}</Badge>
                    </div>
                    <span className={cn(
                        "font-bold text-sm",
                        type === "income" && "text-green-600"
                    )}>
                        {type === "income" ? "+" : "-"}{formatCents(total)}
                    </span>
                </div>
                {significant.map(g => renderGroupCard(g))}
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full space-y-4 relative">
            <LoadingOverlay isLoading={isPending} />

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 text-xs flex-shrink-0">
                <div className="bg-muted/50 p-2 rounded border flex flex-col items-center">
                    <span className="font-bold text-lg">{stats.selectedRows}</span>
                    <span className="text-muted-foreground">Selezionate</span>
                </div>
                <div className="bg-muted/50 p-2 rounded border flex flex-col items-center">
                    <span className="font-bold text-lg">{stats.significantGroups}</span>
                    <span className="text-muted-foreground">Gruppi</span>
                </div>
            </div>

            {/* Threshold toggle */}
            <Button
                variant="outline"
                size="sm"
                className="w-full justify-between"
                onClick={() => setShowThreshold(!showThreshold)}
            >
                <span className="flex items-center gap-2">
                    <Sliders className="h-4 w-4" />
                    Soglia: {formatCents(thresholdCents)}
                </span>
                <ChevronDown className={cn("h-4 w-4 transition", showThreshold && "rotate-180")} />
            </Button>

            {showThreshold && (
                <div className="px-2 pb-2">
                    <Slider
                        value={[thresholdCents]}
                        onValueChange={(v) => setThresholdCents(v[0])}
                        min={0}
                        max={50000}
                        step={500}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                        Gruppi sotto soglia non selezionati di default
                    </p>
                </div>
            )}

            {/* Groups list */}
            <div className="flex-1 overflow-auto space-y-6 pb-24">
                {renderSection("expense", groups.expense)}
                {renderSection("income", groups.income)}

                {/* Less significant */}
                {stats.lessSignificantGroups > 0 && (
                    <div className="border-t pt-4">
                        <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">
                                Meno significativi ({stats.lessSignificantGroups})
                            </span>
                        </div>
                        <div className="space-y-3">
                            {groups.all.filter(g => !g.isSignificant).slice(0, 10).map(g => renderGroupCard(g, true))}
                        </div>
                    </div>
                )}
            </div>

            {/* Floating assistant button */}
            <Button
                variant="outline"
                size="icon"
                className="fixed bottom-20 right-4 h-10 w-10 rounded-full shadow-lg bg-background"
                onClick={() => setShowAssistant(true)}
            >
                <HelpCircle className="h-5 w-5" />
            </Button>

            {/* Group detail sheet */}
            <Sheet open={!!selectedGroup} onOpenChange={(o) => !o && setSelectedGroup(null)}>
                <SheetContent side="bottom" className="h-[85vh] flex flex-col">
                    {selectedGroup && (
                        <>
                            <SheetHeader className="flex-shrink-0">
                                <SheetTitle className="flex items-center justify-between">
                                    <span className="truncate">{selectedGroup.displayName}</span>
                                    <Badge variant="secondary">{selectedGroup.count}</Badge>
                                </SheetTitle>
                            </SheetHeader>

                            {/* Subgroups */}
                            {selectedGroup.subgroups.length > 0 && (
                                <div className="py-3 border-b flex-shrink-0">
                                    <h4 className="text-sm font-medium mb-2">Importi ricorrenti</h4>
                                    <div className="space-y-2">
                                        {selectedGroup.subgroups.map(sg => (
                                            <div key={sg.amountCents} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                                <div>
                                                    <span className="font-mono">{formatCents(sg.amountCents)}</span>
                                                    <span className="text-muted-foreground text-xs ml-2">× {sg.count}</span>
                                                </div>
                                                {sg.isSplit ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleMergeSubgroup(selectedGroup, sg.amountCents)}
                                                    >
                                                        <Link2 className="h-3 w-3 mr-1" />
                                                        Unisci
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleSplitSubgroup(selectedGroup, sg.amountCents)}
                                                    >
                                                        <Unlink className="h-3 w-3 mr-1" />
                                                        Slega
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Rows */}
                            <div ref={detailRef} className="flex-1 overflow-auto">
                                <div style={{ height: `${detailVirtualizer.getTotalSize()}px`, position: "relative" }}>
                                    {detailVirtualizer.getVirtualItems().map(vRow => {
                                        const row = selectedGroupRows[vRow.index]
                                        return (
                                            <div
                                                key={vRow.key}
                                                style={{
                                                    position: "absolute",
                                                    top: 0,
                                                    left: 0,
                                                    width: "100%",
                                                    height: `${vRow.size}px`,
                                                    transform: `translateY(${vRow.start}px)`
                                                }}
                                            >
                                                <div className="flex items-center gap-3 p-3 border-b">
                                                    <Checkbox
                                                        checked={row.isSelected}
                                                        onCheckedChange={() => handleToggleRow(row.rowIndex)}
                                                        disabled={!row.isValid}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between text-xs">
                                                            <span className="text-muted-foreground">
                                                                {row.date?.slice(0, 10) || "—"}
                                                            </span>
                                                            <span className={cn("font-bold", row.type === "income" && "text-green-600")}>
                                                                {formatCents(Math.abs(row.amountCents))}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm truncate">{row.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>

            {/* Assistant sheet */}
            <Sheet open={showAssistant} onOpenChange={setShowAssistant}>
                <SheetContent side="bottom" className="h-[60vh]">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <HelpCircle className="h-5 w-5 text-primary" />
                            Guida all&apos;Import
                        </SheetTitle>
                    </SheetHeader>
                    <div className="space-y-4 mt-4">
                        <div className="rounded-lg border p-3">
                            <h4 className="font-medium text-sm mb-1">Importazione Intelligente</h4>
                            <p className="text-xs text-muted-foreground">
                                I gruppi più rilevanti sono già selezionati. Questa è una fotografia del passato: non serve importare tutto.
                            </p>
                        </div>
                        <div className="rounded-lg border p-3">
                            <h4 className="font-medium text-sm mb-1">Soglia di Importanza</h4>
                            <p className="text-xs text-muted-foreground">
                                Regola la soglia per decidere quali gruppi importare. Inizia dalle spese più importanti.
                            </p>
                        </div>
                        <div className="rounded-lg border p-3">
                            <h4 className="font-medium text-sm mb-1">Transazioni Ricorrenti</h4>
                            <p className="text-xs text-muted-foreground">
                                Usa &quot;Slega&quot; su importi ripetuti per categorizzarli separatamente (es. abbonamenti).
                            </p>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}
