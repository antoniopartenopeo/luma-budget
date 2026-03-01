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
import { WizardShell } from "./wizard-shell"
import { SubSectionCard } from "@/components/patterns/sub-section-card"
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

    const footer = (
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
            <Button
                variant="ghost"
                className="h-11 rounded-xl px-4 text-muted-foreground hover:text-foreground"
                onClick={onClose}
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Chiudi
            </Button>

            <Button
                onClick={handleProcess}
                disabled={!canContinue}
                className={cn(
                    "h-11 gap-2 rounded-xl px-6 font-semibold shadow-md transition-all",
                    canContinue && "hover:shadow-primary/25 hover:-translate-y-[1px]"
                )}
            >
                Continua
                <ArrowRight className="h-4 w-4" />
            </Button>
        </div>
    )

    return (
        <WizardShell
            title="Carica i movimenti"
            subtitle="Importa il file della banca e ti guidiamo passo passo."
            step="upload"
            footer={footer}
        >
            <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/10 px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                        <span className="font-semibold">Prova veloce</span>
                        <span className="text-muted-foreground">Carica dati demo in pochi secondi.</span>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        className="h-9 shrink-0 rounded-xl px-4"
                        disabled={isDemoLoading || isLoading}
                        onClick={() => setIsDemoDialogOpen(true)}
                    >
                        {isDemoLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Carica dati demo
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <SubSectionCard
                        label="Carica file"
                        icon={<FileUp className="h-4 w-4" />}
                        className="min-h-[320px]"
                    >
                        <div className="flex h-full min-h-[240px] flex-col rounded-xl border border-border/60 bg-gradient-to-br from-primary/[0.08] via-background to-muted/20 p-5 dark:from-primary/[0.14] dark:to-white/[0.03]">
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant="outline"
                                    className="inline-flex items-center gap-1.5 border-primary/30 bg-primary/10 text-primary"
                                >
                                    <FileUp className="h-3.5 w-3.5" />
                                    CSV o TXT
                                </Badge>
                            </div>

                            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                                Trascina il file o clicca nell&apos;area qui sotto per selezionarlo dal dispositivo.
                            </p>

                            <div
                                className={cn(
                                    "relative mt-4 flex flex-1 min-h-[168px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors",
                                    fileName && "border-emerald-500/30 bg-emerald-500/5",
                                    !fileName && isDragging && "border-primary/50 bg-primary/10",
                                    !fileName && !isDragging && "border-border/70 bg-background/70 hover:border-primary/40 hover:bg-background dark:border-white/20 dark:bg-white/[0.03] dark:hover:border-primary/40 dark:hover:bg-white/[0.06]"
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

                                {isLoading ? (
                                    <div className="space-y-3">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <Loader2 className="h-6 w-6 animate-spin-slow" />
                                        </div>
                                        <p className="text-sm font-medium text-foreground">Sto leggendo il file</p>
                                    </div>
                                ) : fileName ? (
                                    <div className="w-full max-w-md space-y-3">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
                                            <CheckCircle2 className="h-6 w-6" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="truncate text-base font-semibold tracking-tight text-foreground">{fileName}</p>
                                            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">File pronto</p>
                                        </div>
                                        <div className="pt-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    clearFile()
                                                }}
                                                className="rounded-xl text-muted-foreground hover:text-destructive"
                                            >
                                                <X className="mr-1.5 h-4 w-4" />
                                                Rimuovi file
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="pointer-events-none space-y-4">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <Upload className="h-6 w-6" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <p className="text-base font-semibold tracking-tight text-foreground">Trascina qui il file CSV</p>
                                            <p className="text-sm text-muted-foreground">oppure clicca per selezionarlo</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </SubSectionCard>

                    <SubSectionCard
                        label="Collegamento banca"
                        icon={<Building2 className="h-4 w-4" />}
                        className="min-h-[320px]"
                    >
                        <div className="flex h-full min-h-[240px] flex-col rounded-xl border border-border/60 bg-gradient-to-br from-primary/[0.08] via-background to-muted/20 p-5 dark:from-primary/[0.14] dark:to-white/[0.03]">
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant="outline"
                                    className="inline-flex items-center gap-1.5 border-primary/30 bg-primary/10 text-primary"
                                >
                                    <Clock3 className="h-3.5 w-3.5" />
                                    Standby
                                </Badge>
                            </div>

                            <div className="mt-4 space-y-2">
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    Stiamo completando la verifica normativa. Appena attivo potrai importare i movimenti in modo automatico.
                                </p>
                            </div>

                            <div className="mt-4 space-y-2.5 rounded-lg border border-border/60 bg-background/70 p-3">
                                <div className="flex items-start gap-2 text-sm text-foreground">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                    <span>Autorizzazione sicura direttamente dalla tua banca.</span>
                                </div>
                                <div className="flex items-start gap-2 text-sm text-foreground">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                    <span>Movimenti importati senza dover scaricare il CSV.</span>
                                </div>
                            </div>
                        </div>
                    </SubSectionCard>
                </div>

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
            </div>

            <ConfirmDialog
                open={isDemoDialogOpen}
                onOpenChange={setIsDemoDialogOpen}
                title="Caricare dati demo?"
                description="Questa azione sostituisce le transazioni attuali con un dataset di esempio."
                confirmLabel="Carica demo"
                cancelLabel="Annulla"
                onConfirm={handleLoadDemoData}
                isLoading={isDemoLoading}
            />
        </WizardShell>
    )
}
