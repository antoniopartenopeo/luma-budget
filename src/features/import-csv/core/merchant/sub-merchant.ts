/**
 * Sub-merchant extraction for marketplace transactions
 * Step 4 of the pipeline
 */

import { MARKETPLACE_PREFIXES, SUB_MERCHANT_SEPARATORS } from "./brand-dict";

export interface SubMerchantResult {
    marketplace: string | null;
    subMerchant: string | null;
}

/**
 * Extract sub-merchant from marketplace transactions
 * e.g., "PAYPAL *NETFLIX" -> { marketplace: "PAYPAL", subMerchant: "NETFLIX" }
 * e.g., "AMAZON MARKETPLACE ACME CORP" -> { marketplace: "AMAZON", subMerchant: "ACME CORP" }
 */
export function extractSubMerchant(normalizedText: string): SubMerchantResult {
    // Check if it starts with a known marketplace
    const matchedPrefix = MARKETPLACE_PREFIXES.find(prefix =>
        normalizedText.startsWith(prefix + " ") || normalizedText.startsWith(prefix + "*")
    );

    if (!matchedPrefix) {
        return { marketplace: null, subMerchant: null };
    }

    // Find separator and extract sub-merchant
    let remaining = normalizedText.substring(matchedPrefix.length).trim();

    for (const separator of SUB_MERCHANT_SEPARATORS) {
        const sepIndex = remaining.indexOf(separator);
        if (sepIndex !== -1) {
            // If separator is at start, take what's after it
            if (sepIndex === 0) {
                remaining = remaining.substring(separator.length).trim();
            } else {
                // Take what's before separator as context, after as sub-merchant
                remaining = remaining.substring(sepIndex + separator.length).trim();
            }
            break;
        }
    }

    // Clean up remaining
    remaining = remaining.replace(/^\*+/, "").trim();

    if (remaining.length < 3) {
        // No meaningful sub-merchant found
        return { marketplace: matchedPrefix, subMerchant: null };
    }

    return { marketplace: matchedPrefix, subMerchant: remaining };
}
