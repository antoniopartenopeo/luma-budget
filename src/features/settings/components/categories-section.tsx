"use client"

import { useState, useMemo } from "react"
import { RotateCcw, Search, MoreHorizontal, Archive, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MacroSection } from "@/components/patterns/macro-section"
import { useCategories, useArchiveCategory, useUnarchiveCategory, useResetCategories, useUpsertCategory } from "@/features/categories/api/use-categories"
import { CategoryIcon } from "@/features/categories/components/category-icon"
import { CategoryFormSheet } from "@/features/categories/components/category-form-sheet"
import { Plus, Pencil } from "lucide-react"
import { Category } from "@/features/categories/config"
import { cn } from "@/lib/utils"
import { premiumFieldLabelClassName } from "@/components/ui/control-styles"

export function CategoriesSection() {
    const { data: allCategories = [], isLoading: isCategoriesLoading } = useCategories({ includeArchived: true })
    const upsertCategory = useUpsertCategory()
    const archiveCategory = useArchiveCategory()
    const unarchiveCategory = useUnarchiveCategory()
    const resetCategories = useResetCategories()

    // Filters
    const [searchQuery, setSearchQuery] = useState("")
    const [showArchived, setShowArchived] = useState(false)
    const [activeTab, setActiveTab] = useState("expense")

    // Confirmation dialogs
    const [archiveDialogId, setArchiveDialogId] = useState<string | null>(null)
    const [showResetDialog, setShowResetDialog] = useState(false)

    // Form Dialog State
    const [showFormDialog, setShowFormDialog] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)

    // Memoized filtered list
    const filteredCategories = useMemo(() => {
        let result = allCategories

        // Filter by archived status
        if (!showArchived) {
            result = result.filter(c => !c.archived)
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            result = result.filter(c =>
                c.label.toLowerCase().includes(query) ||
                c.id.toLowerCase().includes(query)
            )
        }

        return result
    }, [allCategories, showArchived, searchQuery])

    // Split by Kind
    const expenseCategories = useMemo(() => filteredCategories.filter(c => c.kind === "expense"), [filteredCategories])
    const incomeCategories = useMemo(() => filteredCategories.filter(c => c.kind === "income"), [filteredCategories])

    const isOperationPending = archiveCategory.isPending || unarchiveCategory.isPending || resetCategories.isPending || upsertCategory.isPending

    const handleCreateClick = () => {
        setEditingCategory(null)
        setShowFormDialog(true)
    }

    const handleEditClick = (category: Category) => {
        setEditingCategory(category)
        setShowFormDialog(true)
    }

    const handleSaveCategory = (category: Category) => {
        upsertCategory.mutate(category, {
            onSuccess: () => {
                setShowFormDialog(false)
                setEditingCategory(null)
            }
        })
    }

    const handleArchive = (id: string) => {
        archiveCategory.mutate(id, {
            onSuccess: () => setArchiveDialogId(null)
        })
    }

    const handleUnarchive = (id: string) => {
        unarchiveCategory.mutate(id)
    }

    const renderCategoryList = (categories: Category[], emptyMessage: string) => {
        if (categories.length === 0) {
            return (
                <div className="surface-subtle py-12 text-center text-muted-foreground">
                    <p className="text-sm font-medium">{searchQuery ? "Nessuna categoria trovata" : emptyMessage}</p>
                </div>
            )
        }

        return (
            <div className="grid gap-2">
                {categories.map((cat) => (
                    <div
                        key={cat.id}
                        className={cn(
                            "group flex items-center justify-between rounded-[1.25rem] border border-white/35 bg-white/55 p-3 backdrop-blur-md transition-[background-color,border-color,box-shadow,opacity] duration-200 hover:bg-white/75 dark:border-white/10 dark:bg-white/[0.05] dark:hover:bg-white/[0.08]",
                            cat.archived && "bg-white/40 opacity-55 grayscale dark:bg-white/[0.03]"
                        )}
                    >
                        <div className="flex items-center gap-4 overflow-hidden">
                            <div className="shrink-0">
                                <CategoryIcon categoryName={cat.label} size={20} showBackground />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className={cn("font-medium truncate", cat.archived && "line-through text-muted-foreground")}>
                                    {cat.label}
                                </span>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    {cat.kind === "expense" && cat.spendingNature && (
                                        <span className={cn(
                                            "rounded-full px-2 py-0.5 font-semibold",
                                            cat.spendingNature === "essential" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                                            cat.spendingNature === "comfort" && "bg-primary/10 text-primary",
                                            cat.spendingNature === "superfluous" && "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                                        )}>
                                            {cat.spendingNature === "essential" ? "Essenziale" :
                                                cat.spendingNature === "comfort" ? "Benessere" : "Superfluo"}
                                        </span>
                                    )}
                                    {cat.archived && (
                                        <span className="rounded-full bg-zinc-500/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600 dark:text-zinc-300">
                                            Archiviata
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            {/* Toggle Archive / Restore */}
                            {cat.archived ? (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                    onClick={() => handleUnarchive(cat.id)}
                                    disabled={isOperationPending}
                                    title="Ripristina"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            ) : (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                                    onClick={() => handleEditClick(cat)}
                                    disabled={isOperationPending}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            )}

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 transition-opacity focus:opacity-100 group-hover:opacity-100">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[160px]">
                                    {!cat.archived ? (
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive"
                                            onClick={() => setArchiveDialogId(cat.id)}
                                        >
                                            <Archive className="mr-2 h-4 w-4" />
                                            Archivia
                                        </DropdownMenuItem>
                                    ) : (
                                        <DropdownMenuItem onClick={() => handleUnarchive(cat.id)}>
                                            <RefreshCw className="mr-2 h-4 w-4" />
                                            Ripristina
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <>

            <MacroSection
                title="Categorie"
                description="Organizza entrate e uscite nel modo più adatto a te."
                headerActions={
                    <Button onClick={handleCreateClick} size="sm" className="w-full sm:w-auto gap-2 rounded-full font-bold shadow-lg shadow-primary/20">
                        <Plus className="h-4 w-4" />
                        Nuova categoria
                    </Button>
                }
                contentClassName="px-0 sm:px-6"
            >
                {isCategoriesLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full rounded-xl" />
                        <Skeleton className="h-[200px] w-full rounded-xl" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Controls */}
                        {/* Controls */}
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                                <div className="relative w-full sm:max-w-xs">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        variant="premium"
                                        placeholder="Cerca categoria..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="h-11 rounded-[1rem] pl-10"
                                    />
                                </div>
                                <div className="surface-subtle flex items-center justify-between gap-3 p-2 sm:justify-end sm:bg-transparent sm:p-0 sm:shadow-none">
                                    <Label htmlFor="show-archived" className="text-sm cursor-pointer text-muted-foreground font-medium pl-2 sm:pl-0">
                                        Mostra archiviate
                                    </Label>
                                    <Switch
                                        id="show-archived"
                                        checked={showArchived}
                                        onCheckedChange={setShowArchived}
                                        className="scale-90"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Tabs & List */}
                        <Tabs defaultValue="expense" value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList variant="premium" className="grid w-full grid-cols-2 gap-2">
                                <TabsTrigger
                                    value="expense"
                                    variant="premium"
                                    className="text-xs font-bold data-[state=active]:text-rose-600"
                                >
                                    Uscite ({expenseCategories.length})
                                </TabsTrigger>
                                <TabsTrigger
                                    value="income"
                                    variant="premium"
                                    className="text-xs font-bold data-[state=active]:text-emerald-600"
                                >
                                    Entrate ({incomeCategories.length})
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="expense" className="mt-6 focus-visible:outline-none animate-enter-up">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className={premiumFieldLabelClassName}>Lista uscite</h3>
                                    <span className="text-xs text-muted-foreground">{expenseCategories.length} trovate</span>
                                </div>
                                {renderCategoryList(expenseCategories, "Nessuna categoria di spesa.")}
                            </TabsContent>
                            <TabsContent value="income" className="mt-6 focus-visible:outline-none animate-enter-up">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className={premiumFieldLabelClassName}>Lista entrate</h3>
                                    <span className="text-xs text-muted-foreground">{incomeCategories.length} trovate</span>
                                </div>
                                {renderCategoryList(incomeCategories, "Nessuna categoria di entrata.")}
                            </TabsContent>
                        </Tabs>

                        {/* Reset Action */}
                        <div className="flex justify-center border-t border-white/20 pt-8 dark:border-white/10">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2 text-muted-foreground hover:text-destructive text-xs"
                                onClick={() => setShowResetDialog(true)}
                                disabled={isOperationPending}
                            >
                                <RotateCcw className="h-3 w-3" />
                                Ripristina Defaults
                            </Button>
                        </div>
                    </div>
                )}
            </MacroSection>

            {/* Archive Confirmation Dialog */}
            <AlertDialog open={!!archiveDialogId} onOpenChange={(open) => !open && setArchiveDialogId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Archivia Categoria</AlertDialogTitle>
                        <AlertDialogDescription>
                            Sei sicuro di voler archiviare questa categoria? Le transazioni esistenti rimarranno intatte, ma la categoria non sarà più disponibile per nuove transazioni.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={archiveCategory.isPending}>Annulla</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => archiveDialogId && handleArchive(archiveDialogId)}
                            disabled={archiveCategory.isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {archiveCategory.isPending ? "Archiviando..." : "Archivia"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reset Categories Dialog */}
            <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Ripristina Categorie Default</AlertDialogTitle>
                        <AlertDialogDescription>
                            Sei sicuro di voler ripristinare le categorie predefinite? Questo non eliminerà le transazioni ma resetterà i nomi, le icone e i colori alle versioni impostate dal sistema.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={resetCategories.isPending}>Annulla</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => resetCategories.mutate(undefined, { onSuccess: () => setShowResetDialog(false) })}
                            disabled={resetCategories.isPending}
                        >
                            {resetCategories.isPending ? "Ripristinando..." : "Ripristina"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Form Sheet */}
            <CategoryFormSheet
                open={showFormDialog}
                onOpenChange={setShowFormDialog}
                categoryToEdit={editingCategory}
                onSave={handleSaveCategory}
                isSaving={upsertCategory.isPending}
            />
        </>
    )
}
