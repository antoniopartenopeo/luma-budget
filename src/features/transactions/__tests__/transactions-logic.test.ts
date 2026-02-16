import { describe, it, expect } from "vitest";
import {
    applyFilters,
    applySorting,
    computeSummary,
    paginateData,
    TransactionFilters
} from "../utils/transactions-logic";
import { Transaction } from "../api/types";

const mockTransactions: Transaction[] = [
    {
        id: "1",
        amountCents: 10000,
        date: "2024-01-01",
        timestamp: new Date("2024-01-01").getTime(),
        description: "Stipendio",
        category: "Lavoro",
        categoryId: "cat_work",
        type: "income",
    },
    {
        id: "2",
        amountCents: 5000,
        date: "2024-01-02",
        timestamp: new Date("2024-01-02").getTime(),
        description: "Spesa Esselunga",
        category: "Alimentari",
        categoryId: "cat_food",
        type: "expense",
        isSuperfluous: false,
    },
    {
        id: "3",
        amountCents: 2000,
        date: "2024-01-03",
        timestamp: new Date("2024-01-03").getTime(),
        description: "Aperitivo",
        category: "Svago",
        categoryId: "cat_fun",
        type: "expense",
        isSuperfluous: true,
    }
];

describe("transactions-logic", () => {
    describe("applyFilters", () => {
        const defaultFilters: TransactionFilters = {
            search: "",
            type: "all",
            categoryId: "all",
            isSuperfluous: false,
            dateRange: {}
        };

        it("should return all transactions when no filters are applied", () => {
            const result = applyFilters(mockTransactions, defaultFilters);
            expect(result).toHaveLength(3);
        });

        it("should filter by search query", () => {
            const result = applyFilters(mockTransactions, { ...defaultFilters, search: "Esselunga" });
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe("2");
        });

        it("should filter by type", () => {
            const result = applyFilters(mockTransactions, { ...defaultFilters, type: "income" });
            expect(result).toHaveLength(1);
            expect(result[0].type).toBe("income");
        });

        it("should filter by category", () => {
            const result = applyFilters(mockTransactions, { ...defaultFilters, categoryId: "cat_fun" });
            expect(result).toHaveLength(1);
            expect(result[0].categoryId).toBe("cat_fun");
        });

        it("should filter by superfluous flag", () => {
            const result = applyFilters(mockTransactions, { ...defaultFilters, isSuperfluous: true });
            expect(result).toHaveLength(1);
            expect(result[0].isSuperfluous).toBe(true);
        });

        it("should filter by date range", () => {
            const filters: TransactionFilters = {
                ...defaultFilters,
                dateRange: {
                    from: new Date("2024-01-02"),
                    to: new Date("2024-01-03")
                }
            };
            const result = applyFilters(mockTransactions, filters);
            expect(result).toHaveLength(2);
            expect(result.map(r => r.id)).toEqual(["2", "3"]);
        });

        it("should support open-ended range with only from date", () => {
            const filters: TransactionFilters = {
                ...defaultFilters,
                dateRange: {
                    from: new Date("2024-01-02")
                }
            }
            const result = applyFilters(mockTransactions, filters)
            expect(result.map(r => r.id)).toEqual(["2", "3"])
        })

        it("should support open-ended range with only to date", () => {
            const filters: TransactionFilters = {
                ...defaultFilters,
                dateRange: {
                    to: new Date("2024-01-02")
                }
            }
            const result = applyFilters(mockTransactions, filters)
            expect(result.map(r => r.id)).toEqual(["1", "2"])
        })

        it("should ignore invalid date boundaries", () => {
            const filters: TransactionFilters = {
                ...defaultFilters,
                dateRange: {
                    from: new Date("invalid-date")
                }
            }
            const result = applyFilters(mockTransactions, filters)
            expect(result).toHaveLength(3)
        })
    });

    describe("applySorting", () => {
        it("should sort by date desc (default)", () => {
            const result = applySorting(mockTransactions, "date", "desc");
            expect(result[0].id).toBe("3");
            expect(result[2].id).toBe("1");
        });

        it("should sort by amount asc", () => {
            const result = applySorting(mockTransactions, "amount", "asc");
            expect(result[0].id).toBe("3"); // 20
            expect(result[1].id).toBe("2"); // 50
            expect(result[2].id).toBe("1"); // 100
        });

        it("should sort by category name", () => {
            const result = applySorting(mockTransactions, "category", "asc");
            expect(result[0].category).toBe("Alimentari");
            expect(result[1].category).toBe("Lavoro");
            expect(result[2].category).toBe("Svago");
        });
    });

    describe("computeSummary", () => {
        it("should calculate correct totals", () => {
            const result = computeSummary(mockTransactions);
            expect(result.totalCount).toBe(3);
            expect(result.totalIncome).toBe(10000);
            expect(result.totalExpense).toBe(7000); // 5000 + 2000
            expect(result.netBalance).toBe(3000); // 10000 - 7000
        });
    });

    describe("paginateData", () => {
        it("should return first page", () => {
            const result = paginateData(mockTransactions, 1, 2);
            expect(result).toHaveLength(2);
            expect(result[0].id).toBe("1");
        });

        it("should return second page", () => {
            const result = paginateData(mockTransactions, 2, 2);
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe("3");
        });
    });
});
