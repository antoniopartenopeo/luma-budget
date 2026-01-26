"use client"

import { useState } from "react"
import { Pencil, Check, X, AlertTriangle, Home, Sparkles, Target, LucideIcon } from "lucide-react"
import { motion } from "framer-motion"
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
import { BudgetFacts, deriveBudgetState } from "@/domain/narration"

interface GroupBudgetCardProps {
    groupId: BudgetGroupId
    budgetCents: number
    spentCents: number
    isLoading?: boolean
    onSave: (groupId: BudgetGroupId, amountCents: number) => void
    isSaving?: boolean
    elapsedRatio?: number
}

const GROUP_ICONS: Record<BudgetGroupId, LucideIcon> = {
    essential: Home,
    comfort: Sparkles,
    superfluous: Target
}

const GROUP_COLORS: Record<BudgetGroupId, string> = {
    essential: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10",
    comfort: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10",
    superfluous: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10"
}

export function GroupBudgetCard({ groupId, budgetCents, spentCents, isLoading, onSave, isSaving, elapsedRatio }: GroupBudgetCardProps) {
    const safeElapsedRatio = elapsedRatio ?? 0
    const utilizationRatio = budgetCents > 0 ? spentCents / budgetCents : 0
    const pacingRatio = safeElapsedRatio > 0 ? utilizationRatio / safeElapsedRatio : 0
    const projectedSpendCents = safeElapsedRatio > 0 ? Math.round(spentCents / safeElapsedRatio) : 0

    // Facts for State Derivation
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

    const [isEditing, setIsEditing] = useState(false)
    const [editValue, setEditValue] = useState("")

    const remainingCents = budgetCents - spentCents
    const isOverBudget = budgetCents > 0 && spentCents > budgetCents
    const label = BUDGET_GROUP_LABELS[groupId]
    const Icon = GROUP_ICONS[groupId]

    const handleStartEdit = () => {
        setEditValue(budgetCents > 0 ? (budgetCents / 100).toString() : "")
        setIsEditing(true)
    }

    const handleSave = () => {
        const amountCents = parseCurrencyToCents(editValue)
        if (amountCents >= 0) {
            onSave(groupId, amountCents)
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
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="group"
        >
            <Card className={cn(
                "relative overflow-hidden rounded-[2.5rem] transition-all duration-500 border-none",
                "glass-panel hover:bg-white/70 dark:hover:bg-slate-800/60",
                state === "over_budget" && "shadow-[0_0_40px_-10px_rgba(244,63,94,0.3)] ring-1 ring-rose-500/20 bg-rose-50/10 dark:bg-rose-950/20",
                state === "at_risk" && "shadow-[0_0_40px_-10px_rgba(251,191,36,0.2)] ring-1 ring-amber-500/20 bg-amber-50/10 dark:bg-amber-950/20",
                !isEditing && "hover:shadow-2xl hover:scale-[1.01]"
            )}>
                {/* Ambient Glows based on state */}
                {state === "over_budget" && (
                    <div className="absolute top-[-20%] right-[-20%] w-48 h-48 bg-rose-500/10 blur-[60px] rounded-full pointer-events-none" />
                )}
                {state === "at_risk" && (
                    <div className="absolute top-[-20%] right-[-20%] w-48 h-48 bg-amber-500/10 blur-[60px] rounded-full pointer-events-none" />
                )}

                <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "rounded-2xl w-12 h-12 flex items-center justify-center transition-all duration-300 shadow-sm",
                            isEditing ? "bg-primary text-primary-foreground" : GROUP_COLORS[groupId]
                        )}>
                            <Icon className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-bold tracking-tight text-foreground">{label}</CardTitle>
                            {budgetCents > 0 && (
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                                    Budget mensile
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {state === "over_budget" && (
                            <Badge variant="secondary" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[10px] font-bold uppercase tracking-wider h-6">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Over
                            </Badge>
                        )}
                        {state === "at_risk" && (
                            <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] font-bold uppercase tracking-wider h-6">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Rischio
                            </Badge>
                        )}
                        {!isEditing && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                                onClick={handleStartEdit}
                                disabled={isSaving}
                            >
                                <Pencil className="h-3.5 w-3.5" />
                            </Button>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="space-y-4 relative z-10 pt-2">
                    {isEditing ? (
                        <div className="flex items-center gap-2 glass-card p-3 rounded-2xl animate-in zoom-in-95 duration-200">
                            <span className="text-sm font-bold text-primary">€</span>
                            <Input
                                type="number"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                placeholder="0"
                                className="text-sm h-9 border-none bg-transparent focus-visible:ring-0 px-1 font-bold"
                                autoFocus
                            />
                            <div className="flex items-center gap-1">
                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-emerald-500/10" onClick={handleSave} disabled={isSaving}>
                                    <Check className="h-4 w-4 text-emerald-600" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-rose-500/10" onClick={handleCancel} disabled={isSaving}>
                                    <X className="h-4 w-4 text-rose-600" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-end">
                                <div className="space-y-0.5">
                                    <span className="text-2xl font-black tracking-tighter text-foreground tabular-nums">
                                        {budgetCents > 0 ? formatCurrency(budgetCents) : "—"}
                                    </span>
                                </div>
                                {budgetCents > 0 && (
                                    <div className="text-right">
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Speso</p>
                                        <span className="text-sm font-semibold text-foreground/80 tabular-nums">
                                            {formatCurrency(spentCents)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {budgetCents > 0 ? (
                                <>
                                    <BudgetProgressBar
                                        spent={spentCents / 100}
                                        budget={budgetCents / 100}
                                        elapsedRatio={elapsedRatio}
                                        status={state}
                                    />

                                    <div className="flex justify-between items-center pt-1">
                                        <div className="flex items-center gap-2">
                                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                                            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70">
                                                {state === "over_budget" ? "Sforamento" : "Rimanente"}
                                            </span>
                                        </div>
                                        <span className={cn(
                                            "text-sm font-bold tabular-nums",
                                            state === "over_budget" ? "text-rose-600" : "text-emerald-600"
                                        )}>
                                            {formatCurrency(Math.abs(remainingCents))}
                                        </span>
                                    </div>

                                    {utilizationRatio > 1 && (
                                        <p className="text-[10px] text-rose-500/80 font-bold uppercase tracking-wider text-right -mt-2">
                                            +{Math.round((utilizationRatio - 1) * 100)}% oltre limite
                                        </p>
                                    )}
                                </>
                            ) : (
                                <div
                                    className="group/empty cursor-pointer py-10 flex flex-col items-center justify-center border border-dashed border-primary/20 rounded-[2rem] hover:border-primary/40 hover:bg-primary/5 transition-all duration-500"
                                    onClick={handleStartEdit}
                                >
                                    <div className="p-3 rounded-full bg-primary/5 mb-3 group-hover/empty:scale-110 transition-transform duration-500">
                                        <Target className="h-5 w-5 text-primary/40" />
                                    </div>
                                    <p className="text-sm text-foreground/70 font-bold tracking-tight group-hover/empty:text-primary transition-colors">
                                        Configura Budget {label}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground font-medium mt-1 text-center max-w-[200px]">
                                        Definisci un limite per ricevere consigli personalizzati.
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}
