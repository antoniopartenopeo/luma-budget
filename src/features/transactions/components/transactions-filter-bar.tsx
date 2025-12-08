"use client"


import { Search } from "lucide-react"
import { CATEGORIES } from "@/features/categories/config"
import { CategoryIcon } from "@/features/categories/components/category-icon"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface TransactionsFilterBarProps {
    searchValue: string
    onSearchChange: (value: string) => void
    typeValue: string
    onTypeChange: (value: string) => void
    categoryValue: string
    onCategoryChange: (value: string) => void
    onResetFilters?: () => void
}

export function TransactionsFilterBar({
    searchValue,
    onSearchChange,
    typeValue,
    onTypeChange,
    categoryValue,
    onCategoryChange,
    onResetFilters
}: TransactionsFilterBarProps) {
    const hasActiveFilters = typeValue !== "all" || categoryValue !== "all" || searchValue !== ""

    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-4">
                <div className="relative flex-1 md:max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cerca per descrizione o importo..."
                        className="pl-9"
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
                <Select value={typeValue} onValueChange={onTypeChange}>
                    <SelectTrigger className={cn("w-[140px]", typeValue !== "all" && "bg-primary/5 border-primary/20 text-primary font-medium")}>
                        <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tutti</SelectItem>
                        <SelectItem value="income">Entrate</SelectItem>
                        <SelectItem value="expense">Uscite</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={categoryValue} onValueChange={onCategoryChange}>
                    <SelectTrigger className={cn("w-[160px]", categoryValue !== "all" && "bg-primary/5 border-primary/20 text-primary font-medium")}>
                        <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tutte le categorie</SelectItem>
                        {CATEGORIES.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                                <div className="flex items-center gap-2">
                                    <CategoryIcon categoryName={category.label} size={14} />
                                    <span>{category.label}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {hasActiveFilters && onResetFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onResetFilters}
                        className="text-muted-foreground hover:text-foreground hidden md:flex"
                    >
                        Azzera
                    </Button>
                )}
            </div>
            <div className="flex items-center gap-2">
                {/* Period selector placeholder - could be added later */}
            </div>
        </div>
    )
}
