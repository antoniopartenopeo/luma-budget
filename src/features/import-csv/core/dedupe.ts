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

    // 2. Amount Check
    // tx usually has amount string or cents? 
    // Transaction type: amountCents (number)
    const txCents = tx.amountCents;
    // Note: tx.amountCents is signed. row.amountCents is signed.
    // "Same absolute amount" says spec.
    // Actually, usually income matches income.
    // But let's follow spec: "Same absolute amount".
    // If signs differ, is it a match? Usually no. (Refund vs Purchase)

    if (row.amountCents === txCents) {
        score += SCORING.EXACT_AMOUNT;
    } else if (Math.abs(row.amountCents - txCents) < Math.abs(row.amountCents) * 0.01) {
        // Within 1%
        score += SCORING.AMOUNT_TOLERANCE;
    } else {
        // If amount completely different, very unlikely
        return 0; // Optimization: amount mismatch = no duplicate usually
    }

    // 3. Merchant Check
    const txMerchantKey = extractMerchantKey(tx.description);
    if (rowMerchantKey && txMerchantKey && rowMerchantKey === txMerchantKey) {
        score += SCORING.MERCHANT_MATCH;
    }

    // 4. Description Similarity (Levenshtein or simple inclusion)
    // Simple check: do they share significant words?
    // Let's use simple string inclusion for now or simple intersection
    // Spec says "> 80% similarity", let's be simpler for MVP logic without heavier lib
    if (row.description === tx.description) {
        score += SCORING.DESC_SIMILARITY;
    }

    return score;
}

export function detectDuplicates(
    parsedRows: ParsedRow[],
    existingTransactions: Transaction[]
): EnrichedRow[] {
    // Optimization: index existing transactions by amount?
    // For small datasets O(N*M) is fine. For larger, map by amount for O(1) lookup.
    const txsByAmount = new Map<number, Transaction[]>();
    for (const tx of existingTransactions) {
        const amt = tx.amountCents;
        if (!txsByAmount.has(amt)) txsByAmount.set(amt, []);
        txsByAmount.get(amt)!.push(tx);
    }

    return parsedRows.map(row => {
        let bestScore = 0;
        let bestMatchId: string | undefined = undefined;
        const rowMerchantKey = extractMerchantKey(row.description);

        // Candidates: only look at transactions with same amount +/- 5% to limit search space?
        // Or just all?
        // With hash map, looking up EXACT amount is fast.
        // What if fuzzy amount?
        // Let's iterate all for correctness as per strict spec, or optimize slightly.
        // Iterating all might be slow if 10k transactions.
        // Let's filter by date range first (±5 days)

        // Simplest robust approach: Filter candidates by date window (±3 days)
        const candidates = existingTransactions.filter(tx => {
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

        let status: DuplicateStatus = "unique";
        if (bestScore >= SCORE_THRESHOLDS.CONFIRMED) {
            status = "confirmed";
        } else if (bestScore >= SCORE_THRESHOLDS.SUSPECTED) {
            status = "suspected";
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
