"use client"

import { useState, useRef } from "react"
import { Upload, FileUp, X, CheckCircle2, FileText, AlertCircle, ArrowRight, ArrowLeft, ShieldCheck, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

import { processCSV } from "../core/pipeline"
import { ImportState } from "../core/types"
import { useTransactions } from "@/features/transactions/api/use-transactions"
import { cn } from "@/lib/utils"
import { WizardShell } from "./wizard-shell"
import { NumaEngineCard } from "@/components/patterns/numa-engine-card"
import { SubSectionCard } from "@/components/patterns/sub-section-card"

interface ImportStepUploadProps {
    onContinue: (state: ImportState) => void
    onClose: () => void
}

const IMPORT_FLOW_STEPS = [
    {
        icon: FileUp,
        colorClass: "text-primary",
        bgClass: "bg-primary/10",
        stepLabel: "Passo 1",
        title: "Controllo iniziale",
        description: "Leggo il file e tengo solo i movimenti validi."
    },
    {
        icon: Upload,
        colorClass: "text-amber-500",
        bgClass: "bg-amber-500/10",
        stepLabel: "Passo 2",
        title: "Raggruppamento movimenti",
        description: "Unisco i movimenti simili per velocizzare la revisione."
    },
    {
        icon: ShieldCheck,
        colorClass: "text-emerald-500",
        bgClass: "bg-emerald-500/10",
        stepLabel: "Passo 3",
        title: "Conferma finale",
        description: "Prima di salvare vedi un riepilogo chiaro e completo."
    }
] as const

export function ImportStepUpload({ onContinue, onClose }: ImportStepUploadProps) {
    const [csvContent, setCsvContent] = useState("")
    const [pastedContent, setPastedContent] = useState("")
    const [fileName, setFileName] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
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
                setPastedContent("")
                setIsLoading(false)
            }
        }
        reader.onerror = () => {
            setError("Impossibile leggere il file. Riprova.")
            setIsLoading(false)
        }
        reader.readAsText(file)
    }

    const handleProcess = () => {
        if (!csvContent.trim()) return

        setError(null)
        try {
            const state = processCSV(csvContent, existingTransactions)

            if (state.errors.length > 0 && state.rows.length === 0) {
                setError("Questo file non sembra nel formato giusto. Controlla intestazioni e separatore.")
                return
            }

            if (state.rows.length === 0) {
                setError("Nel file non ho trovato movimenti utilizzabili.")
                return
            }

            onContinue(state)
        } catch {
            setError("Non riesco a completare la lettura. Riprova con un file diverso.")
        }
    }

    const clearFile = () => {
        setCsvContent("")
        setFileName(null)
        setError(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
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
                <div className="grid gap-4 md:grid-cols-2">
                    <SubSectionCard
                        label="Carica file"
                        icon={<FileUp className="h-4 w-4" />}
                        className="min-h-[320px]"
                    >
                        <div
                            className={cn(
                                "relative flex h-full min-h-[240px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors",
                                fileName && "border-emerald-500/30 bg-emerald-500/5",
                                !fileName && isDragging && "border-primary/50 bg-primary/10",
                                !fileName && !isDragging && "border-border bg-muted/10 hover:border-primary/40 hover:bg-muted/20 dark:border-white/20 dark:bg-white/[0.03] dark:hover:border-primary/40 dark:hover:bg-white/[0.06]"
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
                    </SubSectionCard>

                    <SubSectionCard
                        label="Incolla testo"
                        icon={<FileText className="h-4 w-4" />}
                        className="min-h-[320px]"
                    >
                        <Textarea
                            className="h-full min-h-[240px] resize-none rounded-xl border-border bg-muted/10 p-4 font-mono text-sm focus-visible:ring-1 dark:border-white/20 dark:bg-white/[0.03]"
                            placeholder={`Data,Descrizione,Importo\n2024-01-01,Stipendio,2500.00\n...`}
                            value={pastedContent}
                            onChange={(e) => {
                                const value = e.target.value
                                setPastedContent(value)
                                setCsvContent(value)
                                setFileName(null)
                                setError(null)
                            }}
                        />
                    </SubSectionCard>
                </div>

                <NumaEngineCard
                    title="Flusso import"
                    icon={Upload}
                    className="w-full"
                    steps={IMPORT_FLOW_STEPS.map((step) => ({
                        icon: step.icon,
                        colorClass: step.colorClass,
                        bgClass: step.bgClass,
                        stepLabel: step.stepLabel,
                        title: step.title,
                        description: step.description
                    }))}
                    auditLabel="Apri dettagli"
                    certificationTitle="Controllo e trasparenza"
                    certificationSubtitle="Lettura guidata, privacy locale"
                    transparencyNote="Durante questa fase il file resta nel browser: nulla viene inviato fuori dal tuo dispositivo."
                    auditStats={[
                        {
                            label: "Righe controllate",
                            value: "100%",
                            subValue: "Ogni riga viene verificata prima del passaggio successivo."
                        },
                        {
                            label: "Duplicati",
                            value: "Gestiti",
                            subValue: "I movimenti già presenti vengono riconosciuti e segnalati."
                        },
                        {
                            label: "Revisione",
                            value: "Guidata",
                            subValue: "Trovi i gruppi già ordinati per completare la conferma più in fretta."
                        },
                        {
                            label: "Privacy",
                            value: "Locale",
                            subValue: "I dati non escono dal browser durante questo passaggio."
                        }
                    ]}
                />

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
        </WizardShell>
    )
}
