export const queryKeys = {
    transactions: {
        all: ["transactions"] as const,
        recent: ["recent-transactions"] as const,
    },
    dashboard: {
        all: ["dashboard-summary"] as const,
        summary: (mode: string, period: string, months?: number) =>
            ["dashboard-summary", mode, period, months] as const,
    },
    budget: {
        all: ["budgets"] as const,
        detail: (period: string) => ["budgets", period] as const,
    },
    settings: () => ['settings'] as const,
    categories: {
        all: () => ['categories'] as const,
        active: () => ['categories', 'active'] as const,
    },
} as const
