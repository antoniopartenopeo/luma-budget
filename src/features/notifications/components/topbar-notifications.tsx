"use client"

import Link from "next/link"
import { AlertTriangle, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { type CSSProperties, useMemo } from "react"
import { cn } from "@/lib/utils"
import { TopbarInlinePanelLabel } from "@/components/layout/topbar-inline-panel-label"
import { TopbarInlinePanelShell } from "@/components/layout/topbar-inline-panel-shell"
import { TOPBAR_INLINE_SUPPORT_TEXT_CLASS } from "@/components/layout/topbar-tokens"
import { useTopbarInlinePanel } from "@/components/layout/use-topbar-inline-panel"
import { useUnreadNotifications } from "../api/use-notifications"
import { NOTIFICATION_KIND_LABEL } from "./notification-ui"

interface TopbarNotificationsProps {
    isOpen?: boolean
    onOpenChange?: (isOpen: boolean) => void
    triggerClassName?: string
}

type NotificationPreview = {
    id: string
    kind: keyof typeof NOTIFICATION_KIND_LABEL
    title: string
    body: string
    highlights: string[]
}

function buildTickerText(notifications: NotificationPreview[]) {
    if (notifications.length === 0) {
        return "Non ci sono ancora novità."
    }

    return notifications
        .map((notification) => [
            NOTIFICATION_KIND_LABEL[notification.kind],
            notification.title,
            notification.body,
            ...notification.highlights.slice(0, 1),
        ].filter(Boolean).join(" · "))
        .join("     •     ")
}

export function TopbarNotifications({ isOpen, onOpenChange, triggerClassName }: TopbarNotificationsProps) {
    const {
        notifications,
        unreadNotifications,
        unreadCount,
        criticalUnreadCount,
        isLoading,
    } = useUnreadNotifications()

    const {
        containerRef,
        isOpen: resolvedIsOpen,
        panelWidth,
        setIsOpen,
        transition,
    } = useTopbarInlinePanel({
        isOpen,
        minWidth: 260,
        maxWidth: 1600,
        onOpenChange,
        scopeSelector: '[data-testid="topbar-desktop-capsule"]',
        widthFactor: 1,
        fallbackViewportFactor: 0.4,
    })

    const unreadIdSet = useMemo(
        () => new Set(unreadNotifications.map((notification) => notification.id)),
        [unreadNotifications]
    )
    const previewNotifications = notifications.slice(0, 3)
    const tickerText = useMemo(
        () => buildTickerText(previewNotifications),
        [previewNotifications]
    )
    const hasUnread = unreadCount > 0
    const hasUnreadPreview = previewNotifications.some((notification) => unreadIdSet.has(notification.id))
    const unreadBadgeText = unreadCount > 99 ? "99+" : `${unreadCount}`
    const shouldAnimateTicker = tickerText.length > 72
    const tickerDurationSeconds = Math.max(28, Math.min(56, Math.ceil(tickerText.length / 4)))

    return (
        <TopbarInlinePanelShell
            containerRef={containerRef}
            isOpen={resolvedIsOpen}
            panelAriaLabel="Novità dell'app"
            panelId="topbar-notifications-panel"
            panelTestId="topbar-notifications-panel"
            panelWidth={panelWidth}
            transition={transition}
            trigger={(
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen((prev) => !prev)}
                    data-testid="topbar-notifications-trigger"
                    aria-label="Notifiche aggiornamenti"
                    aria-expanded={resolvedIsOpen}
                    aria-controls="topbar-notifications-panel"
                    className={cn(
                        "relative z-10 h-10 w-10 shrink-0 text-primary transition-colors focus-visible:ring-0",
                        triggerClassName,
                        resolvedIsOpen && "border-transparent bg-transparent hover:bg-transparent hover:shadow-none"
                    )}
                >
                    <Bell className={cn("h-5 w-5", !resolvedIsOpen && "transition-transform duration-300 group-hover:scale-110 group-active:scale-110 motion-reduce:transform-none")} />
                    {!resolvedIsOpen && hasUnread && (
                        <span
                            data-testid="topbar-notifications-badge"
                            className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-xs font-black text-destructive-foreground motion-safe:group-hover:animate-pulse-soft motion-safe:group-active:animate-pulse-soft motion-reduce:animate-none"
                        >
                            {unreadBadgeText}
                        </span>
                    )}
                </Button>
            )}
        >
            <TopbarInlinePanelLabel testId="topbar-notifications-label">Novità</TopbarInlinePanelLabel>

            {criticalUnreadCount > 0 && (
                <div className="mr-2 inline-flex shrink-0 items-center gap-1 rounded-full border border-rose-500/20 bg-rose-500/12 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-rose-700 dark:text-rose-300">
                    <AlertTriangle className="h-3 w-3" />
                    {criticalUnreadCount}
                </div>
            )}

            <Link
                href="/updates"
                aria-label="Apri cronologia novità"
                data-testid="topbar-notifications-open-updates"
                onClick={() => setIsOpen(false)}
                className="group block min-w-0 flex-1 rounded-full px-1 py-1"
            >
                <div
                    aria-live="polite"
                    className="relative min-w-0 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]"
                >
                    {isLoading ? (
                        <div
                            data-testid="topbar-notifications-ticker"
                            className={cn("truncate text-muted-foreground", TOPBAR_INLINE_SUPPORT_TEXT_CLASS)}
                        >
                            Caricamento notifiche…
                        </div>
                    ) : (
                        <div
                            data-testid="topbar-notifications-ticker"
                            className={cn(
                                "flex w-max items-center gap-8 whitespace-nowrap pr-8 text-foreground/90",
                                TOPBAR_INLINE_SUPPORT_TEXT_CLASS,
                                shouldAnimateTicker && "notifications-ticker-track group-hover:[animation-play-state:paused]"
                            )}
                            style={shouldAnimateTicker
                                ? ({ "--ticker-duration": `${tickerDurationSeconds}s` } as CSSProperties)
                                : undefined}
                        >
                            <span
                                data-testid={previewNotifications[0]
                                    ? `notification-item-${previewNotifications[0].id}`
                                    : "notification-item-empty"}
                                className="inline-flex items-center gap-2"
                            >
                                {hasUnreadPreview && (
                                    <span className="h-2 w-2 rounded-full bg-primary" aria-label="Non letta" />
                                )}
                                {tickerText}
                            </span>
                            {shouldAnimateTicker && (
                                <span aria-hidden="true" className="inline-flex items-center gap-2">
                                    {hasUnreadPreview && <span className="h-2 w-2 rounded-full bg-primary" />}
                                    {tickerText}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </Link>
        </TopbarInlinePanelShell>
    )
}
