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
import { getTopTokens } from "./token-scorer";

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

    // Step 3: Clean noise patterns
    text = cleanNoise(text);

    if (text.length === 0) {
        return "ALTRO";
    }

    // Step 4: Sub-merchant extraction for marketplaces
    const { marketplace, subMerchant } = extractSubMerchant(text);

    if (marketplace && subMerchant) {
        // For marketplaces with sub-merchants, combine them
        // e.g., "PAYPAL *NETFLIX" -> "NETFLIX" (sub-merchant takes priority for categorization)
        // Check if sub-merchant is a known brand
        const subTokens = filterStopwords(tokenize(subMerchant));
        const subKey = subTokens.slice(0, 2).join(" ");

        if (BRAND_DICT[subKey]) {
            return BRAND_DICT[subKey];
        }

        // Return sub-merchant if identifiable, otherwise marketplace
        if (subKey.length >= 3) {
            return subKey;
        }
        return marketplace;
    }

    if (marketplace && !subMerchant) {
        return marketplace;
    }

    // Step 5: Early brand dictionary match
    for (const [variant, canonical] of Object.entries(BRAND_DICT)) {
        if (text.includes(variant)) {
            return canonical;
        }
    }

    // Step 6: Token scoring
    const tokens = filterStopwords(tokenize(text));

    if (tokens.length === 0) {
        return "ALTRO";
    }

    const topTokens = getTopTokens(tokens, 2);
    const key = topTokens.join(" ");

    // Step 7: Final brand dictionary check
    if (BRAND_DICT[key]) {
        return BRAND_DICT[key];
    }

    // Step 8: Fallback
    return key || tokens[0] || "ALTRO";
}

// Re-export for backward compatibility
export { BRAND_DICT } from "./brand-dict";
