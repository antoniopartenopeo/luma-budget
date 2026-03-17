"use client"

import { useState, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Upload, FileUp, X, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, Loader2, Building2, Clock3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { processCSV } from "../core/pipeline"
import { ImportState } from "../core/types"
import { useTransactions } from "@/features/transactions/api/use-transactions"
import { cn } from "@/lib/utils"
import { ConfirmDialog } from "@/components/patterns/confirm-dialog"
import { queryKeys } from "@/lib/query-keys"
import { seedTransactions, __resetTransactionsCache } from "@/features/transactions/api/repository"
import { __resetCategoriesCache } from "@/features/categories/api/repository"

interface ImportStepUploadProps {
    onContinue: (state: ImportState) => void
    onClose: () => void
}

export function ImportStepUpload({ onContinue, onClose }: ImportStepUploadProps) {
    const queryClient = useQueryClient()
    const [csvContent, setCsvContent] = useState("")
    const [fileName, setFileName] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isDemoLoading, setIsDemoLoading] = useState(false)
    const [isDemoDialogOpen, setIsDemoDialogOpen] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const { data: existingTransactions = [] } = useTransactions()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        readFile(file)
    }

    const readFile = (file: File) => {
        setError(null)
        setFileName(file.name)
        setIsLoading(true)

        const reader = new FileReader()
        reader.onload = (event) => {
            const text = event.target?.result
            if (typeof text === "string") {
                setCsvContent(text)
                setIsLoading(false)
            }
        }
        reader.onerror = () => {
            setError("Impossibile leggere il file. Riprova.")
            setIsLoading(false)
        }
        reader.readAsText(file)
    }

    const processInput = (content: string) => {
        if (!content.trim()) return false
        setError(null)
        try {
            const state = processCSV(content, existingTransactions)

            if (state.errors.length > 0 && state.rows.length === 0) {
                setError("Questo file non sembra nel formato giusto. Controlla intestazioni e separatore.")
                return false
            }

            if (state.rows.length === 0) {
                setError("Nel file non ho trovato movimenti utilizzabili.")
                return false
            }

            onContinue(state)
            return true
        } catch {
            setError("Non riesco a completare la lettura. Riprova con un file diverso.")
            return false
        }
    }

    const handleProcess = () => {
        processInput(csvContent)
    }

    const clearFile = () => {
        setCsvContent("")
        setFileName(null)
        setError(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const invalidateAll = async () => {
        __resetTransactionsCache()
        __resetCategoriesCache()
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all }),
            queryClient.invalidateQueries({ queryKey: queryKeys.transactions.recent }),
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
            queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() }),
            queryClient.invalidateQueries({ queryKey: queryKeys.categories.active() }),
            queryClient.invalidateQueries({ queryKey: queryKeys.settings() }),
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications.state }),
        ])
    }

    const handleLoadDemoData = async () => {
        setIsDemoLoading(true)
        setError(null)

        try {
            seedTransactions()
            await invalidateAll()
            onClose()
        } catch (loadError) {
            console.error("Demo load error:", loadError)
            setError("Non riesco a caricare i dati demo. Riprova.")
        } finally {
            setIsDemoLoading(false)
            setIsDemoDialogOpen(false)
        }
    }

    // New Drag & Drop Handlers
    const [isDragging, setIsDragging] = useState(false)

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (file && (file.name.endsWith(".csv") || file.name.endsWith(".txt"))) {
            readFile(file)
        } else {
            setError("Carica un file in formato CSV o TXT.")
        }
    }

    const handleDropZoneKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (fileName) return
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            fileInputRef.current?.click()
        }
    }

    const hasInput = csvContent.trim().length > 0
    const canContinue = hasInput && !isLoading

    return (
        <div className="flex flex-col gap-6">
            {/* Header Area */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                        Carica i movimenti
                    </h2>
                    <p className="text-sm font-medium text-muted-foreground">
                        Importa il file della banca e ti accompagno passo dopo passo.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="h-9 rounded-xl px-4"
                        disabled={isDemoLoading || isLoading}
                        onClick={() => setIsDemoDialogOpen(true)}
                    >
                        {isDemoLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Carica dati demo
                    </Button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                        <div className="space-y-1">
                            <p className="font-semibold">Non riesco a proseguire</p>
                            <p>{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Upload Card (Merged Drag & Drop) */}
                <div
                    className={cn(
                        "relative flex min-h-[300px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[2rem] border-2 border-dashed p-8 text-center transition-all duration-200",
                        fileName ? "border-emerald-500/30 bg-emerald-500/5" :
                            isDragging ? "border-primary/50 bg-primary/10 scale-[1.02]" :
                                "border-border/60 bg-muted/20 hover:border-primary/40 hover:bg-muted/40"
                    )}
                    role="button"
                    tabIndex={fileName ? -1 : 0}
                    aria-label="Carica file CSV o TXT"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onKeyDown={handleDropZoneKeyDown}
                    onClick={() => !fileName && fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        accept=".csv,.txt"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />

                    <div className="absolute top-6 left-6 hidden sm:flex items-center gap-2 font-semibold text-muted-foreground">
                        <FileUp className="h-5 w-5 text-primary" />
                        <span>Seleziona file</span>
                    </div>
                    <div className="absolute top-6 right-6">
                        <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                            CSV o TXT
                        </Badge>
                    </div>

                    <div className="mt-8 flex flex-col items-center justify-center space-y-4">
                        {isLoading ? (
                            <div className="space-y-4">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <Loader2 className="h-7 w-7 animate-spin-slow" />
                                </div>
                                <p className="text-sm font-medium text-foreground">Lettura del file in corso...</p>
                            </div>
                        ) : fileName ? (
                            <div className="w-full max-w-sm space-y-4">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="h-7 w-7" />
                                </div>
                                <div className="space-y-1">
                                    <p className="truncate text-lg font-semibold tracking-tight text-foreground">{fileName}</p>
                                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">File elaborato con successo</p>
                                </div>
                                <div className="pt-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            clearFile()
                                        }}
                                        className="h-9 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                    >
                                        <X className="mr-2 h-4 w-4" />
                                        Rimuovi file
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="pointer-events-none space-y-4">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <Upload className="h-7 w-7" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-lg font-semibold tracking-tight text-foreground">Trascina il file qui</p>
                                    <p className="text-sm font-medium text-muted-foreground">oppure clicca per cercare nel dispositivo</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bank Sync Info Card */}
                <div className="relative flex min-h-[300px] flex-col overflow-hidden rounded-[2rem] border border-border/50 bg-background/50 p-8 shadow-sm backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2 font-semibold text-muted-foreground">
                            <Building2 className="h-5 w-5" />
                            <span className="hidden sm:inline">Sincronizzazione</span>
                        </div>
                        <Badge variant="outline" className="border-border/50 bg-transparent text-muted-foreground">
                            Prossimamente
                        </Badge>
                    </div>

                    <div className="flex flex-1 flex-col items-center justify-center space-y-5 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/40">
                            <Clock3 className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                        <div className="space-y-2 max-w-[250px]">
                            <h3 className="font-semibold text-foreground">Import Automatico</h3>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                In futuro potrai collegare il tuo conto bancario per sincronizzare le transazioni in automatico.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-4 flex w-full items-center justify-between border-t border-border/40 pt-6">
                <Button
                    variant="ghost"
                    className="h-12 rounded-xl px-5 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    onClick={onClose}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Annulla
                </Button>

                <Button
                    onClick={handleProcess}
                    disabled={!canContinue}
                    className={cn(
                        "h-12 gap-2 rounded-xl px-8 font-semibold shadow-lg transition-all duration-200",
                        canContinue && "hover:-translate-y-[1px] hover:shadow-primary/25"
                    )}
                >
                    Analizza Righe
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </div>

            <ConfirmDialog
                open={isDemoDialogOpen}
                onOpenChange={setIsDemoDialogOpen}
                title="Caricare dati demo?"
                description="Questa azione sostituisce le transazioni attuali con un dataset di esempio per farti testare il sistema."
                confirmLabel="Carica demo"
                cancelLabel="Annulla"
                onConfirm={handleLoadDemoData}
                isLoading={isDemoLoading}
            />
        </div>
    )
}
