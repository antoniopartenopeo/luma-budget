import { RawRow, ParseError } from "./types";

/**
 * Heuristics for column mapping
 */
const COLUMN_CANDIDATES = {
    date: ["data", "date", "valuta", "data operazione", "data movimento", "giorno"],
    amount: ["importo", "amount", "ammontare", "entrate", "uscite", "dare", "avere", "saldo", "valore"],
    description: ["descrizione", "description", "causale", "dettagli", "note", "controparte", "merchant"],
};

export interface ParseResult {
    rows: RawRow[];
    errors: ParseError[];
}

/**
 * Detects the most likely delimiter for the CSV content.
 */
function detectDelimiter(content: string): string {
    const candidates = [",", ";", "\t"];
    const lines = content.split(/\r?\n/).slice(0, 5).filter(line => line.trim().length > 0);

    if (lines.length === 0) return ",";

    let bestDelimiter = ",";
    let bestConsistency = -1;

    for (const delimiter of candidates) {
        const counts = lines.map(line => line.split(delimiter).length);
        const isConsistent = counts.every(c => c === counts[0] && c > 1);

        // Prefer consistency first, then higher count
        if (isConsistent && counts[0] > bestConsistency) {
            bestConsistency = counts[0];
            bestDelimiter = delimiter;
        }
    }

    return bestDelimiter;
}

/**
 * Simple CSV line parser that handles quoted values.
 */
function parseLine(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = "";
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
            if (insideQuotes && nextChar === '"') {
                current += '"';
                i++; // skip escaped quote
            } else {
                insideQuotes = !insideQuotes;
            }
        } else if (char === delimiter && !insideQuotes) {
            result.push(current);
            current = "";
        } else {
            current += char;
        }
    }
    result.push(current);
    return result.map(s => s.trim()); // basic trim
}

/**
 * Identify column indices for required fields.
 */
function mapColumns(header: string[]): Record<string, number> {
    const normalizedHeader = header.map(h => h.toLowerCase().trim());
    const mapping: Record<string, number> = {};

    // Helper to find index
    const findIndex = (candidates: string[]) =>
        normalizedHeader.findIndex(h => candidates.some(c => h.includes(c)));

    mapping.date = findIndex(COLUMN_CANDIDATES.date);

    // Logic for amount: explicit amount or dare/avere?
    // For now simple single mapping, but we might need multi-column logic later.
    // The spec mentions "merge" if multiple amount columns exist. 
    // Let's look for known amount identifiers.

    const amountIndex = findIndex(COLUMN_CANDIDATES.amount);
    mapping.amount = amountIndex;

    mapping.description = findIndex(COLUMN_CANDIDATES.description);

    return mapping;
}

export function parseCSV(content: string): ParseResult {
    const errors: ParseError[] = [];
    const rows: RawRow[] = [];

    if (!content.trim()) {
        return { rows: [], errors: [{ lineNumber: 0, message: "Empty CSV content" }] };
    }

    const delimiter = detectDelimiter(content);
    const lines = content.split(/\r?\n/);

    let headerIndex = -1;
    let headerMap: Record<string, number> = {};
    let headers: string[] = [];

    // Find header row (first non-empty row)
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().length > 0) {
            const parsed = parseLine(lines[i], delimiter);
            // Heuristic: Header usually contains "data" or "date" or "importo"
            const lower = parsed.map(c => c.toLowerCase());
            const hasDate = lower.some(c => COLUMN_CANDIDATES.date.some(kid => c.includes(kid)));
            const hasAmount = lower.some(c => COLUMN_CANDIDATES.amount.some(kid => c.includes(kid)));

            if (hasDate || hasAmount) {
                headerIndex = i;
                headers = lower;
                headerMap = mapColumns(parsed);
                break;
            }
        }
    }

    if (headerIndex === -1) {
        return { rows: [], errors: [{ lineNumber: 0, message: "Could not detect header row" }] };
    }

    if (headerMap.date === -1) errors.push({ lineNumber: 0, message: "Missing date column" });
    if (headerMap.amount === -1) errors.push({ lineNumber: 0, message: "Missing amount column" });

    if (errors.length > 0) {
        return { rows: [], errors };
    }

    // Parse Data Rows
    for (let i = headerIndex + 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        const values = parseLine(line, delimiter);

        // Improve robustness: if values length differs significantly, might be an issue, but let's try to map
        if (values.length < Math.max(headerMap.date, headerMap.amount)) {
            errors.push({ lineNumber: i + 1, message: "Row has insufficient columns", raw: line });
            continue;
        }

        const raw: Record<string, string> = {};

        // Save mapped columns with standard keys
        raw['date'] = values[headerMap.date];
        raw['amount'] = values[headerMap.amount];

        // Logic for description
        if (headerMap.description !== -1) {
            raw['description'] = values[headerMap.description];
        } else {
            // Fallback: join all other columns? or just empty strings
            raw['description'] = values.filter((_, idx) => idx !== headerMap.date && idx !== headerMap.amount).join(" ");
        }

        // Also preserve ALL original data for potential detailed inspection or "RawRow" requirement
        headers.forEach((h, idx) => {
            if (values[idx]) raw[h] = values[idx];
        });

        rows.push({
            lineNumber: i + 1,
            raw
        });
    }

    return { rows, errors };
}
