"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Transaction, CreateTransactionDTO } from "@/features/transactions/api/types"
import { TransactionForm } from "./transaction-form"
import { useUpdateTransaction } from "@/features/transactions/api/use-transactions"
import { parseCurrencyToCents } from "@/lib/currency-utils"

interface EditTransactionDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    transaction: Transaction | null
}

export function EditTransactionDialog({ open, onOpenChange, transaction }: EditTransactionDialogProps) {
    const { mutate: updateTransaction, isPending } = useUpdateTransaction()

    if (!transaction) return null

    // Parse amount string to number (remove currency symbol and handle sign)
    const handleSave = (amountStr: string) => {
        const amountCents = Math.abs(parseCurrencyToCents(amountStr))
        const value = amountCents / 100
        return isNaN(value) ? 0 : value
    }

    const defaultValues: Partial<CreateTransactionDTO> = {
        description: transaction.description,
        amount: handleSave(transaction.amount),
        category: transaction.category,
        categoryId: transaction.categoryId,
        type: transaction.type,
    }

    const handleSubmit = (data: CreateTransactionDTO) => {
        updateTransaction(
            { id: transaction.id, data },
            {
                onSuccess: () => {
                    onOpenChange(false)
                },
            }
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Modifica Transazione</DialogTitle>
                    <DialogDescription>
                        Aggiorna i dettagli della transazione.
                    </DialogDescription>
                </DialogHeader>
                <TransactionForm
                    defaultValues={defaultValues}
                    onSubmit={handleSubmit}
                    isLoading={isPending}
                    submitLabel="Salva modifiche"
                />
            </DialogContent>
        </Dialog>
    )
}
