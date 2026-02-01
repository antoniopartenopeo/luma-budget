import { RhythmPreset } from "../types"

export const RHYTHMS: RhythmPreset[] = [
    {
        type: "baseline",
        label: "Nessun Ritmo",
        description: "Mantieni le tue abitudini attuali senza sforzi aggiuntivi.",
        intensity: 0,
        savings: { superfluous: 0, comfort: 0 }
    },
    {
        type: "balanced",
        label: "Equilibrato",
        description: "Riduci il superfluo senza rinunciare al tuo benessere.",
        intensity: 0.5,
        savings: { superfluous: 20, comfort: 5 }
    },
    {
        type: "aggressive",
        label: "Aggressivo",
        description: "Massima velocità per raggiungere l'obiettivo il prima possibile.",
        intensity: 1.0,
        savings: { superfluous: 40, comfort: 15 }
    }
]

export const DEFAULT_RHYTHM_TYPE = "baseline"
