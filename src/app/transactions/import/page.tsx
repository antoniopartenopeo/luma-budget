"use client"

import { useState } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { CsvImportWizard } from "@/features/import-csv/components/csv-import-wizard"
import { BankCsvHelpSection } from "@/features/import-csv/components/bank-csv-help-section"
import { ImportCsvEngineCard } from "@/features/import-csv/components/import-csv-engine-card"
import { MacroSection } from "@/components/patterns/macro-section"

export default function TransactionsImportPage() {
    const [wizardStep, setWizardStep] = useState<"upload" | "review" | "summary">("upload")

    return (
        <div className="space-y-6 w-full">
            <PageHeader
                title="Importa CSV"
                description="Carica un estratto conto e valida le transazioni prima dell'import."
            />

            <ImportCsvEngineCard />

            <MacroSection contentClassName="p-0" className="w-full">
                <div className="min-h-[70vh]">
                    <CsvImportWizard onStepChange={setWizardStep} />
                </div>
            </MacroSection>

            {wizardStep === "upload" ? <BankCsvHelpSection /> : null}
        </div>
    )
}
