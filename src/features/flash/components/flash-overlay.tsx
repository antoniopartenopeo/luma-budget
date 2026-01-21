"use client"

import {
    Dialog,
    DialogTrigger,
    DialogContent,
} from "@/components/ui/dialog"
import { FlashSummaryView } from "./flash-summary-view"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface FlashOverlayProps {
    trigger?: React.ReactNode
}

export function FlashOverlay({ trigger }: FlashOverlayProps) {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full bg-primary/10 hover:bg-primary/20 text-primary h-10 w-10 border border-primary/20"
                    >
                        <Sparkles className="h-5 w-5 fill-primary" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-md p-0 border-none bg-transparent shadow-none [&>button]:hidden">
                <FlashSummaryView onClose={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    )
}
