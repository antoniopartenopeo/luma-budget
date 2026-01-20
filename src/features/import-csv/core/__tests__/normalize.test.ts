
import { describe, it, expect } from "vitest";
import { normalizeRows } from "../normalize";

describe("normalizeRows", () => {
    it("parses ISO date and standard amount", () => {
        const rows = [{ lineNumber: 1, raw: { date: "2024-01-15", amount: "-12.50", description: " Test " } }];
        const { valid } = normalizeRows(rows);

        expect(valid).toHaveLength(1);
        expect(valid[0].date).toBe("2024-01-15");
        expect(valid[0].amountCents).toBe(-1250);
        expect(valid[0].description).toBe("Test");
    });

    it("parses EU date (DD/MM/YYYY) and EU amount (1.234,56)", () => {
        const rows = [{ lineNumber: 1, raw: { date: "15/01/2024", amount: "-1.200,50", description: "EU" } }];
        const { valid } = normalizeRows(rows);

        expect(valid[0].date).toBe("2024-01-15");
        expect(valid[0].amountCents).toBe(-120050);
    });

    it("parses US amount (1,234.56)", () => {
        const rows = [{ lineNumber: 1, raw: { date: "2024-01-01", amount: "1,200.50", description: "US" } }];
        const { valid } = normalizeRows(rows);
        expect(valid[0].amountCents).toBe(120050);
    });

    it("handles negative parenthesis amount", () => {
        const rows = [{ lineNumber: 1, raw: { date: "2024-01-01", amount: "(50.00)", description: "Neg" } }];
        const { valid } = normalizeRows(rows);
        expect(valid[0].amountCents).toBe(-5000);
    });

    it("skips zero amount rows", () => {
        const rows = [{ lineNumber: 1, raw: { date: "2024-01-01", amount: "0.00", description: "Zero" } }];
        const { valid } = normalizeRows(rows);
        expect(valid).toHaveLength(0);
    });

    it("reports invalid dates", () => {
        const rows = [{ lineNumber: 1, raw: { date: "invalid", amount: "10", description: "Bad Date" } }];
        const { errors } = normalizeRows(rows);
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toContain("Invalid date");
    });
});
