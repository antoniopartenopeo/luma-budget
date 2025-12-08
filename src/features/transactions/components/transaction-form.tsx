"use client"

import { useState } from "react"
import { Loader2, TrendingUp, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { CATEGORIES } from "@/features/categories/config"
import { CategoryIcon } from "@/features/categories/components/category-icon"
import { CreateTransactionDTO } from "@/features/transactions/api/types"

interface TransactionFormProps {
    defaultValues?: Partial<CreateTransactionDTO>
    onSubmit: (data: CreateTransactionDTO) => void
    isLoading?: boolean
    submitLabel?: string
}

export function TransactionForm({ defaultValues, onSubmit, isLoading, submitLabel = "Salva" }: TransactionFormProps) {
    const [description, setDescription] = useState(defaultValues?.description || "")
    const [amount, setAmount] = useState(defaultValues?.amount ? defaultValues.amount.toString() : "")
    // Prefer categoryId, fallback to finding id by label, or empty
    const [categoryId, setCategoryId] = useState(defaultValues?.categoryId || "")
    const [type, setType] = useState<"expense" | "income">(defaultValues?.type || "expense")

    const [errors, setErrors] = useState<{ [key: string]: string }>({})

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setErrors({})

        // Validation
        const newErrors: { [key: string]: string } = {}
        if (!description.trim()) newErrors.description = "Inserisci una descrizione"

        const parsedAmount = parseFloat(amount)
        if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
            newErrors.amount = "Inserisci un importo valido"
        }

        if (!categoryId) newErrors.category = "Seleziona una categoria"

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        const selectedCategory = CATEGORIES.find(c => c.id === categoryId)

        onSubmit({
            description,
            amount: parsedAmount,
            categoryId,
            category: selectedCategory?.label || categoryId, // Fallback
            type,
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type Selection - Segmented Control */}
            <div className="grid grid-cols-2 p-1 bg-muted/40 rounded-lg gap-1">
                <button
                    type="button"
                    onClick={() => setType("expense")}
                    className={cn(
                        "flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all duration-200",
                        type === "expense"
                            ? "bg-white text-red-600 shadow-sm ring-1 ring-black/5"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    )}
                >
                    <TrendingDown className="h-4 w-4" />
                    Uscita
                </button>
                <button
                    type="button"
                    onClick={() => setType("income")}
                    className={cn(
                        "flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all duration-200",
                        type === "income"
                            ? "bg-white text-green-600 shadow-sm ring-1 ring-black/5"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    )}
                >
                    <TrendingUp className="h-4 w-4" />
                    Entrata
                </button>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Descrizione</Label>
                <Input
                    id="description"
                    placeholder="es. Spesa settimanale"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={errors.description ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="amount">Importo</Label>
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">€</span>
                    <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        className={cn(
                            "pl-7",
                            errors.amount ? "border-destructive focus-visible:ring-destructive" : ""
                        )}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </div>
                {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger className={errors.category ? "border-destructive ring-destructive" : ""}>
                        <SelectValue placeholder="Seleziona categoria" />
                    </SelectTrigger>
                    <SelectContent>
                        {CATEGORIES.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                                <div className="flex items-center gap-2">
                                    <CategoryIcon categoryName={cat.label} size={16} />
                                    <span>{cat.label}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {submitLabel}
            </Button>
        </form>
    )
}
