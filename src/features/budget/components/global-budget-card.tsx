"use client"

import { useState } from "react"
import { Wallet, Pencil, Check, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { BudgetProgressBar } from "./budget-progress-bar"
import { formatCurrency } from "../utils/calculate-budget"

interface GlobalBudgetCardProps {
    budget: number
    spent: number
    isLoading?: boolean
    onSave: (amount: number) => void
    isSaving?: boolean
}

export function GlobalBudgetCard({ budget, spent, isLoading, onSave, isSaving }: GlobalBudgetCardProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [editValue, setEditValue] = useState("")

    const remaining = budget - spent
    const hasNoBudget = budget === 0

    const handleStartEdit = () => {
        setEditValue(budget > 0 ? budget.toString() : "")
        setIsEditing(true)
    }

    const handleSave = () => {
        const amount = parseFloat(editValue) || 0
        if (amount >= 0) {
            onSave(amount)
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
                        <div className="text-3xl font-bold">{formatCurrency(budget)}</div>
                        <BudgetProgressBar spent={spent} budget={budget} />
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-lg bg-muted/50 p-3">
                                <p className="text-xs text-muted-foreground">Speso finora</p>
                                <p className="text-lg font-semibold text-rose-600">{formatCurrency(spent)}</p>
                            </div>
                            <div className="rounded-lg bg-muted/50 p-3">
                                <p className="text-xs text-muted-foreground">Rimanente</p>
                                <p className={`text-lg font-semibold ${remaining >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                                    {formatCurrency(remaining)}
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
