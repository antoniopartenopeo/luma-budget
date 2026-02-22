

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

export type KpiTone = "positive" | "negative" | "neutral" | "warning"


export interface KpiCardProps {
    title: string
    subtitle?: string
    badge?: React.ReactNode
    value: string | number
    change?: string
    trend?: "up" | "down" | "neutral" | "warning"
    comparisonLabel?: string
    icon: React.ElementType
    isLoading?: boolean
    tone?: KpiTone
    onClick?: () => void
    className?: string
    valueClassName?: string
    description?: string
    /**
     * If provided, the card will animate the value transition.
     */
    animatedValue?: number
    formatFn?: (value: number) => string
    compact?: boolean
}

import { AnimatedNumber } from "@/components/ui/animated-number"

export function KpiCard({
    title,
    subtitle,
    badge,
    value,
    change,
    trend,
    comparisonLabel,
    icon: Icon,
    isLoading,
    tone = "neutral",
    onClick,
    className,
    valueClassName,
    description,
    animatedValue,
    formatFn,
    compact = false,
}: KpiCardProps) {


    if (isLoading) {
        return (
            <Card className={cn("rounded-xl shadow-sm", className)}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-[120px] mb-2" />
                    <Skeleton className="h-3 w-[150px]" />
                </CardContent>
            </Card>
        )
    }

    return (
        <div className={compact ? undefined : "h-full"}>
            <Card
                className={cn(
                    "rounded-xl glass-card",
                    compact ? "py-3 gap-3" : "h-full",

                    onClick && "cursor-pointer active:scale-[0.98] ring-primary/5 hover:ring-2",
                    className
                )}
                onClick={onClick}
            >
                <CardHeader className={cn(
                    "flex flex-row items-center justify-between space-y-0",
                    compact ? "px-4 gap-1 pb-1" : "pb-2"
                )}>
                    <div className="flex flex-col gap-1.5">
                        <CardTitle className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                            {title}
                        </CardTitle>
                        {badge && (
                            <div className="flex">
                                {badge}
                            </div>
                        )}
                        {subtitle && <p className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wide">{subtitle}</p>}
                    </div>
                    <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center transition-colors duration-300",
                        tone === "positive" && "bg-success/10 text-success",
                        tone === "negative" && "bg-destructive/10 text-destructive",
                        tone === "warning" && "bg-warning/10 text-warning",
                        tone === "neutral" && "bg-muted text-muted-foreground"
                    )}>
                        <Icon className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent className={cn(
                    compact ? "px-4" : "flex-1 flex flex-col"
                )}>
                    <div className={cn(
                        "text-2xl sm:text-3xl lg:text-4xl font-black tracking-tighter tabular-nums break-words",
                        valueClassName
                    )}>
                        {typeof animatedValue === 'number' ? (
                            <AnimatedNumber
                                value={animatedValue}
                                formatFn={formatFn}
                                className="block" // ensure block to maintain layout
                            />
                        ) : (
                            value
                        )}
                    </div>

                    <div className={cn(compact ? "pt-2" : "mt-auto pt-4")}>
                        {(change || comparisonLabel) && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                {change && (
                                    <span
                                        className={cn(
                                            "flex items-center font-bold",
                                            trend === "up" ? "text-success" :
                                                trend === "down" ? "text-destructive" :
                                                    trend === "warning" ? "text-warning" :
                                                        "text-muted-foreground"
                                        )}
                                    >
                                        {trend === "up" ? <ArrowUpIcon className="h-3 w-3 mr-0.5" /> :
                                            trend === "down" ? <ArrowDownIcon className="h-3 w-3 mr-0.5" /> : null}
                                        {change}
                                    </span>
                                )}
                                <span className="text-muted-foreground/60">{comparisonLabel}</span>
                            </p>
                        )}
                        {description && (
                            <p className="text-[11px] text-muted-foreground/70 mt-1 leading-snug">
                                {description}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
