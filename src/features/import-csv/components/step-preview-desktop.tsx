"use client"

/**
 * Step Preview Desktop
 * Table-based view for larger screens
 */

import { useState, useMemo, useTransition } from "react"
import { CheckCircle2, AlertCircle, AlertTriangle, Copy, Check, Users, List, Loader2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCents } from "@/lib/currency-utils"
import { getGroupedCategories, getCategoryById } from "@/features/categories/config"
import { CategoryIcon } from "@/features/categories/components/category-icon"
import type { PreviewRow, MerchantGroup } from "../types"
import { groupRowsByMerchant, applyCategoryToGroup } from "../grouping-utils"
import { LoadingOverlay } from "./loading-overlay"

interface StepPreviewProps {
    rows: PreviewRow[]
    onRowsChange: (rows: PreviewRow[]) => void
    onToggleRow: (rowIndex: number) => void
    onUpdateCategory: (rowIndex: number, categoryId: string) => void
    onBulkUpdateCategory?: (categoryId: string) => void
}

export function StepPreviewDesktop({
    rows,
    onRowsChange,
    onToggleRow,
    onUpdateCategory,
    onBulkUpdateCategory
}: StepPreviewProps) {
    const [activeTab, setActiveTab] = useState<"groups" | "rows">("groups")
    const [rowFilter, setRowFilter] = useState<"all" | "valid" | "invalid" | "duplicate">("all")
    const [isPending, startTransition] = useTransition()

    // Get expense categories grouped by spending nature
    const expenseGroups = useMemo(() => getGroupedCategories("expense"), [])
    const incomeGroups = useMemo(() => getGroupedCategories("income"), [])

    // Compute stats
    const stats = useMemo(() => ({
        valid: rows.filter(r => r.isValid && !r.isDuplicate).length,
        invalid: rows.filter(r => !r.isValid).length,
        duplicate: rows.filter(r => r.isDuplicate).length,
        selected: rows.filter(r => r.isSelected && r.isValid).length,
        uncategorized: rows.filter(r => r.isSelected && r.isValid && (r.selectedCategoryId === "altro" || r.selectedCategoryId === "entrate-occasionali")).length
    }), [rows])

    // Compute merchant groups
    const merchantGroups = useMemo(() => groupRowsByMerchant(rows), [rows])

    // Filter rows for Rows tab
    const filteredRows = useMemo(() => {
        return rows.filter(r => {
            if (rowFilter === "valid") return r.isValid && !r.isDuplicate
            if (rowFilter === "invalid") return !r.isValid
            if (rowFilter === "duplicate") return r.isDuplicate
            return true
        })
    }, [rows, rowFilter])

    // Get category label for display
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
        // Individual toggles are usually fast, but wrap just in case
        startTransition(() => onToggleRow(index))
    }

    const handleUpdateCategory = (index: number, catId: string) => {
        startTransition(() => onUpdateCategory(index, catId))
    }

    return (
        <div className="space-y-4 h-full flex flex-col relative">
            <LoadingOverlay isLoading={isPending} />

            {/* Stats Bar */}
            <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {stats.valid} valide
                </Badge>
                {stats.invalid > 0 && (
                    <Badge variant="destructive">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {stats.invalid} invalide
                    </Badge>
                )}
                {stats.duplicate > 0 && (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                        <Copy className="h-3 w-3 mr-1" />
                        {stats.duplicate} duplicati
                    </Badge>
                )}
                <div className="flex-1" />
                <span className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{stats.selected}</span> selezionate
                </span>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col min-h-0">
                <TabsList className="grid w-full max-w-md grid-cols-2 flex-shrink-0">
                    <TabsTrigger value="groups" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Gruppi ({merchantGroups.length})
                    </TabsTrigger>
                    <TabsTrigger value="rows" className="flex items-center gap-2">
                        <List className="h-4 w-4" />
                        Righe ({rows.length})
                    </TabsTrigger>
                </TabsList>

                {/* Groups Tab */}
                <TabsContent value="groups" className="flex-1 mt-4 min-h-0 flex flex-col">
                    <div className="border rounded-lg h-full overflow-hidden flex flex-col bg-background">
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-sm relative">
                                <thead className="bg-muted sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Merchant</th>
                                        <th className="px-4 py-3 text-center font-medium w-24">N°</th>
                                        <th className="px-4 py-3 text-right font-medium w-32">Totale</th>
                                        <th className="px-4 py-3 text-left font-medium w-48">Categoria</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {merchantGroups.map(group => {
                                        const categoryGroups = group.type === "income" ? incomeGroups : expenseGroups

                                        return (
                                            <tr key={`${group.merchantKey}|${group.type}`} className="border-t hover:bg-muted/50">
                                                <td className="px-4 py-3">
                                                    <div className="font-medium">{group.displayName}</div>
                                                    <div className="text-xs text-muted-foreground truncate max-w-[300px]" title={group.sampleDescriptions.join(" | ")}>
                                                        {group.sampleDescriptions[0]}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <Badge variant="secondary">{group.count}</Badge>
                                                </td>
                                                <td className={`px-4 py-3 text-right font-medium ${group.type === "income" ? "text-green-600" : ""}`}>
                                                    {group.type === "income" ? "+" : "-"}{formatCents(Math.abs(group.totalAmountCents))}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Select
                                                        value={group.assignedCategoryId}
                                                        onValueChange={(v) => handleGroupCategoryChange(group, v)}
                                                    >
                                                        <SelectTrigger className="h-8 w-full text-xs">
                                                            <div className="flex items-center gap-1.5 truncate">
                                                                <CategoryIcon
                                                                    categoryId={group.assignedCategoryId}
                                                                    categoryName={getCategoryLabel(group.assignedCategoryId)}
                                                                    size={14}
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
                                                                                <CategoryIcon categoryId={cat.id} categoryName={cat.label} size={14} />
                                                                                {cat.label}
                                                                            </div>
                                                                        </SelectItem>
                                                                    ))}
                                                                </div>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </TabsContent>

                {/* Rows Tab */}
                <TabsContent value="rows" className="flex-1 mt-4 space-y-4 min-h-0 flex flex-col">
                    {/* Row Filters */}
                    <div className="flex gap-2 flex-shrink-0">
                        <button
                            onClick={() => handleFilterChange("all")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${rowFilter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                                }`}
                        >
                            Tutte ({rows.length})
                        </button>
                        <button
                            onClick={() => handleFilterChange("valid")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${rowFilter === "valid" ? "bg-green-500 text-white" : "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                                }`}
                        >
                            <CheckCircle2 className="h-3 w-3" />
                            Valide ({stats.valid})
                        </button>
                        {stats.invalid > 0 && (
                            <button
                                onClick={() => handleFilterChange("invalid")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${rowFilter === "invalid" ? "bg-destructive text-destructive-foreground" : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                                    }`}
                            >
                                <AlertCircle className="h-3 w-3" />
                                Invalide ({stats.invalid})
                            </button>
                        )}
                        {stats.duplicate > 0 && (
                            <button
                                onClick={() => handleFilterChange("duplicate")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${rowFilter === "duplicate" ? "bg-amber-500 text-white" : "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
                                    }`}
                            >
                                <Copy className="h-3 w-3" />
                                Duplicati ({stats.duplicate})
                            </button>
                        )}
                    </div>

                    {/* Rows Table */}
                    <div className="border rounded-lg h-full overflow-hidden flex flex-col bg-background">
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-sm relative">
                                <thead className="bg-muted sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="w-10 px-3 py-2"></th>
                                        <th className="px-3 py-2 text-left font-medium">Data</th>
                                        <th className="px-3 py-2 text-left font-medium">Descrizione</th>
                                        <th className="px-3 py-2 text-left font-medium">Categoria</th>
                                        <th className="px-3 py-2 text-right font-medium">Importo</th>
                                        <th className="px-3 py-2 text-center font-medium">Stato</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRows.map(row => {
                                        const categoryGroups = row.type === "income" ? incomeGroups : expenseGroups

                                        return (
                                            <tr
                                                key={row.rowIndex}
                                                className={`border-t ${!row.isValid ? "bg-destructive/5" : row.isDuplicate ? "bg-amber-500/5" : ""}`}
                                            >
                                                <td className="px-3 py-2">
                                                    <Checkbox
                                                        checked={row.isSelected}
                                                        onCheckedChange={() => handleToggleRow(row.rowIndex)}
                                                        disabled={!row.isValid}
                                                    />
                                                </td>
                                                <td className="px-3 py-2 whitespace-nowrap">
                                                    {row.date ? row.date.slice(0, 10) : <span className="text-destructive">—</span>}
                                                </td>
                                                <td className="px-3 py-2 truncate max-w-[200px]" title={row.description}>
                                                    {row.description}
                                                </td>
                                                <td className="px-3 py-2">
                                                    <Select
                                                        value={row.selectedCategoryId}
                                                        onValueChange={(v) => handleUpdateCategory(row.rowIndex, v)}
                                                        disabled={!row.isValid}
                                                    >
                                                        <SelectTrigger className="h-7 w-[140px] text-xs">
                                                            <div className="flex items-center gap-1.5 truncate">
                                                                <CategoryIcon
                                                                    categoryId={row.selectedCategoryId}
                                                                    categoryName={getCategoryLabel(row.selectedCategoryId)}
                                                                    size={12}
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
                                                </td>
                                                <td className={`px-3 py-2 text-right whitespace-nowrap font-medium ${row.type === "income" ? "text-green-600" : ""
                                                    }`}>
                                                    {row.type === "income" ? "+" : "-"}{formatCents(row.amountCents)}
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    {!row.isValid && (
                                                        <Badge variant="destructive" className="text-[10px]">
                                                            <AlertCircle className="h-3 w-3 mr-1" />
                                                            Errore
                                                        </Badge>
                                                    )}
                                                    {row.isValid && row.isDuplicate && (
                                                        <Badge variant="outline" className="text-[10px] border-amber-500 text-amber-600">
                                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                                            Duplicato
                                                        </Badge>
                                                    )}
                                                    {row.isValid && !row.isDuplicate && row.isSelected && (
                                                        <Badge variant="outline" className="text-[10px] border-green-500 text-green-600">
                                                            <Check className="h-3 w-3 mr-1" />
                                                            OK
                                                        </Badge>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
