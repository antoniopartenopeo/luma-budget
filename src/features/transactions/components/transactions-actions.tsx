"use client"

import { Download, MoreHorizontal, Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CsvImportWizard } from "@/features/import-csv/components/csv-import-wizard"

interface TransactionsActionsProps {
    onAdd?: () => void
    onExportView: () => void
    onExportAll: () => void
    isExporting?: boolean
    hasResults: boolean
}

export function TransactionsActions({
    onAdd,
    onExportView,
    onExportAll,
    isExporting,
    hasResults
}: TransactionsActionsProps) {
    return (
        <div className="flex items-center gap-2">
            {/* Action 1: Add New */}
            {onAdd && (
                <Button
                    onClick={onAdd}
                    className="h-10 rounded-xl font-bold gap-2 px-6 shadow-md transition-all active:scale-95"
                >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Nuova</span>
                </Button>
            )}

            {/* Action 2: Import CSV (Existing Component) */}
            <CsvImportWizard />

            {/* Action 3: Export & More */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-10 w-10 sm:w-auto rounded-xl gap-2 font-bold px-0 sm:px-4"
                        disabled={isExporting}
                    >
                        {isExporting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4 opacity-70" />
                        )}
                        <span className="hidden sm:inline">Esporta</span>
                        <MoreHorizontal className="h-4 w-4 opacity-50 ml-1 hidden sm:block" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-muted-foreground/10 shadow-xl">
                    <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2 py-1.5 gray-500">
                        Formato CSV
                    </DropdownMenuLabel>
                    <DropdownMenuItem
                        onClick={onExportView}
                        disabled={!hasResults}
                        className="rounded-xl gap-2 py-2.5 cursor-pointer"
                    >
                        <Download className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-col">
                            <span className="font-bold">Vista filtrata</span>
                            <span className="text-[10px] text-muted-foreground">Esporta solo i risultati attuali</span>
                        </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={onExportAll}
                        className="rounded-xl gap-2 py-2.5 cursor-pointer"
                    >
                        <Download className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-col">
                            <span className="font-bold">Tutte le transazioni</span>
                            <span className="text-[10px] text-muted-foreground">Esporta l&apos;intero archivio</span>
                        </div>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
