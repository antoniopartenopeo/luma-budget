
import React from "react"
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
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConfirmDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: React.ReactNode
    description?: React.ReactNode
    cancelLabel?: string
    confirmLabel?: string
    onConfirm: () => void
    variant?: "default" | "destructive"
    isLoading?: boolean
}

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    cancelLabel = "Annulla",
    confirmLabel = "Conferma",
    onConfirm,
    variant = "default",
    isLoading = false,
}: ConfirmDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className={cn("flex items-center gap-2", variant === "destructive" && "text-destructive")}>
                        {title}
                    </AlertDialogTitle>
                    {description && (
                        <AlertDialogDescription>
                            {description}
                        </AlertDialogDescription>
                    )}
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2 sm:gap-2">
                    <AlertDialogCancel disabled={isLoading} className="rounded-xl">
                        {cancelLabel}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => {
                            // Prevent auto-closing if isLoading is managed by parent, 
                            // but usually onConfirm triggers usage of isLoading.
                            // If we want to prevent closing we might need to handle it.
                            // Standard AlertDialogAction closes on click. 
                            // If we need async, we might need to prevent default or use controlled open.
                            onConfirm()
                        }}
                        disabled={isLoading}
                        className={cn(
                            "rounded-xl",
                            variant === "destructive"
                                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                : ""
                        )}
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
