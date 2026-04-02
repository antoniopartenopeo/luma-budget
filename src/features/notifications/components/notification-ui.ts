import { NotificationKind } from "../types"

export const NOTIFICATION_KIND_LABEL: Record<NotificationKind, string> = {
    feature: "Novità",
    fix: "Correzioni",
    improvement: "Miglioramenti",
    breaking: "Indicazioni importanti",
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
