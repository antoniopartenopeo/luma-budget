"use client"

import { useState, useMemo } from "react"
import { Loader2, TrendingUp, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { cn } from "@/lib/utils"
import { getGroupedCategories } from "@/features/categories/config"
import { useCategories } from "@/features/categories/api/use-categories"
import { parseCurrencyToCents } from "@/lib/currency-utils"
import { CategoryIcon } from "@/features/categories/components/category-icon"
import { CreateTransactionDTO } from "@/features/transactions/api/types"

interface TransactionFormProps {
    defaultValues?: Partial<CreateTransactionDTO>
    onSubmit: (data: CreateTransactionDTO) => void
    onCancel?: () => void
    onChange?: () => void
    isLoading?: boolean
    submitLabel?: string
}

export function TransactionForm({
    defaultValues,
    onSubmit,
    onCancel,
    onChange,
    isLoading,
    submitLabel = "Salva"
}: TransactionFormProps) {
    const { data: categories = [] } = useCategories()
    const [description, setDescription] = useState(defaultValues?.description || "")
    const [amount, setAmount] = useState(defaultValues?.amount ? defaultValues.amount.toString() : "")
    // Prefer categoryId, fallback to finding id by label, or empty
    const [categoryId, setCategoryId] = useState(defaultValues?.categoryId || "")
    const [type, setType] = useState<"expense" | "income">(defaultValues?.type || "expense")

    // Parse date from defaultValues or use today
    const [date, setDate] = useState<Date>(
        defaultValues?.date ? new Date(defaultValues.date) : new Date()
    )

    const handleFieldChange = <T,>(setter: (val: T) => void, value: T) => {
        setter(value)
        onChange?.()
    }

    const [errors, setErrors] = useState<{ [key: string]: string }>({})

    // Superfluous logic
    const [isSuperfluousManual, setIsSuperfluousManual] = useState<boolean | null>(
        defaultValues?.classificationSource === "manual" ? (defaultValues?.isSuperfluous ?? false) : null
    )
    const isManualOverride = isSuperfluousManual !== null

    // Get grouped categories based on current transaction type
    const groupedCategories = getGroupedCategories(type, categories)

    // Derive isSuperfluous based on category (rule-based), unless manually overridden
    const isSuperfluous = useMemo(() => {
        if (type !== "expense") return false
        if (isManualOverride) return isSuperfluousManual

        const cat = categories.find(c => c.id === categoryId)
        return cat?.spendingNature === "superfluous"
        // eslint-disable-next-line react-hooks/preserve-manual-memoization
    }, [categoryId, isManualOverride, isSuperfluousManual, type, categories])

    const handleCategoryChange = (val: string) => {
        handleFieldChange(setCategoryId, val)
        setIsSuperfluousManual(null) // Reset manual override (UX requirement)
    }

    const handleTypeChange = (newType: "expense" | "income") => {
        handleFieldChange(setType, newType)
        // Only reset if the current category doesn't belong to the new type
        const newGrouped = getGroupedCategories(newType, categories)
        const allCategoriesInGroups = newGrouped.flatMap(g => g.categories)
        const currentCatInList = allCategoriesInGroups.find(c => c.id === categoryId)
        if (!currentCatInList) {
            setCategoryId("")
        }
        setIsSuperfluousManual(null) // Reset manual override when type changes manually
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setErrors({})

        // Validation
        const newErrors: { [key: string]: string } = {}
        if (!description.trim()) newErrors.description = "Inserisci una descrizione"

        const amountCents = Math.abs(parseCurrencyToCents(amount))
        if (!amount || amountCents <= 0) {
            newErrors.amount = "Inserisci un importo valido"
        }

        if (!categoryId) newErrors.category = "Seleziona una categoria"

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        const selectedCategory = categories.find(c => c.id === categoryId)

        onSubmit({
            description,
            amountCents, // Send absolute integer cents
            categoryId,
            category: selectedCategory?.label || categoryId, // Fallback
            type,
            isSuperfluous,
            classificationSource: isManualOverride ? "manual" : "ruleBased",
            date: date.toISOString() // Send date
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type Selection - Segmented Control */}
            <div className="grid grid-cols-2 p-1 bg-muted/40 rounded-lg gap-1">
                <button
                    type="button"
                    onClick={() => handleTypeChange("expense")}
                    className={cn(
                        "flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all",
                        type === "expense"
                            ? "bg-white text-destructive shadow-sm"
                            : "text-muted-foreground hover:bg-muted/50"
                    )}
                >
                    <TrendingDown className="h-4 w-4" />
                    Uscita
                </button>
                <button
                    type="button"
                    onClick={() => handleTypeChange("income")}
                    className={cn(
                        "flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all",
                        type === "income"
                            ? "bg-white text-emerald-600 shadow-sm"
                            : "text-muted-foreground hover:bg-muted/50"
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
                    onChange={(e) => handleFieldChange(setDescription, e.target.value)}
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
                        onChange={(e) => handleFieldChange(setAmount, e.target.value)}
                    />
                </div>
                {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
            </div>

            <div className="space-y-2">
                <Label>Data</Label>
                <DatePicker
                    value={date}
                    onChange={(d) => d && setDate(d)}
                    disabled={isLoading}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select value={categoryId} onValueChange={handleCategoryChange}>
                    <SelectTrigger className={errors.category ? "border-destructive ring-destructive" : ""}>
                        <SelectValue placeholder="Seleziona categoria" />
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
                                            <CategoryIcon categoryName={cat.label} size={16} />
                                            <span>{cat.label}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </div>
                        ))}
                    </SelectContent>
                </Select>
                {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
            </div>

            {/* Superfluous Expense Toggle */}
            {type === "expense" && (
                <div
                    className={cn(
                        "flex items-center gap-2.5 p-2.5 rounded-lg border border-border/50 bg-muted/20 transition-colors",
                        "hover:bg-muted/40 focus-within:ring-2 focus-within:ring-primary/20",
                        isLoading && "opacity-50 pointer-events-none"
                    )}
                >
                    <input
                        type="checkbox"
                        id="isSuperfluous"
                        checked={isSuperfluous}
                        onChange={(e) => {
                            handleFieldChange(setIsSuperfluousManual, e.target.checked)
                        }}
                        disabled={isLoading}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary cursor-pointer disabled:cursor-not-allowed"
                    />
                    <div className="flex flex-col gap-0.5">
                        <Label
                            htmlFor="isSuperfluous"
                            className="font-normal cursor-pointer text-sm"
                        >
                            Segna come spesa superflua
                        </Label>
                        <span className="text-xs text-muted-foreground">
                            Spese non essenziali da monitorare per ridurle nel tempo
                        </span>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-3 pt-4">
                <Button type="submit" className="w-full h-12 rounded-2xl font-bold" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {submitLabel}
                </Button>
                {onCancel && (
                    <Button
                        type="button"
                        variant="ghost"
                        className="w-full h-12 rounded-2xl font-bold text-muted-foreground"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        Annulla
                    </Button>
                )}
            </div>
        </form>
    )
}
