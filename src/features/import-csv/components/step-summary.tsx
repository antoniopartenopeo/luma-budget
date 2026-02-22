"use client"

import { useMemo, useState } from "react"
import { CheckCircle2, TrendingUp, TrendingDown, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ImportState, Override } from "../core/types"
import { generatePayload } from "../core/pipeline"
import { StateMessage } from "@/components/ui/state-message"
import { useCreateBatchTransactions } from "@/features/transactions/api/use-transactions"
import { useCategories } from "@/features/categories/api/use-categories"
import { WizardShell } from "./wizard-shell"
import { MacroSection } from "@/components/patterns/macro-section"
import { formatCents } from "@/domain/money"
import { KpiCard } from "@/components/patterns/kpi-card"

interface ImportStepSummaryProps {
    importState: ImportState
    overrides: Override[]
    excludedGroupIds: string[]
    onBack: () => void
    onClose: () => void
}

export function ImportStepSummary({
    importState,
    overrides,
    excludedGroupIds,
    onBack,
    onClose
}: ImportStepSummaryProps) {
    const { mutateAsync: createBatch, isPending, isError: isSaveError } = useCreateBatchTransactions()
    const { data: categories = [], isLoading: isCategoriesLoading } = useCategories()
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
        if (isCategoriesLoading) return null
        try {
            return generatePayload(includedGroups, importState.rows, overrides, categories)
        } catch (e) {
            console.error("Payload gen error", e)
            return null
        }
    }, [includedGroups, importState.rows, overrides, categories, isCategoriesLoading])

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

        return { income, expense, count }
    }, [payload])

    const importDiagnostics = useMemo(() => {
        const discardedRows = importState.summary.parseErrors.length
        return { discardedRows }
    }, [importState.summary.parseErrors.length])

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
        const footer = (
            <div className="flex w-full justify-end">
                <Button onClick={onClose} size="lg" className="h-12 rounded-xl px-8 text-base shadow-lg transition-all hover:shadow-xl">
                    Torna a Transazioni
                </Button>
            </div>
        )

        return (
            <WizardShell
                title="Importazione completata"
                subtitle="I movimenti sono stati aggiunti allo storico."
                step="summary"
                footer={footer}
            >
                <MacroSection contentClassName="py-10">
                    <div className="flex flex-col items-center justify-center gap-4 text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-lg shadow-emerald-500/20 dark:bg-emerald-900/30 dark:text-emerald-400">
                            <CheckCircle2 className="h-10 w-10" />
                        </div>
                        <p className="text-lg text-muted-foreground">
                            Hai aggiunto <span className="font-semibold text-foreground">{stats?.count} movimenti</span>.
                        </p>
                    </div>
                </MacroSection>
            </WizardShell>
        )
    }

    if (isCategoriesLoading) {
        return (
            <StateMessage
                title="Preparazione riepilogo"
                description="Sto preparando gli ultimi dettagli, attendi un momento."
                variant="empty"
            />
        )
    }

    if (!payload || !stats) {
        return (
            <StateMessage
                title="Non riesco a preparare il riepilogo"
                description="Torna allo step precedente e riprova."
                variant="error"
            />
        )
    }

    const footer = (
        <div className="flex w-full justify-between items-center">
            <Button variant="ghost" onClick={isPending ? undefined : onBack} disabled={isPending} className="h-12 px-5 text-muted-foreground hover:text-foreground">
                Indietro
            </Button>
            <Button onClick={handleConfirm} disabled={isPending} className="h-12 gap-2 rounded-xl px-6 shadow-lg transition-all hover:shadow-primary/25">
                {isPending ? <Loader2 className="h-5 w-5 animate-spin-slow" /> : "Aggiungi movimenti"}
            </Button>
        </div>
    )

    return (
        <WizardShell
            title="Conferma i dati"
            subtitle="Ultimo controllo prima di aggiungere i movimenti."
            step="summary"
            footer={footer}
        >
            <div className="animate-enter-up">
                <MacroSection contentClassName="space-y-5">
                    <div className="w-full grid grid-cols-1 gap-4 lg:grid-cols-3">
                        <KpiCard
                            compact
                            title="Movimenti da aggiungere"
                            value={stats.count}
                            icon={CheckCircle2}
                            tone="neutral"
                            valueClassName="text-2xl sm:text-3xl lg:text-4xl text-foreground"
                            className="h-full"
                            description="Confermando aggiungerai questi movimenti."
                        />
                        <KpiCard
                            compact
                            title="Totale entrate"
                            subtitle="Esclusi duplicati"
                            value={formatCents(stats.income)}
                            icon={TrendingUp}
                            tone="positive"
                            valueClassName="text-2xl sm:text-3xl lg:text-4xl text-emerald-700 dark:text-emerald-300"
                            className="h-full"
                        />
                        <KpiCard
                            compact
                            title="Totale uscite"
                            subtitle="Esclusi duplicati"
                            value={formatCents(stats.expense)}
                            icon={TrendingDown}
                            tone="negative"
                            valueClassName="text-2xl sm:text-3xl lg:text-4xl text-rose-700 dark:text-rose-300"
                            className="h-full"
                        />
                    </div>

                    {(importDiagnostics.discardedRows > 0 || isSaveError) && (
                        <div className="w-full space-y-3 rounded-xl border border-border/60 bg-muted/15 p-4">
                            {importDiagnostics.discardedRows > 0 && (
                                <p className="text-sm text-muted-foreground">
                                    Righe non leggibili ignorate:{" "}
                                    <span className="font-semibold tabular-nums text-foreground">{importDiagnostics.discardedRows}</span>
                                </p>
                            )}

                            {isSaveError && (
                                <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-left text-destructive">
                                    <AlertCircle className="h-5 w-5 shrink-0" />
                                    <div>
                                        <p className="font-bold text-sm">Errore durante il salvataggio</p>
                                        <p className="text-xs opacity-90">Ci dispiace, qualcosa è andato storto. Riprova.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </MacroSection>
            </div>
        </WizardShell>
    )
}
