"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface TransactionsFilterBarProps {
    onSearchChange: (value: string) => void
    onTypeChange: (value: string) => void
    onCategoryChange: (value: string) => void
    categories: string[]
}

export function TransactionsFilterBar({
    onSearchChange,
    onTypeChange,
    onCategoryChange,
    categories,
}: TransactionsFilterBarProps) {
    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-4">
                <div className="relative flex-1 md:max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cerca transazioni..."
                        className="pl-9"
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
                <Select onValueChange={onTypeChange} defaultValue="all">
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tutti</SelectItem>
                        <SelectItem value="income">Entrate</SelectItem>
                        <SelectItem value="expense">Uscite</SelectItem>
                    </SelectContent>
                </Select>
                <Select onValueChange={onCategoryChange} defaultValue="all">
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tutte le categorie</SelectItem>
                        {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                                {category}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center gap-2">
                {/* Period selector placeholder - could be added later */}
            </div>
        </div>
    )
}
