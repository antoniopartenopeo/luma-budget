import { EnrichedRow } from "./types";
import { Transaction } from "../../transactions/api/types";
import { extractMerchantKey } from "./merchant/pipeline";
import { CATEGORY_ENRICHMENT_RULES } from "@/domain/categories";
import { brainCategorizer } from "@/brain/categorizer";

// Use centralized rules from domain
const PATTERN_RULES = CATEGORY_ENRICHMENT_RULES;

/**
 * Main enrichment function
 * 
 * Flow:
 * 1. Build an exact History map (fast lookup).
 * 2. Feed the History to the BrainCategorizer (bulk training).
 * 3. Assign categories prioritizing: History -> Brain AI -> Static Patterns.
 */
export function enrichRows(
    rows: EnrichedRow[],
    existingTransactions: Transaction[]
): EnrichedRow[] {
    // 1. Build history map from existing transactions
    const history = new Map<string, string>();

    for (const t of existingTransactions) {
        if (t.categoryId) {
            const key = extractMerchantKey(t.description);
            if (key && key !== "ALTRO") {
                history.set(key, t.categoryId);
            }
        }
    }

    // 2. Wake up the Brain Categorizer and give it the DB snapshot
    // It will securely auto-train on background if not initialized
    brainCategorizer.initialize();
    brainCategorizer.trainBatch(existingTransactions);

    return rows.map(row => {
        const key = extractMerchantKey(row.description);

        let suggestedId: string | null = null;
        let suggestedSource: "history" | "pattern" | "ai" | null = null;

        // Step 1: Immutable Strict History Priority
        if (history.has(key)) {
            suggestedId = history.get(key)!;
            suggestedSource = "history";
        } else {
            // Step 2: The Brain ML Predictive Lobo
            // We pass the raw original description so the Brain can NLP tokenize it fully
            const aiPrediction = brainCategorizer.predict(row.description);

            // Artificial safe threshold: If the ML is > 65% sure, we trust it over static rules.
            if (aiPrediction.categoryId && aiPrediction.confidence >= 0.65) {
                suggestedId = aiPrediction.categoryId;
                suggestedSource = "ai";
            } else {
                // Step 3: Weak AI confidence. Fallback to hard-coded static Pattern Rules.
                const lowerKey = key.toLowerCase();
                for (const [keywords, catId] of PATTERN_RULES) {
                    if (keywords.some(k => lowerKey.includes(k))) {
                        suggestedId = catId;
                        suggestedSource = "pattern";
                        break;
                    }
                }
            }
        }

        return {
            ...row,
            merchantKey: key,
            suggestedCategoryId: suggestedId,
            suggestedCategorySource: suggestedSource
        };
    });
}

// Re-export for direct usage if needed
export { extractMerchantKey } from "./merchant/pipeline";
