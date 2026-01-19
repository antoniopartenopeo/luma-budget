import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingOverlayProps {
    isLoading: boolean
    text?: string
    className?: string
}

export function LoadingOverlay({ isLoading, text = "Caricamento...", className }: LoadingOverlayProps) {
    if (!isLoading) return null

    return (
        <div className={cn(
            "absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/50 backdrop-blur-[1px] rounded-lg animate-in fade-in duration-200",
            className
        )}>
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <span className="text-sm font-medium text-muted-foreground">{text}</span>
        </div>
    )
}
