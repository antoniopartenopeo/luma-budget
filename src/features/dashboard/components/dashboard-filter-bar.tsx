"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { SegmentedPillSelector } from "@/components/patterns/segmented-pill-selector"
import { DashboardTimeFilter } from "../api/types"
import { formatPeriodLabel, shiftPeriod } from "@/lib/date-ranges"

interface DashboardFilterBarProps {
    filter: DashboardTimeFilter
    onFilterChange: (filter: DashboardTimeFilter) => void
}

export function DashboardFilterBar({ filter, onFilterChange }: DashboardFilterBarProps) {
    // Format period label (e.g. "Gennaio 2024")
    const capitalizedLabel = formatPeriodLabel(filter.period, "it-IT")

    const handlePrevMonth = () => {
        onFilterChange({ ...filter, period: shiftPeriod(filter.period, -1) })
    }

    const handleNextMonth = () => {
        onFilterChange({ ...filter, period: shiftPeriod(filter.period, 1) })
    }

    const handleModeChange = (mode: "month" | "range", months?: 3 | 6 | 12) => {
        onFilterChange({ ...filter, mode, months: mode === "range" ? months : undefined })
    }

    const modeValue = filter.mode === "month" ? "month" : `range-${filter.months}`

    const handleSegmentChange = (value: string) => {
        if (value === "month") {
            handleModeChange("month")
            return
        }
        if (value === "range-3") {
            handleModeChange("range", 3)
            return
        }
        if (value === "range-6") {
            handleModeChange("range", 6)
            return
        }
        if (value === "range-12") {
            handleModeChange("range", 12)
        }
    }

    return (
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between glass-card px-2 py-1.5 md:px-3 rounded-xl border-none">
            {/* Period Selector (Left) */}
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handlePrevMonth} className="h-8 w-8">
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-2 min-w-[140px] md:min-w-[160px] justify-center font-medium text-sm md:text-base">
                    <Calendar className="h-4 w-4 text-muted-foreground hidden xs:block" />
                    <span className="capitalize">{capitalizedLabel}</span>
                </div>

                <Button variant="outline" size="icon" onClick={handleNextMonth} className="h-8 w-8">
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Mode Selector (Right) */}
            <SegmentedPillSelector
                value={modeValue}
                onChange={handleSegmentChange}
                options={[
                    { value: "month", label: "Mese" },
                    { value: "range-3", label: "3M" },
                    { value: "range-6", label: "6M" },
                    { value: "range-12", label: "12M" },
                ]}
                className="flex-wrap justify-center"
                buttonClassName="md:h-8 md:px-3"
            />
        </div>
    )
}
