"use client"

/**
 * Step Preview Mobile
 * Card-based view for interaction on small screens
 */

import { useState, useMemo, useTransition } from "react"
import { CheckCircle2, AlertCircle, AlertTriangle, Copy, Check, Users, List, Filter } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCents } from "@/lib/currency-utils"
import { getGroupedCategories, getCategoryById } from "@/features/categories/config"
import { CategoryIcon } from "@/features/categories/components/category-icon"
import type { PreviewRow, MerchantGroup } from "../types"
import { groupRowsByMerchant, applyCategoryToGroup } from "../grouping-utils"
import { cn } from "@/lib/utils"
import { LoadingOverlay } from "./loading-overlay"

interface StepPreviewProps {
    rows: PreviewRow[]
    onRowsChange: (rows: PreviewRow[]) => void
    onToggleRow: (rowIndex: number) => void
    onUpdateCategory: (rowIndex: number, categoryId: string) => void
    onBulkUpdateCategory?: (categoryId: string) => void
}

export function StepPreviewMobile({
    rows,
    onRowsChange,
    onToggleRow,
    onUpdateCategory,
    onBulkUpdateCategory
}: StepPreviewProps) {
    const [activeTab, setActiveTab] = useState<"groups" | "rows">("groups")
    const [rowFilter, setRowFilter] = useState<"all" | "valid" | "invalid" | "duplicate">("all")
    const [isPending, startTransition] = useTransition()

    const expenseGroups = useMemo(() => getGroupedCategories("expense"), [])
    const incomeGroups = useMemo(() => getGroupedCategories("income"), [])

    // Stats
    const stats = useMemo(() => ({
        valid: rows.filter(r => r.isValid && !r.isDuplicate).length,
        invalid: rows.filter(r => !r.isValid).length,
        duplicate: rows.filter(r => r.isDuplicate).length,
        selected: rows.filter(r => r.isSelected && r.isValid).length
    }), [rows])

    const merchantGroups = useMemo(() => groupRowsByMerchant(rows), [rows])

    const filteredRows = useMemo(() => {
        return rows.filter(r => {
            if (rowFilter === "valid") return r.isValid && !r.isDuplicate
            if (rowFilter === "invalid") return !r.isValid
            if (rowFilter === "duplicate") return r.isDuplicate
            return true
        })
    }, [rows, rowFilter])

    const getCategoryLabel = (categoryId: string): string => {
        const cat = getCategoryById(categoryId)
        return cat?.label || categoryId
    }

    // Handles
    const handleTabChange = (v: string) => {
        startTransition(() => setActiveTab(v as "groups" | "rows"))
    }

    const handleFilterChange = (v: typeof rowFilter) => {
        startTransition(() => setRowFilter(v))
    }

    const handleGroupCategoryChange = (group: MerchantGroup, categoryId: string) => {
        startTransition(() => {
            const updatedRows = applyCategoryToGroup(rows, group, categoryId)
            onRowsChange(updatedRows)
        })
    }

    const handleToggleRow = (index: number) => {
        startTransition(() => onToggleRow(index))
    }

    const handleUpdateCategory = (index: number, catId: string) => {
        startTransition(() => onUpdateCategory(index, catId))
    }

    return (
        <div className="flex flex-col h-full space-y-4 relative">
            <LoadingOverlay isLoading={isPending} />

            {/* Stats Summary */}
            <div className="grid grid-cols-2 gap-2 text-xs flex-shrink-0">
                <div className="bg-muted/50 p-2 rounded border flex flex-col items-center justify-center">
                    <span className="font-bold text-lg">{stats.selected}</span>
                    <span className="text-muted-foreground">Selezionate</span>
                </div>
                <div className="bg-muted/50 p-2 rounded border flex flex-col items-center justify-center">
                    <span className="font-bold text-lg">{merchantGroups.length}</span>
                    <span className="text-muted-foreground">Gruppi</span>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col min-h-0">
                <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
                    <TabsTrigger value="groups">Gruppi</TabsTrigger>
                    <TabsTrigger value="rows">Righe</TabsTrigger>
                </TabsList>

                {/* Groups List */}
                <TabsContent value="groups" className="flex-1 overflow-y-auto min-h-0 mt-4 -mx-1 px-1">
                    <div className="space-y-3 pb-20">
                        {merchantGroups.map(group => {
                            const categoryGroups = group.type === "income" ? incomeGroups : expenseGroups
                            return (
                                <div key={`${group.merchantKey}|${group.type}`} className="border rounded-lg p-3 space-y-3 bg-card shadow-sm">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-semibold text-sm">{group.displayName}</h4>
                                            <p className="text-xs text-muted-foreground mt-0.5">{group.count} transazioni</p>
                                        </div>
                                        <div className={cn(
                                            "font-bold font-mono text-sm",
                                            group.type === "income" ? "text-green-600" : ""
                                        )}>
                                            {group.type === "income" ? "+" : "-"}{formatCents(Math.abs(group.totalAmountCents))}
                                        </div>
                                    </div>

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
                        })}
                    </div>
                </TabsContent>

                {/* Rows List */}
                <TabsContent value="rows" className="flex-1 overflow-y-auto min-h-0 mt-4 -mx-1 px-1">
                    <div className="flex gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar flex-shrink-0">
                        <Badge
                            variant={rowFilter === "all" ? "default" : "outline"}
                            onClick={() => handleFilterChange("all")}
                        >Tutte</Badge>
                        <Badge
                            variant={rowFilter === "valid" ? "default" : "outline"}
                            className={rowFilter === "valid" ? "bg-green-600" : ""}
                            onClick={() => handleFilterChange("valid")}
                        >Valide</Badge>
                        <Badge
                            variant={rowFilter === "invalid" ? "destructive" : "outline"}
                            onClick={() => handleFilterChange("invalid")}
                        >Errori ({stats.invalid})</Badge>
                        <Badge
                            variant={rowFilter === "duplicate" ? "default" : "outline"}
                            className={rowFilter === "duplicate" ? "bg-amber-500" : ""}
                            onClick={() => handleFilterChange("duplicate")}
                        >Doppie ({stats.duplicate})</Badge>
                    </div>

                    <div className="space-y-3 pb-20">
                        {filteredRows.map(row => {
                            const categoryGroups = row.type === "income" ? incomeGroups : expenseGroups
                            return (
                                <div key={row.rowIndex} className={cn(
                                    "border rounded-lg p-3 space-y-2 bg-card shadow-sm",
                                    !row.isValid && "border-destructive/50 bg-destructive/5",
                                    row.isDuplicate && "border-amber-500/50 bg-amber-500/5"
                                )}>
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            checked={row.isSelected}
                                            onCheckedChange={() => handleToggleRow(row.rowIndex)}
                                            disabled={!row.isValid}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <span className="text-xs text-muted-foreground">
                                                    {row.date ? row.date.slice(0, 10) : "No Data"}
                                                </span>
                                                <span className={cn(
                                                    "font-bold font-mono text-sm",
                                                    row.type === "income" ? "text-green-600" : ""
                                                )}>
                                                    {row.type === "income" ? "+" : "-"}{formatCents(row.amountCents)}
                                                </span>
                                            </div>
                                            <p className="font-medium text-sm truncate mt-0.5">{row.description}</p>
                                        </div>
                                    </div>

                                    {/* Warnings */}
                                    {!row.isValid && (
                                        <div className="text-xs text-destructive flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            Dati mancanti o invalidi
                                        </div>
                                    )}
                                    {row.isDuplicate && (
                                        <div className="text-xs text-amber-600 flex items-center gap-1">
                                            <Copy className="h-3 w-3" />
                                            Possibile duplicato
                                        </div>
                                    )}

                                    <Select
                                        value={row.selectedCategoryId}
                                        onValueChange={(v) => handleUpdateCategory(row.rowIndex, v)}
                                        disabled={!row.isValid}
                                    >
                                        <SelectTrigger className="h-8 w-full text-xs">
                                            <div className="flex items-center gap-2 truncate">
                                                <CategoryIcon
                                                    categoryId={row.selectedCategoryId}
                                                    categoryName={getCategoryLabel(row.selectedCategoryId)}
                                                    size={14}
                                                />
                                                <span className="truncate">{getCategoryLabel(row.selectedCategoryId)}</span>
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
                            )
                        })}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
