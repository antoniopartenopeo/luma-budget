// Nessuna modifica necessaria qui, il componente eredita lo stile corretto da MacroSection.

import { CategoryIcon } from "@/features/categories/components/category-icon"
import { cn } from "@/lib/utils"
import { calculateDateRange, filterByRange } from "@/lib/date-ranges"
import { useRecentTransactions } from "@/features/transactions/api/use-transactions"
import { StateMessage } from "@/components/ui/state-message"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardTimeFilter } from "../api/types"
import { useCurrency } from "@/features/settings/api/use-currency"
import { formatSignedCents } from "@/domain/money"
import { getSignedCents } from "@/domain/transactions"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { MacroSection } from "@/components/patterns/macro-section"
import { usePrivacyStore } from "@/features/privacy/privacy.store"
import { getPrivacyClass } from "@/features/privacy/privacy-utils"

interface RecentTransactionsProps {
    filter?: DashboardTimeFilter
}

export function RecentTransactions({ filter }: RecentTransactionsProps) {
    const { data: transactions, isLoading, isError, refetch } = useRecentTransactions()
    const { currency, locale } = useCurrency()
    const { isPrivacyMode } = usePrivacyStore()
    const router = useRouter()

    if (isLoading) {
        // ... (rest of the logic remains same as my previous tool call for RecentTransactions body)
        return (
            <MacroSection title="Transazioni Recenti" description="Caricamento..." className="col-span-3">
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
            </MacroSection>
        )
    }

    if (isError) {
        return (
            <MacroSection className="col-span-3">
                <StateMessage
                    variant="error"
                    title="Errore caricamento transazioni"
                    description="Non è stato possibile caricare le transazioni recenti."
                    actionLabel="Riprova"
                    onActionClick={() => refetch()}
                />
            </MacroSection>
        )
    }

    // Client-side Filtering
    let filteredTransactions = transactions || []
    if (filter) {
        const { startDate, endDate } = calculateDateRange(
            filter.period,
            (filter.mode === "range" && filter.months) ? filter.months : 1
        )
        filteredTransactions = filterByRange(filteredTransactions, startDate, endDate)
    }

    // Sort by date desc (assuming API does, but good to ensure) and take top 5
    const displayedTransactions = filteredTransactions
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5)

    if (displayedTransactions.length === 0) {
        return (
            <MacroSection title="Transazioni Recenti" description="Nel periodo selezionato" className="col-span-3">
                <StateMessage
                    variant="empty"
                    title="Nessuna transazione"
                    description="Nessuna transazione trovata in questo periodo."
                />
            </MacroSection>
        )
    }

    return (
        <MacroSection
            title="Transazioni Recenti"
            description="Ultime 5 transazioni del periodo"
            className="col-span-3"
            headerActions={
                <Button variant="ghost" size="sm" className="gap-1 text-primary" onClick={() => router.push("/transactions")}>
                    Vedi tutte
                    <ChevronRight className="h-4 w-4" />
                </Button>
            }
        >
            <div className="space-y-6">
                {displayedTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <CategoryIcon
                                categoryName={transaction.category}
                                size={20}
                                showBackground
                                className="border border-border/50"
                            />
                            <div className="space-y-1">
                                <p className="text-sm font-medium leading-none text-foreground">{transaction.description}</p>
                                <p className="text-xs text-muted-foreground">{transaction.category} • {transaction.date}</p>
                            </div>
                        </div>
                        <div className={cn("font-medium tabular-nums", transaction.type === "income" ? "text-emerald-600" : "text-foreground", getPrivacyClass(isPrivacyMode))}>
                            {formatSignedCents(getSignedCents(transaction), currency, locale)}
                        </div>
                    </div>
                ))}
            </div>
        </MacroSection>
    )
}
