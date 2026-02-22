"use client"

import { Filter } from "lucide-react"
import { SegmentedPillSelector } from "@/components/patterns/segmented-pill-selector"
import { cn } from "@/lib/utils"
import { THRESHOLD_MAX_CENTS } from "../../core/filters"

interface ThresholdPresetSelectorProps {
    thresholdCents: number
    onCommit: (value: number) => void
    className?: string
}

const THRESHOLD_PRESETS = [
    { value: "0", label: "Tutti" },
    { value: "1000", label: "10 €+" },
    { value: "2500", label: "25 €+" },
    { value: "5000", label: "50 €+" },
    { value: "10000", label: "100 €+" },
    { value: "20000", label: "200 €+" },
    { value: "35000", label: "350 €+" },
    { value: "50000", label: "500 €+" },
    { value: "75000", label: "750 €+" },
    { value: String(THRESHOLD_MAX_CENTS), label: "1000 €+" },
]

/**
 * Preset selector for filtering groups by relevance.
 * Keeps threshold changes simple and consistent through predefined levels.
 */
export function ThresholdPresetSelector({
    thresholdCents,
    onCommit,
    className
}: ThresholdPresetSelectorProps) {
    const currentValue = thresholdCents
    const activePreset = THRESHOLD_PRESETS.some((preset) => Number(preset.value) === currentValue)
        ? String(currentValue)
        : undefined

    const handlePresetChange = (value: string) => {
        const cents = Number(value)
        if (Number.isNaN(cents)) return
        onCommit(cents)
    }

    return (
        <div className={cn("rounded-2xl border border-border/60 bg-background/70 p-4 sm:p-5", className)}>
            <div className="flex items-center gap-4 overflow-x-auto">
                <div className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-foreground">
                    <Filter className="h-4 w-4 text-primary" />
                    <span>Mostra importi da</span>
                </div>
                <div className="shrink-0">
                    <SegmentedPillSelector
                        value={activePreset}
                        onChange={handlePresetChange}
                        options={THRESHOLD_PRESETS}
                        className="min-w-max"
                        buttonClassName="shrink-0 md:h-8 md:px-3"
                    />
                </div>
            </div>
        </div>
    )
}
