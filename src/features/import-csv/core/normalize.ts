import { RawRow, ParsedRow, ParseError } from "./types";
import { parse, isValid, startOfDay, format } from "date-fns";
import { parseCurrencyToCents } from "@/domain/money";

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

        } catch (err: unknown) {
            errors.push({
                lineNumber: row.lineNumber,
                message: err instanceof Error ? err.message : String(err),
                raw: JSON.stringify(row.raw),
            });
        }
    }

    return { valid, errors };
}

/**
 * Date Parsing Logic
 * Supports European, Italian, German, and US date formats.
 */
function parseDate(raw: string): Date | null {
    if (!raw) return null;
    const cleaned = raw.trim();

    // Try 2-digit year conversion first
    const twoDigitYearDate = tryParseTwoDigitYear(cleaned);
    if (twoDigitYearDate) return twoDigitYearDate;

    // Common 4-digit year formats
    const formats = [
        "yyyy-MM-dd",       // ISO
        "dd/MM/yyyy",       // Italian, French
        "dd-MM-yyyy",       // European alternative
        "d/M/yyyy",         // Italian short
        "yyyy/MM/dd",       // Asian-style ISO
        "dd.MM.yyyy",       // German, Swiss
        "d.M.yyyy",         // German short
        "MM/dd/yyyy",       // US fallback
        "M/d/yyyy",         // US short
    ];

    for (const fmt of formats) {
        const d = parse(cleaned, fmt, new Date());
        if (isValid(d)) {
            const year = d.getFullYear();
            if (year < 2000 || year > 2100) continue;
            return startOfDay(d);
        }
    }

    // Native Date fallback for ISO strings like "2026-01-15T00:00:00"
    const native = new Date(cleaned);
    if (isValid(native) && native.getFullYear() > 2000) {
        return startOfDay(native);
    }

    return null;
}

/**
 * Try to parse dates with 2-digit years (e.g., 15/01/26, 15.01.26, 15-01-26)
 * European style: day first (DD/MM/YY, DD.MM.YY, DD-MM-YY)
 * Assumes years 00-50 are 2000s, 51-99 are 1900s (for financial data relevance)
 */
function tryParseTwoDigitYear(cleaned: string): Date | null {
    // 2-digit year formats - European style (day first only, to avoid ambiguity)
    const twoDigitFormats = [
        /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/,  // DD/MM/YY or D/M/YY
        /^(\d{1,2})\.(\d{1,2})\.(\d{2})$/,  // DD.MM.YY (German)
        /^(\d{1,2})-(\d{1,2})-(\d{2})$/,    // DD-MM-YY
    ];

    for (const pattern of twoDigitFormats) {
        const match = cleaned.match(pattern);
        if (match) {
            const day = parseInt(match[1], 10);
            const month = parseInt(match[2], 10);
            const year2 = parseInt(match[3], 10);

            // Convert 2-digit year to 4-digit
            // Financial data: 00-50 → 2000-2050, 51-99 → 1951-1999
            const year4 = year2 <= 50 ? 2000 + year2 : 1900 + year2;

            // Validate ranges
            if (month < 1 || month > 12) continue;
            if (day < 1 || day > 31) continue;
            if (year4 < 2000 || year4 > 2100) continue;

            const d = new Date(year4, month - 1, day);
            if (isValid(d) && d.getDate() === day) {
                return startOfDay(d);
            }
        }
    }

    return null;
}

/**
 * Amount Parsing Logic
 * Leverages the centralized domain parser for financial safety.
 */
function parseAmount(raw: string): number {
    if (!raw) return NaN;

    // Check for negative parentheses before passing to the general parser
    // as it is a specific CSV format not yet in the general domain parser
    const clean = raw.trim();
    const isNegativeParenthesis = /^\(.*\)$/.test(clean);

    let amountStr = clean;
    if (isNegativeParenthesis) {
        amountStr = clean.replace(/[()]/g, "");
    }

    const cents = parseCurrencyToCents(amountStr);

    // If it was in parentheses, ensure it's negative
    return isNegativeParenthesis ? -Math.abs(cents) : cents;
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
