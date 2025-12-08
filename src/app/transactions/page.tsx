"use client"

import { useState, useMemo } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TransactionsTable } from "@/features/transactions/components/transactions-table"
import { TransactionsFilterBar } from "@/features/transactions/components/transactions-filter-bar"
import { useTransactions } from "@/features/transactions/api/use-transactions"
import { useTransactionsActions } from "@/features/transactions/hooks/use-transactions-actions"
import { EditTransactionDialog } from "@/features/transactions/components/edit-transaction-dialog"
import { DeleteTransactionDialog } from "@/features/transactions/components/delete-transaction-dialog"


import { StateMessage } from "@/components/ui/state-message"
import { Skeleton } from "@/components/ui/skeleton"

export default function TransactionsPage() {
    const { data: transactions, isLoading, isError, refetch } = useTransactions()
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedType, setSelectedType] = useState("all")
    const [selectedCategory, setSelectedCategory] = useState("all")

    const {
        editingTransaction,
        deletingTransactionId,
        handleEdit,
        handleDelete,
        closeEdit,
        closeDelete
    } = useTransactionsActions()

    const handleExport = () => {
        alert("Esportazione CSV sarà disponibile a breve.\nFunzione in sviluppo.")
    }

    const filteredTransactions = useMemo(() => {
        if (!transactions) return []

        return transactions.filter((transaction) => {
            const matchesSearch = transaction.description
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
            const matchesType =
                selectedType === "all" || transaction.type === selectedType
            const matchesCategory =
                selectedCategory === "all" || transaction.categoryId === selectedCategory

            return matchesSearch && matchesType && matchesCategory
        })
    }, [transactions, searchQuery, selectedType, selectedCategory])

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
                    <Button variant="outline" className="gap-2" onClick={handleExport}>
                        <Download className="h-4 w-4" />
                        Esporta
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
                }}
            />

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
                            }}
                        />
                    ) : (
                        <StateMessage
                            variant="empty"
                            title="Nessuna transazione"
                            description="Non hai ancora effettuato nessuna transazione."
                            actionLabel="Aggiungi transazione"
                            // QuickExpenseInput is in TopBar, so maybe just scroll top or show a dialog. 
                            // For now, simple textual nudge is fine or trigger focus.
                            // But actionLabel requires onActionClick.
                            onActionClick={() => {
                                const input = document.querySelector('input[placeholder="Descrizione"]') as HTMLInputElement
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
