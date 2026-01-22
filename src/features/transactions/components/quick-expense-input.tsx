"use client"

import { useState, useMemo } from "react"
import { Loader2, CheckCircle2, AlertCircle, TrendingUp, TrendingDown } from "lucide-react"
import { parseCurrencyToCents } from "@/domain/money"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { cn } from "@/lib/utils"

import { useCreateTransaction } from "@/features/transactions/api/use-transactions"
import { Transaction } from "@/features/transactions/api/types"
import { getGroupedCategories, getCategoryById } from "@/features/categories/config"
import { useCategories } from "@/features/categories/api/use-categories"
import { CategoryIcon } from "@/features/categories/components/category-icon"

interface QuickExpenseInputProps {
    onExpenseCreated?: (transaction: Transaction) => void
}

export function QuickExpenseInput({ onExpenseCreated }: QuickExpenseInputProps) {
    const [description, setDescription] = useState("")
    const [amount, setAmount] = useState("")
    const [category, setCategory] = useState("")
    const [date, setDate] = useState<Date>(new Date())
    const [type, setType] = useState<"expense" | "income">("expense")

    const { data: categories = [] } = useCategories()
    const [isFocused, setIsFocused] = useState(false)
    const [validationError, setValidationError] = useState<string | null>(null)

    // Superfluous expense logic
    const [isSuperfluousManual, setIsSuperfluousManual] = useState<boolean | null>(null)
    const isManualOverride = isSuperfluousManual !== null

    const { mutate: create, isPending, isSuccess, isError } = useCreateTransaction()

    // Get grouped categories based on current transaction type
    const groupedCategories = getGroupedCategories(categories, type)

    // Derive isSuperfluous based on category (rule-based), unless manually overridden
    const isSuperfluous = useMemo(() => {
        if (type !== "expense") return false
        if (isManualOverride) return isSuperfluousManual

        const cat = getCategoryById(category, categories)
        return cat?.spendingNature === "superfluous"
        // eslint-disable-next-line react-hooks/preserve-manual-memoization
    }, [category, isManualOverride, isSuperfluousManual, type, categories])

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

        create(
            {
                description,
                amountCents, // Send absolute integer cents
                category: getCategoryById(category, categories)?.label || category,
                categoryId: category,
                type,
                isSuperfluous: type === "expense" ? isSuperfluous : false,
                classificationSource: isManualOverride ? "manual" : "ruleBased",
                date: date.toISOString()
            },
            {
                onSuccess: (data) => {
                    setDescription("")
                    setAmount("")
                    setCategory("")
                    setDate(new Date()) // Reset to today
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
                    "flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-2xl sm:rounded-full bg-background p-2 sm:p-1 shadow-sm transition-all border border-input",
                    isFocused && "shadow-md ring-2 ring-primary/10",
                    hasError && "border-destructive/50 shadow-destructive/10"
                )}
                onFocus={() => setIsFocused(true)}
                onBlur={(e) => {
                    // Check if focus moved inside the popover or other elements
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                        setIsFocused(false)
                    }
                }}
            >
                {/* Mobile: Row 1 (Type + Description) | Desktop: Horizontal flow */}
                <div className="flex items-center gap-1 flex-1">
                    {/* Type Toggle */}
                    <div className="flex bg-muted/50 rounded-full p-0.5 shrink-0">
                        <button
                            type="button"
                            onClick={() => handleTypeChange("expense")}
                            className={cn(
                                "p-1.5 rounded-full transition-all",
                                type === "expense" ? "bg-background text-red-500 shadow-sm" : "text-muted-foreground hover:text-foreground"
                            )}
                            title="Uscita"
                            aria-label="Registra come Uscita"
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
                            aria-label="Registra come Entrata"
                        >
                            <TrendingUp className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="h-6 w-px bg-border/50 mx-1 hidden sm:block" />

                    <Input
                        placeholder={isFocused ? "Es. Caffè bar..." : "Cosa hai comprato?"}
                        value={description}
                        onChange={(e) => {
                            setDescription(e.target.value)
                            if (validationError) setValidationError(null)
                        }}
                        disabled={isPending}
                        className={cn(
                            "h-9 border-0 bg-transparent px-2 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/70 flex-1 min-w-0 text-sm md:text-base",
                            validationError && !description.trim() && "placeholder:text-destructive/50"
                        )}
                    />
                </div>

                <div className="h-px w-full bg-border/50 sm:hidden" />
                <div className="h-6 w-px bg-border/50 hidden sm:block" />

                {/* Mobile: Row 2 (Amount + Date + Category + Action) | Desktop: Horizontal flow */}
                <div className="flex items-center gap-1">
                    {/* Amount */}
                    <div className="relative flex items-center shrink-0 w-24 sm:w-auto">
                        <span className="absolute left-1.5 md:left-2 text-muted-foreground text-xs md:text-sm font-medium">€</span>
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
                                "h-9 w-full sm:w-24 border-0 bg-transparent pl-4 md:pl-6 pr-1 md:pr-2 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/70 text-right font-medium text-sm md:text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                                validationError && (!amount || Math.abs(parseCurrencyToCents(amount)) <= 0) && "placeholder:text-destructive/50 text-destructive"
                            )}
                        />
                    </div>

                    <div className="h-6 w-px bg-border/50 hidden md:block" />

                    {/* Date Picker (Compact Icon) */}
                    <DatePicker
                        value={date}
                        onChange={(d) => d && setDate(d)}
                        variant="icon"
                        align="end"
                        disabled={isPending}
                    />

                    {/* Category */}
                    <Select
                        value={category}
                        onValueChange={(val) => {
                            setCategory(val)
                            setIsSuperfluousManual(null) // Reset manual override on category change
                            if (validationError) setValidationError(null)
                        }}
                        disabled={isPending}
                    >
                        <SelectTrigger className={cn(
                            "h-9 flex-1 sm:w-[130px] border-0 bg-transparent shadow-none focus:ring-0 text-muted-foreground data-[state=checked]:text-foreground text-xs md:text-sm",
                            validationError && !category && "text-destructive/70"
                        )}>
                            <div className="truncate text-left">
                                <SelectValue placeholder="Categoria" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                            {groupedCategories.map((group) => (
                                <div key={group.key}>
                                    <div className="px-2 py-1.5 text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wide">
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

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={isPending}
                        className={cn(
                            "h-8 md:h-9 rounded-full px-3 md:px-4 transition-all ml-auto sm:ml-1 shrink-0 bg-primary text-primary-foreground",
                            isSuccess && "bg-emerald-600 hover:bg-emerald-700 text-white"
                        )}
                    >
                        {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : isSuccess ? (
                            <div className="flex items-center gap-1">
                                <CheckCircle2 className="h-4 w-4" />
                            </div>
                        ) : (
                            <span className="text-xs font-bold sm:font-normal">Aggiungi</span>
                        )}
                    </Button>
                </div>

                {/* Superfluous Toggle - Only for expenses and on larger mobiles/desktop */}
                {type === "expense" && (
                    <div className="hidden lg:flex items-center gap-1 shrink-0">
                        <div className="h-6 w-px bg-border/50 mx-1" />
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
                        >
                            {isSuperfluous ? "Superflua" : "Necessaria"}
                        </button>
                    </div>
                )}
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

