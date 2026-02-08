import { storage } from "@/lib/storage-utils"
import rawFeed from "../data/beta-changelog-feed.json"
import { ChangelogNotification, NotificationKind, NotificationsStateV1 } from "../types"

export const NOTIFICATIONS_STATE_STORAGE_KEY = "numa_notifications_state_v1"

const VALID_KINDS: NotificationKind[] = ["feature", "fix", "improvement"]

function nowIso() {
    return new Date().toISOString()
}

function createDefaultState(): NotificationsStateV1 {
    return {
        version: 1,
        readIds: [],
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

function isValidNotification(value: unknown): value is ChangelogNotification {
    if (!value || typeof value !== "object") return false
    const candidate = value as Partial<ChangelogNotification>

    return (
        typeof candidate.id === "string" &&
        candidate.id.trim().length > 0 &&
        typeof candidate.version === "string" &&
        candidate.version.trim().length > 0 &&
        isValidKind(candidate.kind) &&
        candidate.audience === "beta" &&
        typeof candidate.title === "string" &&
        candidate.title.trim().length > 0 &&
        typeof candidate.body === "string" &&
        candidate.body.trim().length > 0 &&
        typeof candidate.publishedAt === "string" &&
        (candidate.link === undefined || typeof candidate.link === "string")
    )
}

function toTimestamp(isoDate: string): number {
    const ts = new Date(isoDate).getTime()
    return Number.isFinite(ts) ? ts : 0
}

export async function fetchChangelogNotifications(): Promise<ChangelogNotification[]> {
    const feed = Array.isArray(rawFeed) ? rawFeed : []

    return feed
        .filter(isValidNotification)
        .filter(notification => notification.audience === "beta")
        .sort((a, b) => toTimestamp(b.publishedAt) - toTimestamp(a.publishedAt))
}

export async function fetchNotificationsState(): Promise<NotificationsStateV1> {
    const raw = storage.get<unknown>(NOTIFICATIONS_STATE_STORAGE_KEY, null)
    if (!raw || typeof raw !== "object") {
        return createDefaultState()
    }

    const candidate = raw as Partial<NotificationsStateV1>
    if (candidate.version !== 1) {
        return createDefaultState()
    }

    return {
        version: 1,
        readIds: sanitizeReadIds(candidate.readIds),
        updatedAt: typeof candidate.updatedAt === "string" ? candidate.updatedAt : nowIso(),
    }
}

export async function markNotificationAsRead(id: string): Promise<NotificationsStateV1> {
    const current = await fetchNotificationsState()
    const readIds = sanitizeReadIds([...current.readIds, id])

    const next: NotificationsStateV1 = {
        version: 1,
        readIds,
        updatedAt: nowIso(),
    }

    storage.set(NOTIFICATIONS_STATE_STORAGE_KEY, next)
    return next
}

export async function markAllNotificationsAsRead(ids: string[]): Promise<NotificationsStateV1> {
    const next: NotificationsStateV1 = {
        version: 1,
        readIds: sanitizeReadIds(ids),
        updatedAt: nowIso(),
    }

    storage.set(NOTIFICATIONS_STATE_STORAGE_KEY, next)
    return next
}

export function resetNotificationsState(): void {
    storage.remove(NOTIFICATIONS_STATE_STORAGE_KEY)
}

