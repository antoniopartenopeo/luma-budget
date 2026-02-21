"use client"

import { Info, CheckCircle2, HelpCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ReviewAdviceProps {
    completionPercent: number
}

/**
 * Contextual advice banner based on categorization progress.
 * Shows different messages based on completion percentage.
 */
export function ReviewAdvice({ completionPercent }: ReviewAdviceProps) {
    if (completionPercent < 50) {
        return (
            <Alert className="bg-primary/5 border-primary/20 text-primary [&>svg]:text-primary">
                <Info className="h-4 w-4" />
                <AlertTitle className="text-sm">Ti aiuto a fare in fretta</AlertTitle>
                <AlertDescription className="text-xs">
                    Non serve sistemare tutto adesso: i movimenti senza categoria verranno messi in &quot;Altro&quot;.
                </AlertDescription>
            </Alert>
        )
    }

    if (completionPercent < 90) {
        return (
            <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300 [&>svg]:text-emerald-500">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle className="text-sm">Sei a buon punto</AlertTitle>
                <AlertDescription className="text-xs">
                    Hai già coperto la maggior parte dei movimenti.
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <Alert className="bg-muted/50 border-muted text-muted-foreground">
            <HelpCircle className="h-4 w-4" />
            <AlertTitle className="text-sm">Ultimo controllo</AlertTitle>
            <AlertDescription className="text-xs">
                Potrai cambiare categoria anche dopo il salvataggio.
            </AlertDescription>
        </Alert>
    )
}
