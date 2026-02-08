import { RawRow, ParseError } from "./types";
import { parseCurrencyToCents } from "@/domain/money";

/**
 * Heuristics for column mapping
 */
const COLUMN_CANDIDATES = {
    date: ["data", "date", "valuta", "data operazione", "data movimento", "giorno"],
    amount: ["importo", "amount", "ammontare", "entrate", "uscite", "dare", "avere", "saldo", "valore"],
    description: ["descrizione", "description", "causale", "dettagli", "note", "controparte", "merchant"],
};

const EXPLICIT_AMOUNT_CANDIDATES = ["importo", "amount", "ammontare", "valore", "import"];
const DEBIT_AMOUNT_CANDIDATES = ["uscite", "dare", "addebito", "debit"];
const CREDIT_AMOUNT_CANDIDATES = ["entrate", "avere", "accredito", "credit"];
const BALANCE_COLUMN_CANDIDATES = ["saldo", "balance", "progressivo"];

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
    const mapping: Record<string, number> = {
        date: -1,
        amount: -1,
        debit: -1,
        credit: -1,
        description: -1
    };

    // Helper to find index
    const findIndex = (candidates: string[], excluded: string[] = []) =>
        normalizedHeader.findIndex(
            h => candidates.some(c => h.includes(c)) && !excluded.some(ex => h.includes(ex))
        );

    mapping.date = findIndex(COLUMN_CANDIDATES.date);
    mapping.description = findIndex(COLUMN_CANDIDATES.description);

    // Prefer explicit amount columns over composite debit/credit formats.
    mapping.amount = findIndex(EXPLICIT_AMOUNT_CANDIDATES, BALANCE_COLUMN_CANDIDATES);

    // Composite amount columns (common in banking exports)
    mapping.debit = findIndex(DEBIT_AMOUNT_CANDIDATES);
    mapping.credit = findIndex(CREDIT_AMOUNT_CANDIDATES);

    // Fallback for unusual but still valid amount naming.
    if (mapping.amount === -1 && mapping.debit === -1 && mapping.credit === -1) {
        mapping.amount = findIndex(COLUMN_CANDIDATES.amount, BALANCE_COLUMN_CANDIDATES);
    }

    return mapping;
}

function hasNonZeroMonetaryValue(raw: string | undefined): boolean {
    if (!raw) return false;
    const cents = parseCurrencyToCents(raw.trim());
    return cents !== 0;
}

function amountFromDebitCredit(
    debitRaw: string | undefined,
    creditRaw: string | undefined,
    lineNumber: number,
    errors: ParseError[]
): string {
    const debit = debitRaw?.trim() ?? "";
    const credit = creditRaw?.trim() ?? "";
    const hasDebit = hasNonZeroMonetaryValue(debit);
    const hasCredit = hasNonZeroMonetaryValue(credit);

    if (hasDebit && hasCredit) {
        // Rare case: both columns populated; keep the net value and flag it.
        const netCents = parseCurrencyToCents(credit) - Math.abs(parseCurrencyToCents(debit));
        errors.push({
            lineNumber,
            message: "Both debit and credit are populated. Using net value.",
            raw: `${debit} | ${credit}`
        });
        return (netCents / 100).toFixed(2);
    }

    if (hasDebit) return `-${debit}`;
    if (hasCredit) return credit;
    return "0";
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
            const hasAmount = lower.some(c =>
                [...EXPLICIT_AMOUNT_CANDIDATES, ...DEBIT_AMOUNT_CANDIDATES, ...CREDIT_AMOUNT_CANDIDATES]
                    .some(kid => c.includes(kid))
            );

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
    if (headerMap.amount === -1 && headerMap.debit === -1 && headerMap.credit === -1) {
        errors.push({ lineNumber: 0, message: "Missing amount column" });
    }

    if (errors.length > 0) {
        return { rows: [], errors };
    }

    // Parse Data Rows
    for (let i = headerIndex + 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        const values = parseLine(line, delimiter);

        const requiredIndices = [headerMap.date];
        if (headerMap.amount !== -1) {
            requiredIndices.push(headerMap.amount);
        } else {
            if (headerMap.debit !== -1) requiredIndices.push(headerMap.debit);
            if (headerMap.credit !== -1) requiredIndices.push(headerMap.credit);
        }

        const maxRequiredIndex = Math.max(...requiredIndices);
        if (maxRequiredIndex >= values.length) {
            errors.push({ lineNumber: i + 1, message: "Row has insufficient columns", raw: line });
            continue;
        }

        const raw: Record<string, string> = {};

        // Save mapped columns with standard keys
        raw['date'] = values[headerMap.date];
        if (headerMap.amount !== -1) {
            raw['amount'] = values[headerMap.amount];
        } else {
            raw['amount'] = amountFromDebitCredit(
                headerMap.debit !== -1 ? values[headerMap.debit] : undefined,
                headerMap.credit !== -1 ? values[headerMap.credit] : undefined,
                i + 1,
                errors
            );
        }

        // Logic for description
        if (headerMap.description !== -1) {
            raw['description'] = values[headerMap.description];
        } else {
            const excludedIndices = new Set(
                [headerMap.date, headerMap.amount, headerMap.debit, headerMap.credit].filter(idx => idx >= 0)
            );
            raw['description'] = values.filter((_, idx) => !excludedIndices.has(idx)).join(" ").trim();
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
