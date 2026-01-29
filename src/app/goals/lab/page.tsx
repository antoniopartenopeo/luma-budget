
"use client"

import { MacroSection } from "@/components/patterns/macro-section"
import { PageHeader } from "@/components/ui/page-header"
import { NUMAExperience } from "@/features/goals/components/NUMAExperience"

export default function GoalLabPage() {
    return (
        <div className="space-y-8 pb-24 w-full max-w-5xl mx-auto">
            <PageHeader
                title="NUMA 0.1"
                description="Esperienza di Orientamento & Ritmo"
            />

            <MacroSection
                title="Verso il traguardo"
                description="Visualizza il tuo futuro e l'andamento del viaggio."
            >
                <div className="pt-8">
                    <NUMAExperience />
                </div>
            </MacroSection>

            <div className="mt-12 p-8 rounded-3xl bg-blue-500/5 border border-blue-500/10 text-center space-y-4">
                <p className="text-sm text-blue-500/60 font-medium uppercase tracking-widest">Nota di Progetto</p>
                <p className="text-blue-500/80 max-w-lg mx-auto leading-relaxed">
                    Questa è una prova di comprensione (NUMA 0.1).
                    L'interfaccia si focalizza esclusivamente sulla dimensione temporale e sulla tua tranquillità, superando ogni logica di controllo tradizionale.
                </p>
            </div>
        </div>
    )
}
