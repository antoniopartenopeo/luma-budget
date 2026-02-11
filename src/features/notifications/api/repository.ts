import { storage } from "@/lib/storage-utils"
import {
    ChangelogNotification,
    NotificationKind,
    NotificationsStateV1,
    NotificationsStateV2
} from "../types"

export const LEGACY_NOTIFICATIONS_STATE_STORAGE_KEY = "numa_notifications_state_v1"
export const NOTIFICATIONS_STATE_STORAGE_KEY = "numa_notifications_state_v2"
export const CHANGELOG_NOTIFICATIONS_API_PATH = "/api/notifications/changelog"

const VALID_KINDS: NotificationKind[] = ["feature", "fix", "improvement", "breaking"]

function nowIso(): string {
    return new Date().toISOString()
}

function createDefaultState(): NotificationsStateV2 {
    return {
        version: 2,
        readIds: [],
        lastSeenVersion: null,
        updatedAt: nowIso(),
    }
}

function isValidKind(value: unknown): value is NotificationKind {
    return typeof value === "string" && VALID_KINDS.includes(value as NotificationKind)
}

function sanitizeReadIds(value: unknown): string[] {
    if (!Array.isArray(value)) return []
    const ids = value.filter((id): id is string => typeof id === "string" && id.trim().length > 0)
    return Array.from(new Set(ids))
}

function sanitizeHighlights(value: unknown): string[] {
    if (!Array.isArray(value)) return []

    const out: string[] = []
    const seen = new Set<string>()

    for (const item of value) {
        if (typeof item !== "string") continue
        const normalized = item.trim()
        if (!normalized || seen.has(normalized)) continue
        seen.add(normalized)
        out.push(normalized)
    }

    return out
}

function normalizeNotification(value: unknown): ChangelogNotification | null {
    if (!value || typeof value !== "object") return null
    const candidate = value as Partial<ChangelogNotification>

    if (
        typeof candidate.id !== "string" ||
        candidate.id.trim().length === 0 ||
        typeof candidate.version !== "string" ||
        candidate.version.trim().length === 0 ||
        !isValidKind(candidate.kind) ||
        candidate.audience !== "beta" ||
        typeof candidate.title !== "string" ||
        candidate.title.trim().length === 0 ||
        typeof candidate.body !== "string" ||
        candidate.body.trim().length === 0 ||
        typeof candidate.publishedAt !== "string" ||
        (candidate.link !== undefined && typeof candidate.link !== "string")
    ) {
        return null
    }

    const body = candidate.body.trim()
    const highlights = sanitizeHighlights(candidate.highlights).filter(item => item !== body)

    return {
        id: candidate.id.trim(),
        version: candidate.version.trim(),
        kind: candidate.kind,
        audience: "beta",
        title: candidate.title.trim(),
        body,
        highlights,
        isCritical: candidate.isCritical === true,
        publishedAt: candidate.publishedAt,
        link: candidate.link,
    }
}

function toTimestamp(isoDate: string): number {
    const ts = new Date(isoDate).getTime()
    return Number.isFinite(ts) ? ts : 0
}

function normalizeStateV2(candidate: Partial<NotificationsStateV2>): NotificationsStateV2 {
    return {
        version: 2,
        readIds: sanitizeReadIds(candidate.readIds),
        lastSeenVersion: typeof candidate.lastSeenVersion === "string" && candidate.lastSeenVersion.trim().length > 0
            ? candidate.lastSeenVersion.trim()
            : null,
        updatedAt: typeof candidate.updatedAt === "string" ? candidate.updatedAt : nowIso(),
    }
}

function parseLegacyStateV1(raw: unknown): NotificationsStateV1 | null {
    if (!raw || typeof raw !== "object") return null
    const candidate = raw as Partial<NotificationsStateV1>
    if (candidate.version !== 1) return null

    return {
        version: 1,
        readIds: sanitizeReadIds(candidate.readIds),
        updatedAt: typeof candidate.updatedAt === "string" ? candidate.updatedAt : nowIso(),
    }
}

export async function fetchChangelogNotifications(): Promise<ChangelogNotification[]> {
    let feed: unknown = []

    try {
        const response = await fetch(CHANGELOG_NOTIFICATIONS_API_PATH, {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
            cache: "no-store",
        })
        if (!response.ok) return []
        feed = await response.json()
    } catch {
        return []
    }

    const safeFeed = Array.isArray(feed) ? feed : []

    return safeFeed
        .map(normalizeNotification)
        .filter((notification): notification is ChangelogNotification => notification !== null)
        .filter(notification => notification.audience === "beta")
        .sort((a, b) => toTimestamp(b.publishedAt) - toTimestamp(a.publishedAt))
}

export async function fetchNotificationsState(): Promise<NotificationsStateV2> {
    const rawV2 = storage.get<unknown>(NOTIFICATIONS_STATE_STORAGE_KEY, null)
    if (rawV2 && typeof rawV2 === "object") {
        const candidate = rawV2 as Partial<NotificationsStateV2>
        if (candidate.version === 2) {
            const normalized = normalizeStateV2(candidate)
            if (
                normalized.readIds.length !== (Array.isArray(candidate.readIds) ? candidate.readIds.length : 0) ||
                normalized.lastSeenVersion !== (typeof candidate.lastSeenVersion === "string" ? candidate.lastSeenVersion : null)
            ) {
                storage.set(NOTIFICATIONS_STATE_STORAGE_KEY, normalized)
            }
            return normalized
        }
    }

    const rawV1 = storage.get<unknown>(LEGACY_NOTIFICATIONS_STATE_STORAGE_KEY, null)
    const legacy = parseLegacyStateV1(rawV1)
    if (legacy) {
        const migrated: NotificationsStateV2 = {
            version: 2,
            readIds: legacy.readIds,
            lastSeenVersion: null,
            updatedAt: legacy.updatedAt || nowIso(),
        }
        storage.set(NOTIFICATIONS_STATE_STORAGE_KEY, migrated)
        return migrated
    }

    return createDefaultState()
}

export async function markNotificationAsRead(id: string, lastSeenVersion?: string): Promise<NotificationsStateV2> {
    const current = await fetchNotificationsState()
    const safeId = id.trim()
    const readIds = safeId ? sanitizeReadIds([...current.readIds, safeId]) : current.readIds

    const next: NotificationsStateV2 = {
        version: 2,
        readIds,
        lastSeenVersion: typeof lastSeenVersion === "string" && lastSeenVersion.trim().length > 0
            ? lastSeenVersion.trim()
            : current.lastSeenVersion,
        updatedAt: nowIso(),
    }

    storage.set(NOTIFICATIONS_STATE_STORAGE_KEY, next)
    return next
}

export async function markAllNotificationsAsRead(ids: string[], lastSeenVersion?: string): Promise<NotificationsStateV2> {
    const current = await fetchNotificationsState()

    const next: NotificationsStateV2 = {
        version: 2,
        readIds: sanitizeReadIds(ids),
        lastSeenVersion: typeof lastSeenVersion === "string" && lastSeenVersion.trim().length > 0
            ? lastSeenVersion.trim()
            : current.lastSeenVersion,
        updatedAt: nowIso(),
    }

    storage.set(NOTIFICATIONS_STATE_STORAGE_KEY, next)
    return next
}

export function resetNotificationsState(): void {
    storage.remove(NOTIFICATIONS_STATE_STORAGE_KEY)
    storage.remove(LEGACY_NOTIFICATIONS_STATE_STORAGE_KEY)
}
