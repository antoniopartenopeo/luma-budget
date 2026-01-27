"use client"

import { useState } from "react"
import { Wallet, Pencil, Check, X, AlertTriangle, TrendingUp, CheckCircle2, Sparkles } from "lucide-react"
import { motion, Variants } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { BudgetProgressBar } from "./budget-progress-bar"
import { formatCurrency } from "../utils/calculate-budget"
import { parseCurrencyToCents } from "@/domain/money"
import { deriveBudgetState, narrateBudget, BudgetFacts } from "@/domain/narration"
import { cn } from "@/lib/utils"
import { EmptyBudgetState } from "./empty-budget-state"
import { MacroSection } from "@/components/patterns/macro-section"

interface GlobalBudgetCardProps {
    budgetCents: number
    spentCents: number
    isLoading?: boolean
    onSave: (amountCents: number) => void
    isSaving?: boolean
    elapsedRatio?: number
}

export function GlobalBudgetCard({ budgetCents, spentCents, isLoading, onSave, isSaving, elapsedRatio }: GlobalBudgetCardProps) {
    const safeElapsedRatio = elapsedRatio ?? 0
    const utilizationRatio = budgetCents > 0 ? spentCents / budgetCents : 0
    const pacingRatio = safeElapsedRatio > 0 ? utilizationRatio / safeElapsedRatio : 0
    const projectedSpendCents = safeElapsedRatio > 0 ? Math.round(spentCents / safeElapsedRatio) : 0

    const budgetFacts: BudgetFacts = {
        spentCents,
        limitCents: budgetCents,
        elapsedRatio: safeElapsedRatio,
        utilizationRatio,
        pacingRatio,
        projectedSpendCents,
        isDataIncomplete: budgetCents === 0 && spentCents === 0
    }

    const state = deriveBudgetState(budgetFacts)
    const narration = narrateBudget(budgetFacts, state)
    const [isEditing, setIsEditing] = useState(false)
    const [editValue, setEditValue] = useState("")

    const remainingCents = budgetCents - spentCents
    const hasNoBudget = budgetCents === 0

    const handleStartEdit = () => {
        setEditValue(budgetCents > 0 ? (budgetCents / 100).toString() : "")
        setIsEditing(true)
    }

    const handleSave = () => {
        const amountCents = parseCurrencyToCents(editValue)
        if (amountCents >= 0) {
            onSave(amountCents)
            setIsEditing(false)
        }
    }

    const handleCancel = () => {
        setIsEditing(false)
        setEditValue("")
    }

    const statusConfig: Record<string, { label: string, className: string, icon: React.ElementType }> = {
        "over_budget": {
            label: "Fuori Budget",
            className: "bg-destructive/10 text-destructive border-destructive/20",
            icon: AlertTriangle
        },
        "at_risk": {
            label: "A Rischio",
            className: "bg-warning/10 text-warning border-warning/20",
            icon: TrendingUp
        },
        "on_track": {
            label: "In Linea",
            className: "bg-success/10 text-success border-success/20",
            icon: CheckCircle2
        },
        "default": {
            label: "Analisi",
            className: "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200",
            icon: Wallet
        }
    }

    const currentStatus = hasNoBudget ? statusConfig["default"] : (statusConfig[state] || statusConfig["on_track"])
    const macroStatus = state === "over_budget" ? "critical" : state === "at_risk" ? "warning" : "default"

    if (isLoading) {
        return (
            <MacroSection
                title={<Skeleton className="h-6 w-48 mb-2" />}
                description={<Skeleton className="h-4 w-64" />}
                className="w-full"
            >
                <div className="space-y-6 pt-2">
                    <Skeleton className="h-10 w-[180px]" />
                    <Skeleton className="h-3 w-full" />
                    <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-20 w-full rounded-2xl" />
                        <Skeleton className="h-20 w-full rounded-2xl" />
                    </div>
                </div>
            </MacroSection>
        )
    }

    return (
        <MacroSection
            variant="premium"
            status={macroStatus}
            title="Budget Mensile"
            description={
                <div className="flex items-center gap-2">
                    {!hasNoBudget && (
                        <Badge variant="outline" className={cn("text-[10px] font-bold px-2 py-0.5 h-auto uppercase tracking-wider gap-1.5 border-none", currentStatus.className)}>
                            <currentStatus.icon className="h-3 w-3" />
                            {currentStatus.label}
                        </Badge>
                    )}
                </div>
            }
            headerActions={
                !isEditing && !hasNoBudget && (
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-muted" onClick={handleStartEdit} disabled={isSaving}>
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                )
            }
        >
            <div className="space-y-6">
                <div className="flex items-center gap-4 -mt-2 mb-4">
                    <div className={cn(
                        "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors shadow-sm bg-white dark:bg-slate-800",
                        "text-primary"
                    )}>
                        <Wallet className="h-7 w-7" />
                    </div>
                </div>

                {hasNoBudget && !isEditing ? (
                    <EmptyBudgetState onSetup={handleStartEdit} disabled={isSaving} />
                ) : isEditing ? (
                    <div className="py-6 animate-enter-up">
                        <div className="flex flex-col items-center gap-6">
                            <div className="text-center space-y-1">
                                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Definisci Budget Mensile</span>
                            </div>

                            <div className="relative w-full max-w-[280px]">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-medium text-muted-foreground/50">€</div>
                                <Input
                                    type="number"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    placeholder="0"
                                    className="text-4xl font-black h-20 pl-14 text-center rounded-2xl bg-muted/30 border-2 border-border/50 focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all shadow-inner"
                                    autoFocus
                                />
                            </div>

                            <div className="flex gap-3 w-full max-w-[280px]">
                                <Button
                                    className="flex-1 h-12 rounded-xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                                    onClick={handleSave}
                                    disabled={isSaving}
                                >
                                    <Check className="h-5 w-5 mr-2" />
                                    Conferma
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 h-12 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground border-border/50"
                                    onClick={handleCancel}
                                    disabled={isSaving}
                                >
                                    Annulla
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="space-y-1">
                            <div className="text-4xl font-black tracking-tighter text-foreground tabular-nums">
                                {formatCurrency(budgetCents)}
                            </div>

                            <BudgetProgressBar
                                spent={spentCents / 100}
                                budget={budgetCents / 100}
                                elapsedRatio={elapsedRatio}
                                status={state}
                                className="h-3"
                            />
                        </div>

                        {utilizationRatio > 1 && (
                            <div className="flex justify-end">
                                <Badge variant="destructive" className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider">
                                    +{Math.round((utilizationRatio - 1) * 100)}% oltre il limite
                                </Badge>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div className="rounded-xl bg-muted/30 border border-border/50 p-4 transition-colors hover:bg-muted/50">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Speso finora</p>
                                <p className={cn(
                                    "text-xl font-bold tabular-nums",
                                    state === "over_budget" || state === "at_risk" ? "text-destructive" : "text-foreground"
                                )}>
                                    {formatCurrency(spentCents)}
                                </p>
                            </div>
                            <div className={cn(
                                "rounded-xl border p-4 transition-colors",
                                state === "over_budget"
                                    ? "bg-destructive/5 border-destructive/20"
                                    : remainingCents >= 0
                                        ? "bg-success/5 border-success/20"
                                        : "bg-muted/30 border-border/50"
                            )}>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                                    {state === "over_budget" ? "Sforamento" : "Rimanente"}
                                </p>
                                <p className={cn(
                                    "text-xl font-bold tabular-nums",
                                    state === "over_budget" ? "text-destructive" : remainingCents >= 0 ? "text-success" : "text-destructive"
                                )}>
                                    {formatCurrency(Math.abs(remainingCents))}
                                </p>
                            </div>
                        </div>

                        <div className="relative overflow-hidden rounded-xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-500/20 p-4 sm:p-5 transition-all hover:bg-indigo-50/80 hover:border-indigo-200">
                            <div className="absolute -top-6 -right-6 h-20 w-20 bg-indigo-500/10 rounded-full blur-2xl" />

                            <div className="relative flex gap-3">
                                <div className="h-8 w-8 rounded-lg bg-indigo-100/50 dark:bg-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400">
                                    <Sparkles className="h-4 w-4" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">Analisi Budget</h4>
                                    <p className="text-sm font-medium text-foreground/90 leading-relaxed text-pretty">
                                        {narration.text}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </MacroSection>
    )
}
