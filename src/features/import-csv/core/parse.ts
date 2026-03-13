import { RawRow, ParseError } from "./types";
import { parseCurrencyToCents } from "@/domain/money";
import Papa from "papaparse";

/**
 * Heuristics for column mapping
 */
const COLUMN_CANDIDATES = {
    date: ["data", "date", "valuta", "data operazione", "data movimento", "giorno"],
    amountCents: ["amountcents"],
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
 * Identify column indices for required fields.
 */
function mapColumns(header: string[]): Record<string, number> {
    const normalizedHeader = header.map(h => h.toLowerCase().trim());
    const mapping: Record<string, number> = {
        date: -1,
        amountCents: -1,
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
    mapping.amountCents = findIndex(COLUMN_CANDIDATES.amountCents);
    mapping.amount = findIndex(EXPLICIT_AMOUNT_CANDIDATES, BALANCE_COLUMN_CANDIDATES);

    // Composite amount columns (common in banking exports)
    mapping.debit = findIndex(DEBIT_AMOUNT_CANDIDATES);
    mapping.credit = findIndex(CREDIT_AMOUNT_CANDIDATES);

    // Fallback for unusual but still valid amount naming.
    if (mapping.amountCents === -1 && mapping.amount === -1 && mapping.debit === -1 && mapping.credit === -1) {
        mapping.amount = findIndex(COLUMN_CANDIDATES.amount, BALANCE_COLUMN_CANDIDATES);
    }

    return mapping;
}

function hasNonZeroMonetaryValue(raw: string | undefined): boolean {
    if (!raw) return false;
    const cents = parseCurrencyToCents(raw.trim());
    return cents !== 0;
}

function amountCentsFromDebitCredit(
    debitRaw: string | undefined,
    creditRaw: string | undefined,
    lineNumber: number,
    errors: ParseError[]
): number {
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
        return netCents;
    }

    if (hasDebit) return -Math.abs(parseCurrencyToCents(debit));
    if (hasCredit) return parseCurrencyToCents(credit);
    return 0;
}

export function parseCSV(content: string): ParseResult {
    const errors: ParseError[] = [];
    const rows: RawRow[] = [];

    if (!content.trim()) {
        return { rows: [], errors: [{ lineNumber: 0, message: "Empty CSV content" }] };
    }

    // Use PapaParse for robust CSV loading
    const parsed = Papa.parse<string[]>(content.trim(), {
        skipEmptyLines: true,
        header: false // We use index mapping
    });

    // Translate structural errors from PapaParse (e.g. malformed quotes)
    // We only log severe errors because missing columns are handled later
    for (const err of parsed.errors) {
        if ((err.type === "Delimiter" && err.code !== "UndetectableDelimiter") || err.type === "Quotes") {
            errors.push({
                lineNumber: err.row !== undefined ? err.row + 1 : 0,
                message: err.message
            });
        }
    }

    const lines = parsed.data;

    let headerIndex = -1;
    let headerMap: Record<string, number> = {};
    let headers: string[] = [];

    // Find header row (first non-empty row containing relevant financial columns)
    for (let i = 0; i < lines.length; i++) {
        const lineVars = lines[i];
        if (!Array.isArray(lineVars)) continue;

        const lower = lineVars.map(c => typeof c === 'string' ? c.toLowerCase() : "");
        const hasDate = lower.some(c => COLUMN_CANDIDATES.date.some(kid => c.includes(kid)));
        const hasAmount = lower.some(c =>
            [...EXPLICIT_AMOUNT_CANDIDATES, ...DEBIT_AMOUNT_CANDIDATES, ...CREDIT_AMOUNT_CANDIDATES]
                .some(kid => c.includes(kid))
        );

        if (hasDate || hasAmount) {
            headerIndex = i;
            headers = lower;
            headerMap = mapColumns(lineVars.map(c => typeof c === 'string' ? c : ""));
            break;
        }
    }

    if (headerIndex === -1) {
        return { rows: [], errors: [{ lineNumber: 0, message: "Could not detect header row" }] };
    }

    if (headerMap.date === -1) errors.push({ lineNumber: 0, message: "Missing date column" });
    if (headerMap.amountCents === -1 && headerMap.amount === -1 && headerMap.debit === -1 && headerMap.credit === -1) {
        errors.push({ lineNumber: 0, message: "Missing amount column" });
    }

    if (errors.length > 0) {
        return { rows: [], errors };
    }

    // Parse Data Rows
    for (let i = headerIndex + 1; i < lines.length; i++) {
        const values = lines[i];
        if (!Array.isArray(values) || values.length === 0) continue;

        const requiredIndices = [headerMap.date];
        if (headerMap.amountCents !== -1) {
            requiredIndices.push(headerMap.amountCents);
        } else if (headerMap.amount !== -1) {
            requiredIndices.push(headerMap.amount);
        } else {
            if (headerMap.debit !== -1) requiredIndices.push(headerMap.debit);
            if (headerMap.credit !== -1) requiredIndices.push(headerMap.credit);
        }

        const maxRequiredIndex = Math.max(...requiredIndices);
        if (maxRequiredIndex >= values.length) {
            errors.push({ lineNumber: i + 1, message: "Row has insufficient columns", raw: values.join(",") });
            continue;
        }

        const raw: Record<string, string> = {};

        // Save mapped columns with standard keys
        raw['date'] = values[headerMap.date];
        if (headerMap.amountCents !== -1) {
            raw['amountCents'] = values[headerMap.amountCents];
        } else if (headerMap.amount !== -1) {
            raw['amount'] = values[headerMap.amount];
        } else {
            raw['amountCents'] = amountCentsFromDebitCredit(
                headerMap.debit !== -1 ? values[headerMap.debit] : undefined,
                headerMap.credit !== -1 ? values[headerMap.credit] : undefined,
                i + 1,
                errors
            ).toString();
        }

        // Logic for description
        if (headerMap.description !== -1) {
            raw['description'] = values[headerMap.description];
        } else {
            const excludedIndices = new Set(
                [headerMap.date, headerMap.amountCents, headerMap.amount, headerMap.debit, headerMap.credit].filter(idx => idx >= 0)
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
