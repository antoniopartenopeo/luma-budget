import { storage } from "@/lib/storage-utils"

export const BACKUP_VERSION = 1 as const;

export const STORAGE_KEYS = {
    TRANSACTIONS: "luma_transactions_v1" as const,
    BUDGETS: "luma_budget_plans_v1" as const,
};

export type BackupV1 = {
    version: 1;
    exportedAt: string; // ISO
    keys: {
        transactionsKey: typeof STORAGE_KEYS.TRANSACTIONS;
        budgetsKey: typeof STORAGE_KEYS.BUDGETS;
    };
    payload: {
        transactions: unknown | null; // raw storage payload
        budgets: unknown | null;      // raw storage payload
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
        },
        payload: {
            transactions: storage.get(STORAGE_KEYS.TRANSACTIONS, null),
            budgets: storage.get(STORAGE_KEYS.BUDGETS, null),
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
    } catch (_e) {
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
};

/**
 * Completely clears all application data from localStorage.
 */
export const resetAllData = (): void => {
    storage.remove(STORAGE_KEYS.TRANSACTIONS);
    storage.remove(STORAGE_KEYS.BUDGETS);
};
