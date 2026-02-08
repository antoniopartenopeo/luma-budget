
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

// ============================================
// Extended Date Format Tests
// ============================================

describe("normalizeRows - Extended Date Formats", () => {
    // German-style dates (DD.MM.YYYY and DD.MM.YY)
    it("parses German date DD.MM.YYYY", () => {
        const rows = [{ lineNumber: 1, raw: { date: "15.01.2024", amount: "10", description: "DE" } }];
        const { valid } = normalizeRows(rows);
        expect(valid[0].date).toBe("2024-01-15");
    });

    it("parses German short date D.M.YYYY", () => {
        const rows = [{ lineNumber: 1, raw: { date: "5.1.2024", amount: "10", description: "DE" } }];
        const { valid } = normalizeRows(rows);
        expect(valid[0].date).toBe("2024-01-05");
    });

    // 2-digit year formats - European (day first)
    it("parses 2-digit year DD/MM/YY", () => {
        const rows = [{ lineNumber: 1, raw: { date: "15/01/26", amount: "10", description: "2YR" } }];
        const { valid } = normalizeRows(rows);
        expect(valid[0].date).toBe("2026-01-15");
    });

    it("parses 2-digit year DD.MM.YY (German)", () => {
        const rows = [{ lineNumber: 1, raw: { date: "15.01.26", amount: "10", description: "2YR DE" } }];
        const { valid } = normalizeRows(rows);
        expect(valid[0].date).toBe("2026-01-15");
    });

    it("parses 2-digit year DD-MM-YY", () => {
        const rows = [{ lineNumber: 1, raw: { date: "15-01-26", amount: "10", description: "2YR" } }];
        const { valid } = normalizeRows(rows);
        expect(valid[0].date).toBe("2026-01-15");
    });

    // Note: YY-MM-DD and YY/MM/DD are intentionally NOT supported
    // because they are ambiguous with DD-MM-YY and DD/MM/YY (European priority)

    // Edge cases for 2-digit years
    it("handles year 00 as 2000", () => {
        const rows = [{ lineNumber: 1, raw: { date: "01/01/00", amount: "10", description: "Y2K" } }];
        const { valid } = normalizeRows(rows);
        expect(valid[0].date).toBe("2000-01-01");
    });

    it("handles year 50 as 2050", () => {
        const rows = [{ lineNumber: 1, raw: { date: "01/06/50", amount: "10", description: "2050" } }];
        const { valid } = normalizeRows(rows);
        expect(valid[0].date).toBe("2050-06-01");
    });

    // Short day/month (single digit)
    it("parses short day/month D/M/YY", () => {
        const rows = [{ lineNumber: 1, raw: { date: "5/1/26", amount: "10", description: "Short" } }];
        const { valid } = normalizeRows(rows);
        expect(valid[0].date).toBe("2026-01-05");
    });

    // US format fallback
    it("parses US date MM/DD/YYYY as fallback", () => {
        const rows = [{ lineNumber: 1, raw: { date: "12/25/2024", amount: "10", description: "US" } }];
        const { valid } = normalizeRows(rows);
        expect(valid[0].date).toBe("2024-12-25");
    });
});
