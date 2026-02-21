/**
 * Merchant Key Extraction Pipeline v3
 * 
 * Deterministic pipeline separating Payment Rails from Merchant Identity.
 */

import { BRAND_DICT } from "./brand-dict";
import { normalize, cleanNoise, tokenize, stripPositionalNoise, stripPrefixes } from "./normalizers";
import { extractSubMerchantFromRemainder } from "./sub-merchant";
import { getTopTokenCandidates, SCORING_BLACKLIST } from "./token-scorer";
import { extractPaymentRail, MARKETPLACE_RAILS } from "./payment-rails";
import { getOverride } from "./overrides";
import { fuzzyMatch } from "./fuzzy-matcher";

const SEPA_CREDITOR_STOPWORDS = new Set([
    ...SCORING_BLACKLIST,
    "IT",
    "IBAN",
    "BANCA",
    "BANK",
    "S",
    "P",
    "A",
    "SPA",
    "SRL",
    "SRLS",
    "DA",
    "PER",
    "DEL",
    "DELLA",
    "DEI",
    "DELLE",
    "A",
]);

const SEPA_TAIL_PATTERNS = [
    /\bA\s+FAVORE\s+DI\b\s+(.+)$/,
    /\bBENEFICIARIO\b\s+(.+)$/,
    /\bDA\b\s+(.+)$/,
];

function resolveBrandFromTokens(tokens: string[]): string | null {
    if (tokens.length === 0) return null;

    for (let i = 0; i < tokens.length - 2; i++) {
        const trigram = `${tokens[i]} ${tokens[i + 1]} ${tokens[i + 2]}`;
        if (BRAND_DICT[trigram]) return BRAND_DICT[trigram];
    }

    for (let i = 0; i < tokens.length - 1; i++) {
        const bigram = `${tokens[i]} ${tokens[i + 1]}`;
        if (BRAND_DICT[bigram]) return BRAND_DICT[bigram];
    }

    for (const token of tokens) {
        if (BRAND_DICT[token]) return BRAND_DICT[token];
    }

    return null;
}

function isSepaReferenceToken(token: string): boolean {
    if (/^IT\d{6,}$/.test(token)) return true; // IBAN fragments
    if (/^[A-Z]{2,}\d{4,}$/.test(token)) return true; // compact references (e.g. SICURA0000123)

    const digits = (token.match(/\d/g) || []).length;
    if (digits >= 4) return true;

    return false;
}

function tokenizeSepaSegment(segment: string): string[] {
    return tokenize(segment)
        .flatMap((token) => token.split(/[^A-Z0-9]+/).filter(Boolean))
        .filter((token) =>
            token.length >= 2 &&
            !SEPA_CREDITOR_STOPWORDS.has(token) &&
            !/^\d+$/.test(token) &&
            !isSepaReferenceToken(token)
        );
}

/**
 * Tries to extract creditor/merchant from SEPA direct debit descriptions.
 * Example:
 * "ADDEBITO SEPA ... SDD DA IT... FINDOMESTIC BANCA S.P.A. MANDATO NR..."
 */
function extractSepaCreditorCandidate(text: string): string | null {
    if (!/\b(SEPA|SDD|MANDATO|INCASSO|FATTURA)\b/.test(text)) return null;

    // Fast path: if a known merchant already exists in the SEPA string, use it directly.
    const globalTokens = tokenizeSepaSegment(text);
    const globalBrandMatch = resolveBrandFromTokens(globalTokens);
    if (globalBrandMatch) return globalBrandMatch;

    let tail: string | null = null;
    for (const pattern of SEPA_TAIL_PATTERNS) {
        const match = text.match(pattern);
        if (match?.[1]) {
            tail = match[1].trim();
            break;
        }
    }

    if (!tail) return null;

    const cleanedTail = tail
        .split(/\bMANDATO\b|\bNR\b|\bN\b/)[0]
        .trim();

    if (!cleanedTail) return null;

    const tokens = tokenizeSepaSegment(cleanedTail);

    if (tokens.length === 0) return null;

    const tailBrandMatch = resolveBrandFromTokens(tokens);
    if (tailBrandMatch) return tailBrandMatch;

    // Fallback: first meaningful token after SEPA creditor segment.
    return tokens[0];
}

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
    const isMarketplaceRail = !!paymentRail && MARKETPLACE_RAILS.includes(paymentRail);

    // Step 2: Strip prefixes (explicitly)
    // Helps with "Op.", "Disposizione", etc that might not be in Payment Rails
    let text = stripPrefixes(railFreeText);

    // Step 3: Clean remaining text
    // - Remove noise (dates, IDs, etc)
    // - Remove positional noise (Cities, Countries at end)
    text = cleanNoise(text);
    text = stripPositionalNoise(text);
    // Clean any remaining asterisks at start/end
    text = text.replace(/^\*+|\*+$/g, "").trim();

    const sepaCreditor = extractSepaCreditorCandidate(text);
    if (sepaCreditor) return sepaCreditor;

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
            // But ensure it's not generic noise. This avoids outputs like "DD PER FATTURA".
            const meaningfulTokens = subTokens.filter((token) =>
                token.length >= 2 &&
                !SCORING_BLACKLIST.has(token) &&
                !/^\d+$/.test(token)
            );
            if ((primary || !paymentRail || isMarketplaceRail) && meaningfulTokens.length > 0) {
                // v3 assumption: if we have a clear sub-merchant structure using separators or bridge tokens,
                // we trust it more. Return up to 3 tokens to capture "BAR DA GINO".
                candidateKey = meaningfulTokens.slice(0, 3).join(" ");
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
    // Unigram (including split variants for hyphenated/noisy tokens)
    const expandedTokens = Array.from(
        new Set(tokens.flatMap((token) => token.split(/[^A-Z0-9]+/).filter(Boolean)))
    );
    for (const token of expandedTokens) {
        if (BRAND_DICT[token]) return BRAND_DICT[token];
    }

    // 5b: Fuzzy Match (NEW - for typos/variations)
    // Try to find approximate match in brand dictionary
    const brandKeys = Object.keys(BRAND_DICT);
    for (const token of expandedTokens) {
        if (token.length >= 4) { // Only fuzzy match tokens with 4+ chars
            const fuzzyResult = fuzzyMatch(token, brandKeys, { threshold: 0.85 });
            if (fuzzyResult) return BRAND_DICT[fuzzyResult];
        }
    }
    // Also try the assembled text
    if (text.length >= 5) {
        const fuzzyResult = fuzzyMatch(text, brandKeys, { threshold: 0.85 });
        if (fuzzyResult) return BRAND_DICT[fuzzyResult];
    }

    // 5c. Scoring (Winner takes all)
    // If no direct or fuzzy match, ask the scorer for the best candidates
    const topCandidates = getTopTokenCandidates(tokens, 2);
    const topTokens = topCandidates.map((candidate) => candidate.token);
    const bestScore = topCandidates[0]?.score ?? -Infinity;

    if (topTokens.length > 0) {
        // Low-confidence fallback: prefer unresolved over noisy pseudo-merchants.
        if (bestScore < 140 && !isMarketplaceRail) {
            return paymentRail ? "UNRESOLVED" : "ALTRO";
        }

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
