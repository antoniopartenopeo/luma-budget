"use client"

import { useState, useMemo } from "react"
import { Loader2, CheckCircle2, AlertCircle, TrendingUp, TrendingDown } from "lucide-react"
import { parseCurrencyToCents } from "@/lib/currency-utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useCreateTransaction } from "@/features/transactions/api/use-transactions"
import { Transaction } from "@/features/transactions/api/types"

import { CATEGORIES, getGroupedCategories } from "@/features/categories/config"
import { CategoryIcon } from "@/features/categories/components/category-icon"

interface QuickExpenseInputProps {
    onExpenseCreated?: (transaction: Transaction) => void
}

export function QuickExpenseInput({ onExpenseCreated }: QuickExpenseInputProps) {
    const [description, setDescription] = useState("")
    const [amount, setAmount] = useState("")
    const [category, setCategory] = useState("")
    const [type, setType] = useState<"expense" | "income">("expense")
    const [isFocused, setIsFocused] = useState(false)
    const [validationError, setValidationError] = useState<string | null>(null)

    // Superfluous expense logic
    const [isSuperfluousManual, setIsSuperfluousManual] = useState<boolean | null>(null)
    const isManualOverride = isSuperfluousManual !== null

    const { mutate: create, isPending, isSuccess, isError } = useCreateTransaction()

    // Get grouped categories based on current transaction type
    const groupedCategories = getGroupedCategories(type)

    // Derive isSuperfluous based on category (rule-based), unless manually overridden
    const isSuperfluous = useMemo(() => {
        if (type !== "expense") return false
        if (isManualOverride) return isSuperfluousManual

        const cat = CATEGORIES.find(c => c.id === category)
        return cat?.spendingNature === "superfluous"
    }, [category, isManualOverride, isSuperfluousManual, type])

    const handleTypeChange = (newType: "expense" | "income") => {
        setType(newType)
        setCategory("") // Reset category when type changes
        setIsSuperfluousManual(null) // Reset manual override
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setValidationError(null)

        // Validation
        if (!description.trim()) {
            setValidationError("Inserisci una descrizione")
            return
        }

        const amountCents = Math.abs(parseCurrencyToCents(amount))
        if (amountCents <= 0) {
            setValidationError("Inserisci un importo valido")
            return
        }

        if (!category) {
            setValidationError("Seleziona una categoria")
            return
        }

        const parsedAmount = amountCents / 100

        create(
            {
                description,
                amount: parsedAmount,
                category: CATEGORIES.find(c => c.id === category)?.label || category,
                categoryId: category,
                type,
                isSuperfluous: type === "expense" ? isSuperfluous : false,
                classificationSource: isManualOverride ? "manual" : "ruleBased",
            },
            {
                onSuccess: (data) => {
                    setDescription("")
                    setAmount("")
                    setCategory("")
                    setIsSuperfluousManual(null)
                    // Keep type as is for convenience
                    if (onExpenseCreated) {
                        onExpenseCreated(data)
                    }
                },
            }
        )
    }

    // Toggle manual override
    const toggleSuperfluous = () => {
        setIsSuperfluousManual(!isSuperfluous)
    }

    const hasError = !!validationError || isError

    return (
        <div className="relative w-full">
            <form
                onSubmit={handleSubmit}
                className={cn(
                    "flex items-center gap-1 rounded-full bg-background p-1 shadow-sm transition-all border border-input",
                    isFocused && "shadow-md ring-2 ring-primary/10",
                    hasError && "border-destructive/50 shadow-destructive/10"
                )}
                onFocus={() => setIsFocused(true)}
                onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                        setIsFocused(false)
                    }
                }}
            >
                {/* Type Toggle */}
                <div className="flex bg-muted/50 rounded-full p-0.5 shrink-0 ml-1">
                    <button
                        type="button"
                        onClick={() => handleTypeChange("expense")}
                        className={cn(
                            "p-1.5 rounded-full transition-all",
                            type === "expense" ? "bg-background text-red-500 shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                        title="Uscita"
                    >
                        <TrendingDown className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTypeChange("income")}
                        className={cn(
                            "p-1.5 rounded-full transition-all",
                            type === "income" ? "bg-background text-green-500 shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                        title="Entrata"
                    >
                        <TrendingUp className="h-4 w-4" />
                    </button>
                </div>

                <div className="h-6 w-px bg-border/50 mx-1" />

                {/* Description */}
                <Input
                    placeholder="Es. Caffè bar, Abbonamento Spotify..."
                    value={description}
                    onChange={(e) => {
                        setDescription(e.target.value)
                        if (validationError) setValidationError(null)
                    }}
                    disabled={isPending}
                    className={cn(
                        "h-9 border-0 bg-transparent px-2 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/70 flex-1 min-w-[120px]",
                        validationError && !description.trim() && "placeholder:text-destructive/50"
                    )}
                />

                <div className="h-6 w-px bg-border/50" />

                {/* Amount */}
                <div className="relative flex items-center">
                    <span className="absolute left-2 text-muted-foreground text-sm font-medium">€</span>
                    <Input
                        type="number"
                        placeholder="0,00"
                        value={amount}
                        onChange={(e) => {
                            setAmount(e.target.value)
                            if (validationError) setValidationError(null)
                        }}
                        disabled={isPending}
                        className={cn(
                            "h-9 w-24 border-0 bg-transparent pl-6 pr-2 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/70 text-right font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                            validationError && (!amount || Math.abs(parseCurrencyToCents(amount)) <= 0) && "placeholder:text-destructive/50 text-destructive"
                        )}
                    />
                </div>

                <div className="h-6 w-px bg-border/50" />

                {/* Category */}
                <Select
                    value={category}
                    onValueChange={(val) => {
                        setCategory(val)
                        if (validationError) setValidationError(null)
                    }}
                    disabled={isPending}
                >
                    <SelectTrigger className={cn(
                        "h-9 w-[130px] border-0 bg-transparent shadow-none focus:ring-0 text-muted-foreground data-[state=checked]:text-foreground",
                        validationError && !category && "text-destructive/70"
                    )}>
                        <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                        {groupedCategories.map((group) => (
                            <div key={group.key}>
                                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    {group.label}
                                </div>
                                {group.categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        <div className="flex items-center gap-2">
                                            <CategoryIcon categoryName={cat.label} size={14} />
                                            <span>{cat.label}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </div>
                        ))}
                    </SelectContent>
                </Select>

                {/* Superfluous Toggle - Only for expenses */}
                {type === "expense" && (
                    <>
                        <div className="h-6 w-px bg-border/50" />
                        <button
                            type="button"
                            onClick={toggleSuperfluous}
                            disabled={isPending}
                            className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-colors whitespace-nowrap",
                                isSuperfluous
                                    ? "bg-destructive/10 text-destructive font-semibold border border-destructive/20"
                                    : "bg-muted/40 text-muted-foreground hover:bg-muted/60"
                            )}
                            title={isManualOverride ? "Classificazione manuale (Clicca per reimpostare)" : "Classificazione automatica (Clicca per forzare)"}
                        >
                            {isSuperfluous ? "Spesa Superflua" : "Spesa Necessaria"}
                        </button>
                    </>
                )}

                {/* Submit Button */}
                <Button
                    type="submit"
                    disabled={isPending}
                    className={cn(
                        "h-9 rounded-full px-4 transition-all ml-1",
                        isSuccess && "bg-emerald-600 hover:bg-emerald-700 text-white"
                    )}
                >
                    {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isSuccess ? (
                        <div className="flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="sr-only">Salvato</span>
                        </div>
                    ) : (
                        "Aggiungi"
                    )}
                </Button>
            </form>

            {/* Error Message */}
            {hasError && (
                <div className="absolute -bottom-8 left-4 flex items-center gap-2 text-xs font-medium text-destructive animate-in fade-in slide-in-from-top-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationError || "Errore durante il salvataggio. Riprova."}
                </div>
            )}
        </div>
    )
}
