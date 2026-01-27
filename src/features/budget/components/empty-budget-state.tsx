"use client"

import { Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EmptyBudgetStateProps {
    onSetup: () => void
    disabled?: boolean
}

export function EmptyBudgetState({ onSetup, disabled }: EmptyBudgetStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-10 text-center animate-enter-up">
            <div className="relative mb-6 group cursor-pointer" onClick={!disabled ? onSetup : undefined}>
                {/* Decorative background blobs */}
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl scale-0 group-hover:scale-150 transition-transform duration-500" />

                <div className="relative h-20 w-20 rounded-[2rem] bg-gradient-to-br from-muted/50 to-muted/10 border border-white/20 shadow-xl flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-1">
                    <Wallet className="h-10 w-10 text-muted-foreground/40 group-hover:text-primary transition-colors duration-300" />
                </div>

                {/* Floating decorators */}
                <div className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-background shadow-md border border-border/50 flex items-center justify-center animate-bounce delay-100">
                    <span className="text-[10px] font-bold text-primary">€</span>
                </div>
            </div>

            <h3 className="text-xl font-bold tracking-tight text-foreground mb-2">
                Pianificazione Necessaria
            </h3>

            <p className="text-muted-foreground text-sm max-w-[260px] leading-relaxed mb-8">
                Imposta un limite mensile per permettere a Numa di guidarti verso i tuoi obiettivi di risparmio.
            </p>

            <Button
                onClick={onSetup}
                disabled={disabled}
                size="lg"
                className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-105 active:scale-95 font-semibold"
            >
                Imposta Budget Ora
            </Button>
        </div>
    )
}
