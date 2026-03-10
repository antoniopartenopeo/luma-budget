import { Button } from "@/components/ui/button"
import { AlertCircle, Smile } from "lucide-react"

interface StateMessageProps {
    variant: "empty" | "error"
    title: string
    description?: string
    actionLabel?: string
    onActionClick?: () => void
    primaryAction?: React.ReactNode // Permette inserimento di bottoni complessi (es. asChild con Link)
}

export function StateMessage({ variant, title, description, actionLabel, onActionClick, primaryAction }: StateMessageProps) {
    const Icon = variant === "error" ? AlertCircle : Smile
    const iconColor = variant === "error" ? "text-destructive" : "text-primary"
    const bgColor = variant === "error" ? "bg-destructive/12" : "bg-primary/10"

    return (
        <div className="surface-strong flex h-full w-full items-center justify-center p-6 sm:p-8">
            <div className="flex max-w-sm flex-col items-center space-y-4 text-center">
                <div className={`flex h-14 w-14 items-center justify-center rounded-full ${bgColor} ring-1 ring-white/40 dark:ring-white/10`}>
                    <Icon className={`h-6 w-6 ${iconColor}`} />
                </div>
                <div className="space-y-1.5">
                    <h3 className="text-lg font-black tracking-tight">{title}</h3>
                    {description && (
                        <p className="mx-auto max-w-[280px] text-sm font-medium leading-relaxed text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
                {primaryAction ? (
                    <div className="mt-2">{primaryAction}</div>
                ) : actionLabel && onActionClick && (
                    <Button
                        variant={variant === "error" ? "destructive" : "default"}
                        size="sm"
                        onClick={onActionClick}
                        className="mt-2 shadow-lg shadow-primary/15"
                    >
                        {actionLabel}
                    </Button>
                )}
            </div>
        </div>
    )
}
