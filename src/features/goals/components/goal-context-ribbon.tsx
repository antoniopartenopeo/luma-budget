"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Target,
    ChevronDown,
    Pencil,
    Check,
    Plus
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
import { Separator } from "@/components/ui/separator"
import { GoalEditSheet } from "./goal-edit-sheet"

interface GoalContextRibbonProps {
    portfolio: GoalPortfolio | null
    activeGoal: NUMAGoal | undefined
    activeRhythm?: { type: string; label: string } | null
    onSelectGoal: (id: string) => void
    onAddGoal: () => void
    onUpdateGoal: (id: string, updates: Partial<Pick<NUMAGoal, "title" | "targetCents">>) => Promise<void>
    onRemoveGoal: (id: string) => Promise<void>
}

export function GoalContextRibbon({
    portfolio,
    activeGoal,
    activeRhythm,
    onSelectGoal,
    onAddGoal,
    onUpdateGoal,
    onRemoveGoal
}: GoalContextRibbonProps) {
    const { currency, locale } = useCurrency()

    // --- Single Sheet State ---
    const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)

    // Wrapper functions for GoalEditSheet
    const handleSaveGoal = async (id: string, title: string, targetCents: number) => {
        await onUpdateGoal(id, { title, targetCents })
    }

    const handleDeleteGoal = async (id: string) => {
        await onRemoveGoal(id)
    }

    if (!portfolio) return null

    return (
        <>
            <div className="w-full glass-panel rounded-2xl border border-white/10 p-3 sm:p-4 flex flex-col sm:flex-row items-center gap-4 shadow-xl shadow-black/5 relative overflow-visible z-20">
                {/* 1. GOAL SWITCHER - Compact pill */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="h-12 rounded-xl px-4 flex items-center gap-3 bg-white/60 dark:bg-slate-900/60 hover:bg-white/90 dark:hover:bg-slate-800/90 border border-border/30 hover:border-border/60 transition-all min-w-[240px] sm:min-w-[280px] justify-between group shadow-sm"
                        >
                            <div className="flex items-center gap-3 text-left">
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center group-hover:from-emerald-500/30 group-hover:to-emerald-600/20 transition-all shrink-0">
                                    <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-widest">Obiettivo</span>
                                    <span className="text-sm font-bold truncate max-w-[160px] sm:max-w-[200px] text-foreground">
                                        {activeGoal ? activeGoal.title : "Seleziona..."}
                                    </span>
                                </div>
                            </div>
                            <ChevronDown className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[280px] p-2 space-y-1">
                        <DropdownMenuLabel className="text-xs text-muted-foreground uppercase font-bold tracking-wider px-2">I tuoi Obiettivi</DropdownMenuLabel>
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
                                    <span className="text-xs text-muted-foreground tabular-nums">{formatCents(g.targetCents, currency, locale)}</span>
                                </div>
                                {activeGoal?.id === g.id && <Check className="h-4 w-4 text-emerald-500" />}
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => {
                                onAddGoal()
                                setTimeout(() => setIsEditSheetOpen(true), 100)
                            }}
                            className="p-3 font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer justify-center hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                        >
                            <Plus className="h-4 w-4 mr-2" /> Nuovo Obiettivo
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* 2. MAIN CONTENT AREA - Target + Status */}
                {activeGoal ? (
                    <div className="flex-1 flex items-center justify-between gap-6 w-full">
                        {/* Left: Target KPI */}
                        <div className="flex items-center gap-4">
                            <Separator orientation="vertical" className="hidden sm:block h-10" />
                            <div className="text-center sm:text-left">
                                <div className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-widest mb-0.5">Target</div>
                                <div className="text-3xl font-black text-foreground tabular-nums tracking-tight leading-none">
                                    {formatCents(activeGoal.targetCents, currency, locale)}
                                </div>
                            </div>
                        </div>

                        {/* Right: Status + Edit - Grouped together */}
                        <div className="flex items-center gap-3">
                            {/* Status Pill */}
                            {activeRhythm ? (
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 shadow-sm">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse-soft shadow-lg shadow-emerald-500/50" />
                                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-wide">
                                        Piano Attivo
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-slate-500/5 to-slate-600/5 border border-border/50">
                                    <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                                    <span className="text-xs font-medium text-muted-foreground tracking-wide">
                                        Nessun Piano
                                    </span>
                                </div>
                            )}

                            {/* Edit Button - Refined */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsEditSheetOpen(true)}
                                className="h-10 w-10 rounded-xl hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all"
                            >
                                <Pencil className="h-4 w-4 text-muted-foreground/70 hover:text-foreground transition-colors" />
                                <span className="sr-only">Modifica obiettivo</span>
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center sm:justify-start py-2">
                        <span className="text-sm text-muted-foreground/70 font-medium">
                            Seleziona un obiettivo per iniziare
                        </span>
                    </div>
                )}
            </div>

            {/* GOAL EDIT SHEET (Extracted Component) */}
            <GoalEditSheet
                goal={activeGoal ?? null}
                open={isEditSheetOpen}
                onOpenChange={setIsEditSheetOpen}
                onSave={handleSaveGoal}
                onDelete={handleDeleteGoal}
            />
        </>
    )
}
