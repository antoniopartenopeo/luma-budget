"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CategoryIcon } from "@/features/categories/components/category-icon"
import { cn } from "@/lib/utils"
import { useRecentTransactions } from "@/features/transactions/api/use-transactions"
import { StateMessage } from "@/components/ui/state-message"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardTimeFilter } from "../api/types"
import { useCurrency } from "@/features/settings/api/use-currency"
import { formatSignedCents, getSignedCents } from "@/lib/currency-utils"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"

interface RecentTransactionsProps {
    filter?: DashboardTimeFilter
}

export function RecentTransactions({ filter }: RecentTransactionsProps) {
    const { data: transactions, isLoading, isError, refetch } = useRecentTransactions()
    const { currency, locale } = useCurrency()
    const router = useRouter()

    if (isLoading) {
        return (
            <Card className="col-span-3 rounded-xl shadow-sm">
                <CardHeader>
                    <CardTitle>Transazioni Recenti</CardTitle>
                    <CardDescription>Caricamento...</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-[150px]" />
                                        <Skeleton className="h-3 w-[100px]" />
                                    </div>
                                </div>
                                <Skeleton className="h-4 w-[60px]" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (isError) {
        return (
            <Card className="col-span-3 rounded-xl shadow-sm">
                <CardContent className="pt-6">
                    <StateMessage
                        variant="error"
                        title="Errore caricamento transazioni"
                        description="Non è stato possibile caricare le transazioni recenti."
                        actionLabel="Riprova"
                        onActionClick={() => refetch()}
                    />
                </CardContent>
            </Card>
        )
    }

    // Client-side Filtering
    let filteredTransactions = transactions || []

    if (filter) {
        const endDate = new Date(filter.period + "-01")
        endDate.setMonth(endDate.getMonth() + 1)
        endDate.setDate(0) // End of month

        const startDate = new Date(filter.period + "-01")
        if (filter.mode === "range" && filter.months) {
            startDate.setMonth(startDate.getMonth() - (filter.months - 1))
        }
        startDate.setDate(1) // Start of month

        filteredTransactions = filteredTransactions.filter(t => {
            const d = new Date(t.timestamp)
            return d >= startDate && d <= endDate
        })
    }

    // Sort by date desc (assuming API does, but good to ensure) and take top 5
    const displayedTransactions = filteredTransactions
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5)

    if (displayedTransactions.length === 0) {
        return (
            <Card className="col-span-3 rounded-xl shadow-sm">
                <CardHeader>
                    <CardTitle>Transazioni Recenti</CardTitle>
                    <CardDescription>Nel periodo selezionato</CardDescription>
                </CardHeader>
                <CardContent>
                    <StateMessage
                        variant="empty"
                        title="Nessuna transazione"
                        description="Nessuna transazione trovata in questo periodo."
                    />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="col-span-3 rounded-xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Transazioni Recenti</CardTitle>
                    <CardDescription>Ultime 5 transazioni del periodo</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="gap-1 text-primary" onClick={() => router.push("/transactions")}>
                    Vedi tutte
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {displayedTransactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center gap-4">
                                <CategoryIcon
                                    categoryName={transaction.category}
                                    size={20}
                                    showBackground
                                    className="border border-border/50"
                                />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">{transaction.description}</p>
                                    <p className="text-xs text-muted-foreground">{transaction.category} • {transaction.date}</p>
                                </div>
                            </div>
                            <div className={cn("font-medium", transaction.type === "income" ? "text-emerald-600" : "text-foreground")}>
                                {formatSignedCents(getSignedCents(transaction), currency, locale)}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
