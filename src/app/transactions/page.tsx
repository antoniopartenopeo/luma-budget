"use client"

import { useState, useMemo, useEffect } from "react"
import { Download, X, Loader2 } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TransactionsTable } from "@/features/transactions/components/transactions-table"
import { TransactionsFilterBar } from "@/features/transactions/components/transactions-filter-bar"
import { useTransactions } from "@/features/transactions/api/use-transactions"
import { useTransactionsActions } from "@/features/transactions/hooks/use-transactions-actions"
import { EditTransactionDialog } from "@/features/transactions/components/edit-transaction-dialog"
import { DeleteTransactionDialog } from "@/features/transactions/components/delete-transaction-dialog"
import { exportTransactionsToCSV } from "@/features/transactions/utils/export-transactions"

import { StateMessage } from "@/components/ui/state-message"
import { Skeleton } from "@/components/ui/skeleton"

export default function TransactionsPage() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const { data: transactions, isLoading, isError, refetch } = useTransactions()

    // Export state
    const [isExporting, setIsExporting] = useState(false)

    // Initialize from URL or default
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedType, setSelectedType] = useState(searchParams.get("type") || "all")
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all")

    // Sync state with URL params when they change
    useEffect(() => {
        const categoryParam = searchParams.get("category")
        if (categoryParam) setSelectedCategory(categoryParam)

        const typeParam = searchParams.get("type")
        if (typeParam) setSelectedType(typeParam)
    }, [searchParams])

    // Derived from URL
    const isWantsFilter = searchParams.get("filter") === "wants"

    const {
        editingTransaction,
        deletingTransactionId,
        handleEdit,
        handleDelete,
        closeEdit,
        closeDelete
    } = useTransactionsActions()

    const handleExport = async () => {
        if (isExporting || isLoading) return

        setIsExporting(true)

        // Small delay for UX feedback
        await new Promise(resolve => setTimeout(resolve, 300))

        const result = exportTransactionsToCSV({
            transactions: filteredTransactions
        })

        setIsExporting(false)

        if (!result.success) {
            alert(result.error || "Si è verificato un errore durante l'esportazione. Riprova.")
        }
    }

    const clearWantsFilter = () => {
        router.push("/transactions")
    }

    const filteredTransactions = useMemo(() => {
        if (!transactions) return []

        return transactions.filter((transaction) => {
            const matchesSearch = transaction.description
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
                transaction.amount.includes(searchQuery)

            const matchesType =
                selectedType === "all" || transaction.type === selectedType

            const matchesCategory =
                selectedCategory === "all" || transaction.categoryId === selectedCategory

            // Dashboard logic for "Useless" (Wants)
            const matchesWants = !isWantsFilter || !!transaction.isSuperfluous

            if (!matchesWants) return false

            return matchesSearch && matchesType && matchesCategory
        })
    }, [transactions, searchQuery, selectedType, selectedCategory, isWantsFilter])

    if (isError) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Transazioni</h1>
                        <p className="text-muted-foreground">
                            Gestisci e monitora le tue entrate e uscite.
                        </p>
                    </div>
                </div>
                <StateMessage
                    variant="error"
                    title="Impossibile caricare le transazioni"
                    description="Si è verificato un problema durante il recupero dei dati. Riprova tra poco."
                    actionLabel="Riprova"
                    onActionClick={() => refetch()}
                />
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Transazioni</h1>
                    <p className="text-muted-foreground">
                        Gestisci e monitora le tue entrate e uscite.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={handleExport}
                        disabled={isExporting || isLoading}
                    >
                        {isExporting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Preparazione file…
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4" />
                                Esporta
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <TransactionsFilterBar
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                typeValue={selectedType}
                onTypeChange={setSelectedType}
                categoryValue={selectedCategory}
                onCategoryChange={setSelectedCategory}
                onResetFilters={() => {
                    setSearchQuery("")
                    setSelectedType("all")
                    setSelectedCategory("all")
                    if (isWantsFilter) clearWantsFilter()
                }}
            />

            {/* Active Filter Indicator for Wants */}
            {isWantsFilter && (
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="pl-2 pr-1 py-1 gap-1 text-sm font-normal bg-orange-100 text-orange-700 hover:bg-orange-200">
                        Filtro attivo: Spese Superflue
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 rounded-full ml-1 hover:bg-orange-300/50"
                            onClick={clearWantsFilter}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </Badge>
                </div>
            )}

            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                </div>
            ) : filteredTransactions.length > 0 ? (
                <TransactionsTable
                    transactions={filteredTransactions}
                    onEditTransaction={handleEdit}
                    onDeleteTransaction={handleDelete}
                />
            ) : (
                <div className="py-12 flex justify-center">
                    {transactions && transactions.length > 0 ? (
                        <StateMessage
                            variant="empty"
                            title="Nessuna transazione trovata"
                            description="Nessuna transazione corrisponde ai filtri selezionati."
                            actionLabel="Azzera filtri"
                            onActionClick={() => {
                                setSearchQuery("")
                                setSelectedType("all")
                                setSelectedCategory("all")
                                if (isWantsFilter) clearWantsFilter()
                            }}
                        />
                    ) : (
                        <StateMessage
                            variant="empty"
                            title="Nessuna transazione"
                            description="Non hai ancora effettuato nessuna transazione."
                            actionLabel="Aggiungi transazione"
                            onActionClick={() => {
                                const input = document.querySelector('input[placeholder="Es. Caffè bar, Abbonamento Spotify..."]') as HTMLInputElement
                                if (input) input.focus()
                            }}
                        />
                    )}
                </div>
            )}

            <EditTransactionDialog
                open={!!editingTransaction}
                onOpenChange={(open) => !open && closeEdit()}
                transaction={editingTransaction}
            />

            <DeleteTransactionDialog
                open={!!deletingTransactionId}
                onOpenChange={(open) => !open && closeDelete()}
                transactionId={deletingTransactionId}
            />
        </div>
    )
}
