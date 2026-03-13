"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, TrendingUp, TrendingDown, Loader2, AlertCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ImportState, Override } from "../core/types"
import { generatePayload } from "../core/pipeline"
import { StateMessage } from "@/components/ui/state-message"
import { useCreateBatchTransactions } from "@/features/transactions/api/use-transactions"
import { useCategories } from "@/features/categories/api/use-categories"
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
            <div className="flex flex-col gap-6">
                {/* Header Area */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                            Importazione completata
                        </h2>
                        <p className="text-sm font-medium text-muted-foreground">
                            I movimenti sono ora nello storico.
                        </p>
                    </div>
                </div>

                <div className="flex min-h-[400px] flex-col items-center justify-center gap-6 rounded-[2rem] border border-border/50 bg-background/50 p-12 text-center shadow-sm backdrop-blur-xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                        className="flex flex-col items-center justify-center gap-6 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 15,
                                delay: 0.1
                            }}
                            className="flex h-24 w-24 items-center justify-center rounded-full border-[6px] border-emerald-500/20 bg-emerald-100 text-emerald-600 shadow-xl shadow-emerald-500/20 dark:border-emerald-500/30 dark:bg-emerald-900/40 dark:text-emerald-400"
                        >
                            <CheckCircle2 className="h-12 w-12" />
                        </motion.div>
                        <div className="space-y-2">
                            <motion.h3
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.4 }}
                                className="text-2xl md:text-3xl font-bold text-foreground"
                            >
                                Tutto fatto!
                            </motion.h3>
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.4 }}
                                className="text-lg text-muted-foreground max-w-[300px] mx-auto"
                            >
                                Hai aggiunto <span className="font-semibold text-foreground">{stats?.count} movimenti</span> con successo al tuo storico.
                            </motion.p>
                        </div>
                    </motion.div>
                </div>

                <div className="mt-6 flex w-full justify-end border-t border-border/40 pt-6">
                    <Button
                        onClick={onClose}
                        size="lg"
                        className="h-12 rounded-xl px-8 text-base shadow-lg transition-[box-shadow,transform,background-color,border-color,color] duration-200 hover:shadow-xl hover:-translate-y-[1px]"
                    >
                        Torna a Transazioni
                    </Button>
                </div>
            </div>
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

    return (
        <div className="flex flex-col gap-6">
            {/* Header Area */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                        Conferma i dati
                    </h2>
                    <p className="text-sm font-medium text-muted-foreground">
                        Ultimo controllo prima di aggiungere i movimenti allo storico.
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/60 bg-muted/10 p-4">
                    <span className="text-sm text-foreground font-medium">Confermando aggiungerai</span>
                    <Badge variant="outline" className="h-7 rounded-full px-3 text-xs font-semibold normal-case tracking-normal text-foreground">
                        {stats.count} movimenti
                    </Badge>
                    <Badge variant="outline" className="h-7 rounded-full border-primary/30 bg-primary/10 px-3 text-xs font-semibold normal-case tracking-normal text-primary">
                        Duplicati già esclusi
                    </Badge>
                </div>

                <div className="w-full grid grid-cols-1 gap-4 lg:grid-cols-2">
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

                {isSaveError && (
                    <div className="w-full space-y-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
                        <div className="flex items-center gap-3 rounded-xl p-2 text-left text-destructive">
                            <AlertCircle className="h-6 w-6 shrink-0" />
                            <div>
                                <p className="font-bold text-sm">Errore durante il salvataggio</p>
                                <p className="text-sm opacity-90">Ci dispiace, qualcosa è andato storto. Riprova.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="mt-6 flex w-full items-center justify-between border-t border-border/40 pt-6">
                <Button variant="ghost" onClick={isPending ? undefined : onBack} disabled={isPending} className="h-12 px-5 text-muted-foreground hover:bg-muted/50 hover:text-foreground">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Indietro
                </Button>
                <Button
                    onClick={handleConfirm}
                    disabled={isPending}
                    className="h-12 gap-2 rounded-xl px-8 font-semibold shadow-lg transition-all duration-200 hover:-translate-y-[1px] hover:shadow-primary/25"
                >
                    {isPending ? <Loader2 className="h-5 w-5 animate-spin-slow" /> : "Conferma importazione"}
                </Button>
            </div>
        </div>
    )
}
