/**
 * Token scoring for merchant key extraction
 * Step 6 of the pipeline
 */

import { BRAND_DICT } from "./brand-dict";

interface ScoredToken {
    token: string;
    score: number;
}

// Known brand fragments for partial matching
const BRAND_FRAGMENTS = new Set(
    Object.values(BRAND_DICT).flatMap(brand =>
        brand.split(" ").filter(t => t.length > 3)
    )
);

/**
 * Score tokens by relevance for merchant identification
 * 
 * Scoring factors:
 * - Position: earlier tokens score higher
 * - Length: longer tokens score higher (more specific)
 * - Brand match: tokens matching known brands score highest
 */
export function scoreTokens(tokens: string[]): ScoredToken[] {
    return tokens.map((token, index) => {
        let score = 0;

        // Position score (first token = 100, decreasing)
        score += Math.max(0, 100 - index * 20);

        // Length score (longer = better, capped)
        score += Math.min(token.length * 5, 50);

        // Brand fragment match (big bonus)
        if (BRAND_FRAGMENTS.has(token)) {
            score += 200;
        }

        // Partial brand match
        for (const fragment of BRAND_FRAGMENTS) {
            if (token.includes(fragment) || fragment.includes(token)) {
                score += 50;
                break;
            }
        }

        // Penalize all-numeric tokens
        if (/^\d+$/.test(token)) {
            score -= 100;
        }

        // Penalize very short tokens
        if (token.length <= 2) {
            score -= 50;
        }

        return { token, score };
    });
}

/**
 * Get top N tokens by score
 */
export function getTopTokens(tokens: string[], count: number = 2): string[] {
    const scored = scoreTokens(tokens);

    return scored
        .filter(t => t.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, count)
        .sort((a, b) => {
            // Re-sort by original position for natural reading order
            const indexA = tokens.indexOf(a.token);
            const indexB = tokens.indexOf(b.token);
            return indexA - indexB;
        })
        .map(t => t.token);
}
