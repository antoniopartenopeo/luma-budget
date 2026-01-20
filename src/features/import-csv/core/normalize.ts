import { RawRow, ParsedRow, ParseError } from "./types";
import { parse, isValid, startOfDay, format } from "date-fns";

/**
 * Normalizes a RawRow into a ParsedRow.
 */
export function normalizeRows(rows: RawRow[]): { valid: ParsedRow[]; errors: ParseError[] } {
    const valid: ParsedRow[] = [];
    const errors: ParseError[] = [];

    for (const row of rows) {
        try {
            const date = parseDate(row.raw.date);
            if (!date) {
                throw new Error(`Invalid date format: ${row.raw.date}`);
            }

            const amountCents = parseAmount(row.raw.amount);
            if (isNaN(amountCents)) throw new Error(`Invalid amount format: ${row.raw.amount}`);

            if (amountCents === 0) {
                continue;
            }

            const originalDescription = row.raw.description || "";
            const cleanDescription = normalizeDescription(originalDescription);

            valid.push({
                lineNumber: row.lineNumber,
                date: format(date, "yyyy-MM-dd"), // Use local date string
                timestamp: date.getTime(),
                amountCents,
                description: cleanDescription,
                originalDescription,
                rawRow: row.raw,
            });

        } catch (err: any) {
            errors.push({
                lineNumber: row.lineNumber,
                message: err.message,
                raw: JSON.stringify(row.raw),
            });
        }
    }

    return { valid, errors };
}

/**
 * Date Parsing Logic
 */
function parseDate(raw: string): Date | null {
    if (!raw) return null;
    const cleaned = raw.trim();

    // Common Formats
    const formats = [
        "yyyy-MM-dd",
        "dd/MM/yyyy",
        "dd-MM-yyyy",
        "d/M/yyyy",
        "yyyy/MM/dd",
        "dd.MM.yyyy",
        "MM/dd/yyyy", // US fallback
    ];

    for (const fmt of formats) {
        const d = parse(cleaned, fmt, new Date());
        if (isValid(d)) {
            const year = d.getFullYear();
            if (year < 2000 || year > 2100) continue;
            return startOfDay(d);
        }
    }

    const native = new Date(cleaned);
    if (isValid(native) && native.getFullYear() > 2000) {
        return startOfDay(native);
    }

    return null;
}

/**
 * Amount Parsing Logic
 */
function parseAmount(raw: string): number {
    if (!raw) return NaN;
    // Remove currency symbols and whitespace
    let clean = raw.replace(/[€$£\s]/g, "");

    // Parenthesis for negative: (50.00) -> -50.00
    const isNegativeParenthesis = /^\(.*\)$/.test(clean);
    if (isNegativeParenthesis) {
        clean = clean.replace(/[()]/g, "");
    }

    const lastComma = clean.lastIndexOf(",");
    const lastDot = clean.lastIndexOf(".");

    let value: number;

    if (lastComma > -1 && lastDot > -1) {
        if (lastComma > lastDot) {
            clean = clean.replace(/\./g, "").replace(",", ".");
        } else {
            clean = clean.replace(/,/g, "");
        }
    } else if (lastComma > -1) {
        clean = clean.replace(",", ".");
    }

    value = parseFloat(clean);

    if (isNegativeParenthesis) value = -Math.abs(value);

    return Math.round(value * 100);
}

/**
 * Description Cleaning
 */
function normalizeDescription(raw: string): string {
    return raw
        .trim()
        .replace(/\s+/g, " ")
        .replace(/[\x00-\x1F\x7F-\x9F]/g, "");
}
