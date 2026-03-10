"use client"

import { FileUp, ShieldCheck, Upload } from "lucide-react"
import { NumaEngineCard } from "@/components/patterns/numa-engine-card"

const IMPORT_FLOW_STEPS = [
    {
        icon: FileUp,
        colorClass: "text-primary",
        bgClass: "bg-primary/10",
        stepLabel: "Passo 1",
        title: "Controllo iniziale",
        description: "Leggo il file e tengo solo i movimenti che posso usare davvero."
    },
    {
        icon: Upload,
        colorClass: "text-amber-500",
        bgClass: "bg-amber-500/10",
        stepLabel: "Passo 2",
        title: "Raggruppamento movimenti",
        description: "Raggruppo i movimenti simili per rendere la revisione più veloce."
    },
    {
        icon: ShieldCheck,
        colorClass: "text-emerald-500",
        bgClass: "bg-emerald-500/10",
        stepLabel: "Passo 3",
        title: "Conferma finale",
        description: "Prima di salvare controlli un riepilogo semplice e completo."
    }
] as const

export function ImportCsvEngineCard() {
    return (
        <NumaEngineCard
            icon={Upload}
            className="w-full"
            steps={IMPORT_FLOW_STEPS.map((step) => ({
                icon: step.icon,
                colorClass: step.colorClass,
                bgClass: step.bgClass,
                stepLabel: step.stepLabel,
                title: step.title,
                description: step.description
            }))}
            certificationTitle="Controllo e trasparenza"
            certificationSubtitle="Import CSV locale e revisione guidata"
            transparencyNote="Nel flusso CSV attivo il file resta nel browser fino alla conferma finale."
            auditStats={[
                {
                    label: "Righe controllate",
                    value: "100%",
                    subValue: "Ogni riga viene verificata prima del passaggio successivo."
                },
                {
                    label: "Duplicati",
                    value: "Gestiti",
                    subValue: "I movimenti già presenti vengono riconosciuti e segnalati."
                },
                {
                    label: "Revisione",
                    value: "Guidata",
                    subValue: "Trovi i gruppi già ordinati per confermare tutto più in fretta."
                },
                {
                    label: "Privacy",
                    value: "Locale",
                    subValue: "Nel flusso CSV attivo i dati restano nel browser durante la revisione."
                }
            ]}
        />
    )
}
