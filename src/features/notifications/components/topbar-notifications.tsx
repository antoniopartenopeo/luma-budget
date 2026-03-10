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
import {
    NOTIFICATION_KIND_CLASS,
    NOTIFICATION_KIND_LABEL,
    formatItalianDate,
} from "./notification-ui"

interface TopbarNotificationsProps {
    triggerClassName?: string
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
                    aria-label="Notifiche aggiornamenti"
                    className={cn(
                        "group relative h-10 w-10 rounded-full border border-primary/20 bg-primary/10 text-primary transition-[background-color,box-shadow,transform] duration-300 hover:bg-primary/20 hover:shadow-md hover:-translate-y-[1px] motion-reduce:transform-none",
                        triggerClassName
                    )}
                >
                    <Bell className="h-5 w-5 transition-transform duration-300 group-hover:scale-110 group-active:scale-110 motion-reduce:transform-none" />
                    {hasUnread && (
                        <span
                            data-testid="topbar-notifications-badge"
                            className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-destructive text-destructive-foreground text-xs font-black flex items-center justify-center motion-safe:group-hover:animate-pulse-soft motion-safe:group-active:animate-pulse-soft motion-reduce:animate-none"
                        >
                            {unreadBadgeText}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="glass-panel w-[380px] rounded-[1.75rem] p-0"
            >
                <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between gap-3">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-bold tracking-tight text-foreground">Novità dell&apos;app</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground">
                                {unreadCount} da leggere
                            </span>
                            {criticalUnreadCount > 0 && (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-300">
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
                        className="h-7 px-2 text-xs font-semibold"
                        disabled={!hasUnread || markAllAsRead.isPending}
                        onClick={() => markAllAsRead.mutate({
                            ids: notifications.map(notification => notification.id),
                            lastSeenVersion: latestVersion,
                        })}
                    >
                        Segna tutto come letto
                    </Button>
                </div>

                <div className="max-h-[380px] overflow-y-auto p-2 space-y-2">
                    {isLoading && (
                        <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                            Sto caricando le novità...
                        </div>
                    )}

                    {!isLoading && notifications.length === 0 && (
                        <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                            Non ci sono ancora novità.
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
                                    "glass-card space-y-2 rounded-[1.25rem] border p-3 transition-[background-color,border-color,box-shadow] duration-200",
                                    isUnread ? "bg-primary/6 border-primary/20" : "bg-white/42 border-white/25 dark:bg-white/[0.03] dark:border-white/10",
                                    isCritical && "ring-1 ring-rose-500/25 border-rose-500/25"
                                )}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-1.5">
                                        <Badge
                                            variant="outline"
                                            className={cn("px-2.5 py-0.5 text-xs", NOTIFICATION_KIND_CLASS[notification.kind])}
                                        >
                                            {NOTIFICATION_KIND_LABEL[notification.kind]}
                                        </Badge>
                                        {isCritical && (
                                            <Badge variant="outline" className="px-2.5 py-0.5 text-xs border-rose-500/25 bg-rose-500/15 text-rose-700 dark:text-rose-300">
                                                Critico
                                            </Badge>
                                        )}
                                    </div>
                                    <span className="text-xs text-muted-foreground font-medium">
                                        {formatItalianDate(notification.publishedAt)}
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    <h4 className="text-sm font-bold leading-tight">{notification.title}</h4>
                                    <p className="text-sm font-medium leading-relaxed text-muted-foreground">{notification.body}</p>
                                    {notification.highlights.length > 0 && (
                                        <ul className="text-xs font-medium leading-relaxed text-muted-foreground/90 space-y-1 list-disc pl-4">
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
                                            className="h-7 px-2 text-xs font-semibold"
                                            onClick={() => markOneAsRead.mutate({
                                                id: notification.id,
                                                lastSeenVersion: latestVersion,
                                            })}
                                            disabled={markOneAsRead.isPending}
                                        >
                                            Segna come letta
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                <div className="px-3 py-2 border-t border-border/50">
                    <Button asChild variant="ghost" size="sm" data-testid="topbar-notifications-open-updates" className="h-8 w-full justify-center text-xs font-semibold">
                        <Link href="/updates">Apri cronologia completa</Link>
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
