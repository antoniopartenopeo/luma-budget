"use client"

import { useState, useMemo } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TransactionsTable } from "@/features/transactions/components/transactions-table"
import { TransactionsFilterBar } from "@/features/transactions/components/transactions-filter-bar"
import { useTransactions } from "@/features/transactions/api/use-transactions"


import { StateMessage } from "@/components/ui/state-message"
import { Skeleton } from "@/components/ui/skeleton"

export default function TransactionsPage() {
    const { data: transactions, isLoading, isError, refetch } = useTransactions()
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedType, setSelectedType] = useState("all")
    const [selectedCategory, setSelectedCategory] = useState("all")


    const categories = useMemo(() => {
        if (!transactions) return []
        const uniqueCategories = new Set(transactions.map((t) => t.category))
        return Array.from(uniqueCategories).sort()
    }, [transactions])

    const filteredTransactions = useMemo(() => {
        if (!transactions) return []

        return transactions.filter((transaction) => {
            const matchesSearch = transaction.description
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
            const matchesType =
                selectedType === "all" || transaction.type === selectedType
            const matchesCategory =
                selectedCategory === "all" || transaction.category === selectedCategory

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
                    <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Esporta
                    </Button>
                </div>
            </div>

            <TransactionsFilterBar
                onSearchChange={setSearchQuery}
                onTypeChange={setSelectedType}
                onCategoryChange={setSelectedCategory}
                categories={categories}
            />

            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                </div>
            ) : (
                <TransactionsTable transactions={filteredTransactions} />
            )}
        </div>
    )
}
