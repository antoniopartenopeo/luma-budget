"use client"

import { useState, useRef } from "react"
import { Upload, ArrowRight, AlertCircle, FileText, FileUp, X, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { processCSV } from "../core/pipeline"
import { ImportState } from "../core/types"
import { useTransactions } from "@/features/transactions/api/use-transactions"
import { cn } from "@/lib/utils"

interface ImportStepUploadProps {
    onContinue: (state: ImportState) => void
}

export function ImportStepUpload({ onContinue }: ImportStepUploadProps) {
    const [csvContent, setCsvContent] = useState("")
    const [fileName, setFileName] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Using simple string tab state to track mode if needed, but Tabs handles visibility
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
        reader.readAsText(file) // Assumes UTF-8 usually safe for CSV
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
                setError("Non ho trovato nessuna transazione valida in questo file o testo.")
                return
            }

            onContinue(state)
        } catch (e: any) {
            setError("Qualcosa è andato storto nel processare i dati. Riprova o controlla il formato.")
        }
    }

    const clearFile = () => {
        setCsvContent("")
        setFileName(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    return (
        <div className="flex flex-col h-full bg-background/50 animate-in fade-in duration-300">
            {/* Header Area */}
            <div className="p-6 border-b shrink-0 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        1
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">Carica i tuoi dati</h2>
                </div>
                <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
                    Questo import serve a dare un contesto iniziale, come una
                    <span className="font-semibold text-foreground/80"> fotografia del passato</span>.
                    Non serve la perfezione: il vero valore inizia da oggi.
                </p>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6 md:px-12 space-y-8">

                <div className="grid md:grid-cols-12 gap-10">
                    {/* Left: Input Methods */}
                    <div className="md:col-span-7 space-y-6">
                        <Tabs defaultValue="upload" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="upload" className="gap-2">
                                    <FileUp className="h-4 w-4" /> Upload File
                                </TabsTrigger>
                                <TabsTrigger value="paste" className="gap-2">
                                    <FileText className="h-4 w-4" /> Incolla Testo
                                </TabsTrigger>
                            </TabsList>

                            {/* TAB: Upload */}
                            <TabsContent value="upload" className="mt-0 outline-none">
                                <Card className={cn(
                                    "border-2 border-dashed h-64 flex flex-col items-center justify-center text-center p-6 space-y-4 transition-all",
                                    fileName ? "border-green-500/30 bg-green-50/10" : "border-muted-foreground/20 hover:border-primary/30 hover:bg-muted/50"
                                )}>
                                    <input
                                        type="file"
                                        accept=".csv,.txt"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                    />

                                    {fileName ? (
                                        <div className="animate-in zoom-in-95 duration-300 flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                                <CheckCircle2 className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-lg">{fileName}</p>
                                                <p className="text-xs text-muted-foreground">Pronto per l&apos;analisi</p>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={clearFile} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                                <X className="h-4 w-4 mr-1" /> Rimuovi
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 cursor-pointer w-full h-full flex flex-col items-center justify-center" onClick={() => fileInputRef.current?.click()}>
                                            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                                <Upload className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-lg">Seleziona un file CSV</p>
                                                <p className="text-sm text-muted-foreground">o trascinalo qui</p>
                                            </div>
                                            <Button variant="secondary" className="mt-2 pointer-events-none">Sfoglia Files</Button>
                                        </div>
                                    )}
                                </Card>
                            </TabsContent>

                            {/* TAB: Paste */}
                            <TabsContent value="paste" className="mt-0 outline-none">
                                <Card className="p-1 border-input shadow-sm">
                                    <Textarea
                                        className="w-full h-64 p-4 border-none resize-none focus-visible:ring-0 font-mono text-xs"
                                        placeholder={`Data,Descrizione,Importo\n2024-01-01,Stipendio,2500.00\n...`}
                                        value={csvContent}
                                        onChange={(e) => {
                                            setCsvContent(e.target.value)
                                            setFileName(null)
                                        }}
                                    />
                                </Card>
                            </TabsContent>
                        </Tabs>

                        {/* Error Message */}
                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm flex items-start gap-3 animate-in slide-in-from-top-2 border border-red-100">
                                <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                                <div className="space-y-1">
                                    <p className="font-semibold">Si è verificato un problema</p>
                                    <p>{error}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Helper Info */}
                    <div className="md:col-span-5 space-y-6">
                        <div className="p-5 rounded-2xl bg-muted/30 border space-y-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <span>Istruzioni Rapide</span>
                            </h3>
                            <ul className="text-sm text-muted-foreground space-y-3">
                                <li className="flex gap-3">
                                    <div className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">1</div>
                                    <span>Scarica l&apos;estratto conto dalla tua banca in formato <strong>Excel</strong> o <strong>CSV</strong>.</span>
                                </li>
                                <li className="flex gap-3">
                                    <div className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">2</div>
                                    <span>Assicurati che ci siano almeno le colonne: <br /><strong>Data</strong> e <strong>Importo</strong>.</span>
                                </li>
                                <li className="flex gap-3">
                                    <div className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">3</div>
                                    <span>La <strong>Descrizione</strong> è fortemente consigliata per categorizzare in automatico.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="text-xs text-muted-foreground p-4">
                            <p className="font-medium text-foreground mb-1">Nota sulla Privacy:</p>
                            I tuoi dati vengono elaborati esclusivamente nel tuo browser. Nessun dato lascia il tuo dispositivo finché non confermi l&apos;importazione.
                        </div>
                    </div>
                </div>

            </div>

            {/* Footer Action */}
            <div className="p-6 border-t bg-muted/20 shrink-0 flex justify-end">
                <Button
                    onClick={handleProcess}
                    disabled={!csvContent.trim() || isLoading}
                    size="lg"
                    className="gap-2 rounded-xl px-8 shadow-lg transition-all"
                >
                    Analizza Dati
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
