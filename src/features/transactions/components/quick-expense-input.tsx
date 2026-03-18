"use client"

import { type Ref, useState, useMemo } from "react"
import { Loader2, CheckCircle2, AlertCircle, TrendingUp, TrendingDown, ShieldCheck, Sparkles } from "lucide-react"
import { parseCurrencyToCents } from "@/domain/money"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { cn } from "@/lib/utils"
import {
    TOPBAR_INLINE_INPUT_TEXT_CLASS,
    TOPBAR_INLINE_SUPPORT_TEXT_CLASS,
} from "@/components/layout/topbar-tokens"

import { useCreateTransaction } from "@/features/transactions/api/use-transactions"
import { Transaction } from "@/features/transactions/api/types"
import { getGroupedCategories, getCategoryById, Category } from "@/features/categories/config"
import { useCategories } from "@/features/categories/api/use-categories"
import { CategoryIcon } from "@/features/categories/components/category-icon"

interface QuickExpenseInputProps {
    autoFocusDescription?: boolean
    descriptionInputRef?: Ref<HTMLInputElement>
    onExpenseCreated?: (transaction: Transaction) => void
    variant?: "card" | "embedded"
}

const EMPTY_ARRAY: Category[] = []

export function QuickExpenseInput({
    autoFocusDescription = false,
    descriptionInputRef,
    onExpenseCreated,
    variant = "card",
}: QuickExpenseInputProps) {
    const [description, setDescription] = useState("")
    const [amount, setAmount] = useState("")
    const [category, setCategory] = useState("")
    const [date, setDate] = useState<Date>(new Date())
    const [type, setType] = useState<"expense" | "income">("expense")

    const { data: categories = EMPTY_ARRAY } = useCategories()
    const [isFocused, setIsFocused] = useState(false)
    const [validationError, setValidationError] = useState<string | null>(null)

    // Superfluous expense logic
    const [isSuperfluousManual, setIsSuperfluousManual] = useState<boolean | null>(null)
    const isManualOverride = isSuperfluousManual !== null

    const { mutate: create, isPending, isSuccess, isError } = useCreateTransaction()

    // Get grouped categories based on current transaction type (memoized)
    const groupedCategories = useMemo(() => {
        return getGroupedCategories(categories, type)
    }, [categories, type])

    // Derive isSuperfluous based on category (rule-based), unless manually overridden
    const isSuperfluous = useMemo(() => {
        if (type !== "expense") return false
        if (isManualOverride) return isSuperfluousManual

        const cat = getCategoryById(category, categories)
        return cat?.spendingNature === "superfluous"
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
    const isEmbedded = variant === "embedded"
    const inlineUtilityButtonClass = "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-transparent bg-transparent text-muted-foreground/80 leading-none transition-[background-color,color,border-color] duration-200 hover:bg-black/[0.045] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-white/[0.06] [&_svg]:shrink-0"
    const expenseNatureLabel = isSuperfluous ? "Spesa superflua" : "Spesa necessaria"
    const ExpenseNatureIcon = isSuperfluous ? Sparkles : ShieldCheck

    return (
        <div className="relative w-full">
            <form
                onSubmit={handleSubmit}
                className={cn(
                    isEmbedded
                        ? "flex h-auto flex-col items-stretch gap-2 rounded-[1.1rem] bg-transparent p-2 sm:h-10 sm:flex-row sm:items-center sm:gap-1 sm:p-0"
                        : "glass-card flex h-auto flex-col items-stretch gap-2 rounded-[1.4rem] p-2 sm:h-12 sm:flex-row sm:items-center sm:p-1",
                    !isEmbedded && isFocused && "bg-background/60 ring-2 ring-primary/20 shadow-lg dark:bg-black/40",
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
                <div className={cn("flex min-w-0 items-center gap-1", isEmbedded ? "flex-[1.55]" : "flex-1")}>
                    {/* Type Toggle */}
                    <div className="shrink-0 rounded-full border border-white/35 bg-white/55 p-0.5 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
                        <button
                            type="button"
                            onClick={() => handleTypeChange("expense")}
                            className={cn(
                                "rounded-full p-1.5 transition-[background-color,color,box-shadow] duration-200",
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
                                "rounded-full p-1.5 transition-[background-color,color,box-shadow] duration-200",
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
                        autoFocus={autoFocusDescription}
                        ref={descriptionInputRef}
                        placeholder={isFocused ? "Es. Caffè bar..." : "Cosa hai comprato?"}
                        value={description}
                        onChange={(e) => {
                            setDescription(e.target.value)
                            if (validationError) setValidationError(null)
                        }}
                        disabled={isPending}
                        className={cn(
                            "h-9 border-0 bg-transparent px-2 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/70 flex-1 min-w-0 text-sm md:text-base",
                            isEmbedded && TOPBAR_INLINE_INPUT_TEXT_CLASS,
                            validationError && !description.trim() && "placeholder:text-destructive/50"
                        )}
                    />
                </div>

                <div className="h-px w-full bg-border/50 sm:hidden" />
                <div className="h-6 w-px bg-border/50 hidden sm:block" />

                {/* Mobile: Row 2 (Amount + Date + Category + Action) | Desktop: Horizontal flow */}
                <div className={cn("flex items-center gap-1", isEmbedded && "shrink-0")}>
                    {/* Amount */}
                    <div className={cn("relative flex items-center shrink-0", isEmbedded ? "w-20" : "w-24 sm:w-auto")}>
                        <span
                            className={cn(
                                "absolute left-1.5 text-muted-foreground font-medium",
                                isEmbedded ? TOPBAR_INLINE_INPUT_TEXT_CLASS : "md:left-2 text-xs md:text-sm"
                            )}
                        >
                            €
                        </span>
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
                                isEmbedded
                                    ? `h-9 w-full border-0 bg-transparent pl-5 pr-1 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/70 text-right font-normal tabular-nums tracking-tighter ${TOPBAR_INLINE_INPUT_TEXT_CLASS} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`
                                    : "h-9 w-full sm:w-24 border-0 bg-transparent pl-4 md:pl-6 pr-1 md:pr-2 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/70 text-right font-black tabular-nums tracking-tighter text-sm md:text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                                validationError && (!amount || Math.abs(parseCurrencyToCents(amount)) <= 0) && "placeholder:text-destructive/50 text-destructive"
                            )}
                        />
                    </div>

                    <div className="h-6 w-px bg-border/50 hidden md:block" />

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
                            isEmbedded
                                ? `h-9 w-[7.25rem] shrink-0 border-0 bg-transparent shadow-none focus:ring-0 text-muted-foreground data-[state=checked]:text-foreground ${TOPBAR_INLINE_SUPPORT_TEXT_CLASS}`
                                : "h-9 flex-1 sm:w-[130px] border-0 bg-transparent shadow-none focus:ring-0 text-muted-foreground data-[state=checked]:text-foreground text-xs md:text-sm",
                            validationError && !category && "text-destructive/70"
                        )}>
                            <div className="truncate text-left">
                                <SelectValue placeholder="Categoria" />
                            </div>
                        </SelectTrigger>
                        <SelectContent variant="premium" className="max-h-[300px]">
                            {groupedCategories.map((group) => (
                                <SelectGroup key={group.key}>
                                    <SelectLabel className="px-2 py-1.5 text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                        {group.label}
                                    </SelectLabel>
                                    {group.categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            <div className="flex items-center gap-2">
                                                <CategoryIcon categoryName={cat.label} size={14} />
                                                <span>{cat.label}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            ))}
                        </SelectContent>
                    </Select>

                    {isEmbedded ? (
                        <>
                            <div className="hidden h-6 w-px bg-border/50 sm:block" />

                            <div data-testid="quick-expense-trailing-actions" className="flex shrink-0 items-center gap-1">
                                <DatePicker
                                    value={date}
                                    onChange={(d) => d && setDate(d)}
                                    variant="icon"
                                    align="end"
                                    disabled={isPending}
                                    className={inlineUtilityButtonClass}
                                    triggerAriaLabel="Seleziona data transazione"
                                    triggerTestId="quick-expense-date-trigger"
                                />

                                {type === "expense" && (
                                    <button
                                        type="button"
                                        data-testid="quick-expense-superfluous-trigger"
                                        aria-label={expenseNatureLabel}
                                        aria-pressed={isSuperfluous}
                                        title={expenseNatureLabel}
                                        onClick={toggleSuperfluous}
                                        disabled={isPending}
                                        className={cn(
                                            inlineUtilityButtonClass,
                                            isSuperfluous
                                                ? "text-primary hover:bg-primary/10 hover:text-primary"
                                                : "text-muted-foreground/80"
                                        )}
                                    >
                                        <ExpenseNatureIcon className="h-4 w-4" />
                                    </button>
                                )}

                                <Button
                                    type="submit"
                                    disabled={isPending}
                                    className={cn(
                                        "h-8 shrink-0 rounded-full bg-primary px-3 text-primary-foreground sm:ml-1",
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
                                        <span className={cn(TOPBAR_INLINE_SUPPORT_TEXT_CLASS, "sm:font-medium")}>Aggiungi</span>
                                    )}
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Date Picker (Compact Icon) */}
                            <DatePicker
                                value={date}
                                onChange={(d) => d && setDate(d)}
                                variant="icon"
                                align="end"
                                disabled={isPending}
                            />

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isPending}
                                className={cn(
                                    "ml-auto h-8 shrink-0 rounded-full bg-primary px-3 text-primary-foreground md:h-9 md:px-4 sm:ml-1",
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
                        </>
                    )}
                </div>

                {/* Superfluous Toggle - Only for expenses and on larger mobiles/desktop */}
                {!isEmbedded && type === "expense" && (
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
                <div className="absolute -bottom-8 left-4 flex items-center gap-2 text-xs font-medium text-destructive animate-enter-up">
                    <AlertCircle className="h-3 w-3" />
                    {validationError || "Errore durante il salvataggio. Riprova."}
                </div>
            )}
        </div>
    )
}
