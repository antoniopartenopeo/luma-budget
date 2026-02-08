
import { describe, it, expect } from "vitest";
import { detectDuplicates } from "../dedupe";
import { enrichRows, extractMerchantKey } from "../enrich";
import { ParsedRow, EnrichedRow } from "../types";
import { Transaction } from "../../../transactions/api/types";
import { CategoryIds } from "@/domain/categories";
import { groupRowsByMerchant } from "../grouping";

describe("dedupe & enrich", () => {
    const baseTx: Transaction = {
        id: "tx-1",
        date: "2024-01-01",
        amountCents: 5000,
        description: "POS MARKET",
        category: "Cibo",
        categoryId: "cibo",
        type: "expense",
        timestamp: new Date("2024-01-01").getTime(),
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

    it("does not mark duplicate when type differs", () => {
        const rows: ParsedRow[] = [{
            lineNumber: 1,
            date: "2024-01-01",
            timestamp: new Date("2024-01-01").getTime(),
            amountCents: 5000, // income
            description: "POS MARKET",
            originalDescription: "POS MARKET",
            rawRow: {}
        }];

        const result = detectDuplicates(rows, [baseTx]);
        expect(result[0].duplicateStatus).toBe("unique");
        expect(result[0].duplicateOf).toBeUndefined();
        expect(result[0].isSelected).toBe(true);
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
        // Logic removes POS prefix and applies canonical brand dictionary (ESSELUNGA)
        expect(extractMerchantKey("POS ESSELUNGA MILANO")).toBe("ESSELUNGA");
        expect(extractMerchantKey("NETFLIX.COM")).toBe("NETFLIX");
    });

    it("suggests category from pattern", () => {
        const rows = [createRow({ description: "NETFLIX", merchantKey: "NETFLIX" })];
        const enriched = enrichRows(rows, []);
        expect(enriched[0].suggestedCategoryId).toBe(CategoryIds.ABBONAMENTI);
    });

    it("prioritizes history", () => {
        const rows = [createRow({ description: "ESSELUNGA", merchantKey: "ESSELUNGA" })];
        const existing: Transaction[] = [{ ...baseTx, description: "ESSELUNGA", categoryId: CategoryIds.SVAGO_EXTRA, amountCents: 5000 }];

        const enriched = enrichRows(rows, existing);
        expect(enriched[0].suggestedCategoryId).toBe(CategoryIds.SVAGO_EXTRA);
    });

    it("splits UNRESOLVED into separate income/expense groups", () => {
        const incomeRow = createRow({
            id: "r-income",
            amountCents: 250000,
            merchantKey: "UNRESOLVED"
        });

        const expenseRow = createRow({
            id: "r-expense",
            amountCents: -4990,
            merchantKey: "UNRESOLVED"
        });

        const groups = groupRowsByMerchant([incomeRow, expenseRow]);
        const unresolvedGroups = groups.filter(g => g.merchantKey === "UNRESOLVED");

        expect(unresolvedGroups).toHaveLength(2);
        expect(unresolvedGroups.map(g => g.label)).toEqual(
            expect.arrayContaining(["UNRESOLVED • Entrate", "UNRESOLVED • Uscite"])
        );
        expect(unresolvedGroups.every(g => g.rowCount === 1)).toBe(true);
    });
});
