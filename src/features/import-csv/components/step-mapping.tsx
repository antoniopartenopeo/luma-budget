"use client"

/**
 * Step Mapping - Column mapping for CSV import
 */

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { CSVFormat, MappingState } from "../types"

interface StepMappingProps {
    format: CSVFormat
    mappingState: MappingState
    onMappingChange: (state: MappingState) => void
}

export function StepMapping({ format, mappingState, onMappingChange }: StepMappingProps) {
    const { headers, sampleRows } = format
    const { mapping, dateFormat, amountFormat } = mappingState

    const updateMapping = (field: keyof typeof mapping, value: string | null) => {
        onMappingChange({
            ...mappingState,
            mapping: { ...mapping, [field]: value }
        })
    }

    const columnOptions = headers
        .filter(h => h && h.trim() !== "") // Filter out empty headers
        .map(h => ({ value: h, label: h }))

    return (
        <div className="space-y-6">
            {/* Sample Preview */}
            <div className="rounded-lg border overflow-hidden">
                <div className="bg-muted px-3 py-2 text-xs font-medium text-muted-foreground">
                    Anteprima dati ({sampleRows.length} righe)
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead className="bg-muted/50">
                            <tr>
                                {headers.map((h, i) => (
                                    <th key={i} className="px-3 py-2 text-left font-medium">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {sampleRows.slice(0, 3).map((row, i) => (
                                <tr key={i} className="border-t">
                                    {row.map((cell, j) => (
                                        <td key={j} className="px-3 py-2 truncate max-w-[150px]">
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Column Mapping */}
            <div className="space-y-4">
                <h3 className="text-sm font-medium">Mappatura Colonne</h3>

                <div className="grid gap-4 sm:grid-cols-2">
                    {/* Date */}
                    <div className="space-y-2">
                        <Label htmlFor="map-date">Data *</Label>
                        <Select
                            value={mapping.date || ""}
                            onValueChange={v => updateMapping("date", v || null)}
                        >
                            <SelectTrigger id="map-date">
                                <SelectValue placeholder="Seleziona colonna" />
                            </SelectTrigger>
                            <SelectContent>
                                {columnOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="map-desc">Descrizione *</Label>
                        <Select
                            value={mapping.description || ""}
                            onValueChange={v => updateMapping("description", v || null)}
                        >
                            <SelectTrigger id="map-desc">
                                <SelectValue placeholder="Seleziona colonna" />
                            </SelectTrigger>
                            <SelectContent>
                                {columnOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Amount Format */}
                <div className="space-y-3">
                    <Label>Formato Importo</Label>
                    <RadioGroup
                        value={amountFormat}
                        onValueChange={(v) => onMappingChange({ ...mappingState, amountFormat: v as "single" | "split" })}
                        className="flex gap-4"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="single" id="amt-single" />
                            <Label htmlFor="amt-single" className="font-normal">Colonna unica (con segno)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="split" id="amt-split" />
                            <Label htmlFor="amt-split" className="font-normal">Addebito/Accredito separati</Label>
                        </div>
                    </RadioGroup>
                </div>

                {/* Amount Column(s) */}
                <div className="grid gap-4 sm:grid-cols-2">
                    {amountFormat === "single" ? (
                        <div className="space-y-2">
                            <Label htmlFor="map-amount">Importo *</Label>
                            <Select
                                value={mapping.amount || ""}
                                onValueChange={v => updateMapping("amount", v || null)}
                            >
                                <SelectTrigger id="map-amount">
                                    <SelectValue placeholder="Seleziona colonna" />
                                </SelectTrigger>
                                <SelectContent>
                                    {columnOptions.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="map-debit">Addebito (Uscite)</Label>
                                <Select
                                    value={mapping.debit || ""}
                                    onValueChange={v => updateMapping("debit", v || null)}
                                >
                                    <SelectTrigger id="map-debit">
                                        <SelectValue placeholder="Seleziona colonna" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {columnOptions.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="map-credit">Accredito (Entrate)</Label>
                                <Select
                                    value={mapping.credit || ""}
                                    onValueChange={v => updateMapping("credit", v || null)}
                                >
                                    <SelectTrigger id="map-credit">
                                        <SelectValue placeholder="Seleziona colonna" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {columnOptions.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}
                </div>

                {/* Date Format */}
                <div className="space-y-2">
                    <Label>Formato Data</Label>
                    <RadioGroup
                        value={dateFormat}
                        onValueChange={(v) => onMappingChange({ ...mappingState, dateFormat: v as MappingState["dateFormat"] })}
                        className="flex flex-wrap gap-4"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="auto" id="df-auto" />
                            <Label htmlFor="df-auto" className="font-normal">Auto</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="DD/MM/YYYY" id="df-eu" />
                            <Label htmlFor="df-eu" className="font-normal">GG/MM/AAAA</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="MM/DD/YYYY" id="df-us" />
                            <Label htmlFor="df-us" className="font-normal">MM/GG/AAAA</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="YYYY-MM-DD" id="df-iso" />
                            <Label htmlFor="df-iso" className="font-normal">AAAA-MM-GG</Label>
                        </div>
                    </RadioGroup>
                </div>
            </div>
        </div>
    )
}
