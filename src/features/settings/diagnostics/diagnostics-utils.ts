
import { STORAGE_KEYS_REGISTRY } from "@/lib/storage-keys"

export type DiagnosticsSnapshot = {
    generatedAt: string
    app: {
        version: string
        env: string
    }
    storage: Array<{
        key: string
        label: string
        present: boolean
        approxBytes: number
        summary: string
        isUnregistered?: boolean
    }>
    totalApproxBytes: number
    notes: string[]
}

export function getAppVersion(): string {
    return process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0"
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

export function buildDiagnosticsSnapshot(): DiagnosticsSnapshot {
    const storageReport: DiagnosticsSnapshot["storage"] = STORAGE_KEYS_REGISTRY.map((config) => {
        const rawString = safeGetItem(config.key)
        const present = rawString !== null
        const approxBytes = estimateBytes(rawString)
        let summary = present ? "present" : "missing"

        if (present && rawString) {
            try {
                const raw = JSON.parse(rawString)
                if (config.countFn) {
                    const count = config.countFn(raw)
                    summary = `${config.label}: ${count}`
                } else {
                    summary = `${config.label}: ok`
                }
            } catch {
                summary = "corrupted JSON"
            }
        }

        return {
            key: config.key,
            label: config.label,
            present,
            approxBytes,
            summary,
        }
    })

    // Detect unregistered luma_ keys
    if (typeof window !== "undefined") {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key?.startsWith("luma_") && !STORAGE_KEYS_REGISTRY.some(c => c.key === key)) {
                const rawString = localStorage.getItem(key)
                storageReport.push({
                    key,
                    label: "Unregistered",
                    present: true,
                    approxBytes: estimateBytes(rawString),
                    summary: "Unregistered storage key",
                    isUnregistered: true
                })
            }
        }
    }

    const totalApproxBytes = storageReport.reduce((acc, curr) => acc + curr.approxBytes, 0)

    return {
        generatedAt: new Date().toISOString(),
        app: {
            version: getAppVersion(),
            env: process.env.NODE_ENV || "unknown",
        },
        storage: storageReport,
        totalApproxBytes,
        notes: ["Cross-tab sync: enabled via storage event listener (best-effort info)"],
    }
}
