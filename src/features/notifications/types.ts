export type NotificationKind = "feature" | "fix" | "improvement"
export type NotificationAudience = "beta"

export interface ChangelogNotification {
    id: string
    version: string
    kind: NotificationKind
    audience: NotificationAudience
    title: string
    body: string
    publishedAt: string
    link?: string
}

export interface NotificationsStateV1 {
    version: 1
    readIds: string[]
    updatedAt: string
}

