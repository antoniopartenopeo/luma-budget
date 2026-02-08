"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatPeriodDisplay, getPreviousPeriod, getNextPeriod, getCurrentPeriod } from "../utils/calculate-budget"

interface MonthSelectorProps {
    period: string
    onPeriodChange: (period: string) => void
}

export function MonthSelector({ period, onPeriodChange }: MonthSelectorProps) {
    const currentPeriod = getCurrentPeriod()
    const isCurrentMonth = period === currentPeriod

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onPeriodChange(getPreviousPeriod(period))}
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="min-w-[140px] md:min-w-[160px] text-center">
                <span className="font-medium text-sm md:text-base">{formatPeriodDisplay(period)}</span>
            </div>

            <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onPeriodChange(getNextPeriod(period))}
                disabled={isCurrentMonth}
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    )
}
