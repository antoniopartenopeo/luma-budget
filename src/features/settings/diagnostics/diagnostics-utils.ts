
export type DiagnosticsSnapshot = {
    generatedAt: string
    app: {
        version: string
        env: string
    }
    storage: Array<{
        key: string
        present: boolean
        approxBytes: number
        summary: string
    }>
    notes: string[]
}

export function getAppVersion(): string {
    return process.env.NEXT_PUBLIC_APP_VERSION ?? "dev"
}

export function safeGetItem(key: string): string | null {
    if (typeof window === "undefined") return null
    try {
        return localStorage.getItem(key)
    } catch {
        return null
    }
}

export function estimateBytes(str: string | null): number {
    if (str === null) return 0
    if (typeof Blob !== "undefined") {
        try {
            return new Blob([str]).size
        } catch {
            // Fallback if Blob fails
        }
    }
    return str.length
}

export function countTransactionsFromRaw(raw: unknown): number {
    if (Array.isArray(raw)) {
        return raw.length
    }
    if (raw && typeof raw === "object") {
        let count = 0
        for (const value of Object.values(raw)) {
            if (Array.isArray(value)) {
                count += value.length
            }
        }
        return count
    }
    return 0
}

export function countBudgetPlansFromRaw(raw: unknown): number {
    if (Array.isArray(raw)) {
        return raw.length
    }
    if (raw && typeof raw === "object") {
        return Object.keys(raw).length
    }
    return 0
}

export function buildDiagnosticsSnapshot(): DiagnosticsSnapshot {
    const keys = [
        "luma_transactions_v1",
        "luma_budget_plans_v1",
        "luma_settings_v1",
    ]

    const storageReport = keys.map((key) => {
        const rawString = safeGetItem(key)
        const present = rawString !== null
        const approxBytes = estimateBytes(rawString)
        let summary = present ? "present" : "missing"

        if (present && rawString) {
            try {
                const raw = JSON.parse(rawString)
                if (key === "luma_transactions_v1") {
                    summary = `transactions: ${countTransactionsFromRaw(raw)}`
                } else if (key === "luma_budget_plans_v1") {
                    summary = `budgetPlans: ${countBudgetPlansFromRaw(raw)}`
                } else if (key === "luma_settings_v1") {
                    summary = "settings: ok"
                }
            } catch {
                summary = "corrupted JSON"
            }
        }

        return {
            key,
            present,
            approxBytes,
            summary,
        }
    })

    return {
        generatedAt: new Date().toISOString(),
        app: {
            version: getAppVersion(),
            env: process.env.NODE_ENV || "unknown",
        },
        storage: storageReport,
        notes: ["Cross-tab sync: enabled via storage event listener (best-effort info)"],
    }
}
