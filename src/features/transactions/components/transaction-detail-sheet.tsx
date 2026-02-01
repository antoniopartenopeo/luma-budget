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
import { Edit2, Trash2, Calendar, Tag, Info, ArrowLeft, AlertTriangle } from "lucide-react";
import { TransactionForm } from "./transaction-form";
import { useUpdateTransaction, useDeleteTransaction } from "@/features/transactions/api/use-transactions";
import { formatSignedCents } from "@/domain/money/currency";
import { getSignedCents } from "@/domain/transactions";
import { ConfirmDialog } from "@/components/patterns/confirm-dialog";
import { usePrivacyStore } from "@/features/privacy/privacy.store";
import { getPrivacyClass } from "@/features/privacy/privacy-utils";

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
    const { isPrivacyMode } = usePrivacyStore();

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


    const defaultFormValues: Partial<CreateTransactionDTO> = {
        description: transaction.description,
        amountCents: transaction.amountCents,
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
                className="sm:max-w-md p-0 overflow-hidden flex flex-col border-none bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-2xl"
            >
                <SheetHeader className="p-6 pb-4 border-b border-white/20 shrink-0">
                    <div className="flex items-center gap-4">
                        {isEditing ? (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-xl hover:bg-white/50"
                                onClick={() => isDirty ? setShowCloseConfirm(true) : setIsEditing(false)}
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        ) : (
                            <CategoryIcon categoryName={transaction.category} size={48} showBackground />
                        )}
                        <div className="flex flex-col">
                            <SheetTitle className="text-xl font-bold tracking-tight leading-tight">
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

                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/20">
                    {isEditing ? (
                        <TransactionForm
                            defaultValues={defaultFormValues}
                            onSubmit={handleSave}
                            isLoading={isUpdating}
                            onChange={() => setIsDirty(true)}
                            submitLabel="Salva"
                            onCancel={() => isDirty ? setShowCloseConfirm(true) : setIsEditing(false)}
                        />
                    ) : (
                        <div className="space-y-8">
                            {/* Amount Block */}
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-1">
                                    Importo
                                </span>
                                <div className={cn(
                                    "text-5xl font-black tabular-nums tracking-tighter",
                                    transaction.type === "income" ? "text-emerald-600" : "text-foreground",
                                    getPrivacyClass(isPrivacyMode)
                                )}>
                                    {formatSignedCents(getSignedCents(transaction))}
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-1">
                                        <Calendar className="h-3 w-3" />
                                        Data
                                    </div>
                                    <div className="text-sm font-medium bg-white/50 dark:bg-white/5 p-3 rounded-xl border border-white/20">
                                        {formatTransactionDate(transaction)}
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-1">
                                        <Tag className="h-3 w-3" />
                                        Tipo
                                    </div>
                                    <div className="bg-white/50 dark:bg-white/5 p-3 rounded-xl border border-white/20">
                                        <Badge
                                            variant="secondary"
                                            className={cn(
                                                "text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border shadow-none",
                                                transaction.type === "income"
                                                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                                                    : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20"
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
                                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-1">
                                        <Info className="h-3 w-3" />
                                        Classificazione
                                    </div>
                                    <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 flex items-center justify-between">
                                        <div className="flex flex-col text-sm font-medium">
                                            <span className="font-bold text-amber-700 dark:text-amber-400">Spesa Superflua</span>
                                            <span className="text-muted-foreground/80">Considerata non essenziale.</span>
                                        </div>
                                        <Badge className="bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/20 text-[9px] uppercase font-bold shadow-none rounded-md">
                                            {transaction.classificationSource === "ruleBased" ? "Regola" : "Manuale"}
                                        </Badge>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {!isEditing && (
                    <div className="shrink-0 p-6 bg-white/40 dark:bg-white/5 border-t border-white/20 backdrop-blur-md">
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                variant="outline"
                                className="h-12 rounded-xl gap-2 font-bold hover:bg-white/60"
                                onClick={() => setIsEditing(true)}
                            >
                                <Edit2 className="h-4 w-4" />
                                Modifica
                            </Button>
                            <Button
                                variant="destructive"
                                className="h-12 rounded-xl gap-2 font-bold shadow-lg shadow-rose-500/20"
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
            <ConfirmDialog
                open={showCloseConfirm}
                onOpenChange={setShowCloseConfirm}
                title="Scartare le modifiche?"
                description="Hai apportato delle modifiche che non sono state salvate. Vuoi davvero tornare indietro?"
                cancelLabel="Continua a modificare"
                confirmLabel="Scarta modifiche"
                onConfirm={() => {
                    setIsEditing(false);
                    setIsDirty(false);
                    setShowCloseConfirm(false);
                    if (!open) onOpenChange(false);
                }}
                variant="destructive"
            />

            <ConfirmDialog
                open={showDeleteConfirm}
                onOpenChange={setShowDeleteConfirm}
                title={
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Sei sicuro di voler eliminare?
                    </div>
                }
                description="Questa azione è irreversibile. La transazione verrà rimossa permanentemente."
                confirmLabel="Elimina"
                onConfirm={handleDelete}
                isLoading={isDeleting}
                variant="destructive"
            />
        </>
    );
}
