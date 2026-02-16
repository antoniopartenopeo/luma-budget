function clampPercent(value: number): number {
    if (!Number.isFinite(value)) return 0
    return Math.min(100, Math.max(0, Math.round(value)))
}

function parseForceFlag(raw: string | undefined): "on" | "off" | null {
    if (!raw) return null
    const normalized = raw.trim().toLowerCase()
    if (normalized === "on") return "on"
    if (normalized === "off") return "off"
    return null
}

function bucketUserId(userId: string): number {
    let hash = 2166136261
    for (let index = 0; index < userId.length; index += 1) {
        hash ^= userId.charCodeAt(index)
        hash = Math.imul(hash, 16777619)
    }
    return (hash >>> 0) % 100
}

export function isFinancialLabRealtimeOverlayEnabled(userId: string): boolean {
    const forced = parseForceFlag(process.env.NEXT_PUBLIC_FF_FINLAB_RT_OVERLAY_FORCE)
    if (forced === "on") return true
    if (forced === "off") return false

    const rolloutPercentRaw = process.env.NEXT_PUBLIC_FF_FINLAB_RT_OVERLAY_PERCENT
    if (typeof rolloutPercentRaw === "undefined") {
        return true
    }

    const rolloutPercent = clampPercent(Number(rolloutPercentRaw))
    if (rolloutPercent <= 0) return false
    if (rolloutPercent >= 100) return true

    return bucketUserId(userId) < rolloutPercent
}
