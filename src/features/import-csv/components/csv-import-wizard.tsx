"use client"

import { useState } from "react"
import { FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { ImportStepUpload } from "./step-upload"
import { ImportStepReview } from "./step-review"
import { ImportStepSummary } from "./step-summary"
import { ImportState, Override } from "../core/types"
import { useCategories } from "@/features/categories/api/use-categories"
import { buildImportPayload } from "../core/payload"

export interface ReviewResult {
    overrides: Override[]
    excludedGroupIds: string[]
}

export function CsvImportWizard() {
    const { data: categories = [] } = useCategories()
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState<"upload" | "review" | "summary">("upload")

    // Core Logic State
    const [importState, setImportState] = useState<ImportState | null>(null)
    const [overrides, setOverrides] = useState<Override[]>([])
    const [excludedGroupIds, setExcludedGroupIds] = useState<string[]>([])

    // Lifted threshold state - survives back navigation
    const [thresholdCents, setThresholdCents] = useState(0)

    const resetWizard = () => {
        setStep("upload")
        setImportState(null)
        setOverrides([])
        setExcludedGroupIds([])
        setThresholdCents(0)
    }

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        if (!newOpen) {
            setTimeout(resetWizard, 300)
        }
    }

    // Step Transitions
    const handleUploadComplete = (state: ImportState) => {
        setImportState(state)
        setStep("review")
    }

    const handleReviewComplete = (result: ReviewResult) => {
        setOverrides(result.overrides)
        setExcludedGroupIds(result.excludedGroupIds)

        // Generate payload immediately to catch errors early
        try {
            buildImportPayload(
                importState!.groups,
                new Map(importState!.rows.map(r => [r.id, r])),
                result.overrides,
                categories
            )
        } catch (e) {
            console.error("Payload validation failed", e)
        }

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

            <DialogContent className="w-full h-full max-w-full max-h-full sm:max-w-7xl sm:max-h-[90vh] sm:h-[90vh] flex flex-col p-0 gap-0 outline-none overflow-hidden sm:rounded-2xl rounded-none">
                {step === "upload" && (
                    <ImportStepUpload
                        onContinue={handleUploadComplete}
                        onClose={() => setOpen(false)}
                    />
                )}

                {step === "review" && importState && (
                    <ImportStepReview
                        initialState={importState}
                        initialOverrides={overrides}
                        thresholdCents={thresholdCents}
                        onThresholdChange={setThresholdCents}
                        onBack={() => setStep("upload")}
                        onContinue={handleReviewComplete}
                    />
                )}

                {step === "summary" && importState && (
                    <ImportStepSummary
                        importState={importState}
                        overrides={overrides}
                        thresholdCents={thresholdCents}
                        excludedGroupIds={excludedGroupIds}
                        onBack={() => setStep("review")}
                        onClose={handleImportSuccess}
                    />
                )}
            </DialogContent>
        </Dialog>
    )
}
