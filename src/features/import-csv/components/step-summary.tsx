"use client"

import { useMemo, useState } from "react"
import { CheckCircle2, Wallet, TrendingUp, TrendingDown, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ImportState, Override } from "../core/types"
import { generatePayload } from "../core/pipeline"
import { StateMessage } from "@/components/ui/state-message"
import { useCreateBatchTransactions } from "@/features/transactions/api/use-transactions"
import { useCategories } from "@/features/categories/api/use-categories"
import { WizardShell } from "./wizard-shell"
import { MacroSection } from "@/components/patterns/macro-section"
import { formatCents, formatSignedCents } from "@/domain/money"
import { KpiCard } from "@/components/patterns/kpi-card"
import { ImportMetricsGrid } from "./review"
import { cn } from "@/lib/utils"

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

        const net = income - expense
        return { income, expense, net, count }
    }, [payload])

    const importVisibility = useMemo(() => {
        const totalValidRows = importState.summary.totalRows
        const duplicatesSkipped = importState.summary.duplicatesSkipped
        const discardedRows = importState.summary.parseErrors.length
        const importableBeforeThreshold = importState.summary.selectedRows
        const readyToImport = stats?.count ?? 0
        const excludedByThreshold = Math.max(0, importableBeforeThreshold - readyToImport)

        return {
            totalValidRows,
            duplicatesSkipped,
            discardedRows,
            excludedByThreshold,
            readyToImport
        }
    }, [
        importState.summary.totalRows,
        importState.summary.duplicatesSkipped,
        importState.summary.parseErrors.length,
        importState.summary.selectedRows,
        stats?.count
    ])

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
            <div className="flex flex-col h-full items-center justify-center p-8 bg-background animate-enter-up text-center">
                <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400 cursor-default shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="h-12 w-12" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight mb-2">Importazione Completata!</h2>
                <p className="text-muted-foreground text-lg w-full mx-auto mb-8">
                    Hai aggiunto <span className="text-foreground font-bold">{stats?.count} transazioni</span> alla tua storia.
                    <br />
                    <span className="font-medium text-primary">Puoi rivederle e modificarle dalla tabella transazioni.</span>
                </p>
                <Button onClick={onClose} size="lg" className="rounded-full px-12 h-14 text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
                    Torna alle Transazioni
                </Button>
            </div>
        )
    }

    if (isCategoriesLoading) {
        return (
            <StateMessage
                title="Preparazione riepilogo"
                description="Sto caricando le categorie, attendi un momento."
                variant="empty"
            />
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
            <Button variant="ghost" onClick={isPending ? undefined : onBack} disabled={isPending} className="h-12 px-5 text-muted-foreground hover:text-foreground">
                Indietro
            </Button>
            <Button onClick={handleConfirm} disabled={isPending} className="gap-2 rounded-full px-10 h-12 shadow-lg hover:shadow-primary/25 text-lg transition-all">
                {isPending ? <Loader2 className="h-5 w-5 animate-spin-slow" /> : "Conferma Import"}
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
            <div className="flex-1 p-6 md:p-12 animate-enter-up">
                <MacroSection>
                    <ImportMetricsGrid
                        className="mb-6"
                        items={[
                            {
                                key: "valid-rows",
                                label: "Righe valide",
                                value: importVisibility.totalValidRows,
                                tone: "neutral",
                            },
                            {
                                key: "duplicates",
                                label: "Duplicati esclusi",
                                value: importVisibility.duplicatesSkipped,
                                tone: "warning",
                            },
                            {
                                key: "below-threshold",
                                label: "Sotto soglia",
                                value: importVisibility.excludedByThreshold,
                                tone: "info",
                            },
                            {
                                key: "ready-import",
                                label: "Da importare",
                                value: importVisibility.readyToImport,
                                tone: "success",
                            },
                        ]}
                    />

                    {importVisibility.discardedRows > 0 && (
                        <div className="mb-6 text-xs text-muted-foreground">
                            Righe scartate durante lettura CSV: <span className="font-semibold tabular-nums">{importVisibility.discardedRows}</span>
                        </div>
                    )}

                    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
                        <KpiCard
                            compact
                            title="Entrate Totali"
                            value={formatCents(stats.income)}
                            icon={TrendingUp}
                            tone="positive"
                            valueClassName="text-2xl sm:text-3xl lg:text-4xl text-emerald-700 dark:text-emerald-300"
                            className="h-full"
                        />
                        <KpiCard
                            compact
                            title="Uscite Totali"
                            value={formatCents(stats.expense)}
                            icon={TrendingDown}
                            tone="negative"
                            valueClassName="text-2xl sm:text-3xl lg:text-4xl text-rose-700 dark:text-rose-300"
                            className="h-full"
                        />
                        <KpiCard
                            compact
                            title="Saldo del Periodo"
                            value={formatSignedCents(stats.net)}
                            icon={Wallet}
                            tone={stats.net >= 0 ? "positive" : "negative"}
                            valueClassName={cn(
                                "text-2xl sm:text-3xl lg:text-4xl",
                                stats.net >= 0 ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"
                            )}
                            className="h-full"
                        />
                    </div>

                    <div className="w-full mt-12 text-center space-y-6">
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
