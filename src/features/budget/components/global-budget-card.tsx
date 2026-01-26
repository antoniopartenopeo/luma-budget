"use client"

import { useState } from "react"
import { Wallet, Pencil, Check, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { BudgetProgressBar } from "./budget-progress-bar"
import { formatCurrency } from "../utils/calculate-budget"
import { parseCurrencyToCents } from "@/domain/money"
import { deriveBudgetState, narrateBudget, BudgetFacts } from "@/domain/narration"
import { Sparkles } from "lucide-react"

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

    // Facts for Narration
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

    if (isLoading) {
        return (
            <Card className="rounded-xl shadow-sm">
                <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-[140px]" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-8 w-[120px]" />
                    <Skeleton className="h-2 w-full" />
                    <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="rounded-xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Wallet className="h-4 w-4 text-primary" />
                    </div>
                    <CardTitle className="text-lg font-semibold">Budget Mensile</CardTitle>
                </div>
                {!isEditing && !hasNoBudget && (
                    <Button variant="ghost" size="sm" onClick={handleStartEdit} disabled={isSaving}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                {hasNoBudget && !isEditing ? (
                    <div className="py-4 text-center">
                        <p className="text-muted-foreground mb-3">
                            Non hai ancora impostato un budget per questo mese.
                        </p>
                        <Button onClick={handleStartEdit} disabled={isSaving}>
                            Imposta budget
                        </Button>
                    </div>
                ) : isEditing ? (
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-medium">€</span>
                        <Input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            placeholder="0"
                            className="text-lg font-bold h-10"
                            autoFocus
                        />
                        <Button size="icon" variant="ghost" onClick={handleSave} disabled={isSaving}>
                            <Check className="h-4 w-4 text-emerald-600" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={handleCancel} disabled={isSaving}>
                            <X className="h-4 w-4 text-rose-600" />
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="text-3xl font-bold">{formatCurrency(budgetCents)}</div>
                        <BudgetProgressBar
                            spent={spentCents / 100}
                            budget={budgetCents / 100}
                            elapsedRatio={elapsedRatio}
                            status={state}
                        />
                        {utilizationRatio > 1 && (
                            <p className="text-[10px] text-muted-foreground text-right -mt-0.5 font-medium">
                                +{Math.round((utilizationRatio - 1) * 100)}% oltre il limite
                            </p>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-lg bg-muted/50 p-3">
                                <p className="text-xs text-muted-foreground">Speso finora</p>
                                <p className={`text-lg font-semibold ${state === "over_budget" || state === "at_risk" ? "text-rose-600" : "text-foreground"}`}>
                                    {formatCurrency(spentCents)}
                                </p>
                            </div>
                            <div className="rounded-lg bg-muted/50 p-3">
                                <p className="text-xs text-muted-foreground">
                                    {state === "over_budget" ? "Sforamento" : "Rimanente"}
                                </p>
                                <p className={`text-lg font-semibold ${state === "over_budget" ? "text-rose-600" : remainingCents >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                                    {formatCurrency(Math.abs(remainingCents))}
                                </p>
                            </div>
                        </div>

                        {/* Semantic Narration Layer (Checklist Item 1 & 5) */}
                        <div className="rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-500/20 p-4">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-500 dark:text-indigo-400 mb-1.5 uppercase tracking-widest">
                                <Sparkles className="h-3.5 w-3.5" />
                                Analisi Budget
                            </div>
                            <p className="text-sm font-medium text-foreground/90 leading-relaxed">
                                {narration.text}
                            </p>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
