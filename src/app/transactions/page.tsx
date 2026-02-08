"use client"

import { useState, Suspense } from "react"
import { ArrowUpRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { TransactionsTable } from "@/features/transactions/components/transactions-table"
import { TransactionsFilterBar } from "@/features/transactions/components/transactions-filter-bar"
import { TransactionsSummaryBar } from "@/features/transactions/components/transactions-summary-bar"
import { TransactionDetailSheet } from "@/features/transactions/components/transaction-detail-sheet"
import { ConfirmDialog } from "@/components/patterns/confirm-dialog"
import { useTransactions, useDeleteTransaction } from "@/features/transactions/api/use-transactions"
import { useCategories } from "@/features/categories/api/use-categories"
import { useTransactionsView } from "@/features/transactions/hooks/use-transactions-view"
import { exportTransactionsToCSV } from "@/features/transactions/utils/export-transactions"
import { Transaction } from "@/features/transactions/api/types"
import { PageHeader } from "@/components/ui/page-header"

import { StateMessage } from "@/components/ui/state-message"
import { Skeleton } from "@/components/ui/skeleton"
import { TransactionsActions } from "@/features/transactions/components/transactions-actions"
import { MacroSection, macroItemVariants } from "@/components/patterns/macro-section"
import { StaggerContainer } from "@/components/patterns/stagger-container"
import { motion } from "framer-motion"



function TransactionsPageContent() {
    const { data: transactions = [], isLoading, isError, refetch } = useTransactions()
    const {
        search, type, categoryId, period, fromDate, toDate,
        sort, order, page,
        filteredList, sortedList, paginatedList, summary, totalPages,
        updateParams, resetFilters, handleSortChange, filters
    } = useTransactionsView(transactions)

    // --- Local UI State for Detail Sheet ---
    const [selectedDetail, setSelectedDetail] = useState<Transaction | null>(null)
    const [detailMode, setDetailMode] = useState<"view" | "edit">("view")
    const [isExporting, setIsExporting] = useState(false)
    const [exportError, setExportError] = useState<string | null>(null)
    const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null)

    const { mutate: deleteTx, isPending: isDeleting } = useDeleteTransaction()
    const { data: categories = [] } = useCategories()

    // --- Actions ---
    const handleEdit = (transaction: Transaction) => {
        setSelectedDetail(transaction)
        setDetailMode("edit")
    }

    const handleDelete = (id: string) => {
        const transaction = transactions.find(t => t.id === id)
        if (transaction) {
            setTransactionToDelete(transaction)
        }
    }

    const confirmDelete = () => {
        if (!transactionToDelete) return
        deleteTx(transactionToDelete.id, {
            onSuccess: () => setTransactionToDelete(null)
        })
    }

    const handleExport = async (all: boolean = false) => {
        if (isExporting || isLoading) return
        setIsExporting(true)

        // Small delay for UX feedback
        await new Promise(resolve => setTimeout(resolve, 300))

        const exportList = all ? transactions : sortedList
        const result = exportTransactionsToCSV({
            transactions: exportList,
            categories: categories,
            dateRange: filters.dateRange.from && filters.dateRange.to
                ? { start: filters.dateRange.from.toISOString(), end: filters.dateRange.to.toISOString() }
                : undefined
        })

        setIsExporting(false)
        if (!result.success) {
            setExportError(result.error || "Si è verificato un errore durante l'esportazione.")
        }
    }

    if (isError) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Transazioni</h1>
                    <p className="text-muted-foreground">Gestisci e monitora le tue entrate e uscite.</p>
                </div>
                <StateMessage
                    variant="error"
                    title="Impossibile caricare le transazioni"
                    description="Si è verificato un problema durante il recupero dei dati."
                    actionLabel="Riprova"
                    onActionClick={() => refetch()}
                />
            </div>
        )
    }

    return (
        <StaggerContainer className="space-y-8">
            {/* Header: PageHeader component preferred */}
            <motion.div variants={macroItemVariants}>
                <PageHeader
                    title="Transazioni"
                    description="Analisi dettagliata del tuo flusso di cassa."
                    actions={
                        <TransactionsActions
                            onExportView={() => handleExport(false)}
                            onExportAll={() => handleExport(true)}
                            isExporting={isExporting}
                            hasResults={filteredList.length > 0}
                        />
                    }
                />
            </motion.div>

            {/* MacroSection for Main Content */}
            <MacroSection
                title="Elenco Movimenti"
                description="Tutte le transazioni del periodo"
                headerActions={
                    <TransactionsFilterBar
                        searchValue={search}
                        onSearchChange={(v) => updateParams({ q: v, p: "1" })}
                        typeValue={type}
                        onTypeChange={(v) => updateParams({ type: v, p: "1" })}
                        categoryValue={categoryId}
                        onCategoryChange={(v) => updateParams({ cat: v, p: "1" })}
                        periodValue={period}
                        onPeriodChange={(v) => updateParams({ period: v, p: "1", from: null, to: null })}
                        dateRange={{ from: fromDate, to: toDate }}
                        onDateRangeChange={(range) => updateParams({ from: range.from || null, to: range.to || null, p: "1" })}
                        isSuperfluousOnly={type === "superfluous"}
                        onResetFilters={resetFilters}
                    />
                }
                className="h-full"
            >

                {/* Summary KPI Bar */}
                <div className="mb-8">
                    <TransactionsSummaryBar summary={summary} isLoading={isLoading} />
                </div>

                {/* Main Content: Table or Empty State */}
                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-20 w-full rounded-2xl" />
                        <Skeleton className="h-64 w-full rounded-3xl" />
                    </div>
                ) : filteredList.length > 0 ? (
                    <TransactionsTable
                        transactions={paginatedList}
                        onEditTransaction={handleEdit}
                        onDeleteTransaction={handleDelete}
                        onRowClick={(t) => {
                            setSelectedDetail(t)
                            setDetailMode("view")
                        }}
                        sortField={sort}
                        sortOrder={order}
                        onSortChange={handleSortChange}
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={(p) => updateParams({ p: p.toString() })}
                    />
                ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-center max-w-md mx-auto">
                        <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                            <ArrowUpRight className="h-10 w-10 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-xl font-bold tracking-tight mb-2 text-foreground">Nessun risultato</h3>
                        <p className="text-muted-foreground font-medium mb-8 leading-relaxed">
                            Non abbiamo trovato transazioni che corrispondano ai criteri selezionati.
                        </p>
                        <Button
                            onClick={resetFilters}
                            variant="secondary"
                            className="rounded-xl font-bold px-8"
                        >
                            Azzera tutti i filtri
                        </Button>
                    </div>
                )}

            </MacroSection>

            {/* Detail Sidebar */}
            <TransactionDetailSheet
                transaction={selectedDetail}
                open={!!selectedDetail}
                onOpenChange={(open) => !open && setSelectedDetail(null)}
                mode={detailMode}
            />

            {/* Export Error Dialog */}
            <ConfirmDialog
                open={!!exportError}
                onOpenChange={(open) => !open && setExportError(null)}
                title="Errore di Esportazione"
                description={exportError}
                confirmLabel="OK"
                cancelLabel="Chiudi"
                onConfirm={() => setExportError(null)}
            />

            {/* Direct Deletion Confirmation */}
            <ConfirmDialog
                open={!!transactionToDelete}
                onOpenChange={(open) => !open && setTransactionToDelete(null)}
                title="Conferma eliminazione"
                description={`Sei sicuro di voler eliminare la transazione "${transactionToDelete?.description}"? Questa azione non può essere annullata.`}
                confirmLabel="Elimina"
                cancelLabel="Annulla"
                onConfirm={confirmDelete}
                isLoading={isDeleting}
                variant="destructive"
            />
        </StaggerContainer>
    )
}

export default function TransactionsPage() {
    return (
        <Suspense fallback={
            <div className="space-y-8 animate-in fade-in duration-500">
                <div>
                    <Skeleton className="h-10 w-64 rounded-xl" />
                    <Skeleton className="h-4 w-48 mt-2 rounded-lg" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Skeleton className="h-24 rounded-2xl" />
                    <Skeleton className="h-24 rounded-2xl" />
                    <Skeleton className="h-24 rounded-2xl" />
                    <Skeleton className="h-24 rounded-2xl" />
                </div>
                <Skeleton className="h-96 w-full rounded-2xl" />
            </div>
        }>
            <TransactionsPageContent />
        </Suspense>
    )
}
