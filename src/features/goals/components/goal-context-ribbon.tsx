"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

import {
    Target,
    ChevronDown,
    Pencil,
    Check,
    Plus,
    RefreshCw,
    Save
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { formatCents } from "@/domain/money"
import { useCurrency } from "@/features/settings/api/use-currency"
import { GoalPortfolio, NUMAGoal } from "@/VAULT/goals/types"

import { GoalEditSheet } from "./goal-edit-sheet"

interface GoalContextRibbonProps {
    portfolio: GoalPortfolio | null
    activeGoal: NUMAGoal | undefined
    activeRhythm?: { type: string; label: string } | null
    onSelectGoal: (id: string) => void
    onAddGoal: () => Promise<NUMAGoal>
    onUpdateGoal: (id: string, updates: Partial<Pick<NUMAGoal, "title" | "targetCents">>) => Promise<void>
    onRemoveGoal: (id: string) => Promise<void>
    onReset?: () => void
    onSave?: () => void
}

export function GoalContextRibbon({
    portfolio,
    activeGoal,
    activeRhythm,
    onSelectGoal,
    onAddGoal,
    onUpdateGoal,
    onRemoveGoal,
    onReset,
    onSave
}: GoalContextRibbonProps) {
    const { currency, locale } = useCurrency()

    // --- Single Sheet State ---
    const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
    const [editGoalId, setEditGoalId] = useState<string | null>(null)

    const sheetGoal = (editGoalId
        ? portfolio?.goals.find((goal) => goal.id === editGoalId)
        : activeGoal) ?? null

    const handleSheetOpenChange = (open: boolean) => {
        setIsEditSheetOpen(open)
        if (!open) setEditGoalId(null)
    }

    // Wrapper functions for GoalEditSheet
    const handleSaveGoal = async (id: string, title: string, targetCents: number) => {
        await onUpdateGoal(id, { title, targetCents })
    }

    const handleDeleteGoal = async (id: string) => {
        await onRemoveGoal(id)
    }

    const handleAddGoal = async () => {
        try {
            const newGoal = await onAddGoal()
            setEditGoalId(newGoal.id)
            setIsEditSheetOpen(true)
        } catch {
            // Parent callback handles user feedback (toast).
        }
    }

    if (!portfolio) return null

    return (
        <>
            <div className="w-full glass-panel rounded-2xl border border-white/10 p-2 sm:p-3 flex flex-col md:flex-row items-center gap-4 shadow-xl shadow-black/5 relative overflow-visible z-20">

                {/* 1. GOAL SELECTION & TARGET (Left Group) */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Visual Pill Container (UBI Standard) */}
                    <div className="flex items-center h-12 rounded-xl bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-sm focus-within:ring-2 ring-primary/20 transition-all md:min-w-[280px]">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className="flex items-center gap-3 px-3 h-full hover:bg-white/90 dark:hover:bg-slate-800/90 transition-all flex-1 min-w-0 rounded-l-xl group border-r border-border/20"
                                >
                                    <div className="flex items-center gap-3 text-left min-w-0">
                                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center group-hover:from-emerald-500/30 group-hover:to-emerald-600/20 transition-all shrink-0">
                                            <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-widest leading-none mb-0.5">Obiettivo</span>
                                            <span className="text-sm font-bold truncate text-foreground">
                                                {activeGoal ? activeGoal.title : "Seleziona..."}
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronDown className="h-4 w-4 ml-auto text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[280px] p-2 space-y-1">
                                <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider px-2">I tuoi Obiettivi</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {portfolio.goals.map(g => (
                                    <DropdownMenuItem
                                        key={g.id}
                                        onClick={() => onSelectGoal(g.id)}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-lg cursor-pointer",
                                            activeGoal?.id === g.id ? "bg-emerald-50 dark:bg-emerald-900/20" : ""
                                        )}
                                    >
                                        <div className={cn(
                                            "h-2 w-2 rounded-full",
                                            activeGoal?.id === g.id ? "bg-emerald-500" : "bg-muted-foreground/30"
                                        )} />
                                        <div className="flex flex-col flex-1">
                                            <span className={cn("font-bold", activeGoal?.id === g.id ? "text-emerald-700 dark:text-emerald-400" : "")}>{g.title}</span>
                                            <span className="text-[10px] font-bold text-muted-foreground/60 tabular-nums uppercase tracking-wider">{formatCents(g.targetCents, currency, locale)}</span>
                                        </div>
                                        {activeGoal?.id === g.id && <Check className="h-4 w-4 text-emerald-500" />}
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={handleAddGoal}
                                    className="p-3 font-bold text-primary cursor-pointer justify-center hover:bg-primary/10"
                                >
                                    <Plus className="h-4 w-4 mr-2" /> Nuovo Obiettivo
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Dedicated Edit Button */}
                        {activeGoal && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    setEditGoalId(activeGoal.id)
                                    setIsEditSheetOpen(true)
                                }}
                                className="h-full w-10 rounded-l-none rounded-r-xl hover:bg-white/90 dark:hover:bg-slate-800/90 text-muted-foreground hover:text-foreground transition-colors"
                                title="Modifica obiettivo"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                            </Button>
                        )}
                    </div>
                    {activeGoal && (
                        <>
                            <div className="h-8 w-px bg-border/40 hidden md:block mx-2" />
                            <div className="flex flex-col hidden md:flex">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-widest leading-none mb-1">Target</span>
                                <span className="text-2xl font-black text-foreground tabular-nums tracking-tighter leading-none">
                                    {formatCents(activeGoal.targetCents, currency, locale)}
                                </span>
                            </div>
                        </>
                    )}
                </div>

                {/* 2. ACTIONS & STATUS (Right Group) */}
                {activeGoal ? (
                    <div className="flex-1 flex items-center justify-end gap-3 w-full border-t md:border-t-0 border-white/5 pt-3 md:pt-0">

                        {/* Status (Compact) */}
                        <div className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider mr-auto md:mr-0",
                            activeRhythm
                                ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                : "bg-muted/50 border-border/50 text-muted-foreground"
                        )}>
                            <div className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                activeRhythm ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/40"
                            )} />
                            {activeRhythm ? "Piano Attivo" : "No Piano"}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            {onReset && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onReset}
                                    title="Reset simulazione"
                                    className="h-9 px-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    <span className="sr-only sm:not-sr-only sm:ml-2 text-xs font-bold">Reset</span>
                                </Button>
                            )}

                            {onSave && (
                                <Button
                                    size="sm"
                                    onClick={onSave}
                                    className="h-9 rounded-lg px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20"
                                >
                                    <Save className="h-4 w-4 sm:mr-2" />
                                    <span className="hidden sm:inline text-xs uppercase tracking-wide">Salva Piano</span>
                                </Button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 hidden md:flex justify-end pr-4 opacity-50">
                        <span className="text-sm font-medium italic">Seleziona un obiettivo...</span>
                    </div>
                )}
            </div>

            {/* GOAL EDIT SHEET (Extracted Component) */}
            <GoalEditSheet
                goal={sheetGoal}
                open={isEditSheetOpen}
                onOpenChange={handleSheetOpenChange}
                onSave={handleSaveGoal}
                onDelete={handleDeleteGoal}
            />
        </>
    )
}
