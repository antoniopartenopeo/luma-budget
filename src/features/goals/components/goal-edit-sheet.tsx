"use client"

import { useState, useEffect } from "react"
import { Target, Trash2 } from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { parseCurrencyToCents } from "@/domain/money/currency"
import { ConfirmDialog } from "@/components/patterns/confirm-dialog"
import type { NUMAGoal } from "@/VAULT/goals/types"

interface GoalEditSheetProps {
    goal: NUMAGoal | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: (id: string, title: string, targetCents: number) => Promise<void>
    onDelete: (id: string) => Promise<void>
}

export function GoalEditSheet({
    goal,
    open,
    onOpenChange,
    onSave,
    onDelete,
}: GoalEditSheetProps) {
    const [titleDraft, setTitleDraft] = useState("")
    const [targetDraft, setTargetDraft] = useState("")
    const [isSaving, setIsSaving] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    // Sync drafts when sheet opens
    useEffect(() => {
        if (open && goal) {
            setTitleDraft(goal.title)
            setTargetDraft(String(goal.targetCents / 100))
        }
    }, [open, goal])

    const handleSave = async () => {
        if (!goal || !titleDraft.trim()) return
        setIsSaving(true)
        try {
            const targetCents = parseCurrencyToCents(targetDraft)
            await onSave(goal.id, titleDraft.trim(), targetCents)
            onOpenChange(false)
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!goal) return
        setIsDeleting(true)
        try {
            await onDelete(goal.id)
            setShowDeleteConfirm(false)
            onOpenChange(false)
        } finally {
            setIsDeleting(false)
        }
    }

    if (!goal) return null

    return (
        <>
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent className="sm:max-w-md p-0 overflow-hidden flex flex-col border-none">
                    {/* Header with border separator */}
                    <SheetHeader className="p-6 pb-4 border-b border-white/20 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                                <Target className="h-6 w-6 text-emerald-500" />
                            </div>
                            <div className="flex flex-col">
                                <SheetTitle className="text-xl font-bold tracking-tight">
                                    Modifica Obiettivo
                                </SheetTitle>
                                <SheetDescription className="text-sm font-medium">
                                    Aggiorna il nome e il target del tuo obiettivo.
                                </SheetDescription>
                            </div>
                        </div>
                    </SheetHeader>

                    {/* Scrollable body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Name Input */}
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-1">
                                Nome Obiettivo
                            </label>
                            <Input
                                value={titleDraft}
                                onChange={(e) => setTitleDraft(e.target.value)}
                                placeholder="Es. Vacanza, Fondo emergenza..."
                                className="h-12 text-base font-medium bg-white/50 dark:bg-white/5 border-white/20 rounded-xl"
                            />
                        </div>

                        {/* Target Input */}
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-1">
                                Importo Target
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">€</span>
                                <Input
                                    type="number"
                                    value={targetDraft}
                                    onChange={(e) => setTargetDraft(e.target.value)}
                                    placeholder="0"
                                    className="h-12 pl-10 text-xl font-black tabular-nums bg-white/50 dark:bg-white/5 border-white/20 rounded-xl"
                                />
                            </div>
                        </div>

                        <Separator className="my-2" />

                        {/* Danger Zone */}
                        <div className="rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-rose-700 dark:text-rose-400">Elimina Obiettivo</p>
                                    <p className="text-xs text-muted-foreground">Questa azione è irreversibile.</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-100 dark:hover:bg-rose-900/30"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Elimina
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Footer with border separator */}
                    <div className="shrink-0 p-6 bg-white/40 dark:bg-white/5 border-t border-white/20 backdrop-blur-md">
                        <Button
                            onClick={handleSave}
                            disabled={isSaving || !titleDraft.trim()}
                            className="w-full h-12 font-bold rounded-xl shadow-lg shadow-primary/20"
                        >
                            {isSaving ? "Salvataggio..." : "Salva Modifiche"}
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={showDeleteConfirm}
                onOpenChange={setShowDeleteConfirm}
                title={`Eliminare "${goal.title}"?`}
                description="Questa azione è irreversibile. L'obiettivo verrà rimosso dal tuo portfolio."
                confirmLabel="Elimina"
                onConfirm={handleDelete}
                isLoading={isDeleting}
                variant="destructive"
            />
        </>
    )
}
