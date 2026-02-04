import { cn } from "@/lib/utils"

interface PageHeaderProps {
    title: React.ReactNode
    description?: React.ReactNode
    actions?: React.ReactNode
    className?: string
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
    return (
        <div className={cn("flex flex-col gap-4 md:flex-row md:items-center md:justify-between", className)}>
            <div className="space-y-1.5">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                    {title}
                </h1>
                {description && (
                    <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                        {description}
                    </p>
                )}
            </div>
            {actions && (
                <div className="flex items-center gap-2">
                    {actions}
                </div>
            )}
        </div>
    )
}
