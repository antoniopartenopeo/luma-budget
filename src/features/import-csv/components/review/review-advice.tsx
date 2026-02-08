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
                <AlertTitle className="text-sm">Consiglio Rapido</AlertTitle>
                <AlertDescription className="text-xs">
                    Non devi classificare tutto ora. Le voci non assegnate andranno in &quot;Altro&quot;.
                </AlertDescription>
            </Alert>
        )
    }

    if (completionPercent < 90) {
        return (
            <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 [&>svg]:text-emerald-500">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle className="text-sm">Ottimo lavoro!</AlertTitle>
                <AlertDescription className="text-xs">
                    Hai coperto la maggior parte delle transazioni.
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <Alert className="bg-muted/50 border-muted text-muted-foreground">
            <HelpCircle className="h-4 w-4" />
            <AlertTitle className="text-sm">Quasi perfetto</AlertTitle>
            <AlertDescription className="text-xs">
                Potrai sempre modificare le categorie anche dopo l&apos;import.
            </AlertDescription>
        </Alert>
    )
}
