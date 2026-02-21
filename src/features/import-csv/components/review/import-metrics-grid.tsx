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
    neutral: "border bg-muted/30 text-foreground",
    success: "border border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300",
    warning: "border border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-300",
    danger: "border border-rose-500/20 bg-rose-500/5 text-rose-700 dark:text-rose-300",
    info: "border border-sky-500/20 bg-sky-500/5 text-sky-700 dark:text-sky-300",
}

export function ImportMetricsGrid({ items, className }: ImportMetricsGridProps) {
    return (
        <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-2", className)}>
            {items.map((item) => (
                <div key={item.key} className={cn("rounded-xl p-3", TONE_CLASSNAME[item.tone ?? "neutral"])}>
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground/90">{item.label}</div>
                    <div className="text-lg font-bold tabular-nums">{item.value}</div>
                    {item.detail ? (
                        <div className="text-[10px] tabular-nums opacity-80">{item.detail}</div>
                    ) : null}
                </div>
            ))}
        </div>
    )
}
