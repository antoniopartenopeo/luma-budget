"use client"

import { Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { formatCents } from "@/domain/money"
import { THRESHOLD_MAX_CENTS, THRESHOLD_STEP_CENTS } from "../../core/filters"

interface ThresholdSliderProps {
    thresholdCents: number
    visualThreshold: number
    isDragging: boolean
    hiddenGroupsCount: number
    onVisualChange: (value: number) => void
    onCommit: (value: number) => void
    onDragStart: () => void
    onDragEnd: () => void
    className?: string
}

/**
 * Threshold slider for filtering groups by relevance.
 * Shows visual feedback during drag and committed value otherwise.
 */
export function ThresholdSlider({
    thresholdCents,
    visualThreshold,
    isDragging,
    hiddenGroupsCount,
    onVisualChange,
    onCommit,
    onDragStart,
    onDragEnd,
    className
}: ThresholdSliderProps) {
    return (
        <div className={["flex flex-col gap-2", className].filter(Boolean).join(" ")}>
            <div className="flex items-center gap-3">
                <Filter className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="text-sm font-semibold">Mostra importi da</span>
                <Badge variant="outline" className="ml-auto font-mono tabular-nums text-xs">
                    {isDragging ? formatCents(visualThreshold) : formatCents(thresholdCents)}
                </Badge>
                {hiddenGroupsCount > 0 && (
                    <Badge variant="secondary" className="border-amber-300/60 bg-amber-100/70 text-xs text-amber-800">
                        {hiddenGroupsCount} gruppi nascosti
                    </Badge>
                )}
            </div>
            <Slider
                value={[isDragging ? visualThreshold : thresholdCents]}
                min={0}
                max={THRESHOLD_MAX_CENTS}
                step={THRESHOLD_STEP_CENTS}
                onValueChange={([v]) => {
                    onVisualChange(v)
                    onDragStart()
                }}
                onValueCommit={([v]) => {
                    onCommit(v)
                    onDragEnd()
                }}
                className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>Tutti i movimenti</span>
                <span>Solo importi più alti</span>
            </div>
        </div>
    )
}
