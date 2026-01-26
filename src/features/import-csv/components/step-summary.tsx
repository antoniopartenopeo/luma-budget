"use client"

import { useMemo, useState } from "react"
import { CheckCircle2, ArrowRight, Wallet, TrendingUp, TrendingDown, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ImportState, Override } from "../core/types"
import { generatePayload } from "../core/pipeline"
import { StateMessage } from "@/components/ui/state-message"
import { useCreateBatchTransactions } from "@/features/transactions/api/use-transactions"
import { useCategories } from "@/features/categories/api/use-categories"
import { WizardShell } from "./wizard-shell"
import { MacroSection } from "@/components/patterns/macro-section"

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
    const { data: categories = [] } = useCategories()
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
            return generatePayload(includedGroups, importState.rows, overrides, categories)
        } catch (e) {
            console.error("Payload gen error", e)
            return null
        }
    }, [includedGroups, importState.rows, overrides, categories])

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
                <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400 animate-bounce cursor-default shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="h-12 w-12" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight mb-2">Importazione Completata!</h2>
                <p className="text-muted-foreground text-lg max-w-md mx-auto mb-8">
                    Hai aggiunto <span className="text-foreground font-semibold">{stats?.count} transazioni</span> alla tua storia.
                    <br />
                    <span className="font-medium text-primary">Il vero viaggio inizia ora.</span>
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

    const footer = (
        <div className="flex w-full justify-between items-center">
            <Button variant="ghost" onClick={isPending ? undefined : onBack} disabled={isPending} className="text-muted-foreground hover:text-foreground">
                Indietro
            </Button>
            <Button onClick={handleConfirm} disabled={isPending} className="gap-2 rounded-full px-10 h-12 shadow-lg hover:shadow-primary/25 text-lg transition-all">
                {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Conferma Import"}
            </Button>
        </div>
    )

    return (
        <WizardShell
            title="Riepilogo Finale"
            subtitle="Ecco cosa stiamo per aggiungere al tuo bilancio."
            step="summary"
            footer={footer}
        >
            <div className="flex-1 p-6 md:p-12 animate-in fade-in slide-in-from-right-4 duration-300">
                <MacroSection>
                    <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* KPI Cards */}
                        <div className="bg-emerald-500/5 p-6 rounded-2xl border border-emerald-500/20 flex flex-col justify-center items-center text-emerald-700 dark:text-emerald-400">
                            <TrendingUp className="h-8 w-8 mb-2 opacity-50" />
                            <div className="text-sm font-medium opacity-70">Entrate Totali</div>
                            <div className="text-2xl font-bold">
                                {(stats.income / 100).toLocaleString("it-IT", { style: "currency", currency: "EUR" })}
                            </div>
                        </div>

                        <div className="bg-rose-500/5 p-6 rounded-2xl border border-rose-500/20 flex flex-col justify-center items-center text-rose-700 dark:text-rose-400">
                            <TrendingDown className="h-8 w-8 mb-2 opacity-50" />
                            <div className="text-sm font-medium opacity-70">Uscite Totali</div>
                            <div className="text-2xl font-bold">
                                {(stats.expense / 100).toLocaleString("it-IT", { style: "currency", currency: "EUR" })}
                            </div>
                        </div>

                        <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20 flex flex-col justify-center items-center text-primary md:col-span-1 border-t-4 border-t-primary">
                            <Wallet className="h-8 w-8 mb-2 opacity-50" />
                            <div className="text-sm font-medium opacity-70">Saldo del Periodo</div>
                            <div className="text-2xl font-bold">
                                {(stats.net / 100).toLocaleString("it-IT", { style: "currency", currency: "EUR" })}
                            </div>
                        </div>
                    </div>

                    <div className="max-w-xl mx-auto mt-12 text-center space-y-6">
                        <p className="text-muted-foreground">
                            Premendo conferma, queste <strong className="text-foreground">{stats.count} transazioni</strong> diventeranno parte del tuo storico.
                            Potrai sempre modificarle, cancellarle o riorganizzarle in seguito.
                        </p>

                        {isSaveError && (
                            <div className="p-4 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 flex items-center gap-3 text-left">
                                <AlertCircle className="h-5 w-5 shrink-0" />
                                <div>
                                    <p className="font-bold text-sm">Errore durante il salvataggio</p>
                                    <p className="text-xs opacity-90">Ci dispiace, qualcosa è andato storto. Riprova.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </MacroSection>
            </div>
        </WizardShell>
    )
}
