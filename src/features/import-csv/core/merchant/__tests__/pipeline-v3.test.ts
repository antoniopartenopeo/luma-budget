
import { extractMerchantKey } from "../pipeline";
import { describe, test, expect } from "vitest";

describe("Merchant Extraction v3 - Golden Fixtures", () => {

    // The SOURCE OF TRUTH for Merchant Recognition
    const GOLDEN_FIXTURES = [
        // 1. Payment Rails vs Merchant Separation
        { desc: "PAGAMENTO POS 4.99 APPLE PAY *UBIDOCS", expected: "UBIDOCS" },
        { desc: "APPLE PAY", expected: "UNRESOLVED" }, // Rail without merchant
        { desc: "PAYPAL *SPOTIFY AB", expected: "SPOTIFY" },
        { desc: "Op. 123 CARTA B C C ROMA", expected: "UNRESOLVED" }, // "ROMA" is positional noise, CARTA is rail
        { desc: "AMZN Mktp IT*R83 12", expected: "AMAZON" }, // "AMAZON" is brand-dict match for AMZN? No, "AMAZON" in dict. "AMZN" might need alias.
        // Wait, "AMZN" is not in BRAND_DICT in step 9. "AMAZON" is.
        // If "AMZN" is not mapped, it might return "AMZN"?
        // Let's modify the fixture to use "AMAZON" if that's what we expect, or add AMZN to text.
        // Or assumes "AMZN Mktp" -> SubMerchant logic?
        // Let's use a simpler known case for now or add AMZN to dict later.
        // Actually, "AMAZON" is in PAYMENT_RAILS as "AMAZON PAYMENT", "AMAZON PAY".
        // "AMZN" is not.
        // Let's stick to the plan's list but verify expectation.

        { desc: "SUMUP *BAR DA GINO", expected: "BAR DA GINO" },
        { desc: "ZARA MILANO 3", expected: "ZARA" }, // "Milano" stripped
        { desc: "GOOGLE PAY *RYAN", expected: "RYAN" },
        { desc: "FACEBOOK* ADS", expected: "META" },
        { desc: "CRV*ESSELUNGA", expected: "ESSELUNGA" }, // Curve rail

        // 2. Standard Retailers (Regression Check)
        { desc: "PAGAMENTO POS ESSELUNGA VIA TIZIANO", expected: "ESSELUNGA" },
        { desc: "MC DONALDS CAPPUCCINI", expected: "MCDONALD" }, // Dict normalization
        { desc: "LIDL ITALIA SRL", expected: "LIDL" },
        { desc: "COOP LOMBARDIA", expected: "COOP" },

        // 3. Positional Noise (Cities)
        { desc: "FARMACIA ROSSI ROMA", expected: "FARMACIA" }, // Matches generic FARMACIA in dict
        { desc: "TRATTORIA VERDE MILANO", expected: "TRATTORIA VERDE" },
        { desc: "HOTEL CENTRALE LONDRA", expected: "HOTEL CENTRALE" },

        // 4. Noise & IDs
        { desc: "CARTA 5555 HOTEL 12345", expected: "HOTEL" }, // 12345 removed, CARTA removed
        { desc: "PAGAMENTO POS 12/05/2023 RISTORANTE", expected: "RISTORANTE" },

        // 5. Overrides (Placeholder check, assuming empty map initially)
        // If we added overrides, we'd test here.

        // 6. Generic Rails (Fallback)
        { desc: "PAGAMENTO POS", expected: "UNRESOLVED" },
        { desc: "ADDEBITO PRELIEVO", expected: "UNRESOLVED" },

        // 7. Edge Cases
        { desc: "   ", expected: "ALTRO" },
        { desc: "...", expected: "ALTRO" },
        { desc: "AMAZON PAY", expected: "UNRESOLVED" },
        { desc: "AMAZON PAY * SELLER", expected: "SELLER" }, // Generic seller?
        // The dict has "AMAZON" -> "AMAZON". "AMAZON PAY" -> Rail.
        // If "SELLER" is generically blacklisted?
        // "SELLER" is in SCORING_BLACKLIST? No, wait. "SELLER" was mentioned in pipeline comments.
        // "subTokens[0] ... includes 'SELLER'".
        // If generic, returns Marketplace?
        // In v3, remaining is "SELLER". Scoring blacklists? "SELLER" isn't in SCORING_BLACKLIST in `token-scorer.ts`.
        // So it might return "SELLER".

        // 8. Bridge Tokens
        { desc: "PAYPAL *Mktp TEST", expected: "TEST" },
        { desc: "PAYPAL *IE *TEST", expected: "TEST" },
    ];

    test.each(GOLDEN_FIXTURES)("['$desc'] -> '$expected'", ({ desc, expected }) => {
        const result = extractMerchantKey(desc);
        expect(result).toBe(expected);
    });
});
