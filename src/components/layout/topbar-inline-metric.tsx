"use client"

import { type CSSProperties } from "react"
import { cn } from "@/lib/utils"
import {
    TOPBAR_INLINE_KPI_VALUE_CLASS,
    TOPBAR_INLINE_LABEL_CLASS,
    resolveTopbarToneClass,
} from "./topbar-tokens"

interface TopbarInlineMetricProps {
    allowTruncate?: boolean
    blurValue?: boolean
    className?: string
    label: string
    meterPct?: number | null
    testId: string
    tone?: "positive" | "neutral" | "warning" | "negative"
    value: string
    valueClassName?: string
}

export function TopbarInlineMetric({
    allowTruncate = false,
    blurValue = false,
    className,
    label,
    meterPct,
    testId,
    tone = "neutral",
    value,
    valueClassName,
}: TopbarInlineMetricProps) {
    const toneClass = resolveTopbarToneClass(tone)

    return (
        <div className={cn("flex min-w-0 flex-1 flex-col justify-center gap-0.5", className)}>
            <span className={TOPBAR_INLINE_LABEL_CLASS}>
                {label}
            </span>

            <div className="flex min-w-0 items-center gap-1.5">
                <span
                    data-testid={testId}
                    className={cn(
                        TOPBAR_INLINE_KPI_VALUE_CLASS,
                        allowTruncate ? "truncate" : "whitespace-nowrap",
                        toneClass,
                        blurValue && "blur-sm opacity-55 select-none",
                        valueClassName
                    )}
                >
                    {value}
                </span>

                {meterPct !== undefined && meterPct !== null && (
                    <span className="hidden h-1 w-7 shrink-0 overflow-hidden rounded-full bg-foreground/10 sm:block">
                        <span
                            className={cn("block h-full origin-left rounded-full bg-current/75", toneClass)}
                            style={{ transform: `scaleX(${Math.max(0, Math.min(meterPct, 100)) / 100})` } as CSSProperties}
                        />
                    </span>
                )}
            </div>
        </div>
    )
}
