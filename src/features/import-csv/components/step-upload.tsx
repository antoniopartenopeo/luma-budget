"use client"

import { useState, useRef } from "react"
import { Upload, FileUp, X, CheckCircle2, FileText, AlertCircle, ArrowRight, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { processCSV } from "../core/pipeline"
import { ImportState } from "../core/types"
import { useTransactions } from "@/features/transactions/api/use-transactions"
import { cn } from "@/lib/utils"
import { WizardShell } from "./wizard-shell"
import { BankCsvHelpSection } from "./bank-csv-help-section"
import { MacroSection } from "@/components/patterns/macro-section"

interface ImportStepUploadProps {
    onContinue: (state: ImportState) => void
    onClose: () => void
}

export function ImportStepUpload({ onContinue, onClose }: ImportStepUploadProps) {
    const [csvContent, setCsvContent] = useState("")
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
                setError(`Non riesco a leggere questo CSV. Errore: ${state.errors[0].message}`)
                return
            }

            if (state.rows.length === 0) {
                setError("Non ho trovato nessuna transazione valida.")
                return
            }

            onContinue(state)
        } catch {
            setError("Qualcosa è andato storto. Riprova o controlla il formato.")
        }
    }

    const clearFile = () => {
        setCsvContent("")
        setFileName(null)
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
        if (file && (file.name.endsWith('.csv') || file.name.endsWith('.txt'))) {
            readFile(file)
        } else {
            setError("Per favore carica un file CSV o TXT valido.")
        }
    }

    const footer = (
        <div className="flex w-full justify-between items-center">
            <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
                onClick={onClose}
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Chiudi
            </Button>

            {/* Secure Note */}
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground opacity-60">
                <CheckCircle2 className="h-3 w-3" />
                <span>Solo nel tuo browser</span>
            </div>

            <Button
                onClick={handleProcess}
                disabled={!csvContent.trim() || isLoading}
                size="lg"
                className={cn(
                    "gap-2 rounded-full px-8 shadow-lg transition-all duration-300",
                    csvContent.trim() ? "shadow-primary/25 hover:shadow-primary/40 translate-y-0 opacity-100" : "opacity-80 translate-y-1"
                )}
            >
                Analizza Dati
                <ArrowRight className="h-4 w-4" />
            </Button>
        </div>
    )

    return (
        <WizardShell
            title="Importa Transazioni"
            subtitle="Carica l'estratto conto. Al resto pensiamo noi."
            step="upload"
            footer={footer}
        >
            <div className="flex flex-col items-center justify-center space-y-5 min-h-[30vh] animate-enter-up">
                {/* 3. Drop Zone / Tabs */}
                <MacroSection className="w-full max-w-3xl" contentClassName="p-0">
                    <Tabs defaultValue="upload" className="w-full flex flex-col">
                        <TabsList className="w-full grid grid-cols-2 rounded-t-[2.25rem] border-b bg-muted/30 p-0 h-11 overflow-hidden">
                            <TabsTrigger value="upload" className="h-full rounded-none data-[state=active]:bg-card data-[state=active]:shadow-none border-r border-transparent data-[state=active]:border-border/50 transition-all gap-2 text-base">
                                <FileUp className="h-4 w-4" /> Upload File
                            </TabsTrigger>
                            <TabsTrigger value="paste" className="h-full rounded-none data-[state=active]:bg-card data-[state=active]:shadow-none gap-2 text-base">
                                <FileText className="h-4 w-4" /> Incolla Testo
                            </TabsTrigger>
                        </TabsList>

                        <div className="p-6 bg-gradient-to-b from-card to-muted/20 rounded-b-[2.25rem] overflow-hidden">
                            <TabsContent value="upload" className="mt-0 outline-none">
                                <div
                                    className={cn(
                                        "relative group cursor-pointer flex flex-col items-center justify-center text-center p-6 border-2 border-dashed rounded-xl transition-all duration-300 min-h-[150px]",
                                        isDragging ? "border-primary bg-primary/5 scale-[0.99]" : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/30",
                                        fileName ? "border-emerald-500/50 bg-emerald-500/5" : ""
                                    )}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => !fileName && fileInputRef.current?.click()}
                                >
                                    <input
                                        type="file"
                                        accept=".csv,.txt"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                    />

                                    {fileName ? (
                                        <div className="animate-in zoom-in-50 duration-300 flex flex-row items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                                                <CheckCircle2 className="h-6 w-6" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="font-bold text-xl tracking-tight">{fileName}</p>
                                                <p className="text-emerald-600 dark:text-emerald-400 font-medium text-sm">File pronto</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => { e.stopPropagation(); clearFile(); }}
                                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 mt-2"
                                            >
                                                <X className="h-4 w-4 mr-1" /> Rimuovi file
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-6 pointer-events-none">
                                            <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/5">
                                                <Upload className="h-6 w-6" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-bold text-xl tracking-tight">Trascina il CSV qui</p>
                                                <p className="text-muted-foreground text-sm font-medium">o clicca per selezionare</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="paste" className="mt-0 outline-none">
                                <Textarea
                                    className="w-full h-[150px] p-4 border rounded-xl resize-none font-mono text-xs bg-muted/30 focus:bg-card transition-colors ring-offset-0 focus-visible:ring-1"
                                    placeholder={`Data,Descrizione,Importo\n2024-01-01,Stipendio,2500.00\n...`}
                                    value={csvContent}
                                    onChange={(e) => {
                                        setCsvContent(e.target.value)
                                        setFileName(null)
                                    }}
                                />
                            </TabsContent>

                            {/* Error Message */}
                            {error && (
                                <div className="mt-8 p-4 rounded-xl bg-destructive/5 text-destructive border border-destructive/10 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                    <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                                    <div className="space-y-1">
                                        <p className="font-bold">Si è verificato un problema</p>
                                        <p>{error}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Tabs>
                </MacroSection>

                <BankCsvHelpSection />

            </div>
        </WizardShell>
    )
}
