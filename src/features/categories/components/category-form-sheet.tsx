"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Category, CategoryKind, SpendingNature } from "../config"
import { ICON_REGISTRY } from "../icon-registry"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { generateCategoryId } from "../api/repository"

// Curated colors from default categories
const COLOR_PALETTE = [
    { bg: "bg-orange-100", text: "text-orange-600", hex: "#ea580c" },
    { bg: "bg-blue-100", text: "text-blue-600", hex: "#2563eb" },
    { bg: "bg-cyan-100", text: "text-cyan-600", hex: "#0891b2" },
    { bg: "bg-pink-100", text: "text-pink-600", hex: "#db2777" },
    { bg: "bg-teal-100", text: "text-teal-600", hex: "#0d9488" },
    { bg: "bg-emerald-100", text: "text-emerald-600", hex: "#059669" },
    { bg: "bg-sky-100", text: "text-sky-600", hex: "#0284c7" },
    { bg: "bg-yellow-100", text: "text-yellow-600", hex: "#ca8a04" },
    { bg: "bg-lime-100", text: "text-lime-600", hex: "#65a30d" },
    { bg: "bg-gray-100", text: "text-gray-600", hex: "#4b5563" },
    { bg: "bg-amber-100", text: "text-amber-600", hex: "#d97706" },
    { bg: "bg-slate-100", text: "text-slate-600", hex: "#475569" },
    { bg: "bg-teal-100", text: "text-teal-700", hex: "#0f766e" },
    { bg: "bg-red-100", text: "text-red-600", hex: "#dc2626" },
    { bg: "bg-rose-100", text: "text-rose-600", hex: "#e11d48" },
    { bg: "bg-orange-100", text: "text-orange-700", hex: "#c2410c" },
    { bg: "bg-stone-100", text: "text-stone-600", hex: "#57534e" },
    { bg: "bg-sky-100", text: "text-sky-700", hex: "#0369a1" },
    { bg: "bg-amber-100", text: "text-amber-700", hex: "#b45309" },
    { bg: "bg-zinc-900", text: "text-zinc-100", hex: "#18181b" }, // Dark Mode / Black
]

interface CategoryFormSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    categoryToEdit?: Category | null
    onSave: (category: Category) => void
    isSaving?: boolean
}

export function CategoryFormSheet({ open, onOpenChange, categoryToEdit, onSave, isSaving }: CategoryFormSheetProps) {
    // Form State
    const [label, setLabel] = useState("")
    const [kind, setKind] = useState<CategoryKind>("expense")
    const [spendingNature, setSpendingNature] = useState<SpendingNature>("essential")
    const [iconName, setIconName] = useState("helpCircle")
    const [colorIndex, setColorIndex] = useState(0)

    // Validation
    const [error, setError] = useState("")

    // Load data on edit
    useEffect(() => {
        if (open) {
            if (categoryToEdit) {
                setLabel(categoryToEdit.label) // eslint-disable-line react-hooks/set-state-in-effect
                setKind(categoryToEdit.kind)
                setSpendingNature(categoryToEdit.spendingNature)
                setIconName(categoryToEdit.iconName)

                // Try to find matching color or default to first
                const colorStr = categoryToEdit.color
                const idx = COLOR_PALETTE.findIndex(p =>
                    colorStr.includes(p.text) && colorStr.includes(p.bg)
                )
                setColorIndex(idx >= 0 ? idx : 0)
            } else {
                // Reset for new
                setLabel("")
                setKind("expense")
                setSpendingNature("essential")
                setIconName("helpCircle")
                setColorIndex(0)
            }
            setError("")
        }
    }, [open, categoryToEdit])

    const handleSubmit = () => {
        if (!label.trim()) {
            setError("Il nome è obbligatorio")
            return
        }

        const selectedColor = COLOR_PALETTE[colorIndex]
        const finalColor = `${selectedColor.text} ${selectedColor.bg}`

        const newCategory: Category = {
            id: categoryToEdit ? categoryToEdit.id : generateCategoryId(),
            label: label.trim(),
            kind,
            spendingNature: kind === "income" ? "essential" : spendingNature, // Income defaults to essential/neutral
            iconName,
            color: finalColor,
            hexColor: selectedColor.hex,
            archived: categoryToEdit ? categoryToEdit.archived : false,
            updatedAt: new Date().toISOString()
        }

        onSave(newCategory)
    }

    // Filter icons for grid
    const iconKeys = Object.keys(ICON_REGISTRY)

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="sm:max-w-md w-full flex flex-col p-0 overflow-hidden border-none text-left">
                <SheetHeader className="p-6 pb-4 border-b border-white/20 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                            {/* Dynamically show selected icon or default Tag */}
                            {(() => {
                                const Icon = ICON_REGISTRY[iconName] || ICON_REGISTRY.helpCircle
                                return <Icon className="h-6 w-6 text-primary" />
                            })()}
                        </div>
                        <div className="flex flex-col">
                            <SheetTitle className="text-xl font-bold tracking-tight">
                                {categoryToEdit ? "Modifica Categoria" : "Nuova Categoria"}
                            </SheetTitle>
                            <SheetDescription className="text-sm font-medium">
                                {categoryToEdit ? "Modifica i dettagli della categoria." : "Crea una nuova categoria per organizzare le tue spese."}
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Name */}
                    <div className="grid gap-2">
                        <Label htmlFor="name" className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-1">Nome</Label>
                        <Input
                            id="name"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="Es. Palestra"
                            className="h-12 bg-white/50 dark:bg-white/5 border-white/20 rounded-xl"
                        />
                    </div>

                    {/* Kind */}
                    <div className="grid gap-2">
                        <Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-1">Tipo</Label>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant={kind === "expense" ? "default" : "outline"}
                                onClick={() => setKind("expense")}
                                disabled={!!categoryToEdit}
                                className={cn(
                                    "flex-1 h-12 rounded-xl font-bold transition-all",
                                    kind === "expense" ? "bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-500/20" : "bg-white/50 dark:bg-white/5 border-white/20"
                                )}
                            >
                                Uscita
                            </Button>
                            <Button
                                type="button"
                                variant={kind === "income" ? "default" : "outline"}
                                onClick={() => setKind("income")}
                                disabled={!!categoryToEdit}
                                className={cn(
                                    "flex-1 h-12 rounded-xl font-bold transition-all",
                                    kind === "income" ? "bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20" : "bg-white/50 dark:bg-white/5 border-white/20"
                                )}
                            >
                                Entrata
                            </Button>
                        </div>
                        {!!categoryToEdit && <p className="text-[10px] font-medium text-muted-foreground px-1 italic">Il tipo non può essere modificato dopo la creazione.</p>}
                    </div>

                    {/* Spending Nature (Only for Expenses) */}
                    {kind === "expense" && (
                        <div className="grid gap-2">
                            <Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-1">Gruppo Spese</Label>
                            <Select value={spendingNature} onValueChange={(v) => setSpendingNature(v as SpendingNature)}>
                                <SelectTrigger className="h-12 bg-white/50 dark:bg-white/5 border-white/20 rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="essential">Essenziali (Necessità)</SelectItem>
                                    <SelectItem value="comfort">Benessere (Qualità della vita)</SelectItem>
                                    <SelectItem value="superfluous">Superflue (Non essenziali)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <Separator className="opacity-50" />

                    {/* Color Picker */}
                    <div className="grid gap-3">
                        <Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-1">Colore</Label>
                        <div className="flex flex-wrap gap-2 px-1">
                            {COLOR_PALETTE.map((p, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    className={cn(
                                        "w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110",
                                        p.bg,
                                        colorIndex === idx ? "border-foreground ring-2 ring-primary/20 scale-110" : "border-white/20"
                                    )}
                                    onClick={() => setColorIndex(idx)}
                                    aria-label={`Select color ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Icon Picker */}
                    <div className="grid gap-3">
                        <Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-1">Icona</Label>
                        <div className="grid grid-cols-6 gap-2 p-3 bg-white/30 dark:bg-black/20 border border-white/10 rounded-2xl">
                            {iconKeys.map((key) => {
                                const Icon = ICON_REGISTRY[key]
                                const isSelected = iconName === key
                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        className={cn(
                                            "flex items-center justify-center h-10 w-10 rounded-xl transition-all duration-200",
                                            isSelected
                                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110"
                                                : "text-muted-foreground hover:bg-white/50 dark:hover:bg-white/5 hover:text-foreground"
                                        )}
                                        onClick={() => setIconName(key)}
                                        title={key}
                                    >
                                        <Icon size={20} />
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <div className="shrink-0 p-6 bg-white/40 dark:bg-white/5 border-t border-white/20 backdrop-blur-md">
                    {error && <p className="text-sm text-destructive font-bold mb-4 px-1">{error}</p>}
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSaving}
                            className="h-12 rounded-xl font-bold border-white/20 bg-white/50 dark:bg-white/5"
                        >
                            Annulla
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isSaving}
                            className="h-12 rounded-xl font-bold shadow-lg shadow-primary/20"
                        >
                            {isSaving ? "Salvataggio..." : "Salva"}
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
