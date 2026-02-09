"use client"

import Link from "next/link"
import { Bell, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import {
    useMarkAllNotificationsAsRead,
    useMarkNotificationAsRead,
    useUnreadNotifications
} from "../api/use-notifications"
import { NotificationKind } from "../types"

interface TopbarNotificationsProps {
    triggerClassName?: string
}

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

export function TopbarNotifications({ triggerClassName }: TopbarNotificationsProps) {
    const {
        notifications,
        unreadNotifications,
        unreadCount,
        criticalUnreadCount,
        isLoading
    } = useUnreadNotifications()
    const markOneAsRead = useMarkNotificationAsRead()
    const markAllAsRead = useMarkAllNotificationsAsRead()

    const unreadIdSet = new Set(unreadNotifications.map(notification => notification.id))
    const latestVersion = notifications[0]?.version
    const unreadBadgeText = unreadCount > 99 ? "99+" : `${unreadCount}`
    const hasUnread = unreadCount > 0

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    data-testid="topbar-notifications-trigger"
                    aria-label="Notifiche changelog beta"
                    className={cn(
                        "group relative h-10 w-10 rounded-full border border-primary/20 bg-primary/10 text-primary transition-all duration-300 hover:bg-primary/20 hover:shadow-md hover:-translate-y-[1px] motion-reduce:transform-none",
                        triggerClassName
                    )}
                >
                    <Bell className="h-5 w-5 transition-transform duration-300 group-hover:scale-110 group-active:scale-110 motion-reduce:transform-none" />
                    {hasUnread && (
                        <span
                            data-testid="topbar-notifications-badge"
                            className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-black flex items-center justify-center motion-safe:group-hover:animate-pulse-soft motion-safe:group-active:animate-pulse-soft motion-reduce:animate-none"
                        >
                            {unreadBadgeText}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-[380px] p-0 rounded-2xl border border-white/20 bg-background/95 backdrop-blur-xl"
            >
                <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between gap-3">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-black uppercase tracking-wider text-foreground">Aggiornamenti Beta</span>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-medium text-muted-foreground">
                                {unreadCount} non lett{unreadCount === 1 ? "o" : "i"}
                            </span>
                            {criticalUnreadCount > 0 && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-300">
                                    <AlertTriangle className="h-3 w-3" />
                                    {criticalUnreadCount} critic{criticalUnreadCount === 1 ? "o" : "i"}
                                </span>
                            )}
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        data-testid="topbar-notifications-mark-all"
                        className="text-[10px] uppercase tracking-wider font-bold h-7 px-2"
                        disabled={!hasUnread || markAllAsRead.isPending}
                        onClick={() => markAllAsRead.mutate({
                            ids: notifications.map(notification => notification.id),
                            lastSeenVersion: latestVersion,
                        })}
                    >
                        Segna tutti come letti
                    </Button>
                </div>

                <div className="max-h-[380px] overflow-y-auto p-2 space-y-2">
                    {isLoading && (
                        <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                            Caricamento notifiche...
                        </div>
                    )}

                    {!isLoading && notifications.length === 0 && (
                        <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                            Nessun aggiornamento disponibile.
                        </div>
                    )}

                    {!isLoading && notifications.map((notification) => {
                        const isUnread = unreadIdSet.has(notification.id)
                        const isCritical = notification.isCritical || notification.kind === "breaking"

                        return (
                            <div
                                key={notification.id}
                                data-testid={`notification-item-${notification.id}`}
                                className={cn(
                                    "rounded-xl border p-3 space-y-2 transition-colors",
                                    isUnread ? "bg-primary/5 border-primary/20" : "bg-background/40 border-border/40",
                                    isCritical && "ring-1 ring-rose-500/25 border-rose-500/25"
                                )}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-1.5">
                                        <Badge
                                            variant="outline"
                                            className={cn("text-[9px] px-2 py-0.5", KIND_CLASS[notification.kind])}
                                        >
                                            {KIND_LABEL[notification.kind]}
                                        </Badge>
                                        {isCritical && (
                                            <Badge variant="outline" className="text-[9px] px-2 py-0.5 border-rose-500/25 bg-rose-500/15 text-rose-700 dark:text-rose-300">
                                                Critico
                                            </Badge>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground font-medium">
                                        {formatItalianDate(notification.publishedAt)}
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    <h4 className="text-sm font-bold leading-tight">{notification.title}</h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{notification.body}</p>
                                    {notification.highlights.length > 0 && (
                                        <ul className="text-[11px] text-muted-foreground/90 space-y-1 list-disc pl-4">
                                            {notification.highlights.slice(0, 3).map((highlight, index) => (
                                                <li key={`${notification.id}-hl-${index}`}>{highlight}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                {isUnread && (
                                    <div className="pt-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            data-testid={`notification-read-${notification.id}`}
                                            className="h-7 px-2 text-[10px] uppercase tracking-wider font-bold"
                                            onClick={() => markOneAsRead.mutate({
                                                id: notification.id,
                                                lastSeenVersion: latestVersion,
                                            })}
                                            disabled={markOneAsRead.isPending}
                                        >
                                            Segna come letto
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                <div className="px-3 py-2 border-t border-border/50">
                    <Button asChild variant="ghost" size="sm" data-testid="topbar-notifications-open-updates" className="w-full justify-center text-[10px] uppercase tracking-wider font-bold h-8">
                        <Link href="/updates">Apri storico aggiornamenti</Link>
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
