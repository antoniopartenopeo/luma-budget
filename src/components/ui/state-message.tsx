import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Smile } from "lucide-react"

interface StateMessageProps {
    variant: "empty" | "error"
    title: string
    description?: string
    actionLabel?: string
    onActionClick?: () => void
}

export function StateMessage({ variant, title, description, actionLabel, onActionClick }: StateMessageProps) {
    const Icon = variant === "error" ? AlertCircle : Smile
    const iconColor = variant === "error" ? "text-destructive" : "text-primary"
    const bgColor = variant === "error" ? "bg-destructive/10" : "bg-primary/10"

    return (
        <Card className="w-full h-full border-dashed shadow-sm bg-muted/30 flex items-center justify-center p-6">
            <CardContent className="flex flex-col items-center text-center space-y-4 p-0">
                <div className={`h-12 w-12 rounded-full ${bgColor} flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${iconColor}`} />
                </div>
                <div className="space-y-1">
                    <h3 className="font-semibold tracking-tight text-lg">{title}</h3>
                    {description && (
                        <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">
                            {description}
                        </p>
                    )}
                </div>
                {actionLabel && onActionClick && (
                    <Button
                        variant={variant === "error" ? "destructive" : "default"}
                        size="sm"
                        onClick={onActionClick}
                        className="mt-2"
                    >
                        {actionLabel}
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}
