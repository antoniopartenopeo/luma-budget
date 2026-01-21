"use client"

import { useMemo, useState } from "react"
import { CheckCircle2, ArrowRight, Wallet, TrendingUp, TrendingDown, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ImportState, Override } from "../core/types"
import { generatePayload } from "../core/pipeline"
import { getIncludedGroups } from "../core/filters"
import { StateMessage } from "@/components/ui/state-message"
import { useCreateBatchTransactions } from "@/features/transactions/api/use-transactions"

interface ImportStepSummaryProps {
    importState: ImportState
    overrides: Override[]
    thresholdCents: number
    excludedGroupIds: string[]
    onBack: () => void
    onClose: () => void
}

export function ImportStepSummary({
    importState,
    overrides,
    thresholdCents,
    excludedGroupIds,
    onBack,
    onClose
}: ImportStepSummaryProps) {
    const { mutateAsync: createBatch, isPending, isError: isSaveError, error: saveError } = useCreateBatchTransactions()
    const [isSuccess, setIsSuccess] = useState(false)

    // Filter groups using the explicit list from the previous step
    const includedGroups = useMemo(() => {
        const excludedSet = new Set(excludedGroupIds)
        return importState.groups
            .filter(g => !excludedSet.has(g.id))
            .sort((a, b) => Math.abs(b.totalCents) - Math.abs(a.totalCents))
    }, [importState.groups, excludedGroupIds])

    // Compute Final Stats using ONLY included groups
    const payload = useMemo(() => {
        try {
            return generatePayload(includedGroups, importState.rows, overrides)
        } catch (e) {
            console.error("Payload gen error", e)
            return null
        }
    }, [includedGroups, importState.rows, overrides])

    const stats = useMemo(() => {
        if (!payload) return null
        let income = 0
        let expense = 0
        let count = 0

        payload.transactions.forEach(t => {
            count++
            if (t.type === "income") income += t.amountCents
            else expense += t.amountCents
        })

        const net = income - expense
        return { income, expense, net, count }
    }, [payload])

    const handleConfirm = async () => {
        if (!payload) return

        try {
            await createBatch(payload.transactions)
            setIsSuccess(true)
        } catch (err) {
            console.error("Failed to save transactions", err)
        }
    }

    if (isSuccess) {
        return (
            <div className="flex flex-col h-full items-center justify-center p-8 bg-background animate-in zoom-in-95 duration-500 text-center">
                <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6 text-green-600 animate-bounce cursor-default">
                    <CheckCircle2 className="h-12 w-12" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight mb-2">Importazione Completata!</h2>
                <p className="text-muted-foreground text-lg max-w-md mx-auto mb-8">
                    Hai aggiunto {stats?.count} transazioni alla tua storia.
                    <br />
                    <span className="font-medium text-foreground">Il vero viaggio inizia ora.</span>
                </p>
                <Button onClick={onClose} size="lg" className="rounded-full px-12 h-14 text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
                    Torna alle Transazioni
                </Button>
            </div>
        )
    }

    if (!payload || !stats) {
        return (
            <StateMessage
                title="Errore di Calcolo"
                description="Impossibile generare il riepilogo. Torna indietro e riprova."
                variant="error"
            />
        )
    }

    return (
        <div className="flex flex-col h-full bg-background animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Header */}
            <div className="p-6 border-b shrink-0 bg-card">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        3
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">Riepilogo Finale</h2>
                </div>
                <p className="text-muted-foreground text-sm">
                    Ecco cosa stiamo per aggiungere al tuo bilancio.
                </p>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-12">
                <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* KPI Cards */}
                    <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 flex flex-col justify-center items-center text-emerald-900">
                        <TrendingUp className="h-8 w-8 mb-2 opacity-50" />
                        <div className="text-sm font-medium opacity-70">Entrate Totali</div>
                        <div className="text-2xl font-bold">
                            {(stats.income / 100).toLocaleString("it-IT", { style: "currency", currency: "EUR" })}
                        </div>
                    </div>

                    <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-100 flex flex-col justify-center items-center text-rose-900">
                        <TrendingDown className="h-8 w-8 mb-2 opacity-50" />
                        <div className="text-sm font-medium opacity-70">Uscite Totali</div>
                        <div className="text-2xl font-bold">
                            {(stats.expense / 100).toLocaleString("it-IT", { style: "currency", currency: "EUR" })}
                        </div>
                    </div>

                    <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex flex-col justify-center items-center text-blue-900 md:col-span-1 border-t-4 border-t-blue-500">
                        <Wallet className="h-8 w-8 mb-2 opacity-50" />
                        <div className="text-sm font-medium opacity-70">Saldo del Periodo</div>
                        <div className="text-2xl font-bold">
                            {(stats.net / 100).toLocaleString("it-IT", { style: "currency", currency: "EUR" })}
                        </div>
                    </div>
                </div>

                <div className="max-w-xl mx-auto mt-12 text-center space-y-4">
                    <p className="text-muted-foreground">
                        Premendo conferma, queste {stats.count} transazioni diventeranno parte del tuo storico.
                        Potrai sempre modificarle, cancellarle o riorganizzarle in seguito.
                    </p>

                    {isSaveError && (
                        <div className="p-4 rounded-xl bg-red-50 text-red-800 border-red-200 border flex items-center gap-3 text-left">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <div>
                                <p className="font-bold text-sm">Errore durante il salvataggio</p>
                                <p className="text-xs opacity-90">Ci dispiace, qualcosa è andato storto. Riprova.</p>
                            </div>
                        </div>
                    )}

                    {!isSaveError && (
                        <div className="p-4 rounded-xl bg-muted/30 border border-dashed border-muted-foreground/20 text-sm">
                            Nota: Questo import genererà un ID batch unico per permetterti, se serve, di annullare l&apos;intera operazione in un colpo solo.
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-card shrink-0 flex justify-between items-center">
                <Button variant="ghost" onClick={isPending ? undefined : onBack} disabled={isPending}>
                    Indietro
                </Button>
                <Button onClick={handleConfirm} disabled={isPending} className="gap-2 rounded-xl px-10 h-12 shadow-lg text-lg">
                    {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Conferma Import"}
                </Button>
            </div>
        </div>
    )
}
