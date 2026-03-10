import { Search, X } from "lucide-react"
import { getGroupedCategories } from "@/features/categories/config"
import { useCategories } from "@/features/categories/api/use-categories"
import { CategoryIcon } from "@/features/categories/components/category-icon"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatDateLocalISO } from "@/lib/date-ranges"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { premiumFieldLabelClassName } from "@/components/ui/control-styles"

export type PeriodPreset = "1m" | "3m" | "6m" | "1y" | "all" | "custom"

interface TransactionsFilterBarProps {
    searchValue: string
    onSearchChange: (value: string) => void
    typeValue: string
    onTypeChange: (value: string) => void
    categoryValue: string
    onCategoryChange: (value: string) => void
    periodValue: PeriodPreset
    onPeriodChange: (value: PeriodPreset) => void
    dateRange: { from?: string; to?: string }
    onDateRangeChange: (range: { from?: string; to?: string }) => void
    isSuperfluousOnly: boolean
    onResetFilters?: () => void
}

export function TransactionsFilterBar({
    searchValue,
    onSearchChange,
    typeValue,
    onTypeChange,
    categoryValue,
    onCategoryChange,
    periodValue,
    onPeriodChange,
    dateRange,
    onDateRangeChange,
    isSuperfluousOnly,
    onResetFilters
}: TransactionsFilterBarProps) {
    const { data: categories = [] } = useCategories()
    const hasActiveFilters =
        typeValue !== "all" ||
        categoryValue !== "all" ||
        searchValue !== "" ||
        periodValue !== "all" ||
        isSuperfluousOnly

    const allGroupedCategories = getGroupedCategories(categories, undefined)

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_auto] gap-4 items-center">
                {/* Zone 1: Search */}
                <div className="relative w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                    <Input
                        variant="premium"
                        placeholder="Cerca..."
                        className="h-11 rounded-[1rem] pl-10"
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                {/* Zone 2: Filters */}
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:flex sm:flex-wrap lg:flex-nowrap items-center gap-2 overflow-visible">
                    {/* Period */}
                    <Select value={periodValue} onValueChange={(v) => onPeriodChange(v as PeriodPreset)}>
                        <SelectTrigger
                            variant="premium"
                            className={cn(
                                "w-full sm:w-[140px] lg:w-[150px] flex-shrink-0 h-11 px-3 text-xs md:text-sm",
                                periodValue !== "all" ? "text-primary font-semibold" : "text-muted-foreground"
                            )}
                        >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className="truncate text-left">
                                    <SelectValue placeholder="Periodo" />
                                </div>
                            </div>
                        </SelectTrigger>
                        <SelectContent variant="premium">
                            <SelectItem value="all">Tutto il tempo</SelectItem>
                            <SelectItem value="1m">Ultimo mese</SelectItem>
                            <SelectItem value="3m">Ultimi 3 mesi</SelectItem>
                            <SelectItem value="6m">Ultimi 6 mesi</SelectItem>
                            <SelectItem value="1y">Ultimo anno</SelectItem>
                            <Separator className="my-1 opacity-50" />
                            <SelectItem value="custom">Periodo personalizzato</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Type */}
                    <Select value={typeValue} onValueChange={onTypeChange}>
                        <SelectTrigger
                            variant="premium"
                            className={cn(
                                "w-full sm:w-[120px] lg:w-[130px] flex-shrink-0 h-11 px-3 text-xs md:text-sm",
                                typeValue !== "all" ? "text-primary font-semibold" : "text-muted-foreground"
                            )}
                        >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className="truncate text-left">
                                    <SelectValue placeholder="Tipo" />
                                </div>
                            </div>
                        </SelectTrigger>
                        <SelectContent variant="premium">
                            <SelectItem value="all">Tutti i tipi</SelectItem>
                            <SelectItem value="income">Entrate</SelectItem>
                            <SelectItem value="expense">Uscite</SelectItem>
                            <Separator className="my-1 opacity-50" />
                            <SelectItem value="superfluous">Superflue</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Category */}
                    <Select value={categoryValue} onValueChange={onCategoryChange}>
                        <SelectTrigger
                            variant="premium"
                            className={cn(
                                "w-full sm:w-[140px] lg:w-[150px] flex-shrink-0 h-11 px-3 text-xs md:text-sm",
                                categoryValue !== "all" ? "text-primary font-semibold" : "text-muted-foreground"
                            )}
                        >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className="truncate text-left">
                                    <SelectValue placeholder="Categoria" />
                                </div>
                            </div>
                        </SelectTrigger>
                        <SelectContent variant="premium" className="max-h-[300px]">
                            <SelectItem value="all">Tutte le categorie</SelectItem>
                            {allGroupedCategories.map((group) => (
                                <div key={group.key}>
                                    <div className={cn("mt-2 px-2 py-1.5", premiumFieldLabelClassName)}>
                                        {group.label}
                                    </div>
                                    {group.categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id} className="rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <CategoryIcon categoryName={category.label} size={14} />
                                                <span>{category.label}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </div>
                            ))}
                        </SelectContent>
                    </Select>


                    {hasActiveFilters && onResetFilters && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onResetFilters}
                            className="hidden sm:flex h-10 w-10 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/5 rounded-xl"
                            title="Azzera filtri"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Custom Date Range Inputs */}
            {periodValue === "custom" && (
                <div className="surface-subtle flex items-center gap-3 rounded-[1.25rem] p-3 animate-enter-up">
                    <div className="flex flex-col gap-1.5 flex-1">
                        <label className={premiumFieldLabelClassName}>Dal</label>
                        <DatePicker
                            value={dateRange.from ? new Date(dateRange.from) : undefined}
                            onChange={(d) => onDateRangeChange({ ...dateRange, from: d ? formatDateLocalISO(d) : undefined })}
                            placeholder="Data inizio"
                            dateFormat="dd/MM/yyyy"
                            className="h-11 rounded-[1rem] border-white/30 bg-white/58 shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_18px_36px_-28px_rgba(15,23,42,0.42)] hover:bg-white/72 dark:border-white/12 dark:bg-white/[0.06] dark:hover:bg-white/[0.09]"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1">
                        <label className={premiumFieldLabelClassName}>Al</label>
                        <DatePicker
                            value={dateRange.to ? new Date(dateRange.to) : undefined}
                            onChange={(d) => onDateRangeChange({ ...dateRange, to: d ? formatDateLocalISO(d) : undefined })}
                            placeholder="Data fine"
                            dateFormat="dd/MM/yyyy"
                            className="h-11 rounded-[1rem] border-white/30 bg-white/58 shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_18px_36px_-28px_rgba(15,23,42,0.42)] hover:bg-white/72 dark:border-white/12 dark:bg-white/[0.06] dark:hover:bg-white/[0.09]"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
