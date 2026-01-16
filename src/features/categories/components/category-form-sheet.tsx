"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Category, CategoryKind, SpendingNature } from "../config"
import { ICON_REGISTRY } from "../icon-registry"
import { cn } from "@/lib/utils"
import { generateCategoryId } from "../api/repository"

// Curated colors from default categories
const COLOR_PALETTE = [
    { bg: "bg-orange-100", text: "text-orange-600", hex: "#ea580c" },
    { bg: "bg-blue-100", text: "text-blue-600", hex: "#2563eb" },
    { bg: "bg-indigo-100", text: "text-indigo-600", hex: "#4f46e5" },
    { bg: "bg-pink-100", text: "text-pink-600", hex: "#db2777" },
    { bg: "bg-teal-100", text: "text-teal-600", hex: "#0d9488" },
    { bg: "bg-purple-100", text: "text-purple-600", hex: "#9333ea" },
    { bg: "bg-sky-100", text: "text-sky-600", hex: "#0284c7" },
    { bg: "bg-yellow-100", text: "text-yellow-600", hex: "#ca8a04" },
    { bg: "bg-emerald-100", text: "text-emerald-600", hex: "#059669" },
    { bg: "bg-gray-100", text: "text-gray-600", hex: "#4b5563" },
    { bg: "bg-amber-100", text: "text-amber-600", hex: "#d97706" },
    { bg: "bg-slate-100", text: "text-slate-600", hex: "#475569" },
    { bg: "bg-cyan-100", text: "text-cyan-600", hex: "#0891b2" },
    { bg: "bg-red-100", text: "text-red-600", hex: "#dc2626" },
    { bg: "bg-rose-100", text: "text-rose-600", hex: "#e11d48" },
    { bg: "bg-violet-100", text: "text-violet-600", hex: "#7c3aed" },
    { bg: "bg-stone-100", text: "text-stone-600", hex: "#57534e" },
    { bg: "bg-fuchsia-100", text: "text-fuchsia-600", hex: "#c026d3" },
    { bg: "bg-lime-100", text: "text-lime-600", hex: "#65a30d" },
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
            <SheetContent side="right" className="sm:max-w-md w-full flex flex-col p-0 overflow-hidden border-l">
                <SheetHeader className="p-6 border-b shrink-0">
                    <SheetTitle>{categoryToEdit ? "Modifica Categoria" : "Nuova Categoria"}</SheetTitle>
                    <SheetDescription>
                        {categoryToEdit ? "Modifica i dettagli della categoria." : "Crea una nuova categoria per organizzare le tue spese."}
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid gap-6">
                        {/* Name */}
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome</Label>
                            <Input
                                id="name"
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                                placeholder="Es. Palestra"
                            />
                        </div>

                        {/* Kind */}
                        <div className="grid gap-2">
                            <Label>Tipo</Label>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant={kind === "expense" ? "default" : "outline"}
                                    onClick={() => setKind("expense")}
                                    disabled={!!categoryToEdit}
                                    className={cn("flex-1", kind === "expense" ? "bg-rose-600 hover:bg-rose-700" : "")}
                                >
                                    Uscita
                                </Button>
                                <Button
                                    type="button"
                                    variant={kind === "income" ? "default" : "outline"}
                                    onClick={() => setKind("income")}
                                    disabled={!!categoryToEdit}
                                    className={cn("flex-1", kind === "income" ? "bg-emerald-600 hover:bg-emerald-700" : "")}
                                >
                                    Entrata
                                </Button>
                            </div>
                            {!!categoryToEdit && <p className="text-[10px] text-muted-foreground">Il tipo non può essere modificato dopo la creazione.</p>}
                        </div>

                        {/* Spending Nature (Only for Expenses) */}
                        {kind === "expense" && (
                            <div className="grid gap-2">
                                <Label>Gruppo Spese</Label>
                                <Select value={spendingNature} onValueChange={(v) => setSpendingNature(v as SpendingNature)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="essential">Essenziali (Necessità)</SelectItem>
                                        <SelectItem value="comfort">Benessere (Qualità della vita)</SelectItem>
                                        <SelectItem value="superfluous">Superflue (Spreco/Evitabile)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Color Picker */}
                        <div className="grid gap-2">
                            <Label>Colore</Label>
                            <div className="flex flex-wrap gap-2">
                                {COLOR_PALETTE.map((p, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        className={cn(
                                            "w-6 h-6 rounded-full border-2 transition-all",
                                            p.bg,
                                            colorIndex === idx ? "border-foreground scale-110" : "border-transparent"
                                        )}
                                        onClick={() => setColorIndex(idx)}
                                        aria-label={`Select color ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Icon Picker */}
                        <div className="grid gap-2">
                            <Label>Icona</Label>
                            <div className="grid grid-cols-6 gap-2 p-2 border rounded-md">
                                {iconKeys.map((key) => {
                                    const Icon = ICON_REGISTRY[key]
                                    const isSelected = iconName === key
                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            className={cn(
                                                "flex items-center justify-center p-2 rounded-md hover:bg-muted transition-colors",
                                                isSelected ? "bg-primary/10 text-primary ring-2 ring-primary/20" : "text-muted-foreground"
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
                </div>

                <SheetFooter className="p-6 border-t bg-background">
                    {error && <p className="text-sm text-destructive font-medium mr-auto self-center">{error}</p>}
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Annulla</Button>
                    <Button onClick={handleSubmit} disabled={isSaving}>
                        {isSaving ? "Salvataggio..." : "Salva"}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
