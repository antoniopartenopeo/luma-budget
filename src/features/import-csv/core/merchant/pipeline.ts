/**
 * Merchant Key Extraction Pipeline v3
 * 
 * Deterministic pipeline separating Payment Rails from Merchant Identity.
 */

import { BRAND_DICT } from "./brand-dict";
import { normalize, cleanNoise, tokenize, stripPositionalNoise, stripPrefixes } from "./normalizers";
import { extractSubMerchantFromRemainder } from "./sub-merchant";
import { getTopTokens, SCORING_BLACKLIST } from "./token-scorer";
import { extractPaymentRail } from "./payment-rails";
import { getOverride } from "./overrides";

/**
 * Main pipeline function
 * Extracts a normalized merchant key from a transaction description
 */
export function extractMerchantKey(description: string): string {
    if (!description || description.trim().length === 0) {
        return "ALTRO";
    }

    // Step 1: Normalize
    const normalized = normalize(description);

    // Step 0: Overrides (Priority 1)
    const override = getOverride(normalized);
    if (override) {
        return override;
    }

    // Step 2: Extract Payment Rail
    // Critical: Rail is REMOVED from the text to avoid competition
    const { paymentRail, remainder: railFreeText } = extractPaymentRail(normalized);

    // Step 2: Strip prefixes (explicitly)
    // Helps with "Op.", "Disposizione", etc that might not be in Payment Rails
    let text = stripPrefixes(railFreeText);

    // Step 3: Clean remaining text
    // - Remove noise (dates, IDs, etc)
    // - Remove positional noise (Cities, Countries at end)
    text = cleanNoise(text);
    text = stripPositionalNoise(text);

    // If practically empty after cleaning (and stripping rail), evaluate fallback
    if (text.length < 2) {
        return paymentRail ? "UNRESOLVED" : "ALTRO";
    }

    // Step 4: Sub-Merchant / Explicit Extraction
    // Try to find a sub-merchant in the cleaned remainder
    const { subMerchant, primary } = extractSubMerchantFromRemainder(text);

    // Candidates to check against Brand Dictionary
    let candidateKey: string | null = null;

    // Check Primary first (Left side of separator, e.g. "FACEBOOK" in "FACEBOOK* ADS")
    if (primary && primary.length > 2) {
        if (BRAND_DICT[primary]) candidateKey = BRAND_DICT[primary];
        else {
            // Tokenize primary to see if it contains a brand
            const pTokens = tokenize(primary);
            for (const t of pTokens) {
                if (BRAND_DICT[t]) {
                    candidateKey = BRAND_DICT[t];
                    break;
                }
            }
        }
    }

    if (candidateKey) return candidateKey;

    if (subMerchant && subMerchant.length > 2) {
        // If we found a sub-merchant candidate, prioritize it
        // Check if it's a known brand
        const subTokens = tokenize(subMerchant);
        const subKey = subTokens.slice(0, 2).join(" ");

        if (BRAND_DICT[subMerchant]) candidateKey = BRAND_DICT[subMerchant];
        else if (BRAND_DICT[subKey]) candidateKey = BRAND_DICT[subKey];
        else if (BRAND_DICT[subTokens[0]]) candidateKey = BRAND_DICT[subTokens[0]];
        else {
            // If not in dict, use the extracted sub-merchant string directly
            // But ensure it's not generic noise
            const isGeneric = SCORING_BLACKLIST.has(subTokens[0]) || /^\d+$/.test(subTokens[0]);
            if (!isGeneric) {
                // v3 assumption: if we have a clear sub-merchant structure using separators or bridge tokens,
                // we trust it more. Return up to 3 tokens to capture "BAR DA GINO".
                candidateKey = subTokens.slice(0, 3).join(" ");
            }
        }
    }

    if (candidateKey) return candidateKey;

    // Step 5: Token Analysis & Scoring (on the cleaned text)
    const tokens = tokenize(text);
    if (tokens.length === 0) return paymentRail ? "UNRESOLVED" : "ALTRO";

    // 5a. Direct Brand Match (Trigram, Bigram, Unigram)
    // Trigram
    for (let i = 0; i < tokens.length - 2; i++) {
        const trigram = `${tokens[i]} ${tokens[i + 1]} ${tokens[i + 2]}`;
        if (BRAND_DICT[trigram]) return BRAND_DICT[trigram];
    }
    // Bigram
    for (let i = 0; i < tokens.length - 1; i++) {
        const bigram = `${tokens[i]} ${tokens[i + 1]}`;
        if (BRAND_DICT[bigram]) return BRAND_DICT[bigram];
    }
    // Unigram
    for (const token of tokens) {
        if (BRAND_DICT[token]) return BRAND_DICT[token];
    }

    // 5b. Scoring (Winner takes all)
    // If no direct match, ask the scorer for the best candidates
    const topTokens = getTopTokens(tokens, 2);

    if (topTokens.length > 0) {
        const assembledKey = topTokens.join(" ");

        // Final check if assembled key is in dict
        if (BRAND_DICT[assembledKey]) return BRAND_DICT[assembledKey];
        if (BRAND_DICT[topTokens[0]]) return BRAND_DICT[topTokens[0]];

        return assembledKey;
    }

    // Step 6: Final Fallback
    // If we have a Rail but no valid Merchant token => UNRESOLVED
    if (paymentRail) {
        return "UNRESOLVED";
    }

    return "ALTRO";
}

// Re-export for backward compatibility
export { BRAND_DICT } from "./brand-dict";

