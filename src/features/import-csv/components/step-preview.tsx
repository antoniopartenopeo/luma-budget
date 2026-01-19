"use client"

/**
 * Step Preview - Preview and validate import before confirming
 */

import { useState } from "react"
import { CheckCircle2, AlertCircle, AlertTriangle, Copy, Check } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { formatCents } from "@/lib/currency-utils"
import type { PreviewRow } from "../types"

interface StepPreviewProps {
    rows: PreviewRow[]
    onToggleRow: (rowIndex: number) => void
    onUpdateCategory: (rowIndex: number, categoryId: string) => void
}

export function StepPreview({ rows, onToggleRow }: StepPreviewProps) {
    const [filter, setFilter] = useState<"all" | "valid" | "invalid" | "duplicate">("all")

    // Stats
    const validCount = rows.filter(r => r.isValid && !r.isDuplicate).length
    const invalidCount = rows.filter(r => !r.isValid).length
    const duplicateCount = rows.filter(r => r.isDuplicate).length
    const selectedCount = rows.filter(r => r.isSelected && r.isValid).length

    // Filter rows
    const filteredRows = rows.filter(r => {
        if (filter === "valid") return r.isValid && !r.isDuplicate
        if (filter === "invalid") return !r.isValid
        if (filter === "duplicate") return r.isDuplicate
        return true
    })

    return (
        <div className="space-y-4">
            {/* Stats Bar */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setFilter("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                >
                    Tutte ({rows.length})
                </button>
                <button
                    onClick={() => setFilter("valid")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${filter === "valid" ? "bg-green-500 text-white" : "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                        }`}
                >
                    <CheckCircle2 className="h-3 w-3" />
                    Valide ({validCount})
                </button>
                <button
                    onClick={() => setFilter("invalid")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${filter === "invalid" ? "bg-destructive text-destructive-foreground" : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                        }`}
                >
                    <AlertCircle className="h-3 w-3" />
                    Invalide ({invalidCount})
                </button>
                <button
                    onClick={() => setFilter("duplicate")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${filter === "duplicate" ? "bg-amber-500 text-white" : "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
                        }`}
                >
                    <Copy className="h-3 w-3" />
                    Duplicati ({duplicateCount})
                </button>
            </div>

            {/* Selection Summary */}
            <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{selectedCount}</span> transazioni selezionate per l&apos;importazione
            </div>

            {/* Rows Table */}
            <div className="border rounded-lg overflow-hidden max-h-[300px] overflow-y-auto">
                <table className="w-full text-sm">
                    <thead className="bg-muted sticky top-0">
                        <tr>
                            <th className="w-10 px-3 py-2"></th>
                            <th className="px-3 py-2 text-left font-medium">Data</th>
                            <th className="px-3 py-2 text-left font-medium">Descrizione</th>
                            <th className="px-3 py-2 text-right font-medium">Importo</th>
                            <th className="px-3 py-2 text-center font-medium">Stato</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRows.map(row => (
                            <tr
                                key={row.rowIndex}
                                className={`border-t ${!row.isValid ? "bg-destructive/5" : row.isDuplicate ? "bg-amber-500/5" : ""}`}
                            >
                                <td className="px-3 py-2">
                                    <Checkbox
                                        checked={row.isSelected}
                                        onCheckedChange={() => onToggleRow(row.rowIndex)}
                                        disabled={!row.isValid}
                                    />
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap">
                                    {row.date ? row.date.slice(0, 10) : <span className="text-destructive">—</span>}
                                </td>
                                <td className="px-3 py-2 truncate max-w-[200px]" title={row.description}>
                                    {row.description}
                                </td>
                                <td className={`px-3 py-2 text-right whitespace-nowrap font-medium ${row.type === "income" ? "text-green-600" : "text-foreground"
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
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Duplicate Reason Tooltip */}
            {filteredRows.some(r => r.isDuplicate && r.duplicateReason) && filter === "duplicate" && (
                <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    <p className="font-medium mb-1">Perché sono considerate duplicate?</p>
                    <p>Una transazione è considerata duplicata se ha la stessa data (±1 giorno), descrizione simile e stesso importo.</p>
                </div>
            )}
        </div>
    )
}
