import { storage } from "@/lib/storage-utils"

export const BACKUP_VERSION = 1 as const;

export const STORAGE_KEYS = {
    TRANSACTIONS: "luma_transactions_v1" as const,
    BUDGETS: "luma_budget_plans_v1" as const,
    CATEGORIES: "luma_categories_v1" as const,
    SETTINGS: "luma_settings_v1" as const,
};

export type BackupV1 = {
    version: 1;
    exportedAt: string; // ISO
    keys: {
        transactionsKey: typeof STORAGE_KEYS.TRANSACTIONS;
        budgetsKey: typeof STORAGE_KEYS.BUDGETS;
        categoriesKey: typeof STORAGE_KEYS.CATEGORIES;
        settingsKey: typeof STORAGE_KEYS.SETTINGS;
    };
    payload: {
        transactions: unknown | null; // raw storage payload
        budgets: unknown | null;      // raw storage payload
        categories: unknown | null;   // raw storage payload
        settings: unknown | null;     // raw storage payload
    };
};

/**
 * Builds a BackupV1 object from current localStorage data.
 */
export const buildBackupV1 = (): BackupV1 => {
    return {
        version: BACKUP_VERSION,
        exportedAt: new Date().toISOString(),
        keys: {
            transactionsKey: STORAGE_KEYS.TRANSACTIONS,
            budgetsKey: STORAGE_KEYS.BUDGETS,
            categoriesKey: STORAGE_KEYS.CATEGORIES,
            settingsKey: STORAGE_KEYS.SETTINGS,
        },
        payload: {
            transactions: storage.get(STORAGE_KEYS.TRANSACTIONS, null),
            budgets: storage.get(STORAGE_KEYS.BUDGETS, null),
            categories: storage.get(STORAGE_KEYS.CATEGORIES, null),
            settings: storage.get(STORAGE_KEYS.SETTINGS, null),
        },
    };
};

/**
 * Serializes a backup object to a JSON string.
 */
export const serializeBackup = (backup: BackupV1): string => {
    return JSON.stringify(backup, null, 2);
};

/**
 * Parses and performs light validation on a backup JSON string.
 */
export const parseAndValidateBackup = (json: string): { ok: true; backup: BackupV1 } | { ok: false; error: string } => {
    try {
        const data = JSON.parse(json);

        if (!data || typeof data !== "object") {
            return { ok: false, error: "Dati non validi: il file non contiene un oggetto JSON." };
        }

        if (data.version !== BACKUP_VERSION) {
            return { ok: false, error: `Versione backup non supportata: trovata ${data.version}, attesa ${BACKUP_VERSION}.` };
        }

        if (!data.payload || typeof data.payload !== "object") {
            return { ok: false, error: "Dati non validi: payload mancante o malformato." };
        }

        // Light check on internals
        if (!("transactions" in data.payload) || !("budgets" in data.payload)) {
            return { ok: false, error: "Dati non validi: chiavi di sistema mancanti nel payload." };
        }

        return { ok: true, backup: data as BackupV1 };
    } catch {
        return { ok: false, error: "Errore durante il parsing del JSON: il file potrebbe essere corrotto." };
    }
};

/**
 * Restores a backup by overwriting localStorage data.
 */
export const applyBackupOverwrite = (backup: BackupV1): void => {
    if (backup.payload.transactions === null) {
        storage.remove(STORAGE_KEYS.TRANSACTIONS);
    } else {
        storage.set(STORAGE_KEYS.TRANSACTIONS, backup.payload.transactions);
    }

    if (backup.payload.budgets === null) {
        storage.remove(STORAGE_KEYS.BUDGETS);
    } else {
        storage.set(STORAGE_KEYS.BUDGETS, backup.payload.budgets);
    }

    if (backup.payload.categories === null) {
        storage.remove(STORAGE_KEYS.CATEGORIES);
    } else if (backup.payload.categories) {
        storage.set(STORAGE_KEYS.CATEGORIES, backup.payload.categories);
    }

    if (backup.payload.settings === null) {
        storage.remove(STORAGE_KEYS.SETTINGS);
    } else if (backup.payload.settings) {
        storage.set(STORAGE_KEYS.SETTINGS, backup.payload.settings);
    }
};

/**
 * Clears only transaction data.
 */
export const resetTransactions = (): void => {
    storage.remove(STORAGE_KEYS.TRANSACTIONS);
};

/**
 * Clears only budget data.
 */
export const resetBudgets = (): void => {
    storage.remove(STORAGE_KEYS.BUDGETS);
};

/**
 * Completely clears all application data from localStorage.
 */
export const resetAllData = (): void => {
    storage.remove(STORAGE_KEYS.TRANSACTIONS);
    storage.remove(STORAGE_KEYS.BUDGETS);
    // Note: We don't import resetSettings from repository here to avoid circular depends,
    // but the consumer (SettingsPage) should handle calling resetSettings provided by the hooks
    // or we can add the key cancellation here if we make the key public.
    // For now we add the key explicitly if needed or let the consumer handle it.
    // Let's stick to the pattern: the consumer orchestrates the "reset all".
};

export type BackupSummary = {
    txCount: number;
    budgetCount: number;
    periods: string[];
};

/**
 * Computes a summary from a BackupV1 object for user information before import.
 */
export const getBackupSummary = (backup: BackupV1): BackupSummary => {
    let txCount = 0;
    let budgetCount = 0;
    const periodsSet = new Set<string>();

    const transactions = backup.payload.transactions;
    const budgets = backup.payload.budgets;

    // Helper to extract period YYYY-MM
    const extractPeriod = (item: Record<string, unknown>): string | null => {
        if (!item || typeof item !== "object") return null;

        if (item.period && typeof item.period === "string" && /^\d{4}-\d{2}$/.test(item.period)) {
            return item.period;
        }

        if (typeof item.timestamp === "number") {
            try {
                return new Date(item.timestamp).toISOString().slice(0, 7);
            } catch { return null; }
        }

        if (typeof item.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(item.date)) {
            return item.date.slice(0, 7);
        }

        return null;
    };

    // Calculate Transaction Count & Periods
    if (Array.isArray(transactions)) {
        txCount = transactions.length;
        transactions.forEach(t => {
            const p = extractPeriod(t);
            if (p) periodsSet.add(p);
        });
    } else if (transactions && typeof transactions === "object") {
        Object.values(transactions).forEach(val => {
            if (Array.isArray(val)) {
                txCount += val.length;
                val.forEach(t => {
                    const p = extractPeriod(t);
                    if (p) periodsSet.add(p);
                });
            }
        });
    }

    // Calculate Budget Count & Periods
    if (Array.isArray(budgets)) {
        budgetCount = budgets.length;
        budgets.forEach(b => {
            const p = extractPeriod(b);
            if (p) periodsSet.add(p);
        });
    } else if (budgets && typeof budgets === "object") {
        const entries = Object.entries(budgets);
        budgetCount = entries.length;
        entries.forEach(([key, val]) => {
            const p = extractPeriod(val);
            if (p) {
                periodsSet.add(p);
            } else {
                // Try to extract from key if it looks like userId:YYYY-MM
                const match = key.match(/\d{4}-\d{2}$/);
                if (match) periodsSet.add(match[0]);
            }
        });
    }

    const periods = Array.from(periodsSet).sort().reverse().slice(0, 12);

    return {
        txCount,
        budgetCount,
        periods
    };
};
