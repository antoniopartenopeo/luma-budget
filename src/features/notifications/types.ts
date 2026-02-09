export type NotificationKind = "feature" | "fix" | "improvement" | "breaking"
export type NotificationAudience = "beta"

export interface ChangelogNotification {
    id: string
    version: string
    kind: NotificationKind
    audience: NotificationAudience
    title: string
    // Summary line rendered before the highlights list.
    body: string
    // Additional bullet points; must not repeat body and can be empty.
    highlights: string[]
    isCritical?: boolean
    publishedAt: string
    link?: string
}

export interface NotificationsStateV1 {
    version: 1
    readIds: string[]
    updatedAt: string
}

export interface NotificationsStateV2 {
    version: 2
    readIds: string[]
    lastSeenVersion: string | null
    updatedAt: string
}
