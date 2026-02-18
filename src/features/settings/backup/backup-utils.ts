import { storage } from "@/lib/storage-utils";
import {
    STORAGE_KEY_BUDGET_PLANS,
    STORAGE_KEY_CATEGORIES,
    STORAGE_KEY_GOAL_PORTFOLIO,
    STORAGE_KEY_NOTIFICATIONS,
    STORAGE_KEY_PRIVACY,
    STORAGE_KEYS_REGISTRY,
    STORAGE_KEY_SETTINGS,
    STORAGE_KEY_TRANSACTIONS
} from "@/lib/storage-keys";

export const BACKUP_VERSION = 2 as const;
export const BACKUP_LEGACY_VERSION = 1 as const;

export const STORAGE_KEYS = {
    TRANSACTIONS: STORAGE_KEY_TRANSACTIONS,
    BUDGETS: STORAGE_KEY_BUDGET_PLANS,
    CATEGORIES: STORAGE_KEY_CATEGORIES,
    SETTINGS: STORAGE_KEY_SETTINGS,
    PORTFOLIO: STORAGE_KEY_GOAL_PORTFOLIO,
    NOTIFICATIONS: STORAGE_KEY_NOTIFICATIONS,
    PRIVACY: STORAGE_KEY_PRIVACY,
};

export type BackupV1 = {
    version: 1;
    exportedAt: string;
    keys: {
        transactionsKey: typeof STORAGE_KEYS.TRANSACTIONS;
        budgetsKey: typeof STORAGE_KEYS.BUDGETS;
        categoriesKey: typeof STORAGE_KEYS.CATEGORIES;
        settingsKey: typeof STORAGE_KEYS.SETTINGS;
    };
    payload: {
        transactions: unknown | null;
        budgets: unknown | null;
        categories: unknown | null;
        settings: unknown | null;
    };
};

export type BackupV2 = {
    version: 2;
    exportedAt: string;
    keys: {
        transactionsKey: typeof STORAGE_KEYS.TRANSACTIONS;
        budgetsKey: typeof STORAGE_KEYS.BUDGETS;
        categoriesKey: typeof STORAGE_KEYS.CATEGORIES;
        settingsKey: typeof STORAGE_KEYS.SETTINGS;
        portfolioKey: typeof STORAGE_KEYS.PORTFOLIO;
        notificationsKey: typeof STORAGE_KEYS.NOTIFICATIONS;
        privacyKey: typeof STORAGE_KEYS.PRIVACY;
    };
    payload: {
        transactions: unknown | null;
        budgets: unknown | null;
        categories: unknown | null;
        settings: unknown | null;
        portfolio: unknown | null;
        notifications: unknown | null;
        privacy: unknown | null;
    };
};

export type BackupFile = BackupV1 | BackupV2;

/**
 * Builds a BackupV2 object from current localStorage data.
 */
export const buildBackupV2 = (): BackupV2 => {
    return {
        version: BACKUP_VERSION,
        exportedAt: new Date().toISOString(),
        keys: {
            transactionsKey: STORAGE_KEYS.TRANSACTIONS,
            budgetsKey: STORAGE_KEYS.BUDGETS,
            categoriesKey: STORAGE_KEYS.CATEGORIES,
            settingsKey: STORAGE_KEYS.SETTINGS,
            portfolioKey: STORAGE_KEYS.PORTFOLIO,
            notificationsKey: STORAGE_KEYS.NOTIFICATIONS,
            privacyKey: STORAGE_KEYS.PRIVACY,
        },
        payload: {
            transactions: storage.get(STORAGE_KEYS.TRANSACTIONS, null),
            budgets: storage.get(STORAGE_KEYS.BUDGETS, null),
            categories: storage.get(STORAGE_KEYS.CATEGORIES, null),
            settings: storage.get(STORAGE_KEYS.SETTINGS, null),
            portfolio: storage.get(STORAGE_KEYS.PORTFOLIO, null),
            notifications: storage.get(STORAGE_KEYS.NOTIFICATIONS, null),
            privacy: storage.get(STORAGE_KEYS.PRIVACY, null),
        },
    };
};

/**
 * Backward-compatible alias used by existing call sites.
 */
export const buildBackupV1 = (): BackupV2 => buildBackupV2();

/**
 * Serializes a backup object to a JSON string.
 */
export const serializeBackup = (backup: BackupFile): string => {
    return JSON.stringify(backup, null, 2);
};

function normalizeV1Backup(data: Record<string, unknown>): BackupV1 {
    const payload = (data.payload ?? {}) as Record<string, unknown>;

    return {
        version: 1,
        exportedAt: typeof data.exportedAt === "string" ? data.exportedAt : new Date().toISOString(),
        keys: {
            transactionsKey: STORAGE_KEYS.TRANSACTIONS,
            budgetsKey: STORAGE_KEYS.BUDGETS,
            categoriesKey: STORAGE_KEYS.CATEGORIES,
            settingsKey: STORAGE_KEYS.SETTINGS,
        },
        payload: {
            transactions: payload.transactions ?? null,
            budgets: payload.budgets ?? null,
            categories: payload.categories ?? null,
            settings: payload.settings ?? null,
        },
    };
}

function normalizeV2Backup(data: Record<string, unknown>): BackupV2 {
    const payload = (data.payload ?? {}) as Record<string, unknown>;

    return {
        version: 2,
        exportedAt: typeof data.exportedAt === "string" ? data.exportedAt : new Date().toISOString(),
        keys: {
            transactionsKey: STORAGE_KEYS.TRANSACTIONS,
            budgetsKey: STORAGE_KEYS.BUDGETS,
            categoriesKey: STORAGE_KEYS.CATEGORIES,
            settingsKey: STORAGE_KEYS.SETTINGS,
            portfolioKey: STORAGE_KEYS.PORTFOLIO,
            notificationsKey: STORAGE_KEYS.NOTIFICATIONS,
            privacyKey: STORAGE_KEYS.PRIVACY,
        },
        payload: {
            transactions: payload.transactions ?? null,
            budgets: payload.budgets ?? null,
            categories: payload.categories ?? null,
            settings: payload.settings ?? null,
            portfolio: payload.portfolio ?? null,
            notifications: payload.notifications ?? null,
            privacy: payload.privacy ?? null,
        },
    };
}

/**
 * Parses and validates backup JSON. Supports legacy v1 and current v2.
 */
export const parseAndValidateBackup = (json: string): { ok: true; backup: BackupFile } | { ok: false; error: string } => {
    try {
        const parsed = JSON.parse(json);

        if (!parsed || typeof parsed !== "object") {
            return { ok: false, error: "Dati non validi: il file non contiene un oggetto JSON." };
        }

        const data = parsed as Record<string, unknown>;
        if (!data.payload || typeof data.payload !== "object") {
            return { ok: false, error: "Dati non validi: payload mancante o malformato." };
        }

        const payload = data.payload as Record<string, unknown>;
        if (!("transactions" in payload) || !("budgets" in payload)) {
            return { ok: false, error: "Dati non validi: chiavi di sistema mancanti nel payload." };
        }

        if (data.version === BACKUP_LEGACY_VERSION) {
            return { ok: true, backup: normalizeV1Backup(data) };
        }

        if (data.version === BACKUP_VERSION) {
            return { ok: true, backup: normalizeV2Backup(data) };
        }

        return {
            ok: false,
            error: `Versione backup non supportata: trovata ${String(data.version)}, supportate ${BACKUP_LEGACY_VERSION} e ${BACKUP_VERSION}.`,
        };
    } catch {
        return { ok: false, error: "Errore durante il parsing del JSON: il file potrebbe essere corrotto." };
    }
};

function applyStorageValue(key: string, value: unknown | null): void {
    if (value === null || value === undefined) {
        storage.remove(key);
        return;
    }

    storage.set(key, value);
}

/**
 * Restores a backup by overwriting localStorage data.
 */
export const applyBackupOverwrite = (backup: BackupFile): void => {
    applyStorageValue(STORAGE_KEYS.TRANSACTIONS, backup.payload.transactions);
    applyStorageValue(STORAGE_KEYS.BUDGETS, backup.payload.budgets);
    applyStorageValue(STORAGE_KEYS.CATEGORIES, backup.payload.categories);
    applyStorageValue(STORAGE_KEYS.SETTINGS, backup.payload.settings);

    if (backup.version === BACKUP_LEGACY_VERSION) {
        // Legacy backups do not carry extended state. Clear it to keep overwrite deterministic.
        applyStorageValue(STORAGE_KEYS.PORTFOLIO, null);
        applyStorageValue(STORAGE_KEYS.NOTIFICATIONS, null);
        applyStorageValue(STORAGE_KEYS.PRIVACY, null);
        return;
    }

    applyStorageValue(STORAGE_KEYS.PORTFOLIO, backup.payload.portfolio);
    applyStorageValue(STORAGE_KEYS.NOTIFICATIONS, backup.payload.notifications);
    applyStorageValue(STORAGE_KEYS.PRIVACY, backup.payload.privacy);
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
    const keys = new Set(STORAGE_KEYS_REGISTRY.map(config => config.key));
    keys.forEach(key => storage.remove(key));
};

export type BackupSummary = {
    txCount: number;
    budgetCount: number;
    periods: string[];
};

/**
 * Computes a summary from a backup object for user information before import.
 */
export const getBackupSummary = (backup: BackupFile): BackupSummary => {
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
            } catch {
                return null;
            }
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
        periods,
    };
};
