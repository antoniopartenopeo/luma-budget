"use client"

import { Transaction } from "@/features/transactions/api/types"
import { getCategoryById, CATEGORY_GROUP_LABELS, CategoryGroupKey } from "@/features/categories/config"
import { formatTransactionDate } from "@/features/transactions/utils/format-date"
import { parseCurrencyToCents } from "@/domain/money"

// =====================
// EXPORT CONFIGURATION
// =====================

interface ExportColumn {
    key: string
    header: string
    getValue: (transaction: Transaction) => string
}

const EXPORT_COLUMNS: ExportColumn[] = [
    {
        key: "date",
        header: "Data",
        getValue: (t) => formatTransactionDate(t)
    },
    {
        key: "type",
        header: "Tipo",
        getValue: (t) => t.type === "income" ? "Entrata" : "Uscita"
    },
    {
        key: "category",
        header: "Categoria",
        getValue: (t) => t.category
    },
    {
        key: "categoryGroup",
        header: "Gruppo categoria",
        getValue: (t) => {
            const cat = getCategoryById(t.categoryId)
            if (!cat) return ""

            if (cat.kind === "income") {
                return CATEGORY_GROUP_LABELS["income"]
            }
            return CATEGORY_GROUP_LABELS[cat.spendingNature as CategoryGroupKey] || ""
        }
    },
    {
        key: "description",
        header: "Descrizione",
        getValue: (t) => t.description
    },
    {
        key: "amount",
        header: "Importo (€)",
        getValue: (t) => {
            // Parse amount using the helper and format with comma as decimal separator
            // parseCurrencyToCents returns value in cents, so divide by 100 for Euro
            // It also handles the sign correctly based on the input string (e.g., "-€30.00")
            const numericAmountInCents = parseCurrencyToCents(t.amount)
            const numericAmountInEuros = numericAmountInCents / 100
            return numericAmountInEuros.toFixed(2).replace(".", ",")
        }
    },
    {
        key: "isSuperfluous",
        header: "Superflua",
        getValue: (t) => t.isSuperfluous ? "Sì" : "No"
    },
    {
        key: "classificationSource",
        header: "Fonte classificazione",
        getValue: (t) => {
            if (!t.classificationSource) return ""
            switch (t.classificationSource) {
                case "ruleBased": return "Regola"
                case "manual": return "Manuale"
                case "ai": return "AI"
                default: return ""
            }
        }
    },
    {
        key: "id",
        header: "ID transazione",
        getValue: (t) => t.id
    }
]

// =====================
// CSV GENERATION
// =====================

function escapeCSVField(value: string): string {
    // Escape double quotes and wrap in quotes if contains special chars
    if (value.includes('"') || value.includes(';') || value.includes('\n') || value.includes('\r')) {
        return `"${value.replace(/"/g, '""')}"`
    }
    return value
}

function generateCSVContent(transactions: Transaction[]): string {
    // Header row
    const headers = EXPORT_COLUMNS.map(col => col.header).join(";")

    // Data rows
    const rows = transactions.map(transaction => {
        return EXPORT_COLUMNS
            .map(col => escapeCSVField(col.getValue(transaction)))
            .join(";")
    })

    // Combine with BOM for Excel UTF-8 compatibility
    return "\uFEFF" + [headers, ...rows].join("\n")
}

function generateFilename(dateRange?: { start?: string; end?: string }): string {
    const now = new Date()
    const timestamp = now.toISOString().split("T")[0] // YYYY-MM-DD

    let periodPart = ""
    if (dateRange?.start && dateRange?.end) {
        const startMonth = dateRange.start.substring(0, 7) // YYYY-MM
        const endMonth = dateRange.end.substring(0, 7)
        periodPart = startMonth === endMonth ? `_${startMonth}` : `_${startMonth}_${endMonth}`
    }

    return `numa-budget_transazioni${periodPart}_${timestamp}.csv`
}

// =====================
// EXPORT FUNCTION
// =====================

export interface ExportOptions {
    transactions: Transaction[]
    dateRange?: { start?: string; end?: string }
}

export interface ExportResult {
    success: boolean
    filename?: string
    error?: string
    isEmpty: boolean
}

export function exportTransactionsToCSV(options: ExportOptions): ExportResult {
    const { transactions, dateRange } = options

    try {
        const csvContent = generateCSVContent(transactions)
        const filename = generateFilename(dateRange)

        // Create blob and trigger download
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" })
        const url = URL.createObjectURL(blob)

        const link = document.createElement("a")
        link.href = url
        link.download = filename
        link.style.display = "none"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Cleanup
        URL.revokeObjectURL(url)

        return {
            success: true,
            filename,
            isEmpty: transactions.length === 0
        }
    } catch (error) {
        console.error("Export error:", error)
        return {
            success: false,
            error: "Si è verificato un errore durante l'esportazione. Riprova.",
            isEmpty: transactions.length === 0
        }
    }
}
