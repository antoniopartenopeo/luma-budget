"use client"

/**
 * CSV Import Wizard
 * Multi-step UI for importing bank transactions from CSV
 * 
 * V2.1: Responsive Shell integration
 */

import { useState, useCallback, useMemo } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Upload, FileSpreadsheet, Eye, Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { queryKeys } from "@/lib/query-keys"
import { __resetTransactionsCache } from "@/features/transactions/api/repository"
import { cn } from "@/lib/utils"

import type { CSVFormat, MappingState, PreviewRow, ImportBatch } from "../types"
import { detectCSVFormat, parseCSVToRows, autoDetectMapping } from "../csv-parser"
import { checkDuplicateWithMap, checkInternalDuplicates, buildExistingKeysMap } from "../dedupe-utils"
import {
    generateImportId,
    bulkCreateTransactions,
    saveImportBatch,
    fetchExistingTransactions
} from "../import-service"

import { StepUpload } from "./step-upload"
import { StepMapping } from "./step-mapping"
import { StepPreview } from "./step-preview"
import { WizardShell } from "./wizard-shell"

type WizardStep = "upload" | "mapping" | "processing" | "preview" | "importing" | "done"

interface CSVImportWizardProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CSVImportWizard({ open, onOpenChange }: CSVImportWizardProps) {
    const queryClient = useQueryClient()

    // Wizard state
    const [step, setStep] = useState<WizardStep>("upload")
    const [filename, setFilename] = useState("")
    const [csvText, setCsvText] = useState("")
    const [format, setFormat] = useState<CSVFormat | null>(null)
    const [mappingState, setMappingState] = useState<MappingState>({
        mapping: { date: null, description: null, amount: null, debit: null, credit: null },
        dateFormat: "auto",
        amountFormat: "single"
    })
    const [previewRows, setPreviewRows] = useState<PreviewRow[]>([])
    const [importResult, setImportResult] = useState<{ count: number } | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [processingProgress, setProcessingProgress] = useState(0)

    // Reset wizard
    const resetWizard = useCallback(() => {
        setStep("upload")
        setFilename("")
        setCsvText("")
        setFormat(null)
        setMappingState({
            mapping: { date: null, description: null, amount: null, debit: null, credit: null },
            dateFormat: "auto",
            amountFormat: "single"
        })
        setPreviewRows([])
        setImportResult(null)
        setError(null)
        setProcessingProgress(0)
    }, [])

    // Handle file upload
    const handleFileUpload = useCallback((file: File, text: string) => {
        setFilename(file.name)
        setCsvText(text)
        setError(null)

        try {
            const detected = detectCSVFormat(text)
            setFormat(detected)

            // Auto-detect mapping
            const autoMapping = autoDetectMapping(detected.headers)
            setMappingState(prev => ({
                ...prev,
                mapping: autoMapping,
                amountFormat: (autoMapping.debit || autoMapping.credit) ? "split" : "single"
            }))

            setStep("mapping")
        } catch {
            setError("Errore nel parsing del CSV. Verifica il formato del file.")
        }
    }, [])

    // Handle mapping confirmation - now with processing state
    const handleMappingConfirm = useCallback(async () => {
        if (!format) return

        setStep("processing")
        setProcessingProgress(0)
        setError(null)

        // Use setTimeout to allow UI to update before heavy computation
        setTimeout(() => {
            try {
                setProcessingProgress(20)
                const parsed = parseCSVToRows(csvText, format, mappingState)

                setProcessingProgress(40)
                const existingTx = fetchExistingTransactions()
                // Pre-build Map for O(1) lookups instead of O(n×m)
                const existingKeysMap = buildExistingKeysMap(existingTx)

                setProcessingProgress(60)
                const internalDupes = checkInternalDuplicates(parsed)

                setProcessingProgress(80)
                const preview: PreviewRow[] = parsed.map(row => {
                    const dupCheck = checkDuplicateWithMap(row, existingKeysMap)
                    const internalDupe = internalDupes.get(row.rowIndex)

                    return {
                        ...row,
                        isValid: row.parseErrors.length === 0 && row.date !== null && row.amountCents > 0,
                        isDuplicate: dupCheck.isDuplicate || !!internalDupe,
                        duplicateReason: dupCheck.reason || internalDupe,
                        selectedCategoryId: row.type === "income" ? "entrate-occasionali" : "altro",
                        isSelected: !dupCheck.isDuplicate && !internalDupe
                    }
                })

                setProcessingProgress(100)
                setPreviewRows(preview)

                // Small delay to show 100% before transitioning
                setTimeout(() => setStep("preview"), 200)
            } catch {
                setError("Errore nella generazione dell'anteprima.")
                setStep("mapping")
            }
        }, 50)
    }, [csvText, format, mappingState])

    // Handle import confirmation
    const handleImportConfirm = useCallback(async () => {
        setStep("importing")
        setError(null)

        try {
            const importId = generateImportId()
            const created = bulkCreateTransactions(
                previewRows,
                importId
            )

            // Save to history
            const batch: ImportBatch = {
                id: importId,
                importedAt: new Date().toISOString(),
                filename: filename,
                transactionCount: created.length
            }
            saveImportBatch(batch)

            // Invalidate queries
            __resetTransactionsCache()
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all }),
                queryClient.invalidateQueries({ queryKey: queryKeys.transactions.recent }),
                queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
            ])

            setImportResult({ count: created.length })
            setStep("done")
        } catch {
            setError("Errore durante l'importazione. Nessuna transazione è stata salvata.")
            setStep("preview")
        }
    }, [previewRows, filename, queryClient])

    // Toggle row selection
    const toggleRowSelection = useCallback((rowIndex: number) => {
        setPreviewRows(prev => prev.map(r =>
            r.rowIndex === rowIndex ? { ...r, isSelected: !r.isSelected } : r
        ))
    }, [])

    // Update category for row
    const updateRowCategory = useCallback((rowIndex: number, categoryId: string) => {
        setPreviewRows(prev => prev.map(r =>
            r.rowIndex === rowIndex ? { ...r, selectedCategoryId: categoryId } : r
        ))
    }, [])

    // Bulk update category for uncategorized rows
    const bulkUpdateCategory = useCallback((categoryId: string) => {
        setPreviewRows(prev => prev.map(r =>
            (r.isSelected && r.isValid && (r.selectedCategoryId === "altro" || r.selectedCategoryId === "entrate-occasionali"))
                ? { ...r, selectedCategoryId: categoryId }
                : r
        ))
    }, [])

    // Close handler
    const handleClose = useCallback(() => {
        onOpenChange(false)
        setTimeout(resetWizard, 300)
    }, [onOpenChange, resetWizard])

    // Step indicators
    const steps = [
        { id: "upload", label: "Carica", icon: Upload },
        { id: "mapping", label: "Mappa", icon: FileSpreadsheet },
        { id: "preview", label: "Anteprima", icon: Eye },
        { id: "done", label: "Completa", icon: Check },
    ]

    // Computed stats for footer
    const selectedCount = useMemo(() =>
        previewRows.filter(r => r.isSelected && r.isValid).length,
        [previewRows]
    )

    // Footer Component
    const footerContent = (
        <div className="flex items-center justify-between w-full">
            <Button variant="ghost" onClick={handleClose}>
                {step === "done" ? "Chiudi" : "Annulla"}
            </Button>

            <div className="flex gap-2">
                {step === "mapping" && (
                    <>
                        <Button variant="outline" onClick={() => setStep("upload")}>
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Indietro
                        </Button>
                        <Button onClick={handleMappingConfirm}>
                            Anteprima
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </>
                )}

                {step === "preview" && (
                    <>
                        <Button variant="outline" onClick={() => setStep("mapping")}>
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Indietro
                        </Button>
                        <Button
                            onClick={handleImportConfirm}
                            disabled={selectedCount === 0}
                        >
                            Importa ({selectedCount})
                        </Button>
                    </>
                )}
            </div>
        </div>
    )

    return (
        <WizardShell
            open={open}
            onOpenChange={onOpenChange}
            onClose={handleClose}
            title={step === "done" ? "Importazione Completata" : "Importa da CSV"}
            subtitle={step === "done" ? undefined : (filename || "Carica il file della tua banca")}
            currentStepId={step}
            steps={steps}
            footer={footerContent}
        >
            {/* Error display */}
            {error && (
                <div className="mx-4 mt-4 md:mx-6 md:mt-6 mb-0 bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg">
                    {error}
                </div>
            )}

            {step === "upload" && (
                <div className="h-full overflow-auto p-4 md:p-6">
                    <StepUpload onFileUpload={handleFileUpload} />
                </div>
            )}

            {step === "mapping" && format && (
                <div className="h-full overflow-auto p-4 md:p-6">
                    <StepMapping
                        format={format}
                        mappingState={mappingState}
                        onMappingChange={setMappingState}
                    />
                </div>
            )}

            {step === "processing" && (
                <div className="h-full overflow-auto p-4 md:p-6 flex flex-col items-center justify-center min-h-[300px]">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <div className="text-center space-y-2 mt-6">
                        <h3 className="text-lg font-semibold">Analisi in corso...</h3>
                        <p className="text-muted-foreground">
                            Stiamo analizzando le transazioni e verificando i duplicati.
                        </p>
                    </div>
                    <div className="w-64 mt-6">
                        <Progress value={processingProgress} className="h-2" />
                        <p className="text-xs text-muted-foreground text-center mt-2">
                            {processingProgress}%
                        </p>
                    </div>
                </div>
            )}

            {step === "preview" && (
                <div className="h-full overflow-hidden p-4 md:p-6 flex flex-col">
                    <StepPreview
                        rows={previewRows}
                        onRowsChange={setPreviewRows}
                        onToggleRow={toggleRowSelection}
                        onUpdateCategory={updateRowCategory}
                        onBulkUpdateCategory={bulkUpdateCategory}
                    />
                </div>
            )}

            {step === "importing" && (
                <div className="h-full overflow-auto p-4 md:p-6 flex flex-col items-center justify-center min-h-[300px]">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <div className="text-center mt-6">
                        <h3 className="text-lg font-semibold">Importazione in corso...</h3>
                        <p className="text-muted-foreground">
                            {selectedCount} transazioni in fase di salvataggio.
                        </p>
                    </div>
                </div>
            )}

            {step === "done" && importResult && (
                <div className="h-full overflow-auto p-4 md:p-6 flex flex-col items-center justify-center text-center min-h-[300px]">
                    <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center">
                        <Check className="h-10 w-10 text-green-600" />
                    </div>
                    <div className="mt-6">
                        <h3 className="text-2xl font-bold">Importazione completata!</h3>
                        <p className="text-muted-foreground mt-2">
                            {importResult.count} transazioni importate con successo.
                        </p>
                    </div>
                </div>
            )}
        </WizardShell>
    )
}
