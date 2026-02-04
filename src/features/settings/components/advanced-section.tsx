"use client"

import { useState, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Trash2, Database, CheckCircle2, AlertCircle, Loader2, Copy, AlertTriangle, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ConfirmDialog } from "@/components/patterns/confirm-dialog"
import { queryKeys } from "@/lib/query-keys"
import { cn } from "@/lib/utils"
import { seedTransactions, __resetTransactionsCache } from "@/features/transactions/api/repository"
import { resetSettings } from "@/features/settings/api/repository"
import { resetAllData } from "@/features/settings/backup/backup-utils"
import { buildDiagnosticsSnapshot, DiagnosticsSnapshot } from "@/features/settings/diagnostics/diagnostics-utils"
import { MacroSection } from "@/components/patterns/macro-section"

type ResetType = "transactions" | "budgets" | "settings" | "all" | null

export function AdvancedSection() {
    const queryClient = useQueryClient()

    // Diagnostics
    const [diagnostics, setDiagnostics] = useState<DiagnosticsSnapshot | null>(null)
    const [copyFeedback, setCopyFeedback] = useState<"idle" | "success" | "error">("idle")

    // Reset state
    const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [resetDialog, setResetDialog] = useState<ResetType>(null)

    useEffect(() => {
        // Initial load
        setDiagnostics(buildDiagnosticsSnapshot())

        // Poll for changes every 2s
        const intervalId = setInterval(() => {
            setDiagnostics(buildDiagnosticsSnapshot())
        }, 2000)

        return () => clearInterval(intervalId)
    }, [])

    const handleCopyDiagnostics = async () => {
        if (!diagnostics) return
        try {
            await navigator.clipboard.writeText(JSON.stringify(diagnostics, null, 2))
            setCopyFeedback("success")
            setTimeout(() => setCopyFeedback("idle"), 2000)
        } catch (e) {
            console.error("Copy failed", e)
            setCopyFeedback("error")
            setTimeout(() => setCopyFeedback("idle"), 2000)
        }
    }

    const invalidateAll = async () => {
        __resetTransactionsCache()
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all }),
            queryClient.invalidateQueries({ queryKey: queryKeys.transactions.recent }),
            queryClient.invalidateQueries({ queryKey: queryKeys.budget.all }),
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
            queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() }),
            queryClient.invalidateQueries({ queryKey: queryKeys.categories.active() }),
        ])
    }

    const handleConfirmReset = async () => {
        if (!resetDialog) return

        setIsLoading(true)
        setStatus(null)

        try {
            switch (resetDialog) {
                case "transactions": {
                    const { resetTransactions } = await import("@/features/settings/backup/backup-utils")
                    resetTransactions()
                    __resetTransactionsCache()
                    await Promise.all([
                        queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all }),
                        queryClient.invalidateQueries({ queryKey: queryKeys.transactions.recent }),
                        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
                    ])
                    setStatus({ type: "success", message: "Tutte le transazioni sono state eliminate." })
                    break
                }
                case "budgets": {
                    const { resetBudgets } = await import("@/features/settings/backup/backup-utils")
                    resetBudgets()
                    await Promise.all([
                        queryClient.invalidateQueries({ queryKey: queryKeys.budget.all }),
                        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
                    ])
                    setStatus({ type: "success", message: "Tutti i budget sono stati eliminati." })
                    break
                }
                case "settings": {
                    resetSettings()
                    await queryClient.invalidateQueries({ queryKey: queryKeys.settings() })
                    setStatus({ type: "success", message: "Le impostazioni sono state ripristinate." })
                    break
                }
                case "all": {
                    resetAllData()
                    resetSettings()
                    await invalidateAll()
                    await queryClient.invalidateQueries({ queryKey: queryKeys.settings() })
                    setStatus({ type: "success", message: "Tutti i dati sono stati eliminati con successo." })
                    break
                }
            }
            // Refresh diagnostics after reset
            setDiagnostics(buildDiagnosticsSnapshot())
        } catch (error) {
            console.error("Reset error:", error)
            setStatus({ type: "error", message: "Si è verificato un errore durante l'operazione." })
        } finally {
            setIsLoading(false)
            setResetDialog(null)
        }
    }

    const handleSeed = async () => {
        setIsLoading(true)
        setStatus(null)

        try {
            seedTransactions()
            await invalidateAll()
            setDiagnostics(buildDiagnosticsSnapshot())
            setStatus({ type: "success", message: "Dati demo caricati con successo." })
        } catch (error) {
            console.error("Seed error:", error)
            setStatus({ type: "error", message: "Si è verificato un errore durante il caricamento dei dati demo." })
        } finally {
            setIsLoading(false)
        }
    }

    const getResetDialogContent = () => {
        switch (resetDialog) {
            case "transactions":
                return {
                    title: "Elimina Transazioni",
                    description: "Sei sicuro di voler eliminare TUTTE le transazioni? Questa azione è irreversibile."
                }
            case "budgets":
                return {
                    title: "Elimina Budget",
                    description: "Sei sicuro di voler eliminare TUTTI i piani di budget? Questa azione è irreversibile."
                }
            case "settings":
                return {
                    title: "Ripristina Impostazioni",
                    description: "Sei sicuro di voler ripristinare le impostazioni predefinite?"
                }
            case "all":
                return {
                    title: "Reset Totale",
                    description: "Vuoi davvero eliminare tutti i dati? Questa azione cancellerà permanentemente tutte le transazioni, i piani di budget e le impostazioni. Questa azione è irreversibile."
                }
            default:
                return { title: "", description: "" }
        }
    }

    const dialogContent = getResetDialogContent()

    return (
        <>
            <div className="space-y-6">
                <div className="space-y-6">
                    {/* Diagnostics */}
                    <MacroSection
                        title={
                            <div className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                                <Wrench className="h-6 w-6" />
                                About & Diagnostics
                            </div>
                        }
                        description="Informazioni tecniche sulla versione e sullo stato dei dati locali."
                    >
                        {diagnostics ? (
                            <div className="space-y-4">
                                <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">Versione:</span>
                                        <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">{diagnostics.app.version}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">Ambiente:</span>
                                        <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">{diagnostics.app.env}</span>
                                    </div>
                                    <div className="flex items-center gap-2 ml-auto">
                                        <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">Storage Totale:</span>
                                        <span className={cn(
                                            "font-mono font-bold text-xs",
                                            diagnostics.totalApproxBytes > 1024 * 1024 ? "text-amber-600" : "text-primary"
                                        )}>
                                            {diagnostics.totalApproxBytes > 1024 * 50
                                                ? `${(diagnostics.totalApproxBytes / 1024 / 1024).toFixed(2)} MB`
                                                : `${(diagnostics.totalApproxBytes / 1024).toFixed(1)} KB`
                                            }
                                        </span>
                                    </div>
                                </div>

                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Storage Key</TableHead>
                                                <TableHead className="w-[100px]">Stato</TableHead>
                                                <TableHead className="w-[100px]">Size</TableHead>
                                                <TableHead>Dettagli</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {diagnostics.storage.map((item) => (
                                                <TableRow key={item.key}>
                                                    <TableCell className="font-mono text-xs text-muted-foreground">{item.key}</TableCell>
                                                    <TableCell>
                                                        {item.present ? (
                                                            <span className="text-green-600 font-medium text-xs">Presente</span>
                                                        ) : (
                                                            <span className="text-muted-foreground text-xs">Mancante</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-xs">
                                                        {Math.round(item.approxBytes / 1024 * 10) / 10} KB
                                                    </TableCell>
                                                    <TableCell className="text-xs text-muted-foreground">
                                                        {item.summary}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                <div className="flex justify-end">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCopyDiagnostics}
                                        className="gap-2"
                                        disabled={copyFeedback !== "idle"}
                                    >
                                        {copyFeedback === "success" ? (
                                            <>
                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                Copiato
                                            </>
                                        ) : copyFeedback === "error" ? (
                                            <>
                                                <AlertCircle className="h-4 w-4 text-destructive" />
                                                Errore
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-4 w-4" />
                                                Copia diagnostica
                                            </>
                                        )}
                                    </Button>
                                </div>

                                <div className="text-[10px] text-muted-foreground">
                                    Generated at: {diagnostics.generatedAt}
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground">
                                Caricamento diagnostica in corso... (disponibile solo nel browser)
                            </div>
                        )}
                    </MacroSection>

                    {/* Danger Zone */}
                    <MacroSection
                        status="critical"
                        title={
                            <div className="flex items-center gap-2 text-2xl font-bold tracking-tight text-destructive">
                                <Trash2 className="h-6 w-6" />
                                Gestione Dati e Ripristino
                            </div>
                        }
                        description="Azioni distruttive per rimuovere i dati dall'applicazione."
                    >
                        {status && (
                            <Alert variant={status.type === "success" ? "default" : "destructive"} className={`mb-6 ${status.type === "success" ? "border-green-500/20 bg-green-500/5 text-green-600 dark:text-green-400" : ""}`}>
                                {status.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                <AlertTitle>{status.type === "success" ? "Operazione completata" : "Errore"}</AlertTitle>
                                <AlertDescription>{status.message}</AlertDescription>
                            </Alert>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            {/* Granular Resets */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium">Reset Granulare</h3>

                                <div className="flex flex-col gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setResetDialog("transactions")}
                                        disabled={isLoading}
                                        className="justify-start text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                                    >
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                        Elimina solo transazioni
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={() => setResetDialog("budgets")}
                                        disabled={isLoading}
                                        className="justify-start text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                                    >
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                        Elimina solo budget
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={() => setResetDialog("settings")}
                                        disabled={isLoading}
                                        className="justify-start text-muted-foreground hover:bg-muted"
                                    >
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                        Reset Impostazioni
                                    </Button>
                                </div>
                            </div>

                            {/* Full Reset / Seed */}
                            <div className="space-y-4 border-t sm:border-t-0 sm:border-l pt-4 sm:pt-0 sm:pl-8">
                                <h3 className="text-sm font-medium">Azioni Globali</h3>

                                <div className="flex flex-col gap-2">
                                    <Button
                                        variant="destructive"
                                        onClick={() => setResetDialog("all")}
                                        disabled={isLoading}
                                        className="w-full"
                                    >
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                        Reset totale (Tutto)
                                    </Button>

                                    <div className="h-2"></div>

                                    <Button
                                        variant="outline"
                                        onClick={handleSeed}
                                        disabled={isLoading}
                                        className="w-full"
                                    >
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
                                        Carica dati demo
                                    </Button>
                                    <p className="text-[10px] text-muted-foreground mt-1 text-center">
                                        Rimuove tutto e carica dati di esempio
                                    </p>
                                </div>
                            </div>
                        </div>
                    </MacroSection>

                    {/* Privacy Note */}
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Nota sulla privacy</AlertTitle>
                        <AlertDescription>
                            NUMA Budget è un&apos;applicazione &quot;local-first&quot;. I tuoi dati non lasciano mai questo dispositivo e non vengono inviati a nessun server esterno.
                        </AlertDescription>
                    </Alert>
                </div>
            </div>


            {/* Confirmation Dialog */}
            <ConfirmDialog
                open={!!resetDialog}
                onOpenChange={(open) => !open && setResetDialog(null)}
                title={
                    resetDialog === "all" ? (
                        <>
                            <AlertTriangle className="h-5 w-5" />
                            {dialogContent.title}
                        </>
                    ) : dialogContent.title
                }
                description={dialogContent.description}
                onConfirm={handleConfirmReset}
                isLoading={isLoading}
                variant={resetDialog === "all" ? "destructive" : "default"}
            />
        </>
    )
}
