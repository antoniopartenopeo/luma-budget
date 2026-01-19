"use client"

/**
 * Step Upload - File selection for CSV import
 */

import { useCallback, useRef, useState } from "react"
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StepUploadProps {
    onFileUpload: (file: File, text: string) => void
}

export function StepUpload({ onFileUpload }: StepUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleFile = useCallback(async (file: File) => {
        setError(null)

        if (!file.name.endsWith(".csv")) {
            setError("Seleziona un file CSV (.csv)")
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Il file è troppo grande (max 5MB)")
            return
        }

        try {
            const text = await file.text()
            if (!text.trim()) {
                setError("Il file è vuoto")
                return
            }
            onFileUpload(file, text)
        } catch {
            setError("Errore nella lettura del file")
        }
    }, [onFileUpload])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const file = e.dataTransfer.files[0]
        if (file) handleFile(file)
    }, [handleFile])

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback(() => {
        setIsDragging(false)
    }, [])

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) handleFile(file)
    }, [handleFile])

    return (
        <div className="space-y-6">
            {/* Drop Zone */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
                    border-2 border-dashed rounded-xl p-12 text-center transition-colors
                    ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20"}
                `}
            >
                <div className="flex flex-col items-center gap-4">
                    <div className={`p-4 rounded-full ${isDragging ? "bg-primary/10" : "bg-muted"}`}>
                        <FileSpreadsheet className={`h-8 w-8 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                        <p className="font-medium text-foreground">
                            Trascina qui il file CSV
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            oppure clicca per selezionare
                        </p>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleInputChange}
                        className="hidden"
                    />
                    <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        Seleziona File
                    </Button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                </div>
            )}

            {/* Info */}
            <div className="text-xs text-muted-foreground space-y-1">
                <p>• Formati supportati: CSV con separatore virgola (,) o punto e virgola (;)</p>
                <p>• Il file deve contenere almeno le colonne: Data, Descrizione, Importo</p>
                <p>• Dimensione massima: 5MB</p>
            </div>
        </div>
    )
}
