/**
 * Merchant Key Extraction Pipeline
 * 
 * 8-step pipeline for extracting normalized merchant keys from transaction descriptions.
 * Designed to be O(n) per row.
 * 
 * Steps:
 * 1. NORMALIZE - Uppercase, basic cleanup
 * 2. PREFIX STRIP - Remove common bank prefixes
 * 3. PATTERN CLEAN - Remove dates, IDs, cards, noise
 * 4. SUB-MERCHANT EXTRACT - Handle marketplaces (Amazon, PayPal, etc.)
 * 5. BRAND DICTIONARY (early) - Exact match → return canonical
 * 6. TOKEN SCORE - Score and select best tokens
 * 7. BRAND DICTIONARY (final) - Match assembled key
 * 8. FALLBACK - First 2 tokens or "ALTRO"
 */

import { BRAND_DICT } from "./brand-dict";
import { normalize, stripPrefixes, cleanNoise, tokenize, filterStopwords } from "./normalizers";
import { extractSubMerchant } from "./sub-merchant";
import { getTopTokens, SCORING_BLACKLIST } from "./token-scorer";

/**
 * Main pipeline function
 * Extracts a normalized merchant key from a transaction description
 */
export function extractMerchantKey(description: string): string {
    if (!description || description.trim().length === 0) {
        return "ALTRO";
    }

    // Step 1: Normalize
    let text = normalize(description);

    // Step 2: Strip prefixes
    text = stripPrefixes(text);

    // Step 3: Clean noise patterns (v2.1 includes location cleanup)
    text = cleanNoise(text);

    if (text.length === 0) {
        return "ALTRO";
    }

    // Step 4: Sub-merchant extraction for marketplaces
    // v2.1: extractSubMerchant now scans first 3 tokens and removes bridge tokens
    const { marketplace, subMerchant } = extractSubMerchant(text);

    if (subMerchant) {
        // v2.1: Sub-merchant takes priority. Check if it's a known brand first.
        const subTokens = tokenize(subMerchant);
        if (subTokens.length > 0) {
            // Check for bigram or single token brand match
            const subKey = subTokens.slice(0, 2).join(" ");
            if (BRAND_DICT[subKey]) return BRAND_DICT[subKey];
            if (BRAND_DICT[subTokens[0]]) return BRAND_DICT[subTokens[0]];

            // v2.1 refinement: If sub-merchant is generic or blacklisted, prefer marketplace
            const isGeneric = SCORING_BLACKLIST.has(subTokens[0]) || ["CASHIER", "SELLER", "RETAIL"].includes(subTokens[0]);
            if (!isGeneric && subTokens[0].length >= 3) {
                // Return capitalized label
                return subTokens.slice(0, 2).join(" ");
            }
        }
        // Fallback to marketplace if sub-merchant is too short/generic
        return marketplace || "ALTRO";
    }

    if (marketplace) {
        return marketplace;
    }

    // Step 5: Early brand dictionary match (Token-aware)
    // We use raw tokens here to allow matching brands that include "stopwords"
    const rawTokens = tokenize(text);
    if (rawTokens.length === 0) return "ALTRO";

    // Trigram check (3 words) - v2.1 added for "RISTORANTE DA GINO"
    for (let i = 0; i < rawTokens.length - 2; i++) {
        const trigram = `${rawTokens[i]} ${rawTokens[i + 1]} ${rawTokens[i + 2]}`;
        if (BRAND_DICT[trigram]) return BRAND_DICT[trigram];
    }

    // Bigram check (2 words)
    for (let i = 0; i < rawTokens.length - 1; i++) {
        const bigram = `${rawTokens[i]} ${rawTokens[i + 1]}`;
        if (BRAND_DICT[bigram]) return BRAND_DICT[bigram];
    }

    // Single token check
    for (const token of rawTokens) {
        if (BRAND_DICT[token]) return BRAND_DICT[token];
    }

    // Step 6: Token scoring (v2.1 includes blacklist + tie-break)
    const topTokens = getTopTokens(rawTokens, 2);
    const assembledKey = topTokens.join(" ");

    // Step 7: Final brand dictionary check
    if (BRAND_DICT[assembledKey]) {
        return BRAND_DICT[assembledKey];
    }

    // Step 8: Fallback
    if (assembledKey) return assembledKey;

    // If assembledKey is empty, find first non-blacklisted raw token
    const safeFallback = rawTokens.find(t => !SCORING_BLACKLIST.has(t));
    return safeFallback || "ALTRO";
}

// Re-export for backward compatibility
export { BRAND_DICT } from "./brand-dict";
