"use client"

import Link from "next/link"
import { ArrowLeft, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { CsvImportWizard } from "@/features/import-csv/components/csv-import-wizard"

export default function TransactionsImportPage() {
    return (
        <div className="space-y-6 w-full">
            <PageHeader
                title={
                    <span className="flex items-center gap-3">
                        <FileSpreadsheet className="h-8 w-8" />
                        Importa CSV
                    </span>
                }
                description="Carica un estratto conto e valida le transazioni prima dell'import."
                actions={(
                    <Button asChild variant="outline" size="sm">
                        <Link href="/transactions">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Torna alle transazioni
                        </Link>
                    </Button>
                )}
            />

            <div className="min-h-[70vh]">
                <CsvImportWizard />
            </div>
        </div>
    )
}
