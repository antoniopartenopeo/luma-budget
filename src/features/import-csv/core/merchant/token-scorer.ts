import { BRAND_DICT } from "./brand-dict";

export interface ScoredToken {
    token: string;
    score: number;
    originalIndex: number;
}

// Tokens that should never be selected as merchant keys
export const SCORING_BLACKLIST = new Set([
    "PAGAMENTO", "TRANSAZIONE", "OPERAZIONE", "CARTA", "BANCOMAT",
    "MOVIMENTO", "ACQUISTO", "PRELIEVO", "AUTORIZZAZIONE", "COMMISSIONE",
    "GIROCONTO", "DISPOSIZIONE", "SEPA", "ATM", "POS",
    // SEPA/bank boilerplate tokens
    "DD", "SDD", "MANDATO", "FATTURA", "INCASSO", "NR", "N", "CARICO", "VOSTRO"
]);

// Known brand fragments for partial matching
const BRAND_FRAGMENTS = new Set(
    Object.values(BRAND_DICT).flatMap(brand =>
        brand.split(" ").filter(t => t.length > 2)
    )
);

// Tokens that act as "glue" between words and shouldn't be heavily penalized
const GLUE_WORDS = new Set(["DA", "DI", "DE", "DEL", "DELLA", "DELLE", "AND", "WITH", "FOR"]);

/**
 * Score tokens by relevance
 * v2.1: Blacklist + Bigram check + Tie-break + Glue words
 */
export function scoreTokens(tokens: string[]): ScoredToken[] {
    const scored: ScoredToken[] = tokens.map((token, index) => {
        let score = 0;

        // 0. Blacklist check
        if (SCORING_BLACKLIST.has(token)) {
            return { token, score: -1000, originalIndex: index };
        }

        // 1. Position score (first token = 100, decreasing)
        score += Math.max(0, 100 - index * 20);

        // 2. Length score (longer = better, capped)
        score += Math.min(token.length * 5, 50);

        // 3. Brand fragment match (big bonus)
        if (BRAND_FRAGMENTS.has(token)) {
            score += 200;
        }

        // 4. Bigram check: does this + next token form a brand?
        if (index < tokens.length - 1) {
            const bigram = `${token} ${tokens[index + 1]}`;
            if (BRAND_DICT[bigram]) {
                score += 300; // Super bonus for bigram match
            }
        }
        // Bigram check: does prev + this token form a brand?
        if (index > 0) {
            const bigram = `${tokens[index - 1]} ${token}`;
            if (BRAND_DICT[bigram]) {
                score += 300;
            }
        }

        // 5. Partial brand match
        for (const fragment of BRAND_FRAGMENTS) {
            if (token.includes(fragment) || fragment.includes(token)) {
                score += 50;
                break;
            }
        }

        // 6. Penalties
        if (/^\d+$/.test(token)) score -= 1000;

        // v2.1 refinement: Glue words are neutral but don't get the heavy noise penalty
        // Regular short tokens (noise) get a heavy penalty
        if (token.length <= 2) {
            if (token.length === 1) {
                score -= 200;
            } else if (GLUE_WORDS.has(token)) {
                score -= 30; // Small penalty to break ties in favor of non-glue words
            } else {
                score -= 100;
            }
        }

        return { token, score, originalIndex: index };
    });

    return scored;
}

/**
 * Get top N tokens by score
 * v2.1: Deterministic tie-break
 */
export function getTopTokens(tokens: string[], count: number = 2): string[] {
    return getTopTokenCandidates(tokens, count).map(t => t.token);
}

export function getTopTokenCandidates(tokens: string[], count: number = 2): ScoredToken[] {
    const scored = scoreTokens(tokens);

    return scored
        .filter(t => t.score > -50) // Exclude blacklisted (score threshold)
        .filter(t => !/^\d+$/.test(t.token)) // Explicitly exclude pure numbers (safety net)
        .sort((a, b) => {
            // Primary: Score
            if (b.score !== a.score) return b.score - a.score;
            // Tie-break: Original position (earlier wins)
            return a.originalIndex - b.originalIndex;
        })
        .slice(0, count)
        .sort((a, b) => a.originalIndex - b.originalIndex); // Back to natural order
}
