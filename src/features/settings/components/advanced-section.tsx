"use client"

import { useState, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Trash2, CheckCircle2, AlertCircle, Loader2, Copy, AlertTriangle, Info } from "lucide-react"
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
import { __resetTransactionsCache } from "@/features/transactions/api/repository"
import { __resetCategoriesCache } from "@/features/categories/api/repository"
import { resetSettings } from "@/features/settings/api/repository"
import { resetAllData } from "@/features/settings/backup/backup-utils"
import { buildDiagnosticsSnapshot, DiagnosticsSnapshot } from "@/features/settings/diagnostics/diagnostics-utils"
import { DiagnosticsMetaStrip } from "@/features/settings/diagnostics/components/diagnostics-meta-strip"
import { MacroSection } from "@/components/patterns/macro-section"

type ResetType = "transactions" | "settings" | "all" | null

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
                    setStatus({ type: "success", message: "Tutti i dati locali registrati sono stati eliminati con successo." })
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

    const getResetDialogContent = () => {
        switch (resetDialog) {
            case "transactions":
                return {
                    title: "Elimina Transazioni",
                    description: "Sei sicuro di voler eliminare TUTTE le transazioni? Questa azione è irreversibile."
                }
            case "settings":
                return {
                    title: "Ripristina Impostazioni",
                    description: "Sei sicuro di voler ripristinare le impostazioni predefinite?"
                }
            case "all":
                return {
                    title: "Reset Totale",
                    description: "Vuoi davvero eliminare tutti i dati? Questa azione cancellerà permanentemente transazioni, categorie, impostazioni, portfolio legacy, stato notifiche e preferenze privacy. Questa azione è irreversibile."
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
                    <Alert className="border-amber-500/20 bg-amber-500/6 text-amber-700 dark:text-amber-300">
                        <Info className="h-4 w-4" />
                        <AlertTitle>Sezione tecnica</AlertTitle>
                        <AlertDescription>
                            Questa area serve per controlli e reset avanzati. Se usi Numa ogni giorno, nella maggior parte dei casi puoi ignorarla.
                        </AlertDescription>
                    </Alert>

                    {/* Diagnostics */}
                    <MacroSection
                        title="Diagnostica locale"
                        description="Versione app, stato dello storage e riepilogo dei dati salvati sul dispositivo."
                    >
                        {diagnostics ? (
                            <div className="space-y-4">
                                <DiagnosticsMetaStrip diagnostics={diagnostics} />

                                <div className="rounded-[1.75rem] border border-white/25 bg-white/35 p-2 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.03]">
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
                                        className="gap-2 rounded-full border-white/30 bg-white/55 dark:border-white/12 dark:bg-white/[0.06]"
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

                                <div className="text-xs font-medium text-muted-foreground">
                                    Generato alle: {diagnostics.generatedAt}
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground">
                                Sto preparando la diagnostica locale... disponibile solo nel browser.
                            </div>
                        )}
                    </MacroSection>

                    {/* Danger Zone */}
                    <MacroSection
                        status="critical"
                        title="Reset e pulizia dati"
                        description="Azioni irreversibili sui dati salvati nell'app."
                    >
                        {status && (
                            <Alert variant={status.type === "success" ? "default" : "destructive"} className={`mb-6 ${status.type === "success" ? "border-green-500/20 bg-green-500/5 text-green-600 dark:text-green-400" : ""}`}>
                                {status.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                <AlertTitle>{status.type === "success" ? "Operazione completata" : "Errore"}</AlertTitle>
                                <AlertDescription>{status.message}</AlertDescription>
                            </Alert>
                        )}

                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                            {/* Granular Resets */}
                            <div className="surface-subtle space-y-4 p-5">
                                <h3 className="text-sm font-bold tracking-tight">Reset Granulare</h3>

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
                            <div className="surface-subtle space-y-4 p-5">
                                <h3 className="text-sm font-bold tracking-tight">Azioni Globali</h3>

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
                                </div>
                            </div>
                        </div>
                    </MacroSection>

                    {/* Privacy Note */}
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Nota sulla privacy</AlertTitle>
                        <AlertDescription>
                            NUMA Budget salva e legge i dati locali di questa app sul dispositivo. Se una futura integrazione remota verra abilitata, il relativo flusso dovra dichiararlo in modo esplicito.
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
