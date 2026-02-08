import { Group, ImportPayload, Override, EnrichedRow } from "./types";
import { CreateTransactionDTO } from "../../transactions/api/types";
import { resolveCategory } from "./overrides";
import { getCategoryById, Category } from "../../categories/config";
import { CategoryIds } from "@/domain/categories";

export function buildImportPayload(
    groups: Group[],
    rowsById: Map<string, EnrichedRow>,
    overrides: Override[],
    categories: Category[]
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
                    categoryId = CategoryIds.ALTRO_SUPERFLUO;
                }

                // Validation helper
                const categoryDef = getCategoryById(categoryId, categories);
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
                let source: "manual" | "ruleBased" | "ai" = "ruleBased";

                if (overrides.some(o => o.targetId === row.id || o.targetId === subgroup.id || o.targetId === group.id)) {
                    source = "manual";
                } else if (group.categoryLocked || subgroup.categoryLocked) {
                    source = "manual";
                } else if (categoryId !== row.suggestedCategoryId) {
                    // Implicit override
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
