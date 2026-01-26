"use client"

import { useState } from "react"
import { Wallet, Pencil, Check, X, AlertTriangle, TrendingUp, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { BudgetProgressBar } from "./budget-progress-bar"
import { formatCurrency } from "../utils/calculate-budget"
import { parseCurrencyToCents } from "@/domain/money"
import { deriveBudgetState, narrateBudget, BudgetFacts } from "@/domain/narration"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { EmptyBudgetState } from "./empty-budget-state"

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

    // Badge Config based on State
    const statusConfig: Record<string, { label: string, className: string, icon: React.ElementType }> = {
        "over_budget": {
            label: "Fuori Budget",
            className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800",
            icon: AlertTriangle
        },
        "at_risk": {
            label: "A Rischio",
            className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
            icon: TrendingUp
        },
        "on_track": {
            label: "In Linea",
            className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
            icon: CheckCircle2
        },
        "default": {
            label: "Analisi",
            className: "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200",
            icon: Wallet
        }
    }

    const currentStatus = hasNoBudget ? statusConfig["default"] : (statusConfig[state] || statusConfig["on_track"])

    if (isLoading) {
        return (
            <Card className="rounded-[2.5rem] shadow-sm border-none bg-card/50">
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[140px]" />
                            <Skeleton className="h-3 w-[100px]" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-2">
                    <Skeleton className="h-10 w-[180px]" />
                    <Skeleton className="h-3 w-full" />
                    <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-20 w-full rounded-2xl" />
                        <Skeleton className="h-20 w-full rounded-2xl" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            <Card className={cn(
                "rounded-[2.5rem] border-none glass-panel backdrop-blur-xl transition-all duration-500 overflow-hidden",
                "shadow-xl dark:border-white/5",
                state === "over_budget" && "shadow-[0_0_40px_-10px_rgba(244,63,94,0.3)] ring-1 ring-rose-500/20",
                state === "at_risk" && "shadow-[0_0_40px_-10px_rgba(251,191,36,0.2)] ring-1 ring-amber-500/20"
            )}>
                {/* Visual Glass Reflection Accent */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 dark:from-white/5 to-transparent pointer-events-none" />

                {/* Ambient Glows based on state */}
                {state === "over_budget" && (
                    <div className="absolute top-[-20%] right-[-20%] w-[400px] h-[400px] bg-rose-500/10 blur-[120px] rounded-full pointer-events-none opacity-60" />
                )}
                {state === "at_risk" && (
                    <div className="absolute top-[-20%] right-[-20%] w-[400px] h-[400px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none opacity-60" />
                )}
                {state === "on_track" && (
                    <div className="absolute top-[-20%] right-[-20%] w-[400px] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none opacity-60" />
                )}

                <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors shadow-sm bg-white dark:bg-slate-800",
                            "text-primary"
                        )}>
                            <Wallet className="h-7 w-7" />
                        </div>
                        <div className="space-y-0.5">
                            <CardTitle className="text-xl font-bold tracking-tight text-foreground">Budget Mensile</CardTitle>
                            <div className="flex items-center gap-2">
                                {!hasNoBudget && (
                                    <Badge variant="outline" className={cn("text-[10px] font-bold px-2 py-0.5 h-auto uppercase tracking-wider gap-1.5 border-none", currentStatus.className)}>
                                        <currentStatus.icon className="h-3 w-3" />
                                        {currentStatus.label}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                    {!isEditing && !hasNoBudget && (
                        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-muted" onClick={handleStartEdit} disabled={isSaving}>
                            <Pencil className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    )}
                </CardHeader>

                <CardContent className="space-y-6 pt-2">
                    {hasNoBudget && !isEditing ? (
                        <EmptyBudgetState onSetup={handleStartEdit} disabled={isSaving} />
                    ) : isEditing ? (
                        <div className="py-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
                                        state === "over_budget" || state === "at_risk" ? "text-rose-600 dark:text-rose-400" : "text-foreground"
                                    )}>
                                        {formatCurrency(spentCents)}
                                    </p>
                                </div>
                                <div className={cn(
                                    "rounded-xl border p-4 transition-colors",
                                    state === "over_budget"
                                        ? "bg-rose-500/5 border-rose-500/20"
                                        : remainingCents >= 0
                                            ? "bg-emerald-500/5 border-emerald-500/20"
                                            : "bg-muted/30 border-border/50"
                                )}>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                                        {state === "over_budget" ? "Sforamento" : "Rimanente"}
                                    </p>
                                    <p className={cn(
                                        "text-xl font-bold tabular-nums",
                                        state === "over_budget" ? "text-rose-600 dark:text-rose-400" : remainingCents >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                                    )}>
                                        {formatCurrency(Math.abs(remainingCents))}
                                    </p>
                                </div>
                            </div>

                            {/* Semantic Narration Layer - Advisor Style */}
                            <div className="relative overflow-hidden rounded-xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-500/20 p-4 sm:p-5 transition-all hover:bg-indigo-50/80 hover:border-indigo-200">
                                {/* Decorative Glow */}
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
                </CardContent>
            </Card>
        </motion.div>
    )
}
