"use client"

/**
 * Step Preview Desktop - PR2 GroupsV2 Implementation
 * 
 * Features:
 * - Income/Expense sections sorted by totalAbsCents
 * - Subgroups with split/merge
 * - Group-level selection (isGroupSelected)
 * - Significance threshold + selective import
 * - Assistant panel with contextual guidance
 * - Virtualized lists
 */

import { useState, useMemo, useTransition, useRef, useCallback } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import {
    ChevronRight, ChevronDown, CheckCircle2, AlertCircle,
    AlertTriangle, Copy, Check, Unlink, Link2, HelpCircle,
    TrendingDown, TrendingUp, Sliders, Info, X
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCents } from "@/lib/currency-utils"
import { getGroupedCategories, getCategoryById } from "@/features/categories/config"
import { CategoryIcon } from "@/features/categories/components/category-icon"
import type { PreviewRow, MerchantGroupV2, AmountSubgroup, GroupsV2Result } from "../types"
import { DEFAULT_SIGNIFICANCE_THRESHOLD_CENTS } from "../types"
import {
    computeGroupsV2,
    applyCategoryToGroupV2,
    applyCategoryToSubgroup,
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

// Tipologia mapping
const TIPOLOGIA_MAP: Record<string, string> = {
    essential: "Essenziale",
    comfort: "Comfort",
    superfluous: "Superfluo"
}

// Assistant messages
const ASSISTANT_MESSAGES = {
    initial: {
        title: "Importazione Intelligente",
        message: "Stiamo analizzando le tue transazioni raggruppate per commerciante. I gruppi più significativi sono già selezionati."
    },
    threshold: {
        title: "Soglia di Importanza",
        message: "Regola la soglia per decidere quali gruppi importare. Per un primo import, concentrati sui gruppi più rilevanti — potrai sempre importare il resto dopo."
    },
    subgroups: {
        title: "Transazioni Ricorrenti",
        message: "Abbiamo trovato importi ripetuti (es. abbonamenti). Puoi \"slegare\" un sottogruppo per categorizzarlo diversamente."
    },
    lessSignificant: {
        title: "Gruppi Meno Significativi",
        message: "Questi gruppi sono sotto la soglia. Questa è una fotografia del passato: non serve importare tutto. Inizia dalle spese importanti."
    }
}

export function StepPreviewDesktop({
    rows,
    onRowsChange,
    onToggleRow,
    onUpdateCategory,
}: StepPreviewProps) {
    const [thresholdCents, setThresholdCents] = useState(DEFAULT_SIGNIFICANCE_THRESHOLD_CENTS)
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
    const [groupsV2State, setGroupsV2State] = useState<Map<string, MerchantGroupV2>>(new Map())
    const [showLessSignificant, setShowLessSignificant] = useState(false)
    const [showAssistant, setShowAssistant] = useState(true)
    const [isPending, startTransition] = useTransition()

    const expenseRef = useRef<HTMLDivElement>(null)
    const incomeRef = useRef<HTMLDivElement>(null)

    // Category options
    const expenseCatGroups = useMemo(() => getGroupedCategories("expense"), [])
    const incomeCatGroups = useMemo(() => getGroupedCategories("income"), [])

    // Compute groups with V2
    const baseGroups = useMemo(() =>
        computeGroupsV2(rows, { thresholdCents }),
        [rows, thresholdCents]
    )

    // Apply local state overrides (split/merge, selection)
    const groups: GroupsV2Result = useMemo(() => {
        const applyState = (groups: MerchantGroupV2[]): MerchantGroupV2[] => {
            return groups.map(g => groupsV2State.get(g.patternKey) || g)
        }
        return {
            income: applyState(baseGroups.income),
            expense: applyState(baseGroups.expense),
            all: applyState(baseGroups.all)
        }
    }, [baseGroups, groupsV2State])

    // Stats
    const stats = useMemo(() => {
        const selectedRows = rows.filter(r => r.isSelected && r.isValid)
        const significantGroups = groups.all.filter(g => g.isSignificant)
        const lessSignificantGroups = groups.all.filter(g => !g.isSignificant)

        return {
            totalGroups: groups.all.length,
            significantGroups: significantGroups.length,
            lessSignificantGroups: lessSignificantGroups.length,
            selectedRows: selectedRows.length,
            expenseTotal: groups.expense.reduce((sum, g) => sum + g.totalAbsCents, 0),
            incomeTotal: groups.income.reduce((sum, g) => sum + g.totalAbsCents, 0)
        }
    }, [groups, rows])

    // Significant vs less significant groups
    const significantExpense = useMemo(() =>
        groups.expense.filter(g => g.isSignificant), [groups.expense])
    const significantIncome = useMemo(() =>
        groups.income.filter(g => g.isSignificant), [groups.income])
    const lessSignificantGroups = useMemo(() =>
        groups.all.filter(g => !g.isSignificant), [groups.all])

    // Helpers
    const getCategoryLabel = (categoryId: string): string => {
        const cat = getCategoryById(categoryId)
        return cat?.label || categoryId
    }

    const getTipologia = (categoryId: string): string | null => {
        const allGroups = [...expenseCatGroups, ...incomeCatGroups]
        for (const group of allGroups) {
            if (group.categories.some(c => c.id === categoryId)) {
                return TIPOLOGIA_MAP[group.key] || null
            }
        }
        return null
    }

    // Handlers
    const handleThresholdChange = (value: number[]) => {
        startTransition(() => setThresholdCents(value[0]))
    }

    const toggleGroupExpand = (patternKey: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev)
            if (next.has(patternKey)) next.delete(patternKey)
            else next.add(patternKey)
            return next
        })
    }

    const handleGroupCategoryChange = (group: MerchantGroupV2, categoryId: string) => {
        startTransition(() => {
            const updatedRows = applyCategoryToGroupV2(rows, group, categoryId)
            onRowsChange(updatedRows)
        })
    }

    const handleSubgroupCategoryChange = (subgroup: AmountSubgroup, categoryId: string) => {
        startTransition(() => {
            const updatedRows = applyCategoryToSubgroup(rows, subgroup, categoryId)
            onRowsChange(updatedRows)
        })
    }

    const handleSplitSubgroup = (group: MerchantGroupV2, amountCents: number) => {
        const updated = splitSubgroup(group, amountCents)
        setGroupsV2State(prev => new Map(prev).set(group.patternKey, updated))
    }

    const handleMergeSubgroup = (group: MerchantGroupV2, amountCents: number) => {
        const updated = mergeSubgroup(group, amountCents)
        setGroupsV2State(prev => new Map(prev).set(group.patternKey, updated))
    }

    const handleGroupSelectionChange = (group: MerchantGroupV2, selected: boolean) => {
        const updated = setGroupSelected(group, selected)
        setGroupsV2State(prev => new Map(prev).set(group.patternKey, updated))

        // Also update row selection
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

    const handleIncludeAllLessSignificant = () => {
        lessSignificantGroups.forEach(group => {
            handleGroupSelectionChange(group, true)
        })
    }

    const handleToggleRow = (index: number) => {
        startTransition(() => onToggleRow(index))
    }

    const handleUpdateCategory = (index: number, catId: string) => {
        startTransition(() => onUpdateCategory(index, catId))
    }

    // Render subgroup row
    const renderSubgroup = (group: MerchantGroupV2, subgroup: AmountSubgroup) => {
        const categoryGroups = group.type === "income" ? incomeCatGroups : expenseCatGroups

        return (
            <div
                key={`${group.patternKey}-${subgroup.amountCents}`}
                className={cn(
                    "flex items-center gap-3 px-4 py-2 pl-16 border-b bg-muted/5",
                    subgroup.isSplit && "bg-primary/5 border-l-2 border-l-primary"
                )}
            >
                {/* Split indicator */}
                {subgroup.isSplit && (
                    <Badge variant="default" className="text-[9px] shrink-0">
                        Slegato
                    </Badge>
                )}

                {/* Amount × Count */}
                <div className="flex items-center gap-2 min-w-[120px]">
                    <span className="font-mono text-sm">
                        {formatCents(subgroup.amountCents)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        × {subgroup.count}
                    </span>
                </div>

                {/* Total */}
                <div className="text-sm text-muted-foreground">
                    = {formatCents(subgroup.amountCents * subgroup.count)}
                </div>

                <div className="flex-1" />

                {/* Split/Merge button */}
                {subgroup.isSplit ? (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => handleMergeSubgroup(group, subgroup.amountCents)}
                    >
                        <Link2 className="h-3 w-3 mr-1" />
                        Unisci
                    </Button>
                ) : (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => handleSplitSubgroup(group, subgroup.amountCents)}
                    >
                        <Unlink className="h-3 w-3 mr-1" />
                        Slega
                    </Button>
                )}

                {/* Category select (only if split) */}
                {subgroup.isSplit && (
                    <div className="w-40 shrink-0">
                        <Select
                            value={group.assignedCategoryId}
                            onValueChange={(v) => handleSubgroupCategoryChange(subgroup, v)}
                        >
                            <SelectTrigger className="h-7 text-xs">
                                <div className="flex items-center gap-1.5 truncate">
                                    <CategoryIcon
                                        categoryId={group.assignedCategoryId}
                                        categoryName={getCategoryLabel(group.assignedCategoryId)}
                                        size={12}
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
                                            <SelectItem key={cat.id} value={cat.id} className="text-xs">
                                                <div className="flex items-center gap-2">
                                                    <CategoryIcon categoryId={cat.id} categoryName={cat.label} size={12} />
                                                    {cat.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </div>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>
        )
    }

    // Render group row
    const renderGroupRow = (group: MerchantGroupV2, isLessSignificant = false) => {
        const isExpanded = expandedGroups.has(group.patternKey)
        const categoryGroups = group.type === "income" ? incomeCatGroups : expenseCatGroups
        const tipologia = getTipologia(group.assignedCategoryId)
        const groupRows = rows.filter(r => group.rowIndices.includes(r.rowIndex))
        const hasSubgroups = group.subgroups.length > 0

        return (
            <div key={group.patternKey} className={cn(isLessSignificant && "opacity-60")}>
                <div
                    className={cn(
                        "flex items-center gap-3 px-4 py-3 border-b hover:bg-muted/50 transition-colors",
                        isExpanded && "bg-muted/30"
                    )}
                >
                    {/* Selection checkbox */}
                    <Checkbox
                        checked={group.isGroupSelected}
                        onCheckedChange={(checked) => handleGroupSelectionChange(group, !!checked)}
                        className="shrink-0"
                    />

                    {/* Expand toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => toggleGroupExpand(group.patternKey)}
                    >
                        {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </Button>

                    {/* Group info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-medium">{group.displayName}</span>
                            {hasSubgroups && (
                                <Badge variant="outline" className="text-[9px]">
                                    {group.subgroups.length} ricorrenti
                                </Badge>
                            )}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-1">
                            {group.sampleDescriptions[0]}
                        </div>
                    </div>

                    {/* Count */}
                    <Badge variant="secondary" className="shrink-0">
                        {group.count}
                    </Badge>

                    {/* Total */}
                    <div className={cn(
                        "w-24 text-right font-medium shrink-0",
                        group.type === "income" && "text-green-600"
                    )}>
                        {group.type === "income" ? "+" : "-"}{formatCents(group.totalAbsCents)}
                    </div>

                    {/* Category select */}
                    <div className="w-44 shrink-0">
                        <Select
                            value={group.assignedCategoryId}
                            onValueChange={(v) => handleGroupCategoryChange(group, v)}
                        >
                            <SelectTrigger className="h-8 text-xs">
                                <div className="flex items-center gap-1.5 truncate">
                                    <CategoryIcon
                                        categoryId={group.assignedCategoryId}
                                        categoryName={getCategoryLabel(group.assignedCategoryId)}
                                        size={14}
                                    />
                                    <span className="truncate">{getCategoryLabel(group.assignedCategoryId)}</span>
                                    {tipologia && (
                                        <Badge variant="outline" className="text-[8px] ml-auto py-0">
                                            {tipologia}
                                        </Badge>
                                    )}
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                {categoryGroups.map(catGroup => (
                                    <div key={catGroup.key}>
                                        <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground font-bold bg-muted/50">
                                            {catGroup.label}
                                        </div>
                                        {catGroup.categories.map(cat => (
                                            <SelectItem key={cat.id} value={cat.id} className="text-xs">
                                                <div className="flex items-center gap-2">
                                                    <CategoryIcon categoryId={cat.id} categoryName={cat.label} size={14} />
                                                    {cat.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </div>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Expanded content: subgroups + rows */}
                {isExpanded && (
                    <div className="border-b">
                        {/* Subgroups */}
                        {group.subgroups.map(sg => renderSubgroup(group, sg))}

                        {/* Individual rows */}
                        {groupRows.slice(0, 20).map(row => (
                            <div
                                key={row.rowIndex}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-2 pl-16 border-b bg-background",
                                    !row.isValid && "bg-destructive/5",
                                    row.isDuplicate && "bg-amber-500/5"
                                )}
                            >
                                <Checkbox
                                    checked={row.isSelected}
                                    onCheckedChange={() => handleToggleRow(row.rowIndex)}
                                    disabled={!row.isValid}
                                    className="shrink-0"
                                />
                                <span className="text-xs text-muted-foreground w-20 shrink-0">
                                    {row.date?.slice(0, 10) || "—"}
                                </span>
                                <span className="text-sm flex-1 min-w-0 truncate">
                                    {row.description}
                                </span>
                                <span className={cn(
                                    "font-mono text-sm shrink-0",
                                    row.type === "income" && "text-green-600"
                                )}>
                                    {formatCents(Math.abs(row.amountCents))}
                                </span>
                            </div>
                        ))}
                        {groupRows.length > 20 && (
                            <div className="px-4 py-2 text-xs text-muted-foreground text-center">
                                +{groupRows.length - 20} altre righe
                            </div>
                        )}
                    </div>
                )}
            </div>
        )
    }

    // Render section header
    const renderSectionHeader = (
        type: "expense" | "income",
        groups: MerchantGroupV2[],
        total: number
    ) => {
        const Icon = type === "expense" ? TrendingDown : TrendingUp
        const label = type === "expense" ? "Uscite" : "Entrate"
        const colorClass = type === "income" ? "text-green-600" : "text-foreground"

        return (
            <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <Icon className={cn("h-4 w-4", colorClass)} />
                    <span className="font-semibold">{label}</span>
                    <Badge variant="secondary">{groups.length} gruppi</Badge>
                </div>
                <div className={cn("font-bold", colorClass)}>
                    {type === "income" ? "+" : "-"}{formatCents(total)}
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-full relative">
            <LoadingOverlay isLoading={isPending} />

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Threshold control */}
                <div className="flex-shrink-0 p-4 border-b bg-muted/30">
                    <div className="flex items-center gap-4">
                        <Sliders className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Soglia importanza</span>
                                <span className="text-sm font-mono">{formatCents(thresholdCents)}</span>
                            </div>
                            <Slider
                                value={[thresholdCents]}
                                onValueChange={handleThresholdChange}
                                min={0}
                                max={50000}
                                step={500}
                                className="w-full"
                            />
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        Gruppi con totale ≥ soglia sono selezionati di default. Sotto soglia: meno significativi.
                    </p>
                </div>

                {/* Stats bar */}
                <div className="flex-shrink-0 flex items-center gap-4 px-4 py-2 border-b text-xs">
                    <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                        <span>{stats.significantGroups} gruppi significativi</span>
                    </div>
                    {stats.lessSignificantGroups > 0 && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>{stats.lessSignificantGroups} meno significativi</span>
                        </div>
                    )}
                    <div className="flex-1" />
                    <span className="text-muted-foreground">
                        {stats.selectedRows} righe selezionate
                    </span>
                </div>

                {/* Groups list */}
                <div className="flex-1 overflow-auto">
                    {/* Expense section */}
                    {significantExpense.length > 0 && (
                        <div>
                            {renderSectionHeader("expense", significantExpense,
                                significantExpense.reduce((s, g) => s + g.totalAbsCents, 0))}
                            {significantExpense.map(g => renderGroupRow(g))}
                        </div>
                    )}

                    {/* Income section */}
                    {significantIncome.length > 0 && (
                        <div>
                            {renderSectionHeader("income", significantIncome,
                                significantIncome.reduce((s, g) => s + g.totalAbsCents, 0))}
                            {significantIncome.map(g => renderGroupRow(g))}
                        </div>
                    )}

                    {/* Less significant section */}
                    {lessSignificantGroups.length > 0 && (
                        <div className="border-t-2 border-dashed">
                            <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium text-muted-foreground">
                                        Meno significativi
                                    </span>
                                    <Badge variant="outline">{lessSignificantGroups.length}</Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleIncludeAllLessSignificant}
                                    >
                                        Includi tutti
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowLessSignificant(!showLessSignificant)}
                                    >
                                        {showLessSignificant ? "Nascondi" : "Mostra"}
                                        <ChevronDown className={cn(
                                            "h-4 w-4 ml-1 transition-transform",
                                            showLessSignificant && "rotate-180"
                                        )} />
                                    </Button>
                                </div>
                            </div>
                            {showLessSignificant && lessSignificantGroups.map(g => renderGroupRow(g, true))}
                        </div>
                    )}
                </div>
            </div>

            {/* Assistant panel */}
            {showAssistant && (
                <div className="w-72 border-l bg-muted/20 flex-shrink-0 flex flex-col">
                    <div className="flex items-center justify-between px-4 py-3 border-b">
                        <div className="flex items-center gap-2">
                            <HelpCircle className="h-4 w-4 text-primary" />
                            <span className="font-medium text-sm">Assistente</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setShowAssistant(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex-1 overflow-auto p-4 space-y-4">
                        {/* Context-aware messages */}
                        <div className="space-y-3">
                            <div className="rounded-lg border bg-background p-3">
                                <h4 className="font-medium text-sm mb-1">
                                    {ASSISTANT_MESSAGES.initial.title}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                    {ASSISTANT_MESSAGES.initial.message}
                                </p>
                            </div>

                            <div className="rounded-lg border bg-background p-3">
                                <h4 className="font-medium text-sm mb-1">
                                    <Sliders className="h-3 w-3 inline mr-1" />
                                    {ASSISTANT_MESSAGES.threshold.title}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                    {ASSISTANT_MESSAGES.threshold.message}
                                </p>
                            </div>

                            {groups.all.some(g => g.subgroups.length > 0) && (
                                <div className="rounded-lg border bg-background p-3">
                                    <h4 className="font-medium text-sm mb-1">
                                        <Unlink className="h-3 w-3 inline mr-1" />
                                        {ASSISTANT_MESSAGES.subgroups.title}
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                        {ASSISTANT_MESSAGES.subgroups.message}
                                    </p>
                                </div>
                            )}

                            {lessSignificantGroups.length > 0 && (
                                <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                                    <h4 className="font-medium text-sm mb-1 text-amber-700">
                                        <Info className="h-3 w-3 inline mr-1" />
                                        {ASSISTANT_MESSAGES.lessSignificant.title}
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                        {ASSISTANT_MESSAGES.lessSignificant.message}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Quick stats */}
                        <div className="border-t pt-4">
                            <h4 className="font-medium text-sm mb-2">Riepilogo</h4>
                            <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Uscite totali</span>
                                    <span className="font-mono">-{formatCents(stats.expenseTotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Entrate totali</span>
                                    <span className="font-mono text-green-600">+{formatCents(stats.incomeTotal)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle assistant button (when hidden) */}
            {!showAssistant && (
                <Button
                    variant="outline"
                    size="icon"
                    className="fixed bottom-20 right-6 h-10 w-10 rounded-full shadow-lg"
                    onClick={() => setShowAssistant(true)}
                >
                    <HelpCircle className="h-5 w-5" />
                </Button>
            )}
        </div>
    )
}
