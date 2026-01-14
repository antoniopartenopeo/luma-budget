"use client"

import { useState, useMemo } from "react"
import { Database, RotateCcw, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
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
import { useCategories, useArchiveCategory, useUnarchiveCategory, useResetCategories } from "@/features/categories/api/use-categories"
import { CategoryIcon } from "@/features/categories/components/category-icon"

const PAGE_SIZE = 20

export function CategoriesSection() {
    const { data: allCategories = [], isLoading: isCategoriesLoading } = useCategories({ includeArchived: true })
    const archiveCategory = useArchiveCategory()
    const unarchiveCategory = useUnarchiveCategory()
    const resetCategories = useResetCategories()

    // Filters
    const [searchQuery, setSearchQuery] = useState("")
    const [showArchived, setShowArchived] = useState(false)
    const [currentPage, setCurrentPage] = useState(0)

    // Confirmation dialogs
    const [archiveDialogId, setArchiveDialogId] = useState<string | null>(null)
    const [showResetDialog, setShowResetDialog] = useState(false)

    // Memoized filtered & paginated list
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

    const totalPages = Math.ceil(filteredCategories.length / PAGE_SIZE)
    const paginatedCategories = useMemo(() => {
        const start = currentPage * PAGE_SIZE
        return filteredCategories.slice(start, start + PAGE_SIZE)
    }, [filteredCategories, currentPage])

    // Reset page when filters change
    const handleSearchChange = (value: string) => {
        setSearchQuery(value)
        setCurrentPage(0)
    }

    const handleToggleArchived = (checked: boolean) => {
        setShowArchived(checked)
        setCurrentPage(0)
    }

    const handleArchive = (id: string) => {
        archiveCategory.mutate(id, {
            onSuccess: () => setArchiveDialogId(null)
        })
    }

    const handleUnarchive = (id: string) => {
        unarchiveCategory.mutate(id)
    }

    const handleReset = () => {
        resetCategories.mutate(undefined, {
            onSuccess: () => setShowResetDialog(false)
        })
    }

    const isOperationPending = archiveCategory.isPending || unarchiveCategory.isPending || resetCategories.isPending

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        Gestione Categorie
                    </CardTitle>
                    <CardDescription>
                        Visualizza e gestisci le categorie di spesa e introito.
                        L&apos;archiviazione nasconde la categoria dai menu senza cancellare i dati storici.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isCategoriesLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-[200px] w-full" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Filters */}
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                <div className="relative w-full sm:w-[280px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Cerca categoria..."
                                        value={searchQuery}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        className="pl-9"
                                        aria-label="Cerca categoria"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        id="show-archived"
                                        checked={showArchived}
                                        onCheckedChange={handleToggleArchived}
                                        aria-label="Mostra archiviate"
                                    />
                                    <Label htmlFor="show-archived" className="text-sm cursor-pointer">
                                        Mostra archiviate
                                    </Label>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="rounded-md border overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[40px]"></TableHead>
                                            <TableHead>Nome</TableHead>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead className="hidden sm:table-cell">Id</TableHead>
                                            <TableHead className="text-right">Azioni</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedCategories.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                                    {searchQuery ? "Nessuna categoria trovata" : "Nessuna categoria disponibile"}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            paginatedCategories.map((cat) => (
                                                <TableRow key={cat.id} className={cat.archived ? "opacity-40 grayscale" : ""}>
                                                    <TableCell>
                                                        <CategoryIcon categoryName={cat.label} size={18} />
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {cat.label}
                                                        {cat.archived && (
                                                            <span className="ml-2 text-[10px] bg-muted px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">Archiviata</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="capitalize text-xs">
                                                        {cat.kind === "expense" ? "Uscita" : "Entrata"}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-[10px] text-muted-foreground hidden sm:table-cell">
                                                        {cat.id}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {cat.archived ? (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 text-[11px] font-bold"
                                                                onClick={() => handleUnarchive(cat.id)}
                                                                disabled={isOperationPending}
                                                            >
                                                                Ripristina
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 text-[11px] font-bold text-destructive hover:text-destructive hover:bg-destructive/5"
                                                                onClick={() => setArchiveDialogId(cat.id)}
                                                                disabled={isOperationPending}
                                                            >
                                                                Archivia
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        {filteredCategories.length} categorie
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                            disabled={currentPage === 0}
                                            aria-label="Pagina precedente"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <span className="text-muted-foreground">
                                            {currentPage + 1} / {totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                                            disabled={currentPage >= totalPages - 1}
                                            aria-label="Pagina successiva"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Reset button */}
                            <div className="flex justify-end pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                    onClick={() => setShowResetDialog(true)}
                                    disabled={isOperationPending}
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    Ripristina Categorie Default
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

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
                            onClick={handleReset}
                            disabled={resetCategories.isPending}
                        >
                            {resetCategories.isPending ? "Ripristinando..." : "Ripristina"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
