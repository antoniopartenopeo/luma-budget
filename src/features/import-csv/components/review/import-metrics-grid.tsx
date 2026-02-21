"use client"

import { cn } from "@/lib/utils"

type ImportMetricTone = "neutral" | "success" | "warning" | "danger" | "info"

interface ImportMetricItem {
    key: string
    label: string
    value: number | string
    tone?: ImportMetricTone
    detail?: React.ReactNode
}

interface ImportMetricsGridProps {
    items: ImportMetricItem[]
    className?: string
}

const TONE_CLASSNAME: Record<ImportMetricTone, string> = {
    neutral: "border-border/60 text-foreground",
    success: "border-emerald-500/25 text-emerald-700 dark:text-emerald-300",
    warning: "border-amber-500/25 text-amber-700 dark:text-amber-300",
    danger: "border-rose-500/25 text-rose-700 dark:text-rose-300",
    info: "border-sky-500/25 text-sky-700 dark:text-sky-300",
}

export function ImportMetricsGrid({ items, className }: ImportMetricsGridProps) {
    return (
        <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-2", className)}>
            {items.map((item) => (
                <div
                    key={item.key}
                    className={cn(
                        "rounded-lg border bg-background/60 px-3 py-2.5",
                        TONE_CLASSNAME[item.tone ?? "neutral"]
                    )}
                >
                    <div className="text-xs font-medium text-muted-foreground">{item.label}</div>
                    <div className="text-xl font-semibold tabular-nums leading-tight">{item.value}</div>
                    {item.detail ? (
                        <div className="text-xs tabular-nums text-muted-foreground">{item.detail}</div>
                    ) : null}
                </div>
            ))}
        </div>
    )
}
