"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Trash2, Database, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { seedTransactions, __resetTransactionsCache } from "@/features/transactions/api/repository"

export default function SettingsPage() {
    const queryClient = useQueryClient()
    const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleReset = async () => {
        if (!window.confirm("Vuoi davvero eliminare tutti i dati? Questa azione è irreversibile.")) {
            return
        }

        setIsLoading(true)
        setStatus(null)

        try {
            // 1. Remove localStorage keys
            localStorage.removeItem("luma_transactions_v1")
            localStorage.removeItem("luma_budget_plans_v1")

            // 2. Reset in-memory cache
            __resetTransactionsCache()

            // 3. Invalidate React Query cache
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["transactions"] }),
                queryClient.invalidateQueries({ queryKey: ["recent-transactions"] }),
                queryClient.invalidateQueries({ queryKey: ["budgets"] }),
                queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] })
            ])

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
            // 1. Run seed
            seedTransactions()

            // 2. Reset cache to force reload from seeded storage
            __resetTransactionsCache()

            // 3. Invalidate React Query cache
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["transactions"] }),
                queryClient.invalidateQueries({ queryKey: ["recent-transactions"] }),
                queryClient.invalidateQueries({ queryKey: ["budgets"] }),
                queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] })
            ])

            setStatus({ type: "success", message: "Dati demo caricati con successo." })
        } catch (error) {
            console.error("Seed error:", error)
            setStatus({ type: "error", message: "Si è verificato un errore durante il caricamento dei dati demo." })
        } finally {
            setIsLoading(false)
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

            <Card className="border-destructive/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        Gestione Dati
                    </CardTitle>
                    <CardDescription>
                        Azioni per gestire il database locale (localStorage) della tua applicazione.
                        Tutti i dati sono salvati esclusivamente sul tuo browser.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {status && (
                        <Alert variant={status.type === "success" ? "default" : "destructive"} className={status.type === "success" ? "border-green-500/20 bg-green-500/5 text-green-600 dark:text-green-400" : ""}>
                            {status.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                            <AlertTitle>{status.type === "success" ? "Completato" : "Errore"}</AlertTitle>
                            <AlertDescription>{status.message}</AlertDescription>
                        </Alert>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 space-y-2">
                            <h3 className="text-sm font-medium">Reset Totale</h3>
                            <p className="text-sm text-muted-foreground">
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

                        <div className="flex-1 space-y-2 border-t sm:border-t-0 sm:border-l pt-4 sm:pt-0 sm:pl-6">
                            <h3 className="text-sm font-medium">Dati Demo</h3>
                            <p className="text-sm text-muted-foreground">
                                Popola l&apos;applicazione con un set di transazioni di esempio per testare le funzionalità.
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
