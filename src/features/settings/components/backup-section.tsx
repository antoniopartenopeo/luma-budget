"use client"

import { useState, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Download, Upload, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
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
import { __resetCategoriesCache } from "@/features/categories/api/repository"
import {
    BACKUP_EXPORT_PRIVACY_NOTE,
    BACKUP_IMPORT_VALIDATION_NOTE,
    buildBackupV2,
    serializeBackup,
    parseAndValidateBackup,
    applyBackupOverwrite,
    getBackupSummary,
    BackupSummary,
    BackupFile
} from "@/features/settings/backup/backup-utils"
import { MacroSection } from "@/components/patterns/macro-section"

export function BackupSection() {
    const queryClient = useQueryClient()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [showImportDialog, setShowImportDialog] = useState(false)
    const [pendingBackup, setPendingBackup] = useState<{ backup: BackupFile; summary: BackupSummary } | null>(null)

    const pad2 = (n: number) => n.toString().padStart(2, "0")

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

    const handleExport = () => {
        try {
            const backup = buildBackupV2()
            const json = serializeBackup(backup)
            const blob = new Blob([json], { type: "application/json" })
            const url = URL.createObjectURL(blob)

            const now = new Date()
            const dateStr = `${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(now.getDate())}`
            const timeStr = `${pad2(now.getHours())}${pad2(now.getMinutes())}`

            const link = document.createElement("a")
            link.href = url
            link.download = `numa-backup-v2-${dateStr}-${timeStr}.json`
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

            <MacroSection
                title="Backup & Ripristino"
                description={
                    <>
                        Salva una copia dei tuoi dati in un file JSON oppure ripristina un backup esistente.
                        Se importi un backup, i dati attuali verranno sostituiti.
                    </>
                }
            >
                <Alert className="border-amber-500/20 bg-amber-500/6 text-amber-700 dark:text-amber-300">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Formato backup</AlertTitle>
                    <AlertDescription>
                        {BACKUP_EXPORT_PRIVACY_NOTE} {BACKUP_IMPORT_VALIDATION_NOTE}
                    </AlertDescription>
                </Alert>

                {status && (
                    <Alert variant={status.type === "success" ? "default" : "destructive"} className={status.type === "success" ? "border-green-500/20 bg-green-500/5 text-green-600 dark:text-green-400" : ""}>
                        {status.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                        <AlertTitle>{status.type === "success" ? "Operazione completata" : "Errore"}</AlertTitle>
                        <AlertDescription>{status.message}</AlertDescription>
                    </Alert>
                )}

                <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="surface-subtle flex-1 space-y-4 p-5">
                        <div className="space-y-2">
                            <h3 className="text-sm font-bold tracking-tight">Esporta</h3>
                            <p className="text-xs text-muted-foreground">Scarica una copia aggiornata dei dati sul tuo dispositivo in formato JSON non cifrato.</p>
                            <Button
                                variant="outline"
                                onClick={handleExport}
                                disabled={isLoading}
                                className="w-full rounded-full border-white/30 bg-white/55 sm:w-auto dark:border-white/12 dark:bg-white/[0.06]"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Esporta Backup
                            </Button>
                        </div>
                    </div>

                    <div className="surface-subtle flex-1 space-y-4 p-5">
                        <div className="space-y-2">
                            <h3 className="text-sm font-bold tracking-tight">Importa</h3>
                            <p className="text-xs text-muted-foreground">Carica un backup salvato in precedenza. Numa ripristina solo le sezioni riconosciute del file.</p>
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
                                    className="w-full rounded-full border-white/30 bg-white/55 sm:w-auto dark:border-white/12 dark:bg-white/[0.06]"
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
            </MacroSection>

            {/* Import Confirmation Dialog */}
            <AlertDialog open={showImportDialog} onOpenChange={setShowImportDialog}>
                <AlertDialogContent className="sm:max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Conferma importazione</AlertDialogTitle>
                        <AlertDialogDescription>
                            Importando questo backup sostituirai tutti i dati locali attuali. Il file deve provenire da una fonte affidabile.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    {pendingBackup && (
                        <div className="py-4 space-y-3">
                            <div className="rounded-[1.5rem] border border-white/25 bg-white/45 p-4 text-sm dark:border-white/10 dark:bg-white/[0.04]">
                                <p className="mb-2 border-b border-white/20 pb-1 font-semibold dark:border-white/10">Contenuto del backup</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <span className="text-muted-foreground">Transazioni:</span>
                                    <span className="font-medium">{pendingBackup.summary.txCount}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <span className="text-muted-foreground">Budget legacy:</span>
                                    <span className="font-medium">{pendingBackup.summary.budgetCount}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <span className="text-muted-foreground">Versione formato:</span>
                                    <span className="font-medium">v{pendingBackup.backup.version}</span>
                                </div>
                                <div className="pt-1">
                                    <span className="text-muted-foreground block mb-1">Periodi inclusi:</span>
                                    <div className="flex flex-wrap gap-1">
                                        {pendingBackup.summary.periods.map(period => (
                                            <span key={period} className="rounded-full border border-white/25 bg-background/70 px-2 py-0.5 text-xs font-mono dark:border-white/10 dark:bg-white/[0.04]">
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
