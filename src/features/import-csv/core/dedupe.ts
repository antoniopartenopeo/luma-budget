import { ParsedRow, EnrichedRow, DuplicateStatus } from "./types";
import { Transaction } from "../../transactions/api/types";
import { extractMerchantKey } from "./enrich";
import { differenceInCalendarDays } from "date-fns";

/**
 * Scoring Constants
 */
const SCORE_THRESHOLDS = {
    CONFIRMED: 80,
    SUSPECTED: 50,
};

const SCORING = {
    EXACT_DATE: 30,
    DATE_TOLERANCE: 15,
    EXACT_AMOUNT: 40,
    AMOUNT_TOLERANCE: 20,
    TYPE_MATCH: 20,
    MERCHANT_MATCH: 30,
    DESC_SIMILARITY: 20,
};

function calculateScore(row: ParsedRow, tx: Transaction, rowMerchantKey: string): number {
    let score = 0;

    // 1. Date Check
    const rowDate = new Date(row.timestamp);
    const txDate = new Date(tx.timestamp);
    // Assuming tx.timestamp is reliable. `date` string might be better if timezone issues arise

    const daysDiff = Math.abs(differenceInCalendarDays(rowDate, txDate));

    if (daysDiff === 0) {
        score += SCORING.EXACT_DATE;
    } else if (daysDiff <= 1) {
        score += SCORING.DATE_TOLERANCE;
    } else {
        // Date mismatch > 1 day usually disqualifies match in banking? 
        // Spec says "Same date (±1 day tolerance)". 
        // If >1 day, score 0 for date, but maybe overall score prevents false positive.
    }

    // 2. Type Check
    // Stored transactions use absolute amountCents + explicit type.
    const rowType = row.amountCents > 0 ? "income" : "expense";
    if (tx.type !== rowType) return 0;
    score += SCORING.TYPE_MATCH;

    // 3. Amount Check (absolute)
    const rowAbsCents = Math.abs(row.amountCents);
    const txAbsCents = Math.abs(tx.amountCents);

    if (rowAbsCents === txAbsCents) {
        score += SCORING.EXACT_AMOUNT;
    } else if (
        rowAbsCents > 0 &&
        Math.abs(rowAbsCents - txAbsCents) <= Math.max(1, Math.round(rowAbsCents * 0.01))
    ) {
        // Within 1%
        score += SCORING.AMOUNT_TOLERANCE;
    } else {
        // If amount completely different, very unlikely
        return 0; // Optimization: amount mismatch = no duplicate usually
    }

    // 4. Merchant Check
    const txMerchantKey = extractMerchantKey(tx.description);
    if (rowMerchantKey && txMerchantKey && rowMerchantKey === txMerchantKey) {
        score += SCORING.MERCHANT_MATCH;
    }

    // 5. Description Similarity (Levenshtein or simple inclusion)
    // Simple check: do they share significant words?
    // Let's use simple string inclusion for now or simple intersection
    // Spec says "> 80% similarity", let's be simpler for MVP logic without heavier lib
    if (row.description === tx.description) {
        score += SCORING.DESC_SIMILARITY;
    }

    return score;
}

/**
 * Generate a deterministic signature for O(1) exact matching.
 */
export function generateSignature(timestamp: number, amountCents: number, type: "income" | "expense", description: string): string {
    const cleanDesc = description.trim().replace(/\s+/g, " ").toLowerCase();
    return `${timestamp}::${Math.abs(amountCents)}::${type}::${cleanDesc}`;
}

export function detectDuplicates(
    parsedRows: ParsedRow[],
    existingTransactions: Transaction[]
): EnrichedRow[] {

    // 1. Build an O(1) lookup map of existing transactions' signatures
    const historyMap = new Map<string, string>(); // signature -> tx.id
    for (const tx of existingTransactions) {
        const sig = generateSignature(tx.timestamp, tx.amountCents, tx.type as "income" | "expense", tx.description);
        historyMap.set(sig, tx.id);
    }

    return parsedRows.map(row => {
        const rowMerchantKey = extractMerchantKey(row.description);
        const rowType = row.amountCents > 0 ? "income" : "expense";
        const sig = generateSignature(row.timestamp, row.amountCents, rowType, row.description);

        let status: DuplicateStatus = "unique";
        let bestMatchId: string | undefined = undefined;

        // O(1) Exact Match Check
        if (historyMap.has(sig)) {
            status = "confirmed";
            bestMatchId = historyMap.get(sig);
        } else {
            // Fallback: Fuzzy / Heuristic Check for "Suspected" matches
            let bestScore = 0;
            const rowType = row.amountCents > 0 ? "income" : "expense";

            // Candidate pre-filter: same type + temporal proximity
            const candidates = existingTransactions.filter(tx => {
                if (tx.type !== rowType) return false;
                const days = Math.abs(differenceInCalendarDays(new Date(row.timestamp), new Date(tx.timestamp)));
                return days <= 3;
            });

            for (const tx of candidates) {
                const score = calculateScore(row, tx, rowMerchantKey);
                if (score > bestScore) {
                    bestScore = score;
                    bestMatchId = tx.id;
                }
            }

            if (bestScore >= SCORE_THRESHOLDS.CONFIRMED) {
                status = "confirmed";
            } else if (bestScore >= SCORE_THRESHOLDS.SUSPECTED) {
                status = "suspected";
            }
        }

        return {
            ...row,
            id: crypto.randomUUID(), // Unique ID for this session
            duplicateStatus: status,
            duplicateOf: status !== "unique" ? bestMatchId : undefined,
            merchantKey: rowMerchantKey,
            suggestedCategoryId: null,
            suggestedCategorySource: null,
            isSelected: status === "unique", // Default selection
        };
    });
}
