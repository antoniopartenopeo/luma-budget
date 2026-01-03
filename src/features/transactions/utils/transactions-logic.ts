import { Transaction } from "../api/types";
import { parseCurrencyToCents } from "@/lib/currency-utils";

export type SortField = "date" | "amount" | "category" | "description";
export type SortOrder = "asc" | "desc";

export interface DateRange {
    from?: Date;
    to?: Date;
}

export interface TransactionFilters {
    search: string;
    type: "all" | "income" | "expense";
    categoryId: string;
    isSuperfluous: boolean;
    dateRange: DateRange;
}

export interface TransactionSummary {
    totalCount: number;
    totalIncome: number; // in cents
    totalExpense: number; // in cents
    netBalance: number; // in cents
}

/**
 * Filter transactions based on multiple criteria
 */
export function applyFilters(
    transactions: Transaction[],
    filters: TransactionFilters
): Transaction[] {
    return transactions.filter((t) => {
        // Search filter (description or amount string)
        const matchesSearch =
            filters.search === "" ||
            t.description.toLowerCase().includes(filters.search.toLowerCase()) ||
            t.amount.includes(filters.search);

        if (!matchesSearch) return false;

        // Type filter
        if (filters.type !== "all" && t.type !== filters.type) return false;

        // Category filter
        if (filters.categoryId !== "all" && t.categoryId !== filters.categoryId) return false;

        // Superfluous filter
        if (filters.isSuperfluous && !t.isSuperfluous) return false;

        // Date range filter
        if (filters.dateRange.from || filters.dateRange.to) {
            const txDate = new Date(t.timestamp);
            if (filters.dateRange.from && txDate < filters.dateRange.from) return false;
            // For 'to' date, we usually want to include the entire day
            if (filters.dateRange.to) {
                const endDate = new Date(filters.dateRange.to);
                endDate.setHours(23, 59, 59, 999);
                if (txDate > endDate) return false;
            }
        }

        return true;
    });
}

/**
 * Sort transactions based on field and order
 */
export function applySorting(
    transactions: Transaction[],
    field: SortField,
    order: SortOrder
): Transaction[] {
    return [...transactions].sort((a, b) => {
        let comparison = 0;

        switch (field) {
            case "date":
                comparison = a.timestamp - b.timestamp;
                break;
            case "amount": {
                const aCents = a.amountCents ?? parseCurrencyToCents(a.amount);
                const bCents = b.amountCents ?? parseCurrencyToCents(b.amount);
                comparison = aCents - bCents;
                break;
            }
            case "category":
                comparison = a.category.localeCompare(b.category);
                break;
            case "description":
                comparison = a.description.localeCompare(b.description);
                break;
        }

        return order === "asc" ? comparison : -comparison;
    });
}

/**
 * Calculate summary KPIs for a set of transactions
 */
export function computeSummary(transactions: Transaction[]): TransactionSummary {
    return transactions.reduce(
        (acc, t) => {
            const cents = t.amountCents ?? parseCurrencyToCents(t.amount);

            if (t.type === "income") {
                acc.totalIncome += cents;
                acc.netBalance += cents;
            } else {
                acc.totalExpense += cents;
                acc.netBalance -= cents;
            }

            acc.totalCount += 1;
            return acc;
        },
        { totalCount: 0, totalIncome: 0, totalExpense: 0, netBalance: 0 }
    );
}

/**
 * Paginate data
 */
export function paginateData<T>(data: T[], page: number, pageSize: number): T[] {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
}
