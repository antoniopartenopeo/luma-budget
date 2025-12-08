"use client"

import { useState } from "react"
import { Transaction } from "@/features/transactions/api/types"

export function useTransactionsActions() {
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
    const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null)

    const handleEdit = (transaction: Transaction) => {
        setEditingTransaction(transaction)
    }

    const handleDelete = (id: string) => {
        setDeletingTransactionId(id)
    }

    const closeEdit = () => setEditingTransaction(null)
    const closeDelete = () => setDeletingTransactionId(null)

    return {
        editingTransaction,
        deletingTransactionId,
        handleEdit,
        handleDelete,
        closeEdit,
        closeDelete,
    }
}
