"use client"

import { useState } from "react"
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
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import { Transaction } from "../api/types"
import { cn } from "@/lib/utils"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getCategoryColor, getCategoryIcon } from "@/features/categories/config"
import { CategoryIcon } from "@/features/categories/components/category-icon"

interface TransactionsTableProps {
    transactions: Transaction[]
    onEditTransaction: (transaction: Transaction) => void
    onDeleteTransaction: (id: string) => void
}

export function TransactionsTable({ transactions, onEditTransaction, onDeleteTransaction }: TransactionsTableProps) {
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

    const sortedTransactions = [...transactions].sort((a, b) => {
        return sortOrder === "asc"
            ? a.timestamp - b.timestamp
            : b.timestamp - a.timestamp
    })

    const toggleSort = () => {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[180px]">
                            <Button variant="ghost" onClick={toggleSort} className="-ml-4">
                                Data
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                        </TableHead>
                        <TableHead>Descrizione</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead className="text-center">Tipo</TableHead>
                        <TableHead className="text-right">Importo</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedTransactions.map((transaction) => (
                        <TableRow key={transaction.id} className="hover:bg-muted/30 cursor-default">
                            <TableCell className="font-medium">
                                {transaction.date}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <CategoryIcon categoryName={transaction.category} size={20} showBackground />
                                    <span>{transaction.description}</span>
                                </div>
                            </TableCell>
                            <TableCell>{transaction.category}</TableCell>
                            <TableCell className="text-center">
                                <Badge
                                    variant={
                                        transaction.type === "income" ? "default" : "secondary"
                                    }
                                    className={cn(
                                        transaction.type === "income"
                                            ? "bg-green-500/15 text-green-700 hover:bg-green-500/25 border-green-200"
                                            : "bg-red-500/15 text-red-700 hover:bg-red-500/25 border-red-200"
                                    )}
                                >
                                    {transaction.type === "income" ? "Entrata" : "Uscita"}
                                </Badge>
                            </TableCell>
                            <TableCell
                                className={cn(
                                    "text-right font-medium",
                                    transaction.type === "income"
                                        ? "text-green-600"
                                        : "text-red-600"
                                )}
                            >
                                {transaction.amount}
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Azioni</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => onEditTransaction(transaction)}>
                                            Modifica
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                            onClick={() => onDeleteTransaction(transaction.id)}
                                        >
                                            Elimina
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
