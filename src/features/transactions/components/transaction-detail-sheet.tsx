import { useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Transaction, CreateTransactionDTO } from "../api/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "@/features/categories/components/category-icon";
import { formatTransactionDate } from "../utils/format-date";
import { cn } from "@/lib/utils";
import { Edit2, Trash2, Calendar, Tag, Info, ArrowLeft, Loader2 } from "lucide-react";
import { TransactionForm } from "./transaction-form";
import { useUpdateTransaction, useDeleteTransaction } from "@/features/transactions/api/use-transactions";
import { parseCurrencyToCents } from "@/lib/currency-utils";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TransactionDetailSheetProps {
    transaction: Transaction | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode?: "view" | "edit";
}

export function TransactionDetailSheet({
    transaction,
    open,
    onOpenChange,
    mode = "view",
}: TransactionDetailSheetProps) {
    if (!transaction) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            {/* 
                We use the transaction ID as a key to ensure that the internal state 
                (isEditing, isDirty) resets whenever we switch transactions or reopen the sheet.
            */}
            <TransactionDetailSheetContent
                key={transaction.id}
                transaction={transaction}
                open={open}
                onOpenChange={onOpenChange}
                mode={mode}
            />
        </Sheet>
    );
}

function TransactionDetailSheetContent({
    transaction,
    open,
    onOpenChange,
    mode,
}: {
    transaction: Transaction;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: "view" | "edit";
}) {
    const [isEditing, setIsEditing] = useState(mode === "edit");
    const [isDirty, setIsDirty] = useState(false);
    const [showCloseConfirm, setShowCloseConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const { mutate: updateTransaction, isPending: isUpdating } = useUpdateTransaction();
    const { mutate: deleteTransaction, isPending: isDeleting } = useDeleteTransaction();

    const handleSave = (data: CreateTransactionDTO) => {
        updateTransaction(
            { id: transaction.id, data },
            {
                onSuccess: () => {
                    setIsEditing(false);
                    setIsDirty(false);
                },
            }
        );
    };

    const handleDelete = () => {
        deleteTransaction(transaction.id, {
            onSuccess: () => {
                setShowDeleteConfirm(false);
                onOpenChange(false);
            },
        });
    };


    // Parse amount string to number for form default values
    const amountToNumber = (amountStr: string) => {
        const amountCents = Math.abs(parseCurrencyToCents(amountStr));
        const value = amountCents / 100;
        return isNaN(value) ? 0 : value;
    };

    const defaultFormValues: Partial<CreateTransactionDTO> = {
        description: transaction.description,
        amount: amountToNumber(transaction.amount),
        category: transaction.category,
        categoryId: transaction.categoryId,
        type: transaction.type,
    };

    return (
        <>
            <SheetContent
                onPointerDownOutside={(e) => {
                    if (isEditing && isDirty) {
                        e.preventDefault();
                        setShowCloseConfirm(true);
                    }
                }}
                onEscapeKeyDown={(e) => {
                    if (isEditing && isDirty) {
                        e.preventDefault();
                        setShowCloseConfirm(true);
                    }
                }}
                className="sm:max-w-md p-0 overflow-hidden flex flex-col"
            >
                <SheetHeader className="p-6 pb-4 bg-muted/30 border-b shrink-0">
                    <div className="flex items-center gap-4">
                        {isEditing ? (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-xl"
                                onClick={() => isDirty ? setShowCloseConfirm(true) : setIsEditing(false)}
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        ) : (
                            <CategoryIcon categoryName={transaction.category} size={48} showBackground />
                        )}
                        <div className="flex flex-col">
                            <SheetTitle className="text-xl font-black tracking-tight leading-tight">
                                {isEditing ? "Modifica Transazione" : transaction.description}
                            </SheetTitle>
                            {!isEditing && (
                                <span className="text-sm text-muted-foreground font-medium">
                                    {transaction.category}
                                </span>
                            )}
                        </div>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6">
                    {isEditing ? (
                        <TransactionForm
                            defaultValues={defaultFormValues}
                            onSubmit={handleSave}
                            isLoading={isUpdating}
                            onChange={() => setIsDirty(true)}
                            submitLabel="Salva modifiche"
                            onCancel={() => isDirty ? setShowCloseConfirm(true) : setIsEditing(false)}
                        />
                    ) : (
                        <div className="space-y-8">
                            {/* Amount Block */}
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground px-1">
                                    Importo
                                </span>
                                <div className={cn(
                                    "text-4xl font-black tabular-nums tracking-tighter",
                                    transaction.type === "income" ? "text-emerald-600" : "text-rose-600"
                                )}>
                                    {transaction.amount}
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-black tracking-widest text-muted-foreground px-1">
                                        <Calendar className="h-3 w-3" />
                                        Data
                                    </div>
                                    <div className="text-sm font-bold bg-muted/30 p-3 rounded-2xl border">
                                        {formatTransactionDate(transaction)}
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-black tracking-widest text-muted-foreground px-1">
                                        <Tag className="h-3 w-3" />
                                        Tipo
                                    </div>
                                    <div className="bg-muted/30 p-3 rounded-2xl border">
                                        <Badge
                                            variant="secondary"
                                            className={cn(
                                                "text-[10px] font-black uppercase px-2 py-0.5 rounded-full border",
                                                transaction.type === "income"
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                    : "bg-rose-50 text-rose-700 border-rose-100"
                                            )}
                                        >
                                            {transaction.type === "income" ? "Entrata" : "Uscita"}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Status */}
                            {transaction.isSuperfluous && (
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-black tracking-widest text-muted-foreground px-1">
                                        <Info className="h-3 w-3" />
                                        Classificazione
                                    </div>
                                    <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 flex items-center justify-between">
                                        <div className="flex flex-col text-xs">
                                            <span className="font-bold text-amber-800">Spesa Superflua</span>
                                            <span className="text-amber-600/70">Questa spesa non è stata considerata essenziale.</span>
                                        </div>
                                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200 text-[9px] uppercase font-bold">
                                            {transaction.classificationSource === "ruleBased" ? "Regola" : "Manuale"}
                                        </Badge>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {!isEditing && (
                    <div className="shrink-0 p-6 bg-background border-t">
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                variant="outline"
                                className="h-12 rounded-2xl gap-2 font-bold"
                                onClick={() => setIsEditing(true)}
                            >
                                <Edit2 className="h-4 w-4" />
                                Modifica
                            </Button>
                            <Button
                                variant="destructive"
                                className="h-12 rounded-2xl gap-2 font-bold bg-rose-600 hover:bg-rose-700 shadow-rose-200"
                                onClick={() => setShowDeleteConfirm(true)}
                            >
                                <Trash2 className="h-4 w-4" />
                                Elimina
                            </Button>
                        </div>
                    </div>
                )}
            </SheetContent>

            {/* Confirmation Alerts */}
            <AlertDialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
                <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Scartare le modifiche?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Hai apportato delle modifiche che non sono state salvate. Vuoi davvero tornare indietro?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Continua a modificare</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
                            onClick={() => {
                                setIsEditing(false);
                                setIsDirty(false);
                                setShowCloseConfirm(false);
                                if (!open) onOpenChange(false);
                            }}
                        >
                            Scarta modifiche
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Sei sicuro di voler eliminare?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Questa azione è irreversibile. La transazione verrà rimossa permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Annulla</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-rose-600 text-white hover:bg-rose-700 rounded-xl"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sì, elimina"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
