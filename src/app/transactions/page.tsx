"use client"

import { useState, useMemo, Suspense } from "react"
import { ArrowUpRight } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { TransactionsTable } from "@/features/transactions/components/transactions-table"
import { TransactionsFilterBar, PeriodPreset } from "@/features/transactions/components/transactions-filter-bar"
import { TransactionsSummaryBar } from "@/features/transactions/components/transactions-summary-bar"
import { TransactionDetailSheet } from "@/features/transactions/components/transaction-detail-sheet"
import { useTransactions } from "@/features/transactions/api/use-transactions"
import { exportTransactionsToCSV } from "@/features/transactions/utils/export-transactions"
import {
    applyFilters,
    applySorting,
    computeSummary,
    paginateData,
    SortField,
    SortOrder,
    TransactionFilters
} from "@/features/transactions/utils/transactions-logic"
import { Transaction } from "@/features/transactions/api/types"
import { PageHeader } from "@/components/ui/page-header"

import { StateMessage } from "@/components/ui/state-message"
import { Skeleton } from "@/components/ui/skeleton"

const PAGE_SIZE = 15

function TransactionsPageContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const { data: transactions = [], isLoading, isError, refetch } = useTransactions()

    // --- Filter / Sorting / Pagination State (from URL) ---
    const search = searchParams.get("q") || ""
    const type = (searchParams.get("type") || "all") as "all" | "income" | "expense"
    const categoryId = searchParams.get("cat") || "all"
    const isSuperfluous = searchParams.get("waste") === "true"
    const period = (searchParams.get("period") || "all") as PeriodPreset
    const fromDate = searchParams.get("from") || ""
    const toDate = searchParams.get("to") || ""

    const sort = (searchParams.get("sort") || "date") as SortField
    const order = (searchParams.get("order") || "desc") as SortOrder
    const page = parseInt(searchParams.get("p") || "1", 10)

    // --- Local UI State for Detail Sheet ---
    const [selectedDetail, setSelectedDetail] = useState<Transaction | null>(null)
    const [detailMode, setDetailMode] = useState<"view" | "edit">("view")
    const [isExporting, setIsExporting] = useState(false)

    // --- Derived Filters Object ---
    const filters = useMemo((): TransactionFilters => {
        const dateRange: { from?: Date; to?: Date } = {}

        if (period === "custom") {
            if (fromDate) dateRange.from = new Date(fromDate)
            if (toDate) dateRange.to = new Date(toDate)
        } else if (period !== "all") {
            const now = new Date()
            dateRange.to = now
            const from = new Date()
            if (period === "1m") from.setMonth(now.getMonth() - 1)
            else if (period === "3m") from.setMonth(now.getMonth() - 3)
            else if (period === "6m") from.setMonth(now.getMonth() - 6)
            else if (period === "1y") from.setFullYear(now.getFullYear() - 1)
            dateRange.from = from
        }

        return {
            search,
            type,
            categoryId,
            isSuperfluous,
            dateRange
        }
    }, [search, type, categoryId, isSuperfluous, period, fromDate, toDate])

    // --- Computed Data ---
    const { filteredList, sortedList, paginatedList, summary, totalPages } = useMemo(() => {
        const filtered = applyFilters(transactions, filters)
        const sorted = applySorting(filtered, sort, order)
        const paginated = paginateData(sorted, page, PAGE_SIZE)
        const summ = computeSummary(filtered)
        const totalP = Math.ceil(filtered.length / PAGE_SIZE)

        return {
            filteredList: filtered,
            sortedList: sorted,
            paginatedList: paginated,
            summary: summ,
            totalPages: totalP
        }
    }, [transactions, filters, sort, order, page])

    // --- URL Update Helpers ---
    const updateParams = (updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString())
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === "" || value === "all" || (key === "p" && value === "1")) {
                params.delete(key)
            } else {
                params.set(key, value)
            }
        })
        router.push(`/transactions?${params.toString()}`)
    }

    const resetFilters = () => {
        router.push("/transactions")
    }

    // --- Actions ---
    const handleEdit = (transaction: Transaction) => {
        setSelectedDetail(transaction)
        setDetailMode("edit")
    }

    const handleDelete = (id: string) => {
        const transaction = transactions.find(t => t.id === id)
        if (transaction) {
            setSelectedDetail(transaction)
            setDetailMode("view")
            // The sheet will be opened, and the user can click 'Delete' there.
            // Or we could have a 'delete' mode that shows the confirm immediately.
            // Given the requirement "Delete confirms...", opening the sheet is correct.
        }
    }

    const handleExport = async (all: boolean = false) => {
        if (isExporting || isLoading) return
        setIsExporting(true)

        // Small delay for UX feedback
        await new Promise(resolve => setTimeout(resolve, 300))

        const exportList = all ? transactions : sortedList
        const result = exportTransactionsToCSV({
            transactions: exportList,
            dateRange: filters.dateRange.from && filters.dateRange.to
                ? { start: filters.dateRange.from.toISOString(), end: filters.dateRange.to.toISOString() }
                : undefined
        })

        setIsExporting(false)
        if (!result.success) {
            alert(result.error || "Si è verificato un errore durante l'esportazione.")
        }
    }

    const handleSortChange = (field: SortField) => {
        const newOrder = sort === field && order === "desc" ? "asc" : "desc"
        updateParams({ sort: field, order: newOrder, p: "1" })
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
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <PageHeader
                title="Transazioni"
                description="Analisi dettagliata del tuo flusso di cassa."
            />

            {/* Summary KPI Bar */}
            <TransactionsSummaryBar summary={summary} isLoading={isLoading} />

            {/* Filters Section */}
            <div className="p-4 bg-card/30 border border-muted-foreground/10 rounded-2xl shadow-sm backdrop-blur-md">
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
                    isSuperfluousOnly={isSuperfluous}
                    onSuperfluousChange={(v) => updateParams({ waste: v ? "true" : null, p: "1" })}
                    onResetFilters={resetFilters}
                    onExportView={() => handleExport(false)}
                    onExportAll={() => handleExport(true)}
                    isExporting={isExporting}
                    hasResults={filteredList.length > 0}
                />
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
                    <h3 className="text-xl font-bold tracking-tight mb-2">Nessun risultato</h3>
                    <p className="text-muted-foreground font-medium mb-8">
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

            {/* Detail Sidebar */}
            <TransactionDetailSheet
                transaction={selectedDetail}
                open={!!selectedDetail}
                onOpenChange={(open) => !open && setSelectedDetail(null)}
                mode={detailMode}
            />
        </div>
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
