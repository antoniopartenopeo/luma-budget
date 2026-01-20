
import { describe, it, expect } from "vitest";
import { detectDuplicates } from "../dedupe";
import { enrichRows, extractMerchantKey } from "../enrich";
import { ParsedRow, EnrichedRow } from "../types";
import { Transaction } from "../../../transactions/api/types";

describe("dedupe & enrich", () => {
    const baseTx: Transaction = {
        id: "tx-1",
        date: "2024-01-01",
        amount: "-50.00",
        amountCents: -5000,
        description: "POS MARKET",
        category: "Cibo",
        categoryId: "cibo",
        type: "expense",
        timestamp: new Date("2024-01-01").getTime(),
        icon: "utensils"
    };

    const createRow = (overrides: Partial<EnrichedRow>): EnrichedRow => ({
        lineNumber: 1,
        date: "2024-01-01",
        timestamp: 1000,
        amountCents: -1000,
        description: "TEST",
        originalDescription: "TEST",
        rawRow: {},
        id: "row-1",
        duplicateStatus: "unique",
        merchantKey: "TEST",
        suggestedCategoryId: null,
        suggestedCategorySource: null,
        isSelected: true,
        ...overrides
    });

    it("detects exact duplicate", () => {
        const rows: ParsedRow[] = [{
            lineNumber: 1,
            date: "2024-01-01",
            timestamp: new Date("2024-01-01").getTime(),
            amountCents: -5000,
            description: "POS MARKET",
            originalDescription: "POS MARKET",
            rawRow: {}
        }];

        const result = detectDuplicates(rows, [baseTx]);
        expect(result[0].duplicateStatus).toBe("confirmed");
        expect(result[0].duplicateOf).toBe("tx-1");
        expect(result[0].isSelected).toBe(false);
    });

    it("detects approximate duplicate", () => {
        const rows: ParsedRow[] = [{
            lineNumber: 1,
            date: "2024-01-02",
            timestamp: new Date("2024-01-02").getTime(),
            amountCents: -5000,
            description: "POS MARKET",
            originalDescription: "POS MARKET",
            rawRow: {}
        }];

        const result = detectDuplicates(rows, [baseTx]);
        expect(result[0].duplicateStatus).toBe("confirmed");
    });

    it("extracts merchant key", () => {
        // Logic removes POS prefix and takes first 3 words.
        expect(extractMerchantKey("POS ESSELUNGA MILANO")).toBe("ESSELUNGA MILANO");
        expect(extractMerchantKey("NETFLIX.COM")).toBe("NETFLIX.COM");
    });

    it("suggests category from pattern", () => {
        const rows = [createRow({ description: "NETFLIX", merchantKey: "NETFLIX" })];
        const enriched = enrichRows(rows, []);
        expect(enriched[0].suggestedCategoryId).toBe("abbonamenti");
    });

    it("prioritizes history", () => {
        const rows = [createRow({ description: "ESSELUNGA", merchantKey: "ESSELUNGA" })];
        const existing: Transaction[] = [{ ...baseTx, description: "ESSELUNGA", categoryId: "svago", amountCents: -5000 }];

        const enriched = enrichRows(rows, existing);
        expect(enriched[0].suggestedCategoryId).toBe("svago");
    });
});
