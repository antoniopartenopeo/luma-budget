"use client"

import { useState, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Database, Download, Upload, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { queryKeys } from "@/lib/query-keys"
import { __resetTransactionsCache } from "@/features/transactions/api/repository"
import {
    buildBackupV1,
    serializeBackup,
    parseAndValidateBackup,
    applyBackupOverwrite,
    getBackupSummary,
    BackupSummary,
    BackupV1
} from "@/features/settings/backup/backup-utils"

export function BackupSection() {
    const queryClient = useQueryClient()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [showImportDialog, setShowImportDialog] = useState(false)
    const [pendingBackup, setPendingBackup] = useState<{ backup: BackupV1; summary: BackupSummary } | null>(null)

    const pad2 = (n: number) => n.toString().padStart(2, "0")

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
                setIsLoading(false)
                return
            }

            const summary = getBackupSummary(result.backup)
            setPendingBackup({ backup: result.backup, summary })
            setShowImportDialog(true)
        } catch (error) {
            console.error("Import error:", error)
            setStatus({ type: "error", message: "Errore durante l'importazione del backup." })
        } finally {
            setIsLoading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        }
    }

    const confirmImport = async () => {
        if (!pendingBackup) return

        setShowImportDialog(false)
        setIsLoading(true)
        setStatus(null)

        try {
            applyBackupOverwrite(pendingBackup.backup)
            await invalidateAll()
            setStatus({ type: "success", message: "Backup ripristinato con successo." })
        } catch (error) {
            console.error("Import error:", error)
            setStatus({ type: "error", message: "Errore durante l'importazione del backup." })
        } finally {
            setIsLoading(false)
            setPendingBackup(null)
        }
    }

    return (
        <>
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
                                    Esporta Backup
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 space-y-4 border-t sm:border-t-0 sm:border-l pt-4 sm:pt-0 sm:pl-6">
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium">Importa</h3>
                                <p className="text-xs text-muted-foreground">Carica un file di backup precedentemente esportato.</p>
                                <div className="flex flex-col gap-2">
                                    <input
                                        ref={fileInputRef}
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
                                            Importa Backup
                                        </label>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Import Confirmation Dialog */}
            <AlertDialog open={showImportDialog} onOpenChange={setShowImportDialog}>
                <AlertDialogContent className="sm:max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Conferma Importazione</AlertDialogTitle>
                        <AlertDialogDescription>
                            ATTENZIONE: Importare questo backup sovrascriverà TUTTI i dati locali attuali.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    {pendingBackup && (
                        <div className="py-4 space-y-3">
                            <div className="rounded-md bg-muted p-4 space-y-2 text-sm">
                                <p className="font-semibold border-b pb-1 mb-2">Riepilogo dati trovati:</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <span className="text-muted-foreground">Transazioni:</span>
                                    <span className="font-medium">{pendingBackup.summary.txCount}</span>

                                    <span className="text-muted-foreground">Piani Budget:</span>
                                    <span className="font-medium">{pendingBackup.summary.budgetCount}</span>
                                </div>
                                <div className="pt-1">
                                    <span className="text-muted-foreground block mb-1">Periodi inclusi:</span>
                                    <div className="flex flex-wrap gap-1">
                                        {pendingBackup.summary.periods.map(period => (
                                            <span key={period} className="px-1.5 py-0.5 bg-background border rounded text-[10px] font-mono">
                                                {period}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <AlertDialogFooter className="gap-2 sm:gap-0">
                        <AlertDialogCancel disabled={isLoading}>Annulla</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmImport} disabled={isLoading}>
                            {isLoading ? "Ripristino..." : "Ripristina"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
