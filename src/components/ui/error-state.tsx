import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ErrorStateProps {
    title?: string
    message?: string
    onRetry?: () => void
}

export function ErrorState({
    title = "Qualcosa è andato storto",
    message = "Non siamo riusciti a caricare i dati. Riprova più tardi.",
    onRetry,
}: ErrorStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-8">
            <div className="rounded-lg bg-destructive/10 p-6 text-center max-w-md">
                <div className="flex justify-center mb-4">
                    <AlertCircle className="h-10 w-10 text-destructive" />
                </div>
                <h3 className="text-lg font-semibold text-destructive mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground mb-6">{message}</p>
                {onRetry && (
                    <Button onClick={onRetry} variant="outline" className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Riprova
                    </Button>
                )}
            </div>
        </div>
    )
}
