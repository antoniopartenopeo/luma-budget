import { EnrichedRow } from "./types";
import { Transaction } from "../../transactions/api/types";
import { CATEGORIES } from "../../categories/config";

// Keyword to Category mapping (hardcoded for now as per spec)
const PATTERN_RULES: Array<[string[], string]> = [
    [["netflix", "spotify", "disney", "youtube", "apple music"], "abbonamenti"],
    [["esselunga", "coop", "carrefour", "lidl", "conad", "unes", "aldi"], "cibo"],
    [["enel", "a2a", "iren", "hera", "sorgenia", "acea"], "utenze"],
    [["trenitalia", "italo", "flixbus", "uber", "taxi", "atm", "atac"], "trasporti"],
    [["amazon", "paypal"], "shopping"], // Generic...
    [["farmacia", "medico", "ospedale", "ticket"], "salute"],
    [["bar", "ristorante", "pizzeria", "mcdonald", "burger king"], "ristoranti"],
    [["distributore", "q8", "esso", "ip", "eni", "tamoil"], "auto"],
];

/**
 * Extracts a normalized Merchant Key from a description.
 */
export function extractMerchantKey(description: string): string {
    let normalized = description.toUpperCase();

    // 1. Remove common prefixes
    const prefixes = ["POS ", "PAGAMENTO ", "BONIFICO ", "ADDEBITO ", "ACQUISTO ", "OP. "];
    for (const p of prefixes) {
        if (normalized.startsWith(p)) normalized = normalized.substring(p.length);
    }

    // 2. Remove date patterns and random digits
    normalized = normalized
        .replace(/\d{2}[\/\-]\d{2}[\/\-]\d{2,4}/g, "") // Dates
        .replace(/\d{10,}/g, "") // Long IDs
        .replace(/[\*X]{4,}\d+/g, ""); // Masked cards

    // 3. Trim and clean
    normalized = normalized.trim();

    // 4. Extract first 2-3 significant words?
    // Current logic: take first 2 words if > 3 chars, else take more
    // Simple heuristic: Take first 3 words
    const words = normalized.split(/\s+/).filter(w => w.length > 1);
    return words.slice(0, 3).join(" ");
}

/**
 * Suggest category based on rules and history
 */
function suggestCategory(
    merchantKey: string,
    history: Map<string, string> // merchantKey -> categoryId
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
    // Build history map from existing transactions?
    // Ideally, we'd pass a dedicated history object, but we can derive it from existing txs
    // strictly speaking existing txs might not have "merchantKey" stored, so we re-derive it.

    const history = new Map<string, string>();

    // Build history (last win semantics or frequency? Spec says 'History Match')
    // We'll trust the most recent or frequent? Let's use most recent for simplicity.
    // Actually, we should iterate all valid existing transactions.
    for (const t of existingTransactions) {
        if (t.categoryId) {
            const key = extractMerchantKey(t.description);
            if (key) history.set(key, t.categoryId);
        }
    }

    return rows.map(row => {
        // merchantKey might already be set by dedupe or we ensure it here?
        // In pipeline `enrichRows` is called after dedupe which returns EnrichedRow
        // The spec implementation of `dedupe` logic says it *uses* merchantKey.
        // So we assume `merchantKey` is already populated? 
        // Or we overwrite/ensure it here.
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
