"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useDeleteTransaction } from "@/features/transactions/api/use-transactions"

interface DeleteTransactionDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    transactionId: string | null
}

export function DeleteTransactionDialog({ open, onOpenChange, transactionId }: DeleteTransactionDialogProps) {
    const { mutate: deleteTransaction, isPending } = useDeleteTransaction()

    const handleConfirm = () => {
        if (transactionId) {
            deleteTransaction(transactionId, {
                onSuccess: () => {
                    onOpenChange(false)
                },
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Elimina Transazione</DialogTitle>
                    <DialogDescription>
                        Sei sicuro di voler eliminare questa transazione? Questa azione non può essere annullata.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                    >
                        Annulla
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={isPending}
                    >
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Elimina
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
