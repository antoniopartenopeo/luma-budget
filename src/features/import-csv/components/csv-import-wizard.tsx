"use client"

import { useState } from "react"
import { FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { ImportStepUpload } from "./step-upload"
import { ImportStepReview } from "./step-review"
import { ImportStepSummary } from "./step-summary"
import { ImportState, Override } from "../core/types"

export function CsvImportWizard() {
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState<"upload" | "review" | "summary">("upload")

    // Core Logic State
    const [importState, setImportState] = useState<ImportState | null>(null)
    const [overrides, setOverrides] = useState<Override[]>([])

    const resetWizard = () => {
        setStep("upload")
        setImportState(null)
        setOverrides([])
    }

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        if (!newOpen) {
            // Optional: delay reset to avoid flickering closing animation
            setTimeout(resetWizard, 300)
        }
    }

    // Step Transitions
    const handleUploadComplete = (state: ImportState) => {
        setImportState(state)
        setStep("review")
    }

    const handleReviewComplete = (finalOverrides: Override[]) => {
        setOverrides(finalOverrides)
        setStep("summary")
    }

    const handleImportSuccess = () => {
        setOpen(false)
        resetWizard()
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 hidden md:flex">
                    <FileSpreadsheet className="h-4 w-4" />
                    Importa CSV
                </Button>
            </DialogTrigger>
            {/* Mobile trigger (icon only) handled by parent if needed, or responsive CSS above */}

            <DialogContent className="max-w-4xl max-h-[85vh] h-[85vh] flex flex-col p-0 gap-0 outline-none overflow-hidden sm:rounded-2xl">
                {step === "upload" && (
                    <ImportStepUpload onContinue={handleUploadComplete} />
                )}

                {step === "review" && importState && (
                    <ImportStepReview
                        initialState={importState}
                        initialOverrides={overrides} // usually empty coming from upload
                        onBack={() => setStep("upload")}
                        onContinue={handleReviewComplete}
                    />
                )}

                {step === "summary" && importState && (
                    <ImportStepSummary
                        importState={importState}
                        overrides={overrides}
                        onBack={() => setStep("review")}
                        onClose={handleImportSuccess}
                    />
                )}
            </DialogContent>
        </Dialog>
    )
}
