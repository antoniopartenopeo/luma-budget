// Insights Thresholds Configuration
// ==================================

export const INSIGHT_THRESHOLDS = {
    /** Minimum delta in cents for category spike (€50) */
    SPIKE_MIN_DELTA_CENTS: 5000,

    /** Minimum delta percentage for category spike (30%) */
    SPIKE_MIN_DELTA_PCT: 30,

    /** Number of top transactions to show in drivers */
    TOP_DRIVERS_COUNT: 5,

    /** Maximum number of spike categories to show */
    SPIKE_TOP_CATEGORIES: 3,

    /** Severity thresholds for budget risk (percentage over budget) */
    BUDGET_RISK_SEVERITY: {
        HIGH: 25,   // > 25% over budget = high
        MEDIUM: 10, // > 10% over budget = medium
    },
} as const
