"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    MoreHorizontal,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    ChevronLeft,
    ChevronRight
} from "lucide-react"
import { Transaction } from "../api/types"
import { cn } from "@/lib/utils"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CategoryIcon } from "@/features/categories/components/category-icon"
import { CategoryLabel } from "@/features/categories/components/category-label"
import { formatTransactionDate } from "@/features/transactions/utils/format-date"
import { SortField, SortOrder } from "../utils/transactions-logic"

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

const SortIndicator = ({ field, sortField, sortOrder }: SortIndicatorProps) => {
    if (sortField !== field) return <ArrowUpDown className="ml-2 h-3 w-3 opacity-30" />;
    return sortOrder === "asc"
        ? <ArrowUp className="ml-2 h-3 w-3 text-primary" />
        : <ArrowDown className="ml-2 h-3 w-3 text-primary" />;
};

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
            {/* Desktop View: Table */}
            <div className="hidden md:block rounded-3xl border bg-card overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow className="hover:bg-transparent border-b">
                            <TableHead className="w-[180px]">
                                <Button
                                    variant="ghost"
                                    onClick={() => onSortChange("date")}
                                    className={cn(
                                        "-ml-3 h-9 font-black text-[10px] uppercase tracking-widest hover:bg-muted/50 transition-all",
                                        sortField === "date" ? "text-primary bg-primary/5" : "text-muted-foreground"
                                    )}
                                >
                                    Data
                                    <SortIndicator field="date" sortField={sortField} sortOrder={sortOrder} />
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button
                                    variant="ghost"
                                    onClick={() => onSortChange("description")}
                                    className={cn(
                                        "-ml-3 h-9 font-black text-[10px] uppercase tracking-widest hover:bg-muted/50 transition-all",
                                        sortField === "description" ? "text-primary bg-primary/5" : "text-muted-foreground"
                                    )}
                                >
                                    Descrizione
                                    <SortIndicator field="description" sortField={sortField} sortOrder={sortOrder} />
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button
                                    variant="ghost"
                                    onClick={() => onSortChange("category")}
                                    className={cn(
                                        "-ml-3 h-9 font-black text-[10px] uppercase tracking-widest hover:bg-muted/50 transition-all",
                                        sortField === "category" ? "text-primary bg-primary/5" : "text-muted-foreground"
                                    )}
                                >
                                    Categoria
                                    <SortIndicator field="category" sortField={sortField} sortOrder={sortOrder} />
                                </Button>
                            </TableHead>
                            <TableHead className="text-center font-black text-[10px] uppercase tracking-widest text-muted-foreground">Tipo</TableHead>
                            <TableHead className="text-right">
                                <Button
                                    variant="ghost"
                                    onClick={() => onSortChange("amount")}
                                    className={cn(
                                        "-mr-3 ml-auto h-9 font-black text-[10px] uppercase tracking-widest hover:bg-muted/50 transition-all",
                                        sortField === "amount" ? "text-primary bg-primary/5" : "text-muted-foreground"
                                    )}
                                >
                                    Importo
                                    <SortIndicator field="amount" sortField={sortField} sortOrder={sortOrder} />
                                </Button>
                            </TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((transaction) => (
                            <TableRow
                                key={transaction.id}
                                className="hover:bg-muted/20 transition-all border-b last:border-0 cursor-pointer group"
                                onClick={() => onRowClick(transaction)}
                            >
                                <TableCell className="text-sm text-muted-foreground font-medium">
                                    {formatTransactionDate(transaction)}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <CategoryIcon
                                            categoryName={transaction.category}
                                            categoryId={transaction.categoryId}
                                            size={24}
                                            showBackground
                                        />
                                        <div className="flex flex-col">
                                            <span className="font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                                                {transaction.description}
                                            </span>
                                            {transaction.isSuperfluous && (
                                                <div className="flex mt-1">
                                                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 uppercase tracking-tighter text-amber-600 border-amber-200 bg-amber-50 font-bold">
                                                        Superflua
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm text-foreground/70 font-bold">
                                    <CategoryLabel id={transaction.categoryId} fallback={transaction.category} />
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge
                                        variant="secondary"
                                        className={cn(
                                            "text-[10px] font-black px-2 py-0.5 rounded-full border",
                                            transaction.type === "income"
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                : "bg-rose-50 text-rose-700 border-rose-100"
                                        )}
                                    >
                                        {transaction.type === "income" ? "Entrata" : "Uscita"}
                                    </Badge>
                                </TableCell>
                                <TableCell
                                    className={cn(
                                        "text-right font-black tabular-nums text-base",
                                        transaction.type === "income" ? "text-emerald-600" : "text-rose-600"
                                    )}
                                >
                                    {transaction.amount}
                                </TableCell>
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                    <TransactionActionsMenu
                                        transaction={transaction}
                                        onEdit={onEditTransaction}
                                        onDelete={onDeleteTransaction}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile View: Cards */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
                {transactions.map((transaction) => (
                    <div
                        key={transaction.id}
                        className="p-4 rounded-3xl border bg-card/50 backdrop-blur-sm shadow-sm space-y-4 active:scale-[0.98] transition-transform cursor-pointer"
                        onClick={() => onRowClick(transaction)}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <CategoryIcon
                                    categoryName={transaction.category}
                                    categoryId={transaction.categoryId}
                                    size={36}
                                    showBackground
                                />
                                <div className="flex flex-col">
                                    <span className="font-black text-foreground leading-tight text-base">
                                        {transaction.description}
                                    </span>
                                    <span className="text-xs text-muted-foreground font-medium mt-0.5">
                                        {formatTransactionDate(transaction)} • <CategoryLabel id={transaction.categoryId} fallback={transaction.category} />
                                    </span>
                                </div>
                            </div>
                            <div onClick={(e) => e.stopPropagation()}>
                                <TransactionActionsMenu
                                    transaction={transaction}
                                    onEdit={onEditTransaction}
                                    onDelete={onDeleteTransaction}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-dashed">
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant="secondary"
                                    className={cn(
                                        "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border",
                                        transaction.type === "income"
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                            : "bg-rose-50 text-rose-700 border-rose-100"
                                    )}
                                >
                                    {transaction.type === "income" ? "Entrata" : "Uscita"}
                                </Badge>
                                {transaction.isSuperfluous && (
                                    <Badge variant="outline" className="text-[9px] px-2 py-0.5 uppercase tracking-tighter text-amber-600 border-amber-200 bg-amber-50 font-bold">
                                        Superflua
                                    </Badge>
                                )}
                            </div>
                            <div
                                className={cn(
                                    "text-xl font-black tabular-nums tracking-tighter",
                                    transaction.type === "income" ? "text-emerald-600" : "text-rose-600"
                                )}
                            >
                                {transaction.amount}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-2 py-4">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        Pagina <span className="text-foreground">{currentPage}</span> di <span className="text-foreground">{totalPages}</span>
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-xl border-muted-foreground/20"
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-xl border-muted-foreground/20"
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
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
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted transition-colors">
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl">
                <DropdownMenuLabel className="text-xs text-muted-foreground">Azioni</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onEdit(transaction)} className="gap-2 font-bold">
                    Modifica
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="text-rose-600 focus:text-rose-600 focus:bg-rose-50 gap-2 font-bold"
                    onClick={() => onDelete(transaction.id)}
                >
                    Elimina
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
