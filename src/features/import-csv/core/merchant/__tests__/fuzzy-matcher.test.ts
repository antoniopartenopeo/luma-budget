import { describe, test, expect } from "vitest";
import { similarityRatio, fuzzyMatch, fuzzyMatchWithScore } from "../fuzzy-matcher";

describe("Fuzzy Matcher", () => {
    describe("similarityRatio", () => {
        test("identical strings return 1", () => {
            expect(similarityRatio("NETFLIX", "NETFLIX")).toBe(1);
        });

        test("empty strings return 0", () => {
            expect(similarityRatio("", "NETFLIX")).toBe(0);
            expect(similarityRatio("NETFLIX", "")).toBe(0);
        });

        test("similar strings return high ratio", () => {
            const ratio = similarityRatio("NETFLIIX", "NETFLIX");
            expect(ratio).toBeGreaterThan(0.85);
        });

        test("different strings return low ratio", () => {
            const ratio = similarityRatio("AMAZON", "NETFLIX");
            expect(ratio).toBeLessThan(0.5);
        });

        test("case insensitive", () => {
            const ratio = similarityRatio("netflix", "NETFLIX");
            expect(ratio).toBe(1);
        });
    });

    describe("fuzzyMatch", () => {
        const dictionary = ["NETFLIX", "AMAZON", "SPOTIFY", "DISNEY PLUS", "APPLE"];

        test("exact match returns the brand", () => {
            expect(fuzzyMatch("NETFLIX", dictionary)).toBe("NETFLIX");
        });

        test("typo match returns closest brand", () => {
            expect(fuzzyMatch("NETFLIIX", dictionary)).toBe("NETFLIX");
            expect(fuzzyMatch("AMAZZON", dictionary)).toBe("AMAZON");
            expect(fuzzyMatch("SPOTFY", dictionary)).toBe("SPOTIFY");
        });

        test("no match returns null", () => {
            expect(fuzzyMatch("COMPLETELY DIFFERENT", dictionary)).toBe(null);
        });

        test("short strings (< 3 chars) return null", () => {
            expect(fuzzyMatch("AB", dictionary)).toBe(null);
        });

        test("respects threshold", () => {
            // With high threshold, minor typos still match
            expect(fuzzyMatch("NETFLX", dictionary, { threshold: 0.8 })).toBe("NETFLIX");

            // With very high threshold, they don't
            expect(fuzzyMatch("NFLX", dictionary, { threshold: 0.95 })).toBe(null);
        });

        test("respects maxLengthDiff", () => {
            // Default maxLengthDiff is 3
            expect(fuzzyMatch("AMAZ", dictionary, { threshold: 0.5 })).toBe("AMAZON");

            // With maxLengthDiff of 1, it won't match
            expect(fuzzyMatch("AMAZ", dictionary, { threshold: 0.5, maxLengthDiff: 1 })).toBe(null);
        });
    });

    describe("fuzzyMatchWithScore", () => {
        const dictionary = ["NETFLIX", "AMAZON", "SPOTIFY"];

        test("returns input, match and score", () => {
            const result = fuzzyMatchWithScore("NETFLIIX", dictionary);
            expect(result.input).toBe("NETFLIIX");
            expect(result.match).toBe("NETFLIX");
            expect(result.score).toBeGreaterThan(0.85);
        });

        test("no match returns score 0", () => {
            const result = fuzzyMatchWithScore("UNKNOWN", dictionary, { threshold: 0.95 });
            expect(result.match).toBe(null);
            expect(result.score).toBeLessThan(0.95);
        });
    });
});
