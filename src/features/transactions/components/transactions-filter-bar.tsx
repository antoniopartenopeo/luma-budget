import { Search, Calendar, Filter, X } from "lucide-react"
import { getGroupedCategories } from "@/features/categories/config"
import { useCategories } from "@/features/categories/api/use-categories"
import { CategoryIcon } from "@/features/categories/components/category-icon"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

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
                        placeholder="Cerca..."
                        className="pl-10 h-10 rounded-xl bg-muted/5 border-muted-foreground/10 focus-visible:ring-primary/20"
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                {/* Zone 2: Filters */}
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:flex sm:flex-wrap lg:flex-nowrap items-center gap-2 overflow-visible">
                    {/* Period */}
                    <div className="glass-card p-1 rounded-xl">
                        <Select value={periodValue} onValueChange={(v) => onPeriodChange(v as PeriodPreset)}>
                            <SelectTrigger className={cn(
                                "w-full sm:w-[140px] lg:w-[150px] flex-shrink-0 h-9 px-3 border-0 bg-transparent shadow-none focus:ring-0 transition-colors outline-none text-xs md:text-sm font-medium",
                                periodValue !== "all" ? "text-primary font-bold" : "text-muted-foreground"
                            )}>
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div className="truncate text-left uppercase tracking-wide">
                                        <SelectValue placeholder="Periodo" />
                                    </div>
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-white/5 backdrop-blur-xl bg-white/80 dark:bg-slate-950/80">
                                <SelectItem value="all">Tutto il tempo</SelectItem>
                                <SelectItem value="1m">Ultimo mese</SelectItem>
                                <SelectItem value="3m">Ultimi 3 mesi</SelectItem>
                                <SelectItem value="6m">Ultimi 6 mesi</SelectItem>
                                <SelectItem value="1y">Ultimo anno</SelectItem>
                                <Separator className="my-1 opacity-50" />
                                <SelectItem value="custom">Periodo personalizzato</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Type */}
                    <div className="glass-card p-1 rounded-xl">
                        <Select value={typeValue} onValueChange={onTypeChange}>
                            <SelectTrigger className={cn(
                                "w-full sm:w-[120px] lg:w-[130px] flex-shrink-0 h-9 px-3 border-0 bg-transparent shadow-none focus:ring-0 transition-colors outline-none text-xs md:text-sm font-medium",
                                typeValue !== "all" ? "text-primary font-bold" : "text-muted-foreground"
                            )}>
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div className="truncate text-left uppercase tracking-wide">
                                        <SelectValue placeholder="Tipo" />
                                    </div>
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-white/5 backdrop-blur-xl bg-white/80 dark:bg-slate-950/80">
                                <SelectItem value="all">Tutti i tipi</SelectItem>
                                <SelectItem value="income">Entrate</SelectItem>
                                <SelectItem value="expense">Uscite</SelectItem>
                                <Separator className="my-1 opacity-50" />
                                <SelectItem value="superfluous">Superflue</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Category */}
                    <div className="glass-card p-1 rounded-xl">
                        <Select value={categoryValue} onValueChange={onCategoryChange}>
                            <SelectTrigger className={cn(
                                "w-full sm:w-[140px] lg:w-[150px] flex-shrink-0 h-9 px-3 border-0 bg-transparent shadow-none focus:ring-0 transition-colors outline-none text-xs md:text-sm font-medium",
                                categoryValue !== "all" ? "text-primary font-bold" : "text-muted-foreground"
                            )}>
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div className="truncate text-left uppercase tracking-wide">
                                        <SelectValue placeholder="Categoria" />
                                    </div>
                                </div>
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px] rounded-xl border-white/5 backdrop-blur-xl bg-white/80 dark:bg-slate-950/80">
                                <SelectItem value="all">Tutte le categorie</SelectItem>
                                {allGroupedCategories.map((group) => (
                                    <div key={group.key}>
                                        <div className="px-2 py-1.5 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mt-2">
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
                    </div>


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
                <div className="flex items-center gap-3 p-3 bg-muted/5 border border-muted-foreground/10 rounded-xl animate-enter-up">
                    <div className="flex flex-col gap-1.5 flex-1">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground/60 px-1">Dal</label>
                        <DatePicker
                            value={dateRange.from ? new Date(dateRange.from) : undefined}
                            onChange={(d) => onDateRangeChange({ ...dateRange, from: d?.toISOString().split('T')[0] })}
                            placeholder="Data inizio"
                            dateFormat="dd/MM/yyyy"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground/60 px-1">Al</label>
                        <DatePicker
                            value={dateRange.to ? new Date(dateRange.to) : undefined}
                            onChange={(d) => onDateRangeChange({ ...dateRange, to: d?.toISOString().split('T')[0] })}
                            placeholder="Data fine"
                            dateFormat="dd/MM/yyyy"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
