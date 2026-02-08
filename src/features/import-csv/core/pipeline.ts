import { Transaction } from "../../transactions/api/types";
import { parseCSV } from "./parse";
import { normalizeRows } from "./normalize";
import { detectDuplicates } from "./dedupe";
import { enrichRows } from "./enrich";
import { groupRowsByMerchant } from "./grouping";
import { buildImportPayload } from "./payload";
import { EnrichedRow, Group, ImportPayload, ImportSummary, Override, ParseError, ImportState } from "./types";
import { Category } from "../../categories/config";

/**
 * Stage 1: Process CSV to Interactive State
 */
export function processCSV(
    csvContent: string,
    existingTransactions: Transaction[]
): ImportState {
    // 1. Parse
    const parseResult = parseCSV(csvContent);
    // If parsing failed completely (no rows), return early
    if (parseResult.rows.length === 0 && parseResult.errors.length > 0) {
        // Return empty state with errors
        return {
            rows: [],
            groups: [],
            summary: emptySummary(),
            errors: parseResult.errors
        };
    }

    // 2. Normalize
    const { valid: parsedRows, errors: normalizeErrors } = normalizeRows(parseResult.rows);
    const allErrors = [...parseResult.errors, ...normalizeErrors];

    if (parsedRows.length === 0) {
        return {
            rows: [],
            groups: [],
            summary: emptySummary(),
            errors: allErrors
        };
    }

    // 3. Deduplicate
    const dedupedRows = detectDuplicates(parsedRows, existingTransactions);

    // 4. Enrich
    const enrichedRows = enrichRows(dedupedRows, existingTransactions);

    // 5. Group & Subgroup
    const groups = groupRowsByMerchant(enrichedRows);

    // 6. Summary
    const summary = computeImportSummary(enrichedRows, allErrors);

    return {
        rows: enrichedRows,
        groups,
        summary,
        errors: allErrors
    };
}

export function generatePayload(
    groups: Group[],
    rows: EnrichedRow[],
    overrides: Override[],
    categories: Category[]
): ImportPayload {
    const rowsMap = new Map(rows.map(r => [r.id, r]));
    return buildImportPayload(groups, rowsMap, overrides, categories);
}

// Helper: Summary
function computeImportSummary(rows: EnrichedRow[], errors: ParseError[]): ImportSummary {
    let selectedRows = 0;
    let duplicatesSkipped = 0;
    let totalIncome = 0;
    let totalExpense = 0;
    const cats: Record<string, number> = {};

    let minTime = Infinity;
    let maxTime = -Infinity;

    for (const r of rows) {
        if (r.timestamp < minTime) minTime = r.timestamp;
        if (r.timestamp > maxTime) maxTime = r.timestamp;

        if (!r.isSelected) {
            if (r.duplicateStatus !== 'unique') duplicatesSkipped++;
            continue;
        }

        selectedRows++;
        if (r.amountCents > 0) totalIncome += r.amountCents;
        else totalExpense += r.amountCents;

        // Note: At this stage (pre-override), we use suggested category for summary? 
        // Or just count unassigned?
        // Summary usually reflects "Current State". 
        const cat = r.suggestedCategoryId || "UNASSIGNED";
        cats[cat] = (cats[cat] || 0) + 1;
    }

    return {
        totalRows: rows.length,
        selectedRows,
        duplicatesSkipped,
        totalIncomeCents: totalIncome,
        totalExpenseCents: totalExpense,
        categoryBreakdown: cats,
        dateRange: {
            from: minTime !== Infinity ? new Date(minTime).toISOString() : "",
            to: maxTime !== -Infinity ? new Date(maxTime).toISOString() : ""
        },
        parseErrors: errors
    };
}

function emptySummary(): ImportSummary {
    return {
        totalRows: 0,
        selectedRows: 0,
        duplicatesSkipped: 0,
        totalIncomeCents: 0,
        totalExpenseCents: 0,
        categoryBreakdown: {},
        dateRange: { from: "", to: "" },
        parseErrors: []
    };
}
