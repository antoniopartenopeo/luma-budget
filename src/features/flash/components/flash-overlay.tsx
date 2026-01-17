"use client"

import {
    Dialog,
    DialogTrigger,
    DialogPortal,
    DialogOverlay,
} from "@/components/ui/dialog"
import * as DialogPrimitive from "@radix-ui/react-dialog"
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
            <DialogPortal>
                {/* Overlay più chiaro per far risaltare il vetro bianco */}
                <DialogOverlay className="bg-white/5 backdrop-blur-[2px]" />
                <DialogPrimitive.Content
                    className={cn(
                        "fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] outline-none",
                        "duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
                    )}
                >
                    <FlashSummaryView onClose={() => setOpen(false)} />
                </DialogPrimitive.Content>
            </DialogPortal>
        </Dialog>
    )
}
