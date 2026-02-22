"use client"

import { useMemo } from "react"
import { AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { StaggerContainer } from "@/components/patterns/stagger-container"
import { macroItemVariants } from "@/components/patterns/macro-section"
import {
    useMarkAllNotificationsAsRead,
    useNotificationsFeed,
    useNotificationsState,
} from "../api/use-notifications"
import {
    NOTIFICATION_KIND_CLASS,
    NOTIFICATION_KIND_LABEL,
    formatItalianDate,
} from "./notification-ui"

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
        <StaggerContainer className="space-y-8 w-full">
            <motion.div variants={macroItemVariants}>
                <PageHeader
                    title="Storico Aggiornamenti"
                    description="Riepilogo completo delle release e dei fix distribuiti nell'app."
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
            </motion.div>

            {feedQuery.isLoading && (
                <motion.div variants={macroItemVariants}>
                    <div className="glass-card rounded-2xl p-6 text-sm font-medium leading-relaxed text-muted-foreground">
                        Caricamento aggiornamenti...
                    </div>
                </motion.div>
            )}

            {!feedQuery.isLoading && notifications.length === 0 && (
                <motion.div variants={macroItemVariants}>
                    <div className="glass-card rounded-2xl p-6 text-sm font-medium leading-relaxed text-muted-foreground">
                        Nessun aggiornamento disponibile.
                    </div>
                </motion.div>
            )}

            {!feedQuery.isLoading && groupedByVersion.map(([version, items]) => (
                <motion.div key={version} variants={macroItemVariants}>
                    <section
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
                                                <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5", NOTIFICATION_KIND_CLASS[notification.kind])}>
                                                    {NOTIFICATION_KIND_LABEL[notification.kind]}
                                                </Badge>
                                                {isCritical && (
                                                    <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-rose-500/25 bg-rose-500/15 text-rose-700 dark:text-rose-300">
                                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                                        Critico
                                                    </Badge>
                                                )}
                                                {isRead && (
                                                    <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                                                        Letto
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        <h3 className="text-sm font-bold leading-tight">{notification.title}</h3>
                                        <p className="text-sm font-medium leading-relaxed text-muted-foreground">{notification.body}</p>

                                        {notification.highlights.length > 0 && (
                                            <ul className="text-xs font-medium leading-relaxed text-muted-foreground/90 space-y-1 list-disc pl-4">
                                                {notification.highlights.map((highlight, index) => (
                                                    <li key={`${notification.id}-updates-hl-${index}`}>{highlight}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </article>
                                )
                            })}
                        </div>
                    </section>
                </motion.div>
            ))}
        </StaggerContainer>
    )
}
