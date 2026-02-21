"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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

interface CsvImportWizardProps {
    onStepChange?: (step: "upload" | "review" | "summary") => void
}

export function CsvImportWizard({ onStepChange }: CsvImportWizardProps = {}) {
    const router = useRouter()
    const { data: categories = [] } = useCategories()
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
        resetWizard()
        router.push("/transactions")
    }

    const handleClose = () => {
        resetWizard()
        router.push("/transactions")
    }

    useEffect(() => {
        onStepChange?.(step)
    }, [step, onStepChange])

    return (
        <div className="w-full">
            {step === "upload" && (
                <ImportStepUpload
                    onContinue={handleUploadComplete}
                    onClose={handleClose}
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
        </div>
    )
}
