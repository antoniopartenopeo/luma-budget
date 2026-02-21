import { NotificationKind } from "../types"

export const NOTIFICATION_KIND_LABEL: Record<NotificationKind, string> = {
    feature: "Feature",
    fix: "Fix",
    improvement: "Improvement",
    breaking: "Breaking",
}

export const NOTIFICATION_KIND_CLASS: Record<NotificationKind, string> = {
    feature: "border-primary/20 bg-primary/10 text-primary dark:text-primary",
    fix: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    improvement: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    breaking: "border-rose-500/25 bg-rose-500/15 text-rose-700 dark:text-rose-300",
}

export function formatItalianDate(isoDate: string): string {
    const timestamp = new Date(isoDate).getTime()
    if (!Number.isFinite(timestamp)) return isoDate

    return new Intl.DateTimeFormat("it-IT", {
        year: "numeric",
        month: "short",
        day: "2-digit",
    }).format(new Date(timestamp))
}
