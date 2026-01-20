"use client"

import { useState } from "react"
import { Pencil, Check, X, AlertTriangle, Home, Sparkles, Target, LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { BudgetProgressBar } from "./budget-progress-bar"
import { formatCurrency } from "../utils/calculate-budget"
import { BudgetGroupId, BUDGET_GROUP_LABELS } from "../api/types"
import { cn } from "@/lib/utils"
import { parseCurrencyToCents } from "@/domain/money"

interface GroupBudgetCardProps {
    groupId: BudgetGroupId
    budget: number
    spent: number
    isLoading?: boolean
    onSave: (groupId: BudgetGroupId, amount: number) => void
    isSaving?: boolean
}

const GROUP_ICONS: Record<BudgetGroupId, LucideIcon> = {
    essential: Home,
    comfort: Sparkles,
    superfluous: Target
}

const GROUP_COLORS: Record<BudgetGroupId, string> = {
    essential: "bg-blue-100 text-blue-600",
    comfort: "bg-purple-100 text-purple-600",
    superfluous: "bg-orange-100 text-orange-600"
}

export function GroupBudgetCard({ groupId, budget, spent, isLoading, onSave, isSaving }: GroupBudgetCardProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [editValue, setEditValue] = useState("")

    const remaining = budget - spent
    const isOverBudget = budget > 0 && spent > budget
    const label = BUDGET_GROUP_LABELS[groupId]
    const Icon = GROUP_ICONS[groupId]

    const handleStartEdit = () => {
        setEditValue(budget > 0 ? budget.toString() : "")
        setIsEditing(true)
    }

    const handleSave = () => {
        const amountCents = parseCurrencyToCents(editValue)
        if (amountCents >= 0) {
            onSave(groupId, amountCents / 100)
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
                <CardContent className="space-y-3">
                    <Skeleton className="h-6 w-[100px]" />
                    <Skeleton className="h-2 w-full" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="rounded-xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                    <div className={cn("rounded-full w-8 h-8 flex items-center justify-center", GROUP_COLORS[groupId])}>
                        <Icon className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-base font-medium">{label}</CardTitle>
                </div>
                <div className="flex items-center gap-1">
                    {isOverBudget && (
                        <Badge variant="outline" className="text-rose-600 border-rose-200 bg-rose-50 text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Superato
                        </Badge>
                    )}
                    {!isEditing && (
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleStartEdit} disabled={isSaving}>
                            <Pencil className="h-3 w-3" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {isEditing ? (
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">€</span>
                        <Input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            placeholder="0"
                            className="text-sm h-8"
                            autoFocus
                        />
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleSave} disabled={isSaving}>
                            <Check className="h-3 w-3 text-emerald-600" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleCancel} disabled={isSaving}>
                            <X className="h-3 w-3 text-rose-600" />
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-baseline">
                            <span className="text-xl font-bold">
                                {budget > 0 ? formatCurrency(budget) : "—"}
                            </span>
                            {budget > 0 && (
                                <span className="text-sm text-muted-foreground">
                                    {formatCurrency(spent)} spesi
                                </span>
                            )}
                        </div>
                        {budget > 0 ? (
                            <>
                                <BudgetProgressBar spent={spent} budget={budget} />
                                <div className="text-sm">
                                    <span className="text-muted-foreground">Rimanente: </span>
                                    <span className={remaining >= 0 ? "text-emerald-600 font-medium" : "text-rose-600 font-medium"}>
                                        {formatCurrency(remaining)}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Nessun budget impostato
                            </p>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}
