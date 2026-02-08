import { CreateTransactionDTO } from "../../transactions/api/types";

// =====================
// 1. Raw & Parsed
// =====================

export interface RawRow {
    lineNumber: number;
    raw: Record<string, string>;
}

export interface ParsedRow {
    lineNumber: number;
    date: string; // ISO YYYY-MM-DD
    timestamp: number; // Unix epoch
    amountCents: number; // Signed integer
    description: string; // Cleaned
    originalDescription: string;
    rawRow: Record<string, string>;
}

// =====================
// 2. Enriched & Deduplication
// =====================

export type DuplicateStatus = "unique" | "suspected" | "confirmed";

export interface EnrichedRow extends ParsedRow {
    id: string; // UUID
    duplicateStatus: DuplicateStatus;
    duplicateOf?: string; // ID of existing transaction
    merchantKey: string;
    suggestedCategoryId: string | null;
    suggestedCategorySource: "history" | "pattern" | null;
    isSelected: boolean;
}

// =====================
// 3. Grouping
// =====================

export interface Subgroup {
    id: string;
    label: string;
    rowIds: string[]; // references to EnrichedRow.id
    categoryId: string | null;
    categoryLocked: boolean;
}

export interface Group {
    id: string;
    merchantKey: string;
    label: string;
    rowCount: number;
    totalCents: number;
    dateRange: { from: string; to: string };
    subgroups: Subgroup[];
    categoryId: string | null; // override at group level
    categoryLocked: boolean;
}

// =====================
// 4. Overrides
// =====================

export type OverrideLevel = "row" | "subgroup" | "group";

export interface Override {
    targetId: string;
    level: OverrideLevel;
    categoryId: string;
}

// =====================
// 5. Output
// =====================

export interface ImportPayload {
    importId: string;
    timestamp: number;
    transactions: CreateTransactionDTO[];
}

// =====================
// Errors & Diagnostics
// =====================

export interface ParseError {
    lineNumber: number;
    message: string;
    raw?: string;
}

export interface ImportSummary {
    totalRows: number;
    selectedRows: number;
    duplicatesSkipped: number;
    totalIncomeCents: number;
    totalExpenseCents: number;
    categoryBreakdown: Record<string, number>;
    dateRange: { from: string; to: string };
    parseErrors: ParseError[];
}

export interface ImportState {
    rows: EnrichedRow[];
    groups: Group[];
    summary: ImportSummary;
    errors: ParseError[];
}
