
import { describe, it, expect } from "vitest";
import { parseCSV } from "../parse";

describe("parseCSV", () => {
    it("detects comma delimiter and maps columns", () => {
        const csv = `Data,Descrizione,Importo
2024-01-01,Test Transaction,-50.00
2024-01-02,Another One,100.50`;

        const result = parseCSV(csv);
        expect(result.errors).toHaveLength(0);
        expect(result.rows).toHaveLength(2);
        expect(result.rows[0].raw).toEqual({
            date: "2024-01-01",
            description: "Test Transaction",
            amount: "-50.00",
            "data": "2024-01-01",
            "descrizione": "Test Transaction", // Header lowercase normalized
            "importo": "-50.00"
        });
    });

    it("detects semicolon delimiter", () => {
        const csv = `Date;Description;Amount
2024-01-01;Test;-50`;
        const result = parseCSV(csv);
        expect(result.rows).toHaveLength(1);
        expect(result.rows[0].raw.amount).toBe("-50");
    });

    it("handles quoted fields with delimiters inside", () => {
        const csv = `Date,Description,Amount
2024-01-01,"Store, Inc.",-50`;
        const result = parseCSV(csv);
        expect(result.rows[0].raw.description).toBe("Store, Inc.");
    });

    it("returns error for missing required columns", () => {
        // Parser requires at least Date or Amount to identify header
        // Provide Date, but miss Amount
        const csv = `Data,Description
2024-01-01,Test`;
        const result = parseCSV(csv);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors[0].message).toContain("Missing amount column");
    });

    it("handles mixed case headers", () => {
        const csv = `DATA,IMPORTO
2024-01-01,10`;
        const result = parseCSV(csv);
        expect(result.rows).toHaveLength(1);
        expect(result.rows[0].raw.date).toBe("2024-01-01");
    });

    it("builds signed amount from debit/credit columns", () => {
        const csv = `Data;Dare;Avere;Descrizione
2024-01-01;12,50;;Pagamento carta
2024-01-02;;100,00;Bonifico`;

        const result = parseCSV(csv);
        expect(result.errors).toHaveLength(0);
        expect(result.rows).toHaveLength(2);
        expect(result.rows[0].raw.amount).toBe("-12,50");
        expect(result.rows[1].raw.amount).toBe("100,00");
    });

    it("flags rows where both debit and credit are filled", () => {
        const csv = `Data;Dare;Avere;Descrizione
2024-01-01;10,00;4,00;Rettifica`;

        const result = parseCSV(csv);
        expect(result.rows).toHaveLength(1);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors[0].message).toContain("Both debit and credit");
        expect(result.rows[0].raw.amount).toBe("-6.00");
    });

    it("rejects row when required amount cell is missing", () => {
        const csv = `Data,Importo
2024-01-01`;

        const result = parseCSV(csv);
        expect(result.rows).toHaveLength(0);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors[0].message).toContain("insufficient columns");
    });
});
