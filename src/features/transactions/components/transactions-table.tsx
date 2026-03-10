"use client"

import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Transaction } from "../api/types"
import { cn } from "@/lib/utils"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { SortField, SortOrder } from "../utils/transactions-logic"
import {
    TRANSACTION_TABLE_DESCRIPTION_HEADER_OFFSET_CLASS_NAME,
    TRANSACTION_TABLE_HEADER_COLUMNS_CLASS_NAME,
    TransactionRowCard
} from "./transaction-row-card"

interface TransactionsTableProps {
    transactions: Transaction[]
    onEditTransaction: (transaction: Transaction) => void
    onDeleteTransaction: (id: string) => void
    onRowClick: (transaction: Transaction) => void
    sortField: SortField
    sortOrder: SortOrder
    onSortChange: (field: SortField) => void
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
}

interface SortIndicatorProps {
    field: SortField
    sortField: SortField
    sortOrder: SortOrder
}

interface SortPillProps extends SortIndicatorProps {
    label: string
    onSortChange: (field: SortField) => void
}

interface SortHeaderButtonProps extends SortPillProps {
    align?: "start" | "center" | "end"
}

const SortIndicator = ({ field, sortField, sortOrder }: SortIndicatorProps) => {
    if (sortField !== field) {
        return <ArrowUpDown className="ml-1.5 h-3 w-3 opacity-40" />
    }
    return sortOrder === "asc"
        ? <ArrowUp className="ml-1.5 h-3 w-3 text-primary" />
        : <ArrowDown className="ml-1.5 h-3 w-3 text-primary" />
}

function SortPill({ field, sortField, sortOrder, label, onSortChange }: SortPillProps) {
    return (
        <Button
            type="button"
            variant="ghost"
            onClick={() => onSortChange(field)}
            className={cn(
                "h-9 rounded-xl px-3 text-xs font-bold uppercase tracking-[0.14em] transition-[background-color,color,border-color] duration-200",
                sortField === field
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
        >
            {label}
            <SortIndicator field={field} sortField={sortField} sortOrder={sortOrder} />
        </Button>
    )
}

function SortHeaderButton({
    field,
    sortField,
    sortOrder,
    label,
    onSortChange,
    align = "start"
}: SortHeaderButtonProps) {
    return (
        <Button
            type="button"
            variant="ghost"
            onClick={() => onSortChange(field)}
            className={cn(
                "h-8 rounded-xl px-0 text-[11px] font-black uppercase tracking-[0.16em] transition-[background-color,color,border-color] duration-200",
                align === "start" && "justify-start",
                align === "center" && "justify-center",
                align === "end" && "justify-end",
                sortField === field
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
            )}
        >
            {label}
            <SortIndicator field={field} sortField={sortField} sortOrder={sortOrder} />
        </Button>
    )
}

export function TransactionsTable({
    transactions,
    onEditTransaction,
    onDeleteTransaction,
    onRowClick,
    sortField,
    sortOrder,
    onSortChange,
    currentPage,
    totalPages,
    onPageChange
}: TransactionsTableProps) {
    return (
        <div className="space-y-4">
            <div className="glass-card rounded-[1.6rem] p-1.5 md:hidden">
                <div className="flex flex-wrap items-center gap-1">
                    <SortPill
                        field="date"
                        label="Data"
                        sortField={sortField}
                        sortOrder={sortOrder}
                        onSortChange={onSortChange}
                    />
                    <SortPill
                        field="description"
                        label="Descrizione"
                        sortField={sortField}
                        sortOrder={sortOrder}
                        onSortChange={onSortChange}
                    />
                    <SortPill
                        field="category"
                        label="Categoria"
                        sortField={sortField}
                        sortOrder={sortOrder}
                        onSortChange={onSortChange}
                    />
                    <SortPill
                        field="amount"
                        label="Importo"
                        sortField={sortField}
                        sortOrder={sortOrder}
                        onSortChange={onSortChange}
                    />
                </div>
            </div>

            <div
                className={cn(
                    "glass-card hidden rounded-[1.6rem] px-3.5 py-2.5 md:grid md:items-center md:gap-4",
                    TRANSACTION_TABLE_HEADER_COLUMNS_CLASS_NAME
                )}
            >
                <div className="flex items-center">
                    <SortHeaderButton
                        field="date"
                        label="Data"
                        sortField={sortField}
                        sortOrder={sortOrder}
                        onSortChange={onSortChange}
                        align="start"
                    />
                </div>
                <div className={cn("flex items-center", TRANSACTION_TABLE_DESCRIPTION_HEADER_OFFSET_CLASS_NAME)}>
                    <SortHeaderButton
                        field="description"
                        label="Descrizione"
                        sortField={sortField}
                        sortOrder={sortOrder}
                        onSortChange={onSortChange}
                        align="start"
                    />
                </div>
                <div className="flex items-center">
                    <SortHeaderButton
                        field="category"
                        label="Categoria"
                        sortField={sortField}
                        sortOrder={sortOrder}
                        onSortChange={onSortChange}
                        align="start"
                    />
                </div>
                <div className="flex items-center justify-center">
                    <span className="text-[11px] font-black uppercase tracking-[0.16em] text-muted-foreground/76">
                        Tipo
                    </span>
                </div>
                <div className="flex items-center justify-end">
                    <SortHeaderButton
                        field="amount"
                        label="Importo"
                        sortField={sortField}
                        sortOrder={sortOrder}
                        onSortChange={onSortChange}
                        align="end"
                    />
                </div>
                <div aria-hidden />
            </div>

            <div className="space-y-3">
                {transactions.map((transaction) => (
                    <TransactionRowCard
                        key={transaction.id}
                        transaction={transaction}
                        layout="table"
                        primaryAction={{
                            kind: "button",
                            ariaLabel: `Apri dettaglio transazione ${transaction.description}`,
                            onClick: () => onRowClick(transaction)
                        }}
                        endSlot={
                            <TransactionActionsMenu
                                transaction={transaction}
                                onEdit={onEditTransaction}
                                onDelete={onDeleteTransaction}
                            />
                        }
                    />
                ))}
            </div>

            {totalPages > 1 ? (
                <div className="glass-card flex items-center justify-between rounded-[1.4rem] px-3 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Pagina <span className="text-foreground">{currentPage}</span> di{" "}
                        <span className="text-foreground">{totalPages}</span>
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-[1rem] border border-white/18 bg-white/35 hover:bg-white/55 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.09]"
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-[1rem] border border-white/18 bg-white/35 hover:bg-white/55 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.09]"
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ) : null}
        </div>
    )
}

function TransactionActionsMenu({
    transaction,
    onEdit,
    onDelete
}: {
    transaction: Transaction
    onEdit: (t: Transaction) => void
    onDelete: (id: string) => void
}) {
    return (
        <DropdownMenu theme-target="transaction-menu">
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-[1rem] border border-white/18 bg-white/32 text-muted-foreground transition-[background-color,color,border-color] duration-200 hover:border-white/32 hover:bg-white/55 hover:text-foreground dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.09]"
                >
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl">
                <DropdownMenuLabel className="text-xs text-muted-foreground">Azioni</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onEdit(transaction)} className="gap-2 font-bold">
                    Modifica
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="gap-2 font-bold text-destructive focus:bg-destructive/10 focus:text-destructive"
                    onClick={() => onDelete(transaction.id)}
                >
                    Elimina
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
