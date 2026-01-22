import { EnrichedRow } from "./types";
import { Transaction } from "../../transactions/api/types";
import { extractMerchantKey } from "./merchant/pipeline";
import { CategoryIds, CATEGORY_ENRICHMENT_RULES } from "@/domain/categories";

// Use centralized rules from domain
const PATTERN_RULES = CATEGORY_ENRICHMENT_RULES;

/**
 * Suggest category based on rules and history
 */
function suggestCategory(
    merchantKey: string,
    history: Map<string, string>
): { id: string | null; source: "history" | "pattern" | null } {
    // 1. History match
    if (history.has(merchantKey)) {
        return { id: history.get(merchantKey)!, source: "history" };
    }

    // 2. Pattern match
    const lowerKey = merchantKey.toLowerCase();
    for (const [keywords, catId] of PATTERN_RULES) {
        if (keywords.some(k => lowerKey.includes(k))) {
            return { id: catId, source: "pattern" };
        }
    }

    return { id: null, source: null };
}

/**
 * Main enrichment function
 */
export function enrichRows(
    rows: EnrichedRow[],
    existingTransactions: Transaction[]
): EnrichedRow[] {
    // Build history map from existing transactions
    const history = new Map<string, string>();

    for (const t of existingTransactions) {
        if (t.categoryId) {
            const key = extractMerchantKey(t.description);
            if (key && key !== "ALTRO") {
                history.set(key, t.categoryId);
            }
        }
    }

    return rows.map(row => {
        const key = extractMerchantKey(row.description);
        const suggestion = suggestCategory(key, history);

        return {
            ...row,
            merchantKey: key,
            suggestedCategoryId: suggestion.id,
            suggestedCategorySource: suggestion.source
        };
    });
}

// Re-export for direct usage if needed
export { extractMerchantKey } from "./merchant/pipeline";
