"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useRecentTransactions } from "@/features/transactions/api/use-transactions"
import { LoadingState } from "@/components/ui/loading-state"
import { StateMessage } from "@/components/ui/state-message"
import { Skeleton } from "@/components/ui/skeleton"

export function RecentTransactions() {
    const { data: transactions, isLoading, isError, refetch } = useRecentTransactions()

    const handleAddExpenseClick = () => {
        // Focus on the description input of QuickExpenseInput
        // Assuming the input has a specific ID or we can find it by placeholder/label
        // For now, let's try to find it by attribute as we don't have a ref passed down
        const input = document.querySelector('input[placeholder="Descrizione spesa"]') as HTMLInputElement
        if (input) {
            input.focus()
        }
    }

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

    if (!transactions || transactions.length === 0) {
        return (
            <Card className="col-span-3 rounded-xl shadow-sm">
                <CardHeader>
                    <CardTitle>Transazioni Recenti</CardTitle>
                    <CardDescription>I tuoi ultimi movimenti finanziari</CardDescription>
                </CardHeader>
                <CardContent>
                    <StateMessage
                        variant="empty"
                        title="Nessuna transazione"
                        description="Non hai ancora effettuato nessuna transazione."
                        actionLabel="Aggiungi la tua prima spesa"
                        onActionClick={handleAddExpenseClick}
                    />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="col-span-3 rounded-xl shadow-sm">
            <CardHeader>
                <CardTitle>Transazioni Recenti</CardTitle>
                <CardDescription>I tuoi ultimi movimenti finanziari</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {transactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-10 w-10 bg-muted border border-border">
                                    <AvatarFallback className="bg-transparent text-lg">{transaction.icon}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">{transaction.description}</p>
                                    <p className="text-xs text-muted-foreground">{transaction.category} • {transaction.date}</p>
                                </div>
                            </div>
                            <div className={cn("font-medium", transaction.type === "income" ? "text-emerald-600" : "text-foreground")}>
                                {transaction.amount}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
