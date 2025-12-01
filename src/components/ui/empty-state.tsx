import { LucideIcon, PackageOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
    title: string
    description: string
    icon?: LucideIcon
    actionLabel?: string
    onAction?: () => void
    className?: string
}

export function EmptyState({
    title,
    description,
    icon: Icon = PackageOpen,
    actionLabel,
    onAction,
    className,
}: EmptyStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <Icon className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">{description}</p>
            {actionLabel && onAction && (
                <Button onClick={onAction} className="mt-6" variant="outline">
                    {actionLabel}
                </Button>
            )}
        </div>
    )
}
