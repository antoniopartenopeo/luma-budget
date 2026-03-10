import { storage } from "@/lib/storage-utils";
import {
    STORAGE_KEY_BUDGET_PLANS,
    STORAGE_KEY_CATEGORIES,
    STORAGE_KEY_LEGACY_PORTFOLIO,
    STORAGE_KEY_NOTIFICATIONS,
    STORAGE_KEY_PRIVACY,
    STORAGE_KEYS_REGISTRY,
    STORAGE_KEY_SETTINGS,
    STORAGE_KEY_TRANSACTIONS,
} from "@/lib/storage-keys";

export const BACKUP_VERSION = 2 as const;
export const BACKUP_LEGACY_VERSION = 1 as const;
export const BACKUP_EXPORT_PRIVACY_NOTE =
    "Il backup esportato e un file JSON non cifrato: trattalo come dati finanziari sensibili.";
export const BACKUP_IMPORT_VALIDATION_NOTE =
    "Durante il ripristino Numa importa solo le sezioni riconosciute del backup e rifiuta payload malformati.";

type BackupJsonPrimitive = string | number | boolean | null;
type BackupJsonValue = BackupJsonPrimitive | BackupJsonValue[] | { [key: string]: BackupJsonValue };

export const STORAGE_KEYS = {
    TRANSACTIONS: STORAGE_KEY_TRANSACTIONS,
    BUDGETS: STORAGE_KEY_BUDGET_PLANS,
    CATEGORIES: STORAGE_KEY_CATEGORIES,
    SETTINGS: STORAGE_KEY_SETTINGS,
    PORTFOLIO: STORAGE_KEY_LEGACY_PORTFOLIO,
    NOTIFICATIONS: STORAGE_KEY_NOTIFICATIONS,
    PRIVACY: STORAGE_KEY_PRIVACY,
};

export type BackupMetaV2 = {
    format: "json-cleartext";
    validation: "strict";
    containsSensitiveFinancialData: true;
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
    meta: BackupMetaV2;
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

function buildBackupMeta(): BackupMetaV2 {
    return {
        format: "json-cleartext",
        validation: "strict",
        containsSensitiveFinancialData: true,
    };
}

function nowIso(): string {
    return new Date().toISOString();
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}

function isJsonRecord(value: BackupJsonValue): value is { [key: string]: BackupJsonValue } {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sanitizeJsonValue(value: unknown, depth = 0): BackupJsonValue | undefined {
    if (depth > 12) return undefined;
    if (value === null) return null;

    if (typeof value === "string" || typeof value === "boolean") {
        return value;
    }

    if (typeof value === "number") {
        return Number.isFinite(value) ? value : undefined;
    }

    if (Array.isArray(value)) {
        const sanitizedItems = value
            .map((item) => sanitizeJsonValue(item, depth + 1))
            .filter((item): item is BackupJsonValue => typeof item !== "undefined");
        return sanitizedItems;
    }

    if (!isPlainObject(value)) {
        return undefined;
    }

    const sanitizedEntries = Object.entries(value)
        .map(([key, entryValue]) => [key, sanitizeJsonValue(entryValue, depth + 1)] as const)
        .filter(([, entryValue]) => typeof entryValue !== "undefined");

    return Object.fromEntries(sanitizedEntries) as { [key: string]: BackupJsonValue };
}

function normalizeExportedAt(value: unknown): string {
    if (typeof value !== "string") return nowIso();
    const timestamp = new Date(value).getTime();
    return Number.isFinite(timestamp) ? value : nowIso();
}

function invalidBackupField(field: string): { ok: false; error: string } {
    return {
        ok: false,
        error: `Dati non validi: sezione ${field} non riconosciuta nel backup.`,
    };
}

function normalizeTransactionsPayload(value: unknown): BackupV1["payload"]["transactions"] | undefined {
    if (value === null || typeof value === "undefined") return null;
    const sanitized = sanitizeJsonValue(value);
    if (!sanitized) return undefined;

    if (Array.isArray(sanitized)) {
        return sanitized.every(isJsonRecord) ? sanitized : undefined;
    }

    if (!isJsonRecord(sanitized)) return undefined;
    const isRecordOfTransactionArrays = Object.values(sanitized).every(
        (entry) => Array.isArray(entry) && entry.every(isJsonRecord)
    );
    return isRecordOfTransactionArrays ? sanitized : undefined;
}

function normalizeBudgetsPayload(value: unknown): BackupV1["payload"]["budgets"] | undefined {
    if (value === null || typeof value === "undefined") return null;
    const sanitized = sanitizeJsonValue(value);
    if (!sanitized) return undefined;

    if (Array.isArray(sanitized)) {
        return sanitized.every(isJsonRecord) ? sanitized : undefined;
    }

    if (!isJsonRecord(sanitized)) return undefined;
    const isRecordOfBudgetObjects = Object.values(sanitized).every(isJsonRecord);
    return isRecordOfBudgetObjects ? sanitized : undefined;
}

function normalizeCategoriesPayload(value: unknown): BackupV1["payload"]["categories"] | undefined {
    if (value === null || typeof value === "undefined") return null;
    const sanitized = sanitizeJsonValue(value);
    if (!sanitized) return undefined;

    if (Array.isArray(sanitized)) {
        return sanitized.every(isJsonRecord) ? sanitized : undefined;
    }

    if (!isJsonRecord(sanitized)) return undefined;
    const categories = sanitized.categories;
    if (!Array.isArray(categories) || !categories.every(isJsonRecord)) return undefined;

    return {
        version: 1,
        categories,
        updatedAt: typeof sanitized.updatedAt === "string" ? sanitized.updatedAt : nowIso(),
    };
}

function normalizePlainObjectPayload(value: unknown): Record<string, BackupJsonValue> | null | undefined {
    if (value === null || typeof value === "undefined") return null;
    const sanitized = sanitizeJsonValue(value);
    if (!sanitized || !isJsonRecord(sanitized)) return undefined;
    return sanitized;
}

/**
 * Builds a BackupV2 object from current localStorage data.
 */
export const buildBackupV2 = (): BackupV2 => {
    return {
        version: BACKUP_VERSION,
        exportedAt: nowIso(),
        meta: buildBackupMeta(),
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
    const payload = data.payload as Record<string, unknown>;

    return {
        version: 1,
        exportedAt: normalizeExportedAt(data.exportedAt),
        keys: {
            transactionsKey: STORAGE_KEYS.TRANSACTIONS,
            budgetsKey: STORAGE_KEYS.BUDGETS,
            categoriesKey: STORAGE_KEYS.CATEGORIES,
            settingsKey: STORAGE_KEYS.SETTINGS,
        },
        payload: {
            transactions: normalizeTransactionsPayload(payload.transactions),
            budgets: normalizeBudgetsPayload(payload.budgets),
            categories: normalizeCategoriesPayload(payload.categories),
            settings: normalizePlainObjectPayload(payload.settings),
        },
    };
}

function normalizeV2Backup(data: Record<string, unknown>): BackupV2 {
    const payload = data.payload as Record<string, unknown>;

    return {
        version: 2,
        exportedAt: normalizeExportedAt(data.exportedAt),
        meta: buildBackupMeta(),
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
            transactions: normalizeTransactionsPayload(payload.transactions),
            budgets: normalizeBudgetsPayload(payload.budgets),
            categories: normalizeCategoriesPayload(payload.categories),
            settings: normalizePlainObjectPayload(payload.settings),
            portfolio: normalizePlainObjectPayload(payload.portfolio),
            notifications: normalizePlainObjectPayload(payload.notifications),
            privacy: normalizePlainObjectPayload(payload.privacy),
        },
    };
}

/**
 * Parses and validates backup JSON. Supports legacy v1 and current v2.
 */
export const parseAndValidateBackup = (json: string): { ok: true; backup: BackupFile } | { ok: false; error: string } => {
    try {
        if (json.trim().length === 0) {
            return { ok: false, error: "Dati non validi: il file e vuoto." };
        }

        const parsed = JSON.parse(json);

        if (!isPlainObject(parsed)) {
            return { ok: false, error: "Dati non validi: il file non contiene un oggetto JSON." };
        }

        const data = parsed as Record<string, unknown>;
        if (!isPlainObject(data.payload)) {
            return { ok: false, error: "Dati non validi: payload mancante o malformato." };
        }

        const payload = data.payload as Record<string, unknown>;
        if (!("transactions" in payload) || !("budgets" in payload)) {
            return { ok: false, error: "Dati non validi: chiavi di sistema mancanti nel payload." };
        }

        if (data.version === BACKUP_LEGACY_VERSION) {
            const normalizedBackup = normalizeV1Backup(data);
            if (typeof normalizedBackup.payload.transactions === "undefined") {
                return invalidBackupField("transactions");
            }
            if (typeof normalizedBackup.payload.budgets === "undefined") {
                return invalidBackupField("budgets");
            }
            if (typeof normalizedBackup.payload.categories === "undefined") {
                return invalidBackupField("categories");
            }
            if (typeof normalizedBackup.payload.settings === "undefined") {
                return invalidBackupField("settings");
            }
            return { ok: true, backup: normalizedBackup };
        }

        if (data.version === BACKUP_VERSION) {
            const normalizedBackup = normalizeV2Backup(data);
            if (typeof normalizedBackup.payload.transactions === "undefined") {
                return invalidBackupField("transactions");
            }
            if (typeof normalizedBackup.payload.budgets === "undefined") {
                return invalidBackupField("budgets");
            }
            if (typeof normalizedBackup.payload.categories === "undefined") {
                return invalidBackupField("categories");
            }
            if (typeof normalizedBackup.payload.settings === "undefined") {
                return invalidBackupField("settings");
            }
            if (typeof normalizedBackup.payload.portfolio === "undefined") {
                return invalidBackupField("portfolio");
            }
            if (typeof normalizedBackup.payload.notifications === "undefined") {
                return invalidBackupField("notifications");
            }
            if (typeof normalizedBackup.payload.privacy === "undefined") {
                return invalidBackupField("privacy");
            }
            return { ok: true, backup: normalizedBackup };
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
    const keys = new Set([
        ...STORAGE_KEYS_REGISTRY.map((config) => config.key),
        STORAGE_KEYS.BUDGETS, // Legacy key: keep cleanup deterministic even after budget feature removal.
    ]);
    keys.forEach((key) => storage.remove(key));
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

    if (Array.isArray(transactions)) {
        txCount = transactions.length;
        transactions.forEach((transaction) => {
            const period = extractPeriod(transaction);
            if (period) periodsSet.add(period);
        });
    } else if (transactions && typeof transactions === "object") {
        Object.values(transactions).forEach((value) => {
            if (Array.isArray(value)) {
                txCount += value.length;
                value.forEach((transaction) => {
                    const period = extractPeriod(transaction);
                    if (period) periodsSet.add(period);
                });
            }
        });
    }

    if (Array.isArray(budgets)) {
        budgetCount = budgets.length;
        budgets.forEach((budget) => {
            const period = extractPeriod(budget);
            if (period) periodsSet.add(period);
        });
    } else if (budgets && typeof budgets === "object") {
        const entries = Object.entries(budgets);
        budgetCount = entries.length;
        entries.forEach(([key, value]) => {
            const period = extractPeriod(value);
            if (period) {
                periodsSet.add(period);
            } else {
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
