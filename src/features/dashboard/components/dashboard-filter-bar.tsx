"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { DashboardTimeFilter } from "../api/types"
import { cn } from "@/lib/utils"

interface DashboardFilterBarProps {
    filter: DashboardTimeFilter
    onFilterChange: (filter: DashboardTimeFilter) => void
}

export function DashboardFilterBar({ filter, onFilterChange }: DashboardFilterBarProps) {
    // Helpers to manipulate YYYY-MM
    const currentDate = new Date(filter.period + "-01")

    // Format period label (e.g. "Gennaio 2024")
    const periodLabel = new Intl.DateTimeFormat("it-IT", { month: "long", year: "numeric" }).format(currentDate)
    const capitalizedLabel = periodLabel.charAt(0).toUpperCase() + periodLabel.slice(1)

    const handlePrevMonth = () => {
        const d = new Date(currentDate)
        d.setMonth(d.getMonth() - 1)
        const newPeriod = d.toISOString().slice(0, 7)
        onFilterChange({ ...filter, period: newPeriod })
    }

    const handleNextMonth = () => {
        const d = new Date(currentDate)
        d.setMonth(d.getMonth() + 1)
        const newPeriod = d.toISOString().slice(0, 7)
        onFilterChange({ ...filter, period: newPeriod })
    }

    const handleModeChange = (mode: "month" | "range", months?: 3 | 6 | 12) => {
        onFilterChange({ ...filter, mode, months: mode === "range" ? months : undefined })
    }

    return (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border shadow-sm">
            {/* Period Selector (Left) */}
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handlePrevMonth} className="h-8 w-8">
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-2 min-w-[160px] justify-center font-medium">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="capitalize">{capitalizedLabel}</span>
                </div>

                <Button variant="outline" size="icon" onClick={handleNextMonth} className="h-8 w-8">
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Mode Selector (Right) */}
            <div className="flex items-center gap-1 bg-muted/20 p-1 rounded-lg">
                <Button
                    variant={filter.mode === "month" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => handleModeChange("month")}
                    className={cn("text-xs h-8", filter.mode === "month" && "bg-white shadow-sm")}
                >
                    Mese
                </Button>
                <div className="w-px h-4 bg-border mx-1" />
                <Button
                    variant={filter.mode === "range" && filter.months === 3 ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => handleModeChange("range", 3)}
                    className={cn("text-xs h-8", filter.mode === "range" && filter.months === 3 && "bg-white shadow-sm")}
                >
                    3M
                </Button>
                <Button
                    variant={filter.mode === "range" && filter.months === 6 ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => handleModeChange("range", 6)}
                    className={cn("text-xs h-8", filter.mode === "range" && filter.months === 6 && "bg-white shadow-sm")}
                >
                    6M
                </Button>
                <Button
                    variant={filter.mode === "range" && filter.months === 12 ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => handleModeChange("range", 12)}
                    className={cn("text-xs h-8", filter.mode === "range" && filter.months === 12 && "bg-white shadow-sm")}
                >
                    12M
                </Button>
            </div>
        </div>
    )
}
