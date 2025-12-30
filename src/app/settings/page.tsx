"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Trash2, Database, Download, Upload, CheckCircle2, AlertCircle, Loader2, Settings2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { seedTransactions, __resetTransactionsCache } from "@/features/transactions/api/repository"
import { resetSettings } from "@/features/settings/api/repository"
import {
    buildBackupV1,
    serializeBackup,
    parseAndValidateBackup,
    applyBackupOverwrite,
    resetAllData,
    getBackupSummary,
    BackupSummary,
    BackupV1
} from "@/features/settings/backup/backup-utils"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useSettings, useUpsertSettings } from "@/features/settings/api/use-settings"
import { ThemePreference, CurrencyCode } from "@/features/settings/api/types"
import { Skeleton } from "@/components/ui/skeleton"

export default function SettingsPage() {
    const queryClient = useQueryClient()
    const [status, setStatus] = useState<{ type: "success" | "error" | "info"; message: string; summary?: BackupSummary } | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [showResetDialog, setShowResetDialog] = useState(false)
    const [showImportDialog, setShowImportDialog] = useState(false)
    const [pendingBackup, setPendingBackup] = useState<{ backup: BackupV1; summary: BackupSummary } | null>(null)

    const { data: settings, isLoading: isSettingsLoading, isError: isSettingsError } = useSettings()
    const upsertSettings = useUpsertSettings()
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle")

    const handleThemeChange = (theme: string) => {
        setSaveStatus("saving")
        upsertSettings.mutate({ theme: theme as ThemePreference }, {
            onSuccess: () => {
                setSaveStatus("success")
                setTimeout(() => setSaveStatus("idle"), 2000)
            },
            onError: () => {
                setSaveStatus("error")
                setTimeout(() => setSaveStatus("idle"), 3000)
            }
        })
    }

    const handleCurrencyChange = (currency: string) => {
        setSaveStatus("saving")
        upsertSettings.mutate({ currency: currency as CurrencyCode }, {
            onSuccess: () => {
                setSaveStatus("success")
                setTimeout(() => setSaveStatus("idle"), 2000)
            },
            onError: () => {
                setSaveStatus("error")
                setTimeout(() => setSaveStatus("idle"), 3000)
            }
        })
    }

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

    const handleReset = () => {
        setShowResetDialog(true)
    }

    const confirmReset = async () => {
        // Keeps the existing logic for the "Reset Totale" dialog if invoked, but we'll try to steer towards granular buttons.
        // The user request asks for window.confirm for the granular ones.
        // For "Reset Tutto", let's update it to clear EVERYTHING including settings.

        setShowResetDialog(false)
        setIsLoading(true)
        setStatus(null)

        try {
            // New complete reset logic
            resetAllData()
            resetSettings() // Clear settings too using the imported repo/hook logic function if available, 
            // or better, use the one from repository directly in the handler.
            // Since we didn't export it from backup-utils (to avoid deps), we do it here.

            // Invalidate everything
            await invalidateAll()
            await queryClient.invalidateQueries({ queryKey: ["settings"] })

            setStatus({ type: "success", message: "Tutti i dati sono stati eliminati con successo." })
        } catch (error) {
            console.error("Reset error:", error)
            setStatus({ type: "error", message: "Si è verificato un errore durante il reset dei dati." })
        } finally {
            setIsLoading(false)
        }
    }

    const handleResetTransactions = async () => {
        if (!window.confirm("Sei sicuro di voler eliminare TUTTE le transazioni? Questa azione è irreversibile.")) {
            return
        }

        setIsLoading(true)
        setStatus(null)
        try {
            const { resetTransactions: resetTx } = await import("@/features/settings/backup/backup-utils")
            resetTx()
            __resetTransactionsCache()

            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["transactions"] }),
                queryClient.invalidateQueries({ queryKey: ["recent-transactions"] }),
                queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] })
            ])

            setStatus({ type: "success", message: "Tutte le transazioni sono state eliminate." })
        } catch (error) {
            console.error("Reset transactions error:", error)
            setStatus({ type: "error", message: "Errore durante l'eliminazione delle transazioni." })
        } finally {
            setIsLoading(false)
        }
    }

    const handleResetBudgets = async () => {
        if (!window.confirm("Sei sicuro di voler eliminare TUTTI i piani di budget? Questa azione è irreversibile.")) {
            return
        }

        setIsLoading(true)
        setStatus(null)
        try {
            const { resetBudgets: resetBudgetsFn } = await import("@/features/settings/backup/backup-utils")
            resetBudgetsFn()

            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["budgets"] }),
                queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] })
            ])

            setStatus({ type: "success", message: "Tutti i budget sono stati eliminati." })
        } catch (error) {
            console.error("Reset budgets error:", error)
            setStatus({ type: "error", message: "Errore durante l'eliminazione dei budget." })
        } finally {
            setIsLoading(false)
        }
    }

    const handleResetSettings = async () => {
        if (!window.confirm("Sei sicuro di voler ripristinare le impostazioni predefinite?")) {
            return
        }

        setIsLoading(true)
        setStatus(null)
        try {
            resetSettings()
            await queryClient.invalidateQueries({ queryKey: ["settings"] })
            setStatus({ type: "success", message: "Le impostazioni sono state ripristinate." })
        } catch (error) {
            console.error("Reset settings error:", error)
            setStatus({ type: "error", message: "Errore durante il ripristino delle impostazioni." })
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
            event.target.value = ""
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
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Impostazioni</h1>
                <p className="text-muted-foreground">
                    Gestisci le preferenze dell&apos;applicazione e i tuoi dati locali.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Preferences */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings2 className="h-5 w-5" />
                            Preferenze
                            <div className="ml-auto text-sm font-normal">
                                {saveStatus === "saving" && (
                                    <span className="text-muted-foreground flex items-center">
                                        <Loader2 className="h-3 w-3 mr-2 animate-spin" /> Salvataggio...
                                    </span>
                                )}
                                {saveStatus === "success" && (
                                    <span className="text-green-600 flex items-center">
                                        <CheckCircle2 className="h-3 w-3 mr-2" /> Salvato
                                    </span>
                                )}
                                {saveStatus === "error" && (
                                    <span className="text-destructive flex items-center">
                                        <AlertCircle className="h-3 w-3 mr-2" /> Errore
                                    </span>
                                )}
                            </div>
                        </CardTitle>
                        <CardDescription>
                            Personalizza aspetto e comportamento dell&apos;applicazione.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isSettingsLoading ? (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-10 w-full md:w-[280px]" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-10 w-full md:w-[280px]" />
                                </div>
                            </div>
                        ) : isSettingsError ? (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Errore</AlertTitle>
                                <AlertDescription>
                                    Impossibile caricare le preferenze. Verranno usati i valori predefiniti.
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="theme-select">Tema</Label>
                                    <Select
                                        value={settings?.theme || "system"}
                                        onValueChange={handleThemeChange}
                                        disabled={upsertSettings.isPending}
                                    >
                                        <SelectTrigger id="theme-select">
                                            <SelectValue placeholder="Seleziona tema" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="system">Sistema (Auto)</SelectItem>
                                            <SelectItem value="light">Chiaro</SelectItem>
                                            <SelectItem value="dark">Scuro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="currency-select">Valuta principale</Label>
                                    <Select
                                        value={settings?.currency || "EUR"}
                                        onValueChange={handleCurrencyChange}
                                        disabled={upsertSettings.isPending}
                                    >
                                        <SelectTrigger id="currency-select">
                                            <SelectValue placeholder="Seleziona valuta" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="EUR">Euro (€)</SelectItem>
                                            <SelectItem value="USD">Dollaro ($)</SelectItem>
                                            <SelectItem value="GBP">Sterlina (£)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

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
                            Gestione Dati e Ripristino
                        </CardTitle>
                        <CardDescription>
                            Azioni distruttive per rimuovere i dati dall&apos;applicazione.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            {/* Granular Resets */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium">Reset Granulare</h3>

                                <div className="flex flex-col gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={handleResetTransactions}
                                        disabled={isLoading}
                                        className="justify-start text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                                    >
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                        Elimina solo transazioni
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={handleResetBudgets}
                                        disabled={isLoading}
                                        className="justify-start text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                                    >
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                        Elimina solo budget
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={handleResetSettings}
                                        disabled={isLoading}
                                        className="justify-start text-muted-foreground hover:bg-muted"
                                    >
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Settings2 className="mr-2 h-4 w-4" />}
                                        Ripristina impostazioni default
                                    </Button>
                                </div>
                            </div>

                            {/* Full Reset / Seed */}
                            <div className="space-y-4 border-t sm:border-t-0 sm:border-l pt-4 sm:pt-0 sm:pl-8">
                                <h3 className="text-sm font-medium">Azioni Globali</h3>

                                <div className="flex flex-col gap-2">
                                    <Button
                                        variant="destructive"
                                        onClick={handleReset}
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

            {/* Confirmation Dialogs */}
            <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reset Totale dei Dati</DialogTitle>
                        <DialogDescription>
                            Vuoi davvero eliminare tutti i dati? Questa azione cancellerà permanentemente tutte le transazioni, i piani di budget e le impostazioni. Questa azione è irreversibile.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="ghost" onClick={() => setShowResetDialog(false)}>
                            Annulla
                        </Button>
                        <Button variant="destructive" onClick={confirmReset}>
                            Reset totale
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Conferma Importazione Backup</DialogTitle>
                        <DialogDescription>
                            ATTENZIONE: Importare questo backup sovrascriverà TUTTI i dati locali attuali.
                        </DialogDescription>
                    </DialogHeader>

                    {pendingBackup && (
                        <div className="py-4 space-y-3">
                            <div className="rounded-md bg-muted p-4 space-y-2 text-sm">
                                <p className="font-semibold border-b pb-1 mb-2">Pillola dei dati trovati:</p>
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

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="ghost" onClick={() => setShowImportDialog(false)}>
                            Annulla
                        </Button>
                        <Button onClick={confirmImport}>
                            Importa e Sovrascrivi
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
