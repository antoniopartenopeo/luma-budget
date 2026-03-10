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
        <div className="surface-strong flex w-full flex-col gap-3 rounded-[1.9rem] p-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="surface-subtle flex min-w-0 flex-1 items-center justify-between gap-2 rounded-[1.45rem] px-2.5 py-2.5 sm:max-w-[23rem]">
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handlePrevMonth}
                    className="border border-white/45 bg-white/70 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.26)] hover:-translate-x-0.5 hover:bg-white/80 dark:border-white/10 dark:bg-white/[0.06] dark:hover:bg-white/[0.09]"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="min-w-0 flex-1 px-1 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-foreground/58">
                        Periodo attivo
                    </p>
                    <div className="mt-1 flex items-center justify-center gap-2 text-sm font-semibold text-foreground sm:text-base">
                        <Calendar className="hidden h-4 w-4 text-primary sm:block" />
                        <span className="truncate capitalize">{capitalizedLabel}</span>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleNextMonth}
                    className="border border-white/45 bg-white/70 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.26)] hover:translate-x-0.5 hover:bg-white/80 dark:border-white/10 dark:bg-white/[0.06] dark:hover:bg-white/[0.09]"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            <div className="surface-subtle flex flex-col gap-2 rounded-[1.45rem] px-2.5 py-2 sm:min-w-[16rem] sm:max-w-[18rem]">
                <p className="px-1 text-[10px] font-black uppercase tracking-[0.16em] text-foreground/58">
                    Profondita lettura
                </p>
                <SegmentedPillSelector
                    value={modeValue}
                    onChange={handleSegmentChange}
                    options={[
                        { value: "month", label: "Mese" },
                        { value: "range-3", label: "3M" },
                        { value: "range-6", label: "6M" },
                        { value: "range-12", label: "12M" },
                    ]}
                    className="w-full flex-wrap justify-center rounded-[1rem] border-none bg-transparent p-0 shadow-none"
                    buttonClassName="min-w-[3.5rem] flex-1 md:h-8"
                />
            </div>
        </div>
    )
}
