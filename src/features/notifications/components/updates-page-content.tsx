"use client"

import Link from "next/link"
import { useMemo } from "react"
import { BellRing, AlertTriangle, ArrowUpRight } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
    useMarkAllNotificationsAsRead,
    useNotificationsFeed,
    useNotificationsState,
} from "../api/use-notifications"
import { NotificationKind } from "../types"

const KIND_LABEL: Record<NotificationKind, string> = {
    feature: "Feature",
    fix: "Fix",
    improvement: "Improvement",
    breaking: "Breaking",
}

const KIND_CLASS: Record<NotificationKind, string> = {
    feature: "border-primary/20 bg-primary/10 text-primary dark:text-primary",
    fix: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    improvement: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    breaking: "border-rose-500/25 bg-rose-500/15 text-rose-700 dark:text-rose-300",
}

function formatItalianDate(isoDate: string): string {
    const timestamp = new Date(isoDate).getTime()
    if (!Number.isFinite(timestamp)) return isoDate

    return new Intl.DateTimeFormat("it-IT", {
        year: "numeric",
        month: "short",
        day: "2-digit",
    }).format(new Date(timestamp))
}

export function UpdatesPageContent() {
    const feedQuery = useNotificationsFeed()
    const stateQuery = useNotificationsState()
    const markAllAsRead = useMarkAllNotificationsAsRead()

    const notifications = useMemo(() => feedQuery.data ?? [], [feedQuery.data])
    const readIds = useMemo(() => stateQuery.data?.readIds ?? [], [stateQuery.data?.readIds])
    const readSet = useMemo(() => new Set(readIds), [readIds])
    const latestVersion = notifications[0]?.version

    const groupedByVersion = useMemo(() => {
        const groups = new Map<string, typeof notifications>()
        for (const notification of notifications) {
            const current = groups.get(notification.version) ?? []
            current.push(notification)
            groups.set(notification.version, current)
        }
        return Array.from(groups.entries())
    }, [notifications])

    return (
        <div className="space-y-8 w-full">
            <PageHeader
                title={
                    <span className="flex items-center gap-3">
                        <BellRing className="h-8 w-8" />
                        Storico Aggiornamenti
                    </span>
                }
                description="Riepilogo completo delle release e dei fix distribuiti ai beta tester."
                actions={(
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={notifications.length === 0 || markAllAsRead.isPending}
                        onClick={() => markAllAsRead.mutate({
                            ids: notifications.map(notification => notification.id),
                            lastSeenVersion: latestVersion,
                        })}
                    >
                        Segna tutto come letto
                    </Button>
                )}
            />

            {feedQuery.isLoading && (
                <div className="glass-card rounded-2xl p-6 text-sm text-muted-foreground">
                    Caricamento aggiornamenti...
                </div>
            )}

            {!feedQuery.isLoading && notifications.length === 0 && (
                <div className="glass-card rounded-2xl p-6 text-sm text-muted-foreground">
                    Nessun aggiornamento disponibile.
                </div>
            )}

            {!feedQuery.isLoading && groupedByVersion.map(([version, items]) => (
                <section
                    key={version}
                    id={`v-${version.replaceAll(".", "-")}`}
                    className="glass-card rounded-2xl p-4 sm:p-5 space-y-3"
                >
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-sm sm:text-base font-black tracking-tight">
                            Release {version}
                        </h2>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                            {formatItalianDate(items[0].publishedAt)}
                        </span>
                    </div>

                    <div className="space-y-3">
                        {items.map(notification => {
                            const isCritical = notification.isCritical || notification.kind === "breaking"
                            const isRead = readSet.has(notification.id)

                            return (
                                <article
                                    key={notification.id}
                                    className={cn(
                                        "rounded-xl border p-3 space-y-2 transition-colors",
                                        isRead ? "bg-background/40 border-border/40" : "bg-primary/5 border-primary/20",
                                        isCritical && "ring-1 ring-rose-500/25 border-rose-500/25"
                                    )}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className={cn("text-[9px] px-2 py-0.5", KIND_CLASS[notification.kind])}>
                                                {KIND_LABEL[notification.kind]}
                                            </Badge>
                                            {isCritical && (
                                                <Badge variant="outline" className="text-[9px] px-2 py-0.5 border-rose-500/25 bg-rose-500/15 text-rose-700 dark:text-rose-300">
                                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                                    Critico
                                                </Badge>
                                            )}
                                            {isRead && (
                                                <Badge variant="outline" className="text-[9px] px-2 py-0.5">
                                                    Letto
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <h3 className="text-sm font-bold leading-tight">{notification.title}</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{notification.body}</p>

                                    {notification.highlights.length > 0 && (
                                        <ul className="text-[11px] text-muted-foreground/90 space-y-1 list-disc pl-4">
                                            {notification.highlights.map((highlight, index) => (
                                                <li key={`${notification.id}-updates-hl-${index}`}>{highlight}</li>
                                            ))}
                                        </ul>
                                    )}

                                    {notification.link && (
                                        <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-[10px] uppercase tracking-wider font-bold">
                                            <Link href={notification.link}>
                                                Apri dettaglio
                                                <ArrowUpRight className="h-3 w-3 ml-1" />
                                            </Link>
                                        </Button>
                                    )}
                                </article>
                            )
                        })}
                    </div>
                </section>
            ))}
        </div>
    )
}
