import type { ElementType, ReactNode } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowDownIcon, ArrowUpIcon, Info } from "lucide-react"
import { AnimatedNumber } from "@/components/ui/animated-number"
import { InteractiveCardGhostIcon } from "@/components/patterns/interactive-card-ghost-icon"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
    INTERACTIVE_CARD_HOVER_STATE,
    INTERACTIVE_CARD_TRANSITION,
    resolveInteractiveSurfaceStyle,
    withAlpha
} from "@/components/patterns/interactive-surface"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export type KpiTone = "positive" | "negative" | "neutral" | "warning"

export interface KpiCardProps {
    title: string
    subtitle?: string
    badge?: ReactNode
    value: string | number
    change?: string
    trend?: "up" | "down" | "neutral" | "warning"
    comparisonLabel?: string
    icon: ElementType
    isLoading?: boolean
    tone?: KpiTone
    onClick?: () => void
    className?: string
    valueClassName?: string
    valueMeta?: string
    valueMetaClassName?: string
    description?: string
    explainabilityText?: string
    animatedValue?: number
    formatFn?: (value: number) => string
    compact?: boolean
}
const TONE_STYLES: Record<KpiTone, {
    rawColor: string
    chipClassName: string
}> = {
    positive: {
        rawColor: "#10b981",
        chipClassName: "border-primary/16 bg-primary/10 text-primary dark:text-cyan-100"
    },
    negative: {
        rawColor: "#f43f5e",
        chipClassName: "border-rose-500/16 bg-rose-500/10 text-rose-700 dark:text-rose-300"
    },
    warning: {
        rawColor: "#f59e0b",
        chipClassName: "border-amber-500/18 bg-amber-500/10 text-amber-700 dark:text-amber-300"
    },
    neutral: {
        rawColor: "#0ea5a8",
        chipClassName: "border-primary/16 bg-primary/10 text-primary"
    }
}

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
    valueMeta,
    valueMetaClassName,
    description,
    explainabilityText,
    animatedValue,
    formatFn,
    compact = false,
}: KpiCardProps) {
    const prefersReducedMotion = useReducedMotion()
    const showHoverLift = !prefersReducedMotion && !compact
    const toneStyle = TONE_STYLES[tone]
    const surfaceStyle = resolveInteractiveSurfaceStyle(toneStyle.rawColor, "rest", "neutral")
    const cardStyle = {
        borderColor: surfaceStyle.borderColor,
        backgroundColor: surfaceStyle.backgroundColor,
        boxShadow: surfaceStyle.boxShadow,
    }
    const surfaceBackgroundStyle = { backgroundImage: surfaceStyle.backgroundImage }

    if (isLoading) {
        return (
            <Card className={cn("rounded-xl shadow-sm", className)}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="mb-2 h-8 w-[120px]" />
                    <Skeleton className="h-3 w-[150px]" />
                </CardContent>
            </Card>
        )
    }

    return (
        <motion.div
            className="h-full"
            whileHover={showHoverLift ? INTERACTIVE_CARD_HOVER_STATE : undefined}
            transition={INTERACTIVE_CARD_TRANSITION}
        >
            <Card
                className={cn(
                    "group/kpi relative flex flex-col overflow-hidden rounded-xl glass-card transition-[transform,border-color,box-shadow,background-color] duration-300 h-full",
                    compact && "gap-3 py-3",
                    onClick && "cursor-pointer active:scale-[0.98]",
                    !compact && "hover:border-white/55 hover:shadow-[0_22px_44px_-28px_rgba(15,23,42,0.4)]",
                    showHoverLift && "hover:-translate-y-0.5",
                    className
                )}
                style={cardStyle}
                onClick={onClick}
            >
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute inset-0 opacity-[0.92]" style={surfaceBackgroundStyle} />
                    <div className="absolute inset-[1px] rounded-[calc(theme(borderRadius.xl)-1px)] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02)_34%,transparent_62%)] opacity-80" />
                </div>

                <InteractiveCardGhostIcon
                    icon={Icon}
                    isActive={false}
                    visibility="always"
                    enableFloat={false}
                    floatDelay={0.08}
                    tintStyle={{ color: withAlpha(toneStyle.rawColor, 0.2) }}
                    className={cn(compact ? "bottom-0 right-0 inset-y-auto" : "bottom-[-0.1rem] right-[1%] inset-y-auto")}
                    wrapperClassName={cn(compact ? "h-24 w-24" : "h-32 w-32 sm:h-36 sm:w-36")}
                    iconClassName={cn(compact ? "h-16 w-16" : "h-24 w-24 sm:h-28 sm:w-28")}
                />

                <CardHeader
                    className={cn(
                        "relative z-10 flex flex-row items-start space-y-0",
                        compact ? "gap-2 px-4 pb-1.5" : "px-5 pb-2 pt-5"
                    )}
                >
                    <div className={cn("min-w-0 space-y-1.5", compact ? "max-w-[82%]" : "max-w-[74%]")}>
                        <CardTitle className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/80">
                            {title}
                            {explainabilityText && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="cursor-help text-muted-foreground/60 transition-colors hover:text-muted-foreground">
                                            <Info className="h-3 w-3" />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" align="center" className="max-w-[240px] text-xs font-medium leading-relaxed">
                                        {explainabilityText}
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </CardTitle>
                        {badge && <div className="flex flex-wrap">{badge}</div>}
                        {subtitle && (
                            <p className="text-xs font-medium leading-snug text-muted-foreground/80">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </CardHeader>

                <CardContent className={cn(
                    compact ? "relative z-10 px-4 pb-4" : "relative z-10 flex flex-1 flex-col px-5 pb-5"
                )}>
                    <div className="space-y-4">
                        <div className="flex items-end justify-between gap-3">
                            <div
                                className={cn(
                                    "flex min-w-0 items-baseline gap-2 break-words text-2xl font-black tracking-tighter tabular-nums text-foreground sm:text-3xl lg:text-[2.6rem]",
                                    compact ? "max-w-[82%]" : "max-w-[74%]",
                                    valueClassName
                                )}
                            >
                                {typeof animatedValue === "number" ? (
                                    <>
                                        <AnimatedNumber
                                            value={animatedValue}
                                            formatFn={formatFn}
                                            className="block min-w-0"
                                        />
                                        {valueMeta && (
                                            <span
                                                className={cn(
                                                    "text-sm font-semibold tracking-normal text-muted-foreground/78 sm:text-base",
                                                    valueMetaClassName
                                                )}
                                            >
                                                {valueMeta}
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {value}
                                        {valueMeta && (
                                            <span
                                                className={cn(
                                                    "text-sm font-semibold tracking-normal text-muted-foreground/78 sm:text-base",
                                                    valueMetaClassName
                                                )}
                                            >
                                                {valueMeta}
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>

                            {change ? (
                                <div
                                    className={cn(
                                        "hidden shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] sm:inline-flex",
                                        trend === "up"
                                            ? "border-primary/16 bg-primary/10 text-primary dark:text-cyan-100"
                                            : trend === "down"
                                                ? "border-rose-500/16 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                                                : trend === "warning"
                                                    ? "border-amber-500/16 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                                                    : toneStyle.chipClassName
                                    )}
                                >
                                    {trend === "up" ? <ArrowUpIcon className="h-3 w-3" /> : null}
                                    {trend === "down" ? <ArrowDownIcon className="h-3 w-3" /> : null}
                                    {change}
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <div className={cn(compact ? "pt-3" : "mt-auto pt-5")}>
                        <div className="flex flex-wrap items-center gap-2">
                            {comparisonLabel ? (
                                <span className="rounded-full border border-white/42 bg-white/44 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] dark:border-white/10 dark:bg-white/[0.05] dark:text-foreground/80">
                                    {comparisonLabel}
                                </span>
                            ) : null}
                            {change ? (
                                <span
                                    className={cn(
                                        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] sm:hidden",
                                        trend === "up"
                                            ? "border-primary/16 bg-primary/10 text-primary dark:text-cyan-100"
                                            : trend === "down"
                                                ? "border-rose-500/16 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                                                : trend === "warning"
                                                    ? "border-amber-500/16 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                                                    : toneStyle.chipClassName
                                    )}
                                >
                                    {trend === "up" ? <ArrowUpIcon className="h-3 w-3" /> : null}
                                    {trend === "down" ? <ArrowDownIcon className="h-3 w-3" /> : null}
                                    {change}
                                </span>
                            ) : null}
                        </div>

                        {description ? (
                            <p className="mt-3 max-w-[34ch] text-xs font-medium leading-relaxed text-muted-foreground/76 transition-[opacity,transform,color] duration-300 group-hover/kpi:translate-y-0 group-hover/kpi:text-foreground/78 group-hover/kpi:opacity-100 group-focus-within/kpi:translate-y-0 group-focus-within/kpi:text-foreground/78 group-focus-within/kpi:opacity-100">
                                {description}
                            </p>
                        ) : null}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
