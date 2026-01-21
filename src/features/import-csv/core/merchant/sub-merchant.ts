import { MARKETPLACE_PREFIXES, SUB_MERCHANT_SEPARATORS, BRIDGE_TOKENS } from "./brand-dict";
import { stripPrefixes, tokenize } from "./normalizers";

export interface SubMerchantResult {
    marketplace: string | null;
    subMerchant: string | null;
}

/**
 * Extract sub-merchant from marketplace transactions
 * v2.1: Scans first 3 tokens for marketplace, handles more separators, removes bridge tokens
 */
export function extractSubMerchant(normalizedText: string): SubMerchantResult {
    // 1. Clean up bank prefixes first (redundant if already done in pipeline, but safe)
    const text = stripPrefixes(normalizedText);
    const tokens = tokenize(text);
    if (tokens.length === 0) return { marketplace: null, subMerchant: null };

    // 2. Scan first 3 tokens for marketplace prefix
    let marketplace: string | null = null;
    let marketplaceIndex = -1;

    for (let i = 0; i < Math.min(tokens.length, 3); i++) {
        if (MARKETPLACE_PREFIXES.includes(tokens[i])) {
            marketplace = tokens[i];
            marketplaceIndex = i;
            break;
        }
    }

    if (!marketplace) {
        return { marketplace: null, subMerchant: null };
    }

    // 3. Find sub-merchant after marketplace
    // Re-assemble text starting from marketplace
    const afterMarketplace = text.substring(text.indexOf(marketplace) + marketplace.length).trim();
    if (!afterMarketplace) return { marketplace, subMerchant: null };

    // 4. Try separators
    let subMerchant: string | null = null;
    let bestSepIndex = Infinity;
    let usedSepLength = 0;

    for (const sep of SUB_MERCHANT_SEPARATORS) {
        const idx = afterMarketplace.indexOf(sep);
        if (idx !== -1 && idx < bestSepIndex) {
            bestSepIndex = idx;
            usedSepLength = sep.length;
        }
    }

    if (bestSepIndex !== Infinity) {
        subMerchant = afterMarketplace.substring(bestSepIndex + usedSepLength).trim();
    } else {
        // Fallback: just take everything after marketplace if it's not too long/noisy
        subMerchant = afterMarketplace;
    }

    // 5. Clean sub-merchant from bridge tokens and leading symbols
    if (subMerchant) {
        // Remove leading symbols
        subMerchant = subMerchant.replace(/^[^A-Z0-9]+/, "").trim();

        // Tokenize sub-merchant and filter bridge tokens
        const subTokens = tokenize(subMerchant);
        const cleanedSubTokens = subTokens.filter(t => !BRIDGE_TOKENS.includes(t));

        if (cleanedSubTokens.length > 0) {
            subMerchant = cleanedSubTokens.join(" ");
        } else {
            subMerchant = null;
        }
    }

    return { marketplace, subMerchant };
}
