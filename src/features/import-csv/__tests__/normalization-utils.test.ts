/**
 * Tests for normalization-utils
 */

import {
    normalizeBase,
    tokenizeDescription,
    classifyToken,
    extractUsefulTokens,
    generatePatternKey,
    extractMerchantKey,
    __test__
} from "../normalization-utils"

describe("normalizeBase", () => {
    it("lowercases and trims", () => {
        expect(normalizeBase("  HELLO World  ")).toBe("hello world")
    })

    it("collapses multiple spaces", () => {
        expect(normalizeBase("hello    world")).toBe("hello world")
    })

    it("removes punctuation", () => {
        expect(normalizeBase("hello, world! test.")).toBe("hello world test")
    })
})

describe("tokenizeDescription", () => {
    it("splits into tokens", () => {
        expect(tokenizeDescription("PAGAMENTO POS AMAZON EU")).toEqual([
            "pagamento", "pos", "amazon", "eu"
        ])
    })

    it("handles complex descriptions", () => {
        expect(tokenizeDescription("BONIFICO SEPA DA: MARIO ROSSI")).toEqual([
            "bonifico", "sepa", "da", "mario", "rossi"
        ])
    })
})

describe("classifyToken", () => {
    it("classifies banking prefixes", () => {
        expect(classifyToken("pagamento")).toBe("banking_prefix")
        expect(classifyToken("bonifico")).toBe("banking_prefix")
        expect(classifyToken("sepa")).toBe("banking_prefix")
    })

    it("classifies legal generics", () => {
        expect(classifyToken("srl")).toBe("legal_generic")
        expect(classifyToken("spa")).toBe("legal_generic")
        expect(classifyToken("italia")).toBe("legal_generic")
    })

    it("classifies stopwords", () => {
        expect(classifyToken("del")).toBe("stopword")
        expect(classifyToken("ord")).toBe("stopword")
        expect(classifyToken("ref")).toBe("stopword")
    })

    it("classifies variable tokens (numbers)", () => {
        expect(classifyToken("123456")).toBe("variable")
        expect(classifyToken("402123456")).toBe("variable")
    })

    it("classifies date-like tokens", () => {
        expect(classifyToken("01/12/2024")).toBe("variable")
        expect(classifyToken("2024-01-12")).toBe("variable")
    })

    it("classifies useful tokens", () => {
        expect(classifyToken("amazon")).toBe("useful")
        expect(classifyToken("netflix")).toBe("useful")
        expect(classifyToken("conad")).toBe("useful")
    })

    it("classifies short tokens as stopwords", () => {
        expect(classifyToken("eu")).toBe("legal_generic") // in blacklist
        expect(classifyToken("ab")).toBe("stopword") // too short
    })
})

describe("extractUsefulTokens", () => {
    it("extracts only useful tokens", () => {
        const result = extractUsefulTokens("PAGAMENTO POS AMAZON EU SARL ORD 123456")
        expect(result).toEqual(["amazon"])
    })

    it("handles Netflix-like subscription", () => {
        const result = extractUsefulTokens("ADDEBITO CARTA NETFLIX.COM 12345678")
        expect(result).toEqual(["netflixcom"])
    })

    it("handles supermarket transactions", () => {
        const result = extractUsefulTokens("POS CONAD CITY ROMA VIA TUSCOLANA")
        expect(result).toEqual(["conad", "city", "roma", "via", "tuscolana"])
    })
})

describe("generatePatternKey", () => {
    it("generates pattern key from useful tokens", () => {
        // "conad" and "city" are both useful tokens (not in any blacklist)
        const result = generatePatternKey("PAGAMENTO POS CONAD CITY ROMA VIA", "expense")
        expect(result.patternKey).toContain("conad")
        expect(result.patternKey).toContain("city")
        expect(result.patternKey).toContain("|expense")
        expect(result.isFallback).toBe(false)
    })

    it("falls back to merchantKey when too few useful tokens", () => {
        const result = generatePatternKey("ADDEBITO DD", "expense")
        expect(result.isFallback).toBe(true)
        expect(result.patternKey).toContain("|expense")
    })

    it("includes type in key", () => {
        const expense = generatePatternKey("STIPENDIO AZIENDA SRL", "expense")
        const income = generatePatternKey("STIPENDIO AZIENDA SRL", "income")
        expect(expense.patternKey).toContain("|expense")
        expect(income.patternKey).toContain("|income")
        expect(expense.patternKey).not.toBe(income.patternKey)
    })

    it("produces consistent keys for similar descriptions", () => {
        const key1 = generatePatternKey("PAGAMENTO AMAZON EU SARL ORD 12345", "expense")
        const key2 = generatePatternKey("PAGAMENTO AMAZON EU SARL ORD 67890", "expense")
        expect(key1.patternKey).toBe(key2.patternKey)
    })
})

describe("extractMerchantKey", () => {
    it("extracts first 3 significant words", () => {
        expect(extractMerchantKey("PAGAMENTO POS AMAZON MARKETPLACE")).toBe("amazon marketplace")
    })

    it("removes banking prefixes", () => {
        // "da" is a stopword but extractMerchantKey only removes banking prefixes, not stopwords
        expect(extractMerchantKey("BONIFICO DA MARIO ROSSI")).toBe("da mario rossi")
    })

    it("removes dates and long numbers", () => {
        expect(extractMerchantKey("PAGAMENTO 01/12/2024 AMAZON 123456")).toBe("amazon")
    })

    it("returns 'altro' for empty result", () => {
        // "pos" is a banking prefix but extractMerchantKey processes after prefix removal
        expect(extractMerchantKey("PAGAMENTO 12/01/2024")).toBe("altro")
    })
})
