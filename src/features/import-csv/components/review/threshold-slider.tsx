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
    onDragEnd
}: ThresholdSliderProps) {
    return (
        <div className="px-4 md:px-8 py-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
                <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium">Soglia rilevanza</span>
                <Badge variant="outline" className="ml-auto font-mono text-xs">
                    {isDragging ? formatCents(visualThreshold) : formatCents(thresholdCents)}
                </Badge>
                {hiddenGroupsCount > 0 && (
                    <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 border-amber-200">
                        {hiddenGroupsCount} nascosti
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
            <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Tutti</span>
                <span>Solo grandi importi</span>
            </div>
        </div>
    )
}
