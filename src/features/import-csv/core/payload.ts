import { Group, ImportPayload, Override, EnrichedRow } from "./types";
import { CreateTransactionDTO } from "../../transactions/api/types";
import { resolveCategory } from "./overrides";
import { CATEGORIES, getCategoryById } from "../../categories/config";

export function buildImportPayload(
    groups: Group[],
    rowsById: Map<string, EnrichedRow>,
    overrides: Override[]
): ImportPayload {
    const transactions: CreateTransactionDTO[] = [];
    const timestamp = Date.now();
    const importId = crypto.randomUUID();

    for (const group of groups) {
        for (const subgroup of group.subgroups) {
            for (const rowId of subgroup.rowIds) {
                const row = rowsById.get(rowId);
                if (!row) continue; // Should not happen

                if (!row.isSelected) continue; // Skip unselected/duplicates

                let categoryId = resolveCategory(row, subgroup, group, overrides);

                // Fallback for unassigned categories (as promised by UI)
                if (!categoryId) {
                    categoryId = "altro";
                }

                // Validation helper
                const categoryDef = getCategoryById(categoryId, CATEGORIES);
                if (!categoryDef) {
                    throw new Error(`Invalid category ID: ${categoryId}`);
                }

                // Validation I2: Non-zero amount
                if (row.amountCents === 0) {
                    throw new Error(`Row ${row.lineNumber} has 0 amount.`);
                }

                // Determine Type from Sign
                const type = row.amountCents > 0 ? "income" : "expense";

                // Is Superfluous?
                const isSuperfluous = categoryDef.spendingNature === "superfluous";

                // Classification Source
                // If override existed at ANY level, it's 'manual'. Else 'ruleBased'.
                // We need to re-check if override was used.
                // Simplification: if resolved !== suggested, then manual?
                // Or strictly check if override matched.
                // We'll trust logic: if `resolveCategory` hit an override or locked group, it's manual.
                // If it fell back to suggestion, it's ruleBased.
                let source: "manual" | "ruleBased" | "ai" = "ruleBased";

                if (overrides.some(o => o.targetId === row.id || o.targetId === subgroup.id || o.targetId === group.id)) {
                    source = "manual";
                } else if (group.categoryLocked || subgroup.categoryLocked) {
                    source = "manual";
                } else if (categoryId !== row.suggestedCategoryId) {
                    // Implicit override (should ideally use Override object)
                    source = "manual";
                }

                transactions.push({
                    description: row.description,
                    amountCents: Math.abs(row.amountCents), // Absolute value for DTO
                    type,
                    categoryId,
                    category: categoryDef.label,
                    date: row.date,
                    isSuperfluous,
                    classificationSource: source as "ruleBased" | "manual" | "ai",
                    // Note: we don't pass `importId` to DTO here because `CreateTransactionDTO` 
                    // might not have it, but the `ImportPayload` structure wraps it?
                    // The Spec says `ImportPayload` has `importId` and list of txs.
                    // The Import Service will likely attach importId to each tx when saving to DB.
                });
            }
        }
    }

    return {
        importId,
        timestamp,
        transactions
    };
}
