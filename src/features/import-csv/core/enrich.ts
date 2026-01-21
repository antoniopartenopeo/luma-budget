import { EnrichedRow } from "./types";
import { Transaction } from "../../transactions/api/types";
import { extractMerchantKey } from "./merchant/pipeline";

// Keyword to Category mapping (hardcoded for now as per spec)
const PATTERN_RULES: Array<[string[], string]> = [
    [["netflix", "spotify", "disney", "youtube", "apple music", "prime video", "dazn"], "abbonamenti"],
    [["esselunga", "coop", "carrefour", "lidl", "conad", "unes", "aldi", "eurospin", "penny", "md"], "cibo"],
    [["enel", "a2a", "iren", "hera", "sorgenia", "acea", "eni gas"], "utenze"],
    [["trenitalia", "italo", "flixbus", "uber", "taxi", "atm", "atac", "metro", "bus"], "trasporti"],
    [["amazon", "paypal", "ebay", "zalando", "asos"], "shopping"],
    [["farmacia", "medico", "ospedale", "ticket", "sanitario"], "salute"],
    [["bar", "ristorante", "pizzeria", "mcdonald", "burger", "autogrill", "trattoria"], "ristoranti"],
    [["distributore", "q8", "esso", "ip", "eni", "tamoil", "benzina", "diesel", "carburante"], "auto"],
    [["palestra", "fitness", "gym", "sport"], "sport"],
    [["assicurazione", "polizza", "generali", "allianz", "unipol"], "assicurazioni"],
];

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
