"use client"

/**
 * CSV Import Wizard
 * Multi-step UI for importing bank transactions from CSV
 */

import { useState, useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { X, Upload, FileSpreadsheet, Eye, Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { queryKeys } from "@/lib/query-keys"
import { __resetTransactionsCache } from "@/features/transactions/api/repository"

import type { CSVFormat, MappingState, PreviewRow, ImportBatch } from "../types"
import { detectCSVFormat, parseCSVToRows, autoDetectMapping } from "../csv-parser"
import { checkDuplicate, checkInternalDuplicates } from "../dedupe-utils"
import {
    generateImportId,
    bulkCreateTransactions,
    saveImportBatch,
    fetchExistingTransactions
} from "../import-service"

import { StepUpload } from "./step-upload"
import { StepMapping } from "./step-mapping"
import { StepPreview } from "./step-preview"

type WizardStep = "upload" | "mapping" | "preview" | "importing" | "done"

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
        } catch (err) {
            setError("Errore nel parsing del CSV. Verifica il formato del file.")
        }
    }, [])

    // Handle mapping confirmation
    const handleMappingConfirm = useCallback(() => {
        if (!format) return

        try {
            const parsed = parseCSVToRows(csvText, format, mappingState)
            const existingTx = fetchExistingTransactions()
            const internalDupes = checkInternalDuplicates(parsed)

            const preview: PreviewRow[] = parsed.map(row => {
                const dupCheck = checkDuplicate(row, existingTx)
                const internalDupe = internalDupes.get(row.rowIndex)

                return {
                    ...row,
                    isValid: row.parseErrors.length === 0 && row.date !== null && row.amountCents > 0,
                    isDuplicate: dupCheck.isDuplicate || !!internalDupe,
                    duplicateReason: dupCheck.reason || internalDupe,
                    selectedCategoryId: "other", // Default uncategorized
                    isSelected: !dupCheck.isDuplicate && !internalDupe // Exclude duplicates by default
                }
            })

            setPreviewRows(preview)
            setStep("preview")
        } catch (err) {
            setError("Errore nella generazione dell'anteprima.")
        }
    }, [csvText, format, mappingState])

    // Handle import confirmation
    const handleImportConfirm = useCallback(async () => {
        setStep("importing")
        setError(null)

        try {
            const importId = generateImportId()
            const created = bulkCreateTransactions(
                previewRows,
                importId,
                "other",
                "Altro"
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
        } catch (err) {
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

    const currentStepIdx = steps.findIndex(s => s.id === step || (step === "importing" && s.id === "done"))

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5" />
                        Importa da CSV
                    </DialogTitle>
                    <DialogDescription>
                        Importa transazioni da un file CSV scaricato dalla tua banca.
                    </DialogDescription>
                </DialogHeader>

                {/* Step Indicator */}
                <div className="flex items-center justify-center gap-2 py-4 border-b">
                    {steps.map((s, idx) => (
                        <div key={s.id} className="flex items-center gap-2">
                            <div className={`
                                flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium
                                ${idx < currentStepIdx ? "bg-primary text-primary-foreground" : ""}
                                ${idx === currentStepIdx ? "bg-primary text-primary-foreground ring-2 ring-primary/20" : ""}
                                ${idx > currentStepIdx ? "bg-muted text-muted-foreground" : ""}
                            `}>
                                <s.icon className="h-4 w-4" />
                            </div>
                            {idx < steps.length - 1 && (
                                <div className={`w-8 h-0.5 ${idx < currentStepIdx ? "bg-primary" : "bg-muted"}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Error display */}
                {error && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Step Content */}
                <div className="flex-1 overflow-auto py-4">
                    {step === "upload" && (
                        <StepUpload onFileUpload={handleFileUpload} />
                    )}

                    {step === "mapping" && format && (
                        <StepMapping
                            format={format}
                            mappingState={mappingState}
                            onMappingChange={setMappingState}
                        />
                    )}

                    {step === "preview" && (
                        <StepPreview
                            rows={previewRows}
                            onToggleRow={toggleRowSelection}
                            onUpdateCategory={updateRowCategory}
                        />
                    )}

                    {step === "importing" && (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-muted-foreground">Importazione in corso...</p>
                        </div>
                    )}

                    {step === "done" && importResult && (
                        <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                            <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                                <Check className="h-8 w-8 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Importazione completata!</h3>
                                <p className="text-muted-foreground">
                                    {importResult.count} transazioni importate con successo.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
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
                                    disabled={previewRows.filter(r => r.isSelected && r.isValid).length === 0}
                                >
                                    Importa ({previewRows.filter(r => r.isSelected && r.isValid).length})
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
