import { Search, Calendar, Filter, X, Download, Loader2 } from "lucide-react"
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
    onSuperfluousChange: (value: boolean) => void
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
    onSuperfluousChange,
    onResetFilters
}: TransactionsFilterBarProps) {
    const { data: categories = [] } = useCategories()
    const hasActiveFilters =
        typeValue !== "all" ||
        categoryValue !== "all" ||
        searchValue !== "" ||
        periodValue !== "all" ||
        isSuperfluousOnly

    const allGroupedCategories = getGroupedCategories(undefined, categories)

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
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap lg:flex-nowrap items-center gap-2 overflow-visible">
                    {/* Period */}
                    <Select value={periodValue} onValueChange={(v) => onPeriodChange(v as PeriodPreset)}>
                        <SelectTrigger className={cn(
                            "w-full sm:w-[150px] lg:w-[164px] flex-shrink-0 h-10 px-3 md:px-4 rounded-xl border-muted-foreground/10 transition-colors outline-none",
                            periodValue !== "all" ? "bg-primary/10 border-primary/30 text-primary font-bold" : "bg-muted/5 hover:bg-muted/10"
                        )}>
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Calendar className="h-3.5 w-3.5 opacity-70 shrink-0 hidden xs:block" />
                                <div className="truncate text-left text-xs md:text-sm">
                                    <SelectValue placeholder="Periodo" />
                                </div>
                            </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-muted-foreground/10">
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
                        <SelectTrigger className={cn(
                            "w-full sm:w-[150px] lg:w-[164px] flex-shrink-0 h-10 px-3 md:px-4 rounded-xl border-muted-foreground/10 transition-colors outline-none",
                            typeValue !== "all" ? "bg-primary/10 border-primary/30 text-primary font-bold" : "bg-muted/5 hover:bg-muted/10"
                        )}>
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Filter className="h-3.5 w-3.5 opacity-70 shrink-0 hidden xs:block" />
                                <div className="truncate text-left text-xs md:text-sm">
                                    <SelectValue placeholder="Tipo" />
                                </div>
                            </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-muted-foreground/10">
                            <SelectItem value="all">Tutti i tipi</SelectItem>
                            <SelectItem value="income">Entrate</SelectItem>
                            <SelectItem value="expense">Uscite</SelectItem>
                            <Separator className="my-1 opacity-50" />
                            <SelectItem value="superfluous">Superflue</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Category */}
                    <Select value={categoryValue} onValueChange={onCategoryChange}>
                        <SelectTrigger className={cn(
                            "w-full sm:w-[150px] lg:w-[164px] flex-shrink-0 h-10 px-3 md:px-4 rounded-xl border-muted-foreground/10 transition-colors outline-none",
                            categoryValue !== "all" ? "bg-primary/10 border-primary/30 text-primary font-bold" : "bg-muted/5 hover:bg-muted/10"
                        )}>
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className="truncate text-left text-xs md:text-sm">
                                    <SelectValue placeholder="Categoria" />
                                </div>
                            </div>
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px] rounded-xl border-muted-foreground/10">
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
                <div className="flex items-center gap-3 p-3 bg-muted/5 border border-muted-foreground/10 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
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
