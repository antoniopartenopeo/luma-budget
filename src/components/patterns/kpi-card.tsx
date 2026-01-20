
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"

export type KpiTone = "positive" | "negative" | "neutral" | "warning"

interface KpiCardProps {
    title: string
    subtitle?: string
    value: string | number
    change?: string
    trend?: "up" | "down" | "neutral" | "warning"
    comparisonLabel?: string
    icon: React.ElementType
    isLoading?: boolean
    tone?: KpiTone
    onClick?: () => void
    className?: string
}

export function KpiCard({
    title,
    subtitle,
    value,
    change,
    trend,
    comparisonLabel,
    icon: Icon,
    isLoading,
    tone = "neutral",
    onClick,
    className
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
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
        >
            <Card
                className={cn(
                    "rounded-xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 h-full",
                    onClick && "cursor-pointer active:scale-[0.98] ring-primary/5 hover:ring-2",
                    className
                )}
                onClick={onClick}
            >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {title}
                        </CardTitle>
                        {subtitle && <p className="text-xs text-muted-foreground/70 mt-0.5">{subtitle}</p>}
                    </div>
                    <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center transition-colors duration-300",
                        tone === "positive" && "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400",
                        tone === "negative" && "bg-rose-500/10 text-rose-500 dark:text-rose-400",
                        tone === "warning" && "bg-amber-500/10 text-amber-500 dark:text-amber-400",
                        tone === "neutral" && "bg-muted text-muted-foreground"
                    )}>
                        <Icon className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{value}</div>
                    {(change || comparisonLabel) && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            {change && (
                                <span
                                    className={cn(
                                        "flex items-center font-medium",
                                        trend === "up" ? "text-emerald-600" :
                                            trend === "down" ? "text-rose-600" :
                                                trend === "warning" ? "text-amber-600" :
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
                </CardContent>
            </Card>
        </motion.div>
    )
}
