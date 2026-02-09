import { Transaction } from "../api/types";
import { sumIncomeInCents, sumExpensesInCents, calculateSharePct } from "@/domain/money";
import { filterByRange } from "@/lib/date-ranges";

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
    const normalizeEndOfDay = (date: Date) => {
        const end = new Date(date)
        end.setHours(23, 59, 59, 999)
        return end
    }

    const hasValidFrom =
        filters.dateRange.from instanceof Date &&
        !Number.isNaN(filters.dateRange.from.getTime())
    const hasValidTo =
        filters.dateRange.to instanceof Date &&
        !Number.isNaN(filters.dateRange.to.getTime())

    let scopedTransactions = transactions

    if (hasValidFrom && hasValidTo) {
        scopedTransactions = filterByRange(
            transactions,
            new Date(filters.dateRange.from as Date),
            normalizeEndOfDay(filters.dateRange.to as Date)
        )
    } else if (hasValidFrom) {
        const fromTimestamp = (filters.dateRange.from as Date).getTime()
        scopedTransactions = transactions.filter(t => t.timestamp >= fromTimestamp)
    } else if (hasValidTo) {
        const toTimestamp = normalizeEndOfDay(filters.dateRange.to as Date).getTime()
        scopedTransactions = transactions.filter(t => t.timestamp <= toTimestamp)
    }

    return scopedTransactions.filter((t) => {
        // Search filter (description or amount string)
        const matchesSearch =
            filters.search === "" ||
            t.description.toLowerCase().includes(filters.search.toLowerCase())

        if (!matchesSearch) return false

        // Type filter
        if (filters.type !== "all" && t.type !== filters.type) return false

        // Category filter
        if (filters.categoryId !== "all" && t.categoryId !== filters.categoryId) return false

        // Superfluous filter
        if (filters.isSuperfluous && !t.isSuperfluous) return false

        return true
    })
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
                comparison = (a.amountCents || 0) - (b.amountCents || 0);
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
    const totalIncome = sumIncomeInCents(transactions);
    const totalExpense = sumExpensesInCents(transactions);

    return {
        totalCount: transactions.length,
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense,
    };
}

/**
 * Paginate data
 */
export function paginateData<T>(data: T[], page: number, pageSize: number): T[] {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
}
/**
 * Calculate superfluous expenditure metrics for a set of transactions
 */
export function calculateSuperfluousMetrics(transactions: Transaction[]) {
    const totalSpentCents = sumExpensesInCents(transactions);
    const superfluousSpentCents = sumExpensesInCents(transactions.filter(t => t.isSuperfluous));

    return {
        totalSpentCents,
        superfluousSpentCents,
        percentage: calculateSharePct(superfluousSpentCents, totalSpentCents)
    };
}
