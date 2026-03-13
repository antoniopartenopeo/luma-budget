"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ImportStepUpload } from "./step-upload"
import { ImportStepReview } from "./step-review"
import { ImportStepSummary } from "./step-summary"
import { ImportState, Override } from "../core/types"
import { useCategories } from "@/features/categories/api/use-categories"
import { buildImportPayload } from "../core/payload"
import { MacroSection } from "@/components/patterns/macro-section"

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
        <MacroSection contentClassName="p-6 md:p-8 flex flex-col min-h-[500px]">
            {/* Native Stepper inside MacroSection Header Area */}
            {step !== "summary" && (
                <div className="mb-8 flex items-center gap-2">
                    <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-sm font-semibold text-primary">
                        {step === "upload" && "Passo 1 di 2"}
                        {step === "review" && "Passo 2 di 2"}
                    </div>
                    <div className="text-sm font-medium text-muted-foreground ml-2">
                        {step === "upload" && "Caricamento e analisi"}
                        {step === "review" && "Controllo categorie"}
                    </div>
                </div>
            )}

            <div className="flex-1 w-full relative">
                <AnimatePresence mode="wait">
                    {step === "upload" && (
                        <motion.div
                            key="upload"
                            initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, x: 20, filter: "blur(4px)" }}
                            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                            className="w-full"
                        >
                            <ImportStepUpload
                                onContinue={handleUploadComplete}
                                onClose={handleClose}
                            />
                        </motion.div>
                    )}

                    {step === "review" && importState && (
                        <motion.div
                            key="review"
                            initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, x: 20, filter: "blur(4px)" }}
                            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                            className="w-full"
                        >
                            <ImportStepReview
                                initialState={importState}
                                initialOverrides={overrides}
                                thresholdCents={thresholdCents}
                                onThresholdChange={setThresholdCents}
                                onBack={() => setStep("upload")}
                                onContinue={handleReviewComplete}
                            />
                        </motion.div>
                    )}

                    {step === "summary" && importState && (
                        <motion.div
                            key="summary"
                            initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
                            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                            className="w-full"
                        >
                            <ImportStepSummary
                                importState={importState}
                                overrides={overrides}
                                excludedGroupIds={excludedGroupIds}
                                onBack={() => setStep("review")}
                                onClose={handleImportSuccess}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </MacroSection>
    )
}
