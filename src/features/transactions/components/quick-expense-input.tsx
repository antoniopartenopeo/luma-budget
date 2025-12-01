"use client"

import { useState } from "react"
import { Plus, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useCreateTransaction } from "@/features/transactions/api/use-transactions"
import { Transaction } from "@/features/transactions/api/types"

const CATEGORIES = [
    { id: "cibo", label: "Cibo" },
    { id: "trasporti", label: "Trasporti" },
    { id: "casa", label: "Casa" },
    { id: "svago", label: "Svago" },
    { id: "altro", label: "Altro" },
]

interface QuickExpenseInputProps {
    onExpenseCreated?: (transaction: Transaction) => void
}

export function QuickExpenseInput({ onExpenseCreated }: QuickExpenseInputProps) {
    const [description, setDescription] = useState("")
    const [amount, setAmount] = useState("")
    const [category, setCategory] = useState("")

    const { mutate: create, isPending, isSuccess, isError } = useCreateTransaction()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!description || !amount || !category) return

        create(
            {
                description,
                amount: parseFloat(amount),
                category,
            },
            {
                onSuccess: (data) => {
                    setDescription("")
                    setAmount("")
                    setCategory("")
                    if (onExpenseCreated) {
                        onExpenseCreated(data)
                    }
                },
            }
        )
    }

    return (
        <div className="relative w-full max-w-2xl">
            <form
                onSubmit={handleSubmit}
                className={cn(
                    "flex items-center gap-2 rounded-full bg-background p-1.5 shadow-sm transition-all border border-transparent focus-within:border-primary/20 focus-within:shadow-md",
                    isError && "border-destructive/50 shadow-destructive/10"
                )}
            >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ml-1">
                    <Plus className="h-4 w-4" />
                </div>

                <Input
                    placeholder="Descrizione (es. Pranzo)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="h-9 border-0 bg-transparent px-2 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/70"
                />

                <div className="h-6 w-px bg-border/50" />

                <Input
                    type="number"
                    placeholder="€ 0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-9 w-24 border-0 bg-transparent px-2 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/70"
                />

                <div className="h-6 w-px bg-border/50" />

                <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-9 w-[130px] border-0 bg-transparent shadow-none focus:ring-0 text-muted-foreground data-[state=checked]:text-foreground">
                        <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                        {CATEGORIES.map((cat) => (
                            <SelectItem key={cat.id} value={cat.label}>
                                {cat.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button
                    type="submit"
                    disabled={isPending || !description || !amount || !category}
                    className={cn(
                        "h-9 rounded-full px-4 transition-all",
                        isSuccess && "bg-emerald-600 hover:bg-emerald-700 text-white"
                    )}
                >
                    {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isSuccess ? (
                        <CheckCircle2 className="h-4 w-4" />
                    ) : (
                        "Aggiungi"
                    )}
                </Button>
            </form>

            {isError && (
                <div className="absolute -bottom-8 left-4 flex items-center gap-2 text-xs font-medium text-destructive animate-in fade-in slide-in-from-top-1">
                    <AlertCircle className="h-3 w-3" />
                    Errore durante il salvataggio. Riprova.
                </div>
            )}
        </div>
    )
}
