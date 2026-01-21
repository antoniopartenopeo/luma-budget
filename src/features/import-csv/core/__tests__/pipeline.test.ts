import { describe, it, expect } from "vitest";
import { processCSV, generatePayload } from "../pipeline";
import { Override } from "../types";

describe("CSV Import Core Integration", () => {
    it("runs full pipeline deterministic end-to-end", () => {
        const csv = `Data,Descrizione,Importo
2024-01-01,NETFLIX,-17.99
2024-01-02,ESSELUNGA,-50.00
2024-01-03,STIPENDIO,2500.00`;

        // 1. Process
        const state = processCSV(csv, []);

        expect(state.errors).toHaveLength(0);
        expect(state.rows).toHaveLength(3);

        // Check Groups
        expect(state.groups.length).toBeGreaterThanOrEqual(3);

        const netflixGroup = state.groups.find(g => g.merchantKey === "NETFLIX");
        expect(netflixGroup).toBeDefined();

        // Check Suggestions
        const netflixRow = state.rows.find(r => r.merchantKey === "NETFLIX");
        expect(netflixRow?.suggestedCategoryId).toBe("abbonamenti");

        // 2. Override (Simulate User Action)
        const salaryRow = state.rows.find(r => r.amountCents === 250000);
        expect(salaryRow).toBeDefined();

        const overrides: Override[] = [
            { targetId: salaryRow!.id, level: "row", categoryId: "altro" }
        ];

        // 3. Generate Payload
        const payload = generatePayload(state.groups, state.rows, overrides);

        expect(payload.transactions).toHaveLength(3);
        expect(payload.importId).toBeDefined();

        // Check results
        const txSalary = payload.transactions.find(t => t.amountCents === 250000);
        expect(txSalary?.categoryId).toBe("altro"); // Override applied
        expect(txSalary?.classificationSource).toBe("manual");

        const txNetflix = payload.transactions.find(t => t.description === "NETFLIX");
        expect(txNetflix?.categoryId).toBe("abbonamenti"); // Suggestion applied
        expect(txNetflix?.classificationSource).toBe("ruleBased");
    });

    it("fallbacks to 'altro' if category is missing (Invariant I1 relaxed)", () => {
        const csv = `Data,Descrizione,Importo
2024-01-01,UNKNOWN AMT,10`;
        const state = processCSV(csv, []);

        const unknownRow = state.rows[0];
        expect(unknownRow.suggestedCategoryId).toBeNull();

        const payload = generatePayload(state.groups, state.rows, []);
        expect(payload.transactions[0].categoryId).toBe("altro");
    });
});
