"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Trash2, Database, Download, Upload, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { seedTransactions, __resetTransactionsCache } from "@/features/transactions/api/repository"
import {
    buildBackupV1,
    serializeBackup,
    parseAndValidateBackup,
    applyBackupOverwrite,
    resetAllData,
    getBackupSummary,
    BackupSummary
} from "@/features/settings/backup/backup-utils"

export default function SettingsPage() {
    const queryClient = useQueryClient()
    const [status, setStatus] = useState<{ type: "success" | "error" | "info"; message: string; summary?: BackupSummary } | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const pad2 = (n: number) => n.toString().padStart(2, "0")

    const invalidateAll = async () => {
        __resetTransactionsCache()
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["transactions"] }),
            queryClient.invalidateQueries({ queryKey: ["recent-transactions"] }),
            queryClient.invalidateQueries({ queryKey: ["budgets"] }),
            queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] })
        ])
    }

    const handleReset = async () => {
        if (!window.confirm("Vuoi davvero eliminare tutti i dati? Questa azione è irreversibile.")) {
            return
        }

        setIsLoading(true)
        setStatus(null)

        try {
            resetAllData()
            await invalidateAll()
            setStatus({ type: "success", message: "Tutti i dati sono stati eliminati con successo." })
        } catch (error) {
            console.error("Reset error:", error)
            setStatus({ type: "error", message: "Si è verificato un errore durante il reset dei dati." })
        } finally {
            setIsLoading(false)
        }
    }

    const handleSeed = async () => {
        setIsLoading(true)
        setStatus(null)

        try {
            seedTransactions()
            await invalidateAll()
            setStatus({ type: "success", message: "Dati demo caricati con successo." })
        } catch (error) {
            console.error("Seed error:", error)
            setStatus({ type: "error", message: "Si è verificato un errore durante il caricamento dei dati demo." })
        } finally {
            setIsLoading(false)
        }
    }

    const handleExport = () => {
        try {
            const backup = buildBackupV1()
            const json = serializeBackup(backup)
            const blob = new Blob([json], { type: "application/json" })
            const url = URL.createObjectURL(blob)

            const now = new Date()
            const dateStr = `${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(now.getDate())}`
            const timeStr = `${pad2(now.getHours())}${pad2(now.getMinutes())}`

            const link = document.createElement("a")
            link.href = url
            link.download = `luma-backup-v1-${dateStr}-${timeStr}.json`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)

            setStatus({ type: "success", message: "Backup esportato con successo." })
        } catch (error) {
            console.error("Export error:", error)
            setStatus({ type: "error", message: "Errore durante l'esportazione del backup." })
        }
    }

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setIsLoading(true)
        setStatus(null)

        try {
            const text = await file.text()
            const result = parseAndValidateBackup(text)

            if (!result.ok) {
                setStatus({ type: "error", message: result.error })
                return
            }

            const summary = getBackupSummary(result.backup)

            // Show summary first as visual feedback
            setStatus({
                type: "info",
                message: "Backup caricato e pronto per il ripristino.",
                summary
            })

            const confirmMsg = `ATTENZIONE: Importare questo backup sovrascriverà TUTTI i dati locali attuali.\n\n` +
                `Dati trovati:\n` +
                `- Transazioni: ${summary.txCount}\n` +
                `- Piano Budget: ${summary.budgetCount}\n` +
                `- Periodi: ${summary.periods.join(", ")}\n\n` +
                `Vuoi continuare?`;

            if (!window.confirm(confirmMsg)) {
                setStatus(null)
                return
            }

            applyBackupOverwrite(result.backup)
            await invalidateAll()
            setStatus({ type: "success", message: "Backup ripristinato con successo." })
        } catch (error) {
            console.error("Import error:", error)
            setStatus({ type: "error", message: "Errore durante l'importazione del backup." })
        } finally {
            setIsLoading(false)
            // Reset input
            event.target.value = ""
        }
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Impostazioni</h1>
                <p className="text-muted-foreground">
                    Gestisci le preferenze dell&apos;applicazione e i tuoi dati locali.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Backup & Restore */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            Backup & Ripristino
                        </CardTitle>
                        <CardDescription>
                            Esporta i tuoi dati in un file JSON o importa un backup esistente.
                            L&apos;importazione sovrascriverà tutti i dati attuali.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {status && (
                            <Alert variant={status.type === "success" ? "default" : "destructive"} className={status.type === "success" ? "border-green-500/20 bg-green-500/5 text-green-600 dark:text-green-400" : ""}>
                                {status.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                <AlertTitle>{status.type === "success" ? "Operazione completata" : "Errore"}</AlertTitle>
                                <AlertDescription>{status.message}</AlertDescription>
                            </Alert>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 space-y-4">
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium">Esporta</h3>
                                    <p className="text-xs text-muted-foreground">Scarica una copia dei tuoi dati sul dispositivo.</p>
                                    <Button
                                        variant="outline"
                                        onClick={handleExport}
                                        disabled={isLoading}
                                        className="w-full sm:w-auto"
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        Esporta backup (JSON)
                                    </Button>
                                </div>
                            </div>

                            <div className="flex-1 space-y-4 border-t sm:border-t-0 sm:border-l pt-4 sm:pt-0 sm:pl-6">
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium">Importa</h3>
                                    <p className="text-xs text-muted-foreground">Carica un file di backup precedentemente esportato.</p>
                                    <div className="flex flex-col gap-2">
                                        <input
                                            type="file"
                                            accept=".json"
                                            onChange={handleImport}
                                            className="hidden"
                                            id="backup-upload"
                                            disabled={isLoading}
                                        />
                                        <Button
                                            variant="outline"
                                            asChild
                                            disabled={isLoading}
                                            className="w-full sm:w-auto"
                                        >
                                            <label htmlFor="backup-upload" className="cursor-pointer">
                                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                                Importa backup (JSON)
                                            </label>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Dangerous Actions */}
                <Card className="border-destructive/20">
                    <CardHeader>
                        <CardTitle className="text-destructive flex items-center gap-2">
                            <Trash2 className="h-5 w-5" />
                            Azioni Pericolose
                        </CardTitle>
                        <CardDescription>
                            Queste azioni modificano radicalmente i tuoi dati in modo permanente.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-8">
                            <div className="flex-1 space-y-2">
                                <h3 className="text-sm font-medium">Reset Totale</h3>
                                <p className="text-xs text-muted-foreground">
                                    Elimina permanentemente tutte le transazioni e i piani di budget.
                                </p>
                                <Button
                                    variant="destructive"
                                    onClick={handleReset}
                                    disabled={isLoading}
                                    className="w-full sm:w-auto"
                                >
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                    Reset dati
                                </Button>
                            </div>

                            <div className="flex-1 space-y-2">
                                <h3 className="text-sm font-medium">Ripristina Demo</h3>
                                <p className="text-xs text-muted-foreground">
                                    Sostituisce i dati attuali con il set di transazioni demo di LumaBudget.
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={handleSeed}
                                    disabled={isLoading}
                                    className="w-full sm:w-auto"
                                >
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
                                    Carica dati demo
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Nota sulla privacy</AlertTitle>
                <AlertDescription>
                    LumaBudget è un&apos;applicazione &quot;local-first&quot;. I tuoi dati non lasciano mai questo dispositivo e non vengono inviati a nessun server esterno.
                </AlertDescription>
            </Alert>
        </div>
    )
}
