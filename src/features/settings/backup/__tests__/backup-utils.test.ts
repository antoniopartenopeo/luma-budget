import { describe, it, expect, vi, beforeEach } from "vitest";
import {
    buildBackupV1,
    serializeBackup,
    parseAndValidateBackup,
    applyBackupOverwrite,
    resetAllData,
    STORAGE_KEYS,
    BACKUP_VERSION
} from "../backup-utils";
import { storage } from "@/lib/storage-utils";

// Mock storage
vi.mock("@/lib/storage-utils", () => ({
    storage: {
        get: vi.fn(),
        set: vi.fn(),
        remove: vi.fn(),
    },
}));

describe("Backup Utils", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("buildBackupV1", () => {
        it("should build a backup object with current state", () => {
            const mockTransactions = { "user-1": [{ id: "1" }] };
            const mockBudgets = { "user-1:2025-12": { id: "b1" } };

            vi.mocked(storage.get).mockImplementation((key) => {
                if (key === STORAGE_KEYS.TRANSACTIONS) return mockTransactions;
                if (key === STORAGE_KEYS.BUDGETS) return mockBudgets;
                return null;
            });

            const backup = buildBackupV1();

            expect(backup.version).toBe(BACKUP_VERSION);
            expect(backup.payload.transactions).toEqual(mockTransactions);
            expect(backup.payload.budgets).toEqual(mockBudgets);
            expect(backup.exportedAt).toBeDefined();
        });

        it("should handle empty storage by returning null in payload", () => {
            vi.mocked(storage.get).mockReturnValue(null);

            const backup = buildBackupV1();

            expect(backup.payload.transactions).toBeNull();
            expect(backup.payload.budgets).toBeNull();
        });
    });

    describe("serialize/deserialize", () => {
        it("should perform roundtrip correctly", () => {
            const backup = buildBackupV1();
            const json = serializeBackup(backup);
            const result = parseAndValidateBackup(json);

            expect(result.ok).toBe(true);
            if (result.ok) {
                expect(result.backup).toEqual(expect.objectContaining({
                    version: BACKUP_VERSION,
                    payload: backup.payload
                }));
            }
        });

        it("should fail for invalid JSON", () => {
            const result = parseAndValidateBackup("not a json");
            expect(result.ok).toBe(false);
            if (!result.ok) {
                expect(result.error).toMatch(/Errore durante il parsing/);
            }
        });

        it("should fail for wrong version", () => {
            const invalidBackup = { version: 99, payload: {}, keys: {} };
            const result = parseAndValidateBackup(JSON.stringify(invalidBackup));
            expect(result.ok).toBe(false);
            if (!result.ok) {
                expect(result.error).toMatch(/Versione backup non supportata/);
            }
        });
    });

    describe("applyBackupOverwrite", () => {
        it("should call storage.set for valid payloads", () => {
            const backup = buildBackupV1();
            backup.payload.transactions = { some: "data" };

            applyBackupOverwrite(backup);

            expect(storage.set).toHaveBeenCalledWith(STORAGE_KEYS.TRANSACTIONS, { some: "data" });
        });

        it("should call storage.remove for null payloads", () => {
            const backup = buildBackupV1();
            backup.payload.transactions = null;

            applyBackupOverwrite(backup);

            expect(storage.remove).toHaveBeenCalledWith(STORAGE_KEYS.TRANSACTIONS);
        });
    });

    describe("resetAllData", () => {
        it("should remove both keys", () => {
            resetAllData();
            expect(storage.remove).toHaveBeenCalledWith(STORAGE_KEYS.TRANSACTIONS);
            expect(storage.remove).toHaveBeenCalledWith(STORAGE_KEYS.BUDGETS);
        });
    });
});
