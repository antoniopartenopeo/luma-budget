/**
 * CSV Parser
 * 
 * Handles:
 * - Auto-detect separator (comma vs semicolon)
 * - Quoted values (handles commas inside quotes)
 * - Date parsing (EU, US, ISO formats)
 * - Amount parsing (EU/US format, single or split columns)
 * 
 * Uses parseCurrencyToCents from currency-utils (no parseFloat!)
 */

import { parseCurrencyToCents } from "@/lib/currency-utils"
import type { CSVFormat, ParsedCSVRow, ColumnMapping, MappingState } from "./types"

/**
 * Detects CSV format (separator, headers) from raw text
 */
export function detectCSVFormat(csvText: string): CSVFormat {
    const lines = csvText.trim().split(/\r?\n/)
    if (lines.length === 0) {
        return { separator: ",", hasHeader: true, headers: [], sampleRows: [] }
    }

    const firstLine = lines[0]

    // Count separators in first line
    const commaCount = (firstLine.match(/,/g) || []).length
    const semicolonCount = (firstLine.match(/;/g) || []).length

    const separator: "," | ";" = semicolonCount > commaCount ? ";" : ","

    // Parse first line as headers
    const headers = parseCSVLine(firstLine, separator)

    // Get sample rows (up to 5)
    const sampleRows: string[][] = []
    for (let i = 1; i < Math.min(lines.length, 6); i++) {
        if (lines[i].trim()) {
            sampleRows.push(parseCSVLine(lines[i], separator))
        }
    }

    return {
        separator,
        hasHeader: true, // Assume first row is header
        headers,
        sampleRows
    }
}

/**
 * Parses a single CSV line respecting quoted values
 */
export function parseCSVLine(line: string, separator: "," | ";"): string[] {
    const result: string[] = []
    let current = ""
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
        const char = line[i]

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                // Escaped quote
                current += '"'
                i++
            } else {
                inQuotes = !inQuotes
            }
        } else if (char === separator && !inQuotes) {
            result.push(current.trim())
            current = ""
        } else {
            current += char
        }
    }

    result.push(current.trim())
    return result
}

/**
 * Parses entire CSV text into rows
 */
export function parseCSVText(csvText: string, separator: "," | ";"): string[][] {
    const lines = csvText.trim().split(/\r?\n/)
    return lines.filter(line => line.trim()).map(line => parseCSVLine(line, separator))
}

/**
 * Attempts to parse a date string into ISO format
 * Supports: YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY, DD-MM-YYYY, DD.MM.YYYY
 */
export function parseDateToISO(
    dateStr: string,
    preferredFormat: MappingState["dateFormat"] = "auto"
): string | null {
    if (!dateStr) return null

    const cleaned = dateStr.trim()

    // ISO format: YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
        return cleaned
    }

    // Try common separators
    const match = cleaned.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/)
    if (match) {
        const [, p1, p2, p3] = match
        const year = p3.length === 2 ? `20${p3}` : p3
        let month: string
        let day: string

        if (preferredFormat === "DD/MM/YYYY" || preferredFormat === "auto") {
            // EU format: DD/MM/YYYY
            day = p1.padStart(2, "0")
            month = p2.padStart(2, "0")
        } else if (preferredFormat === "MM/DD/YYYY") {
            // US format: MM/DD/YYYY
            month = p1.padStart(2, "0")
            day = p2.padStart(2, "0")
        } else {
            // Default to EU
            day = p1.padStart(2, "0")
            month = p2.padStart(2, "0")
        }

        // Validate
        const monthNum = parseInt(month, 10)
        const dayNum = parseInt(day, 10)
        if (monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31) {
            return `${year}-${month}-${day}`
        }
    }

    return null
}

/**
 * Parses amount from CSV value(s)
 * Returns signed cents: negative for expense, positive for income
 */
export function parseAmountToCents(
    value: string,
    debitValue?: string,
    creditValue?: string
): { amountCents: number; type: "income" | "expense" } {
    // Split column mode
    if (debitValue !== undefined && creditValue !== undefined) {
        const debitCents = Math.abs(parseCurrencyToCents(debitValue || "0"))
        const creditCents = Math.abs(parseCurrencyToCents(creditValue || "0"))

        if (creditCents > 0) {
            return { amountCents: creditCents, type: "income" }
        } else {
            return { amountCents: debitCents, type: "expense" }
        }
    }

    // Single column mode
    const cents = parseCurrencyToCents(value)
    if (cents >= 0) {
        return { amountCents: Math.abs(cents), type: "income" }
    } else {
        return { amountCents: Math.abs(cents), type: "expense" }
    }
}

/**
 * Main function: Parses CSV data into structured rows
 */
export function parseCSVToRows(
    csvText: string,
    format: CSVFormat,
    mappingState: MappingState
): ParsedCSVRow[] {
    const { mapping, dateFormat } = mappingState
    const rows = parseCSVText(csvText, format.separator)

    // Skip header row
    const dataRows = rows.slice(1)
    const headerIndexMap = new Map<string, number>()
    format.headers.forEach((h, i) => headerIndexMap.set(h, i))

    const getColValue = (row: string[], colName: string | null): string => {
        if (!colName) return ""
        const idx = headerIndexMap.get(colName)
        return idx !== undefined ? (row[idx] || "") : ""
    }

    return dataRows.map((row, idx): ParsedCSVRow => {
        const parseErrors: string[] = []

        // Date
        const rawDate = getColValue(row, mapping.date)
        const date = parseDateToISO(rawDate, dateFormat)
        if (!date && rawDate) {
            parseErrors.push(`Data non riconosciuta: "${rawDate}"`)
        }

        // Description
        const description = getColValue(row, mapping.description) || "Transazione importata"

        // Amount
        let amountCents = 0
        let type: "income" | "expense" = "expense"

        if (mappingState.amountFormat === "split") {
            const debitVal = getColValue(row, mapping.debit)
            const creditVal = getColValue(row, mapping.credit)
            const result = parseAmountToCents("", debitVal, creditVal)
            amountCents = result.amountCents
            type = result.type
        } else {
            const amountVal = getColValue(row, mapping.amount)
            if (!amountVal) {
                parseErrors.push("Importo mancante")
            } else {
                const result = parseAmountToCents(amountVal)
                amountCents = result.amountCents
                type = result.type
            }
        }

        // Build raw values map
        const rawValues: Record<string, string> = {}
        format.headers.forEach((h, i) => {
            rawValues[h] = row[i] || ""
        })

        return {
            rowIndex: idx + 1, // 1-indexed for user display
            date,
            description,
            amountCents,
            type,
            rawValues,
            parseErrors
        }
    })
}

/**
 * Auto-detect column mapping based on headers
 */
export function autoDetectMapping(headers: string[]): ColumnMapping {
    const lowerHeaders = headers.map(h => h.toLowerCase().trim())

    const findColumn = (keywords: string[]): string | null => {
        for (const kw of keywords) {
            const idx = lowerHeaders.findIndex(h => h.includes(kw))
            if (idx !== -1) return headers[idx]
        }
        return null
    }

    return {
        date: findColumn(["data", "date", "datum", "valuta"]),
        description: findColumn(["descrizione", "description", "causale", "riferimento", "motivo", "beneficiario"]),
        amount: findColumn(["importo", "amount", "valore", "saldo"]),
        debit: findColumn(["addebito", "debit", "uscita", "dare"]),
        credit: findColumn(["accredito", "credit", "entrata", "avere"]),
    }
}
