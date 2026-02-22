"use client"

import { useState } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { CsvImportWizard } from "@/features/import-csv/components/csv-import-wizard"
import { BankCsvHelpSection } from "@/features/import-csv/components/bank-csv-help-section"
import { ImportCsvEngineCard } from "@/features/import-csv/components/import-csv-engine-card"
import { MacroSection, macroItemVariants } from "@/components/patterns/macro-section"
import { StaggerContainer } from "@/components/patterns/stagger-container"
import { motion } from "framer-motion"

export default function TransactionsImportPage() {
    const [wizardStep, setWizardStep] = useState<"upload" | "review" | "summary">("upload")

    return (
        <StaggerContainer className="space-y-6 w-full">
            <motion.div variants={macroItemVariants}>
                <PageHeader
                    title="Importa CSV"
                    description="Carica un estratto conto e valida le transazioni prima dell'import."
                />
            </motion.div>

            <motion.div variants={macroItemVariants}>
                <ImportCsvEngineCard />
            </motion.div>

            <motion.div variants={macroItemVariants}>
                <MacroSection contentClassName="p-0" className="w-full">
                    <div className="min-h-[70vh]">
                        <CsvImportWizard onStepChange={setWizardStep} />
                    </div>
                </MacroSection>
            </motion.div>

            {wizardStep === "upload" ? (
                <motion.div variants={macroItemVariants}>
                    <BankCsvHelpSection />
                </motion.div>
            ) : null}
        </StaggerContainer>
    )
}
