"use client"

import Link from "next/link"
import { AlertTriangle, Bell, BrainCircuit, Monitor, Moon, Plus, Sparkles, Sun } from "lucide-react"
import { BRAIN_MATURITY_SAMPLE_TARGET } from "@/brain"
import { useDashboardSummary } from "@/features/dashboard/api/use-dashboard"
import { buildFlashPreviewModel } from "@/features/flash/lib/build-flash-preview-model"
import { getCurrentPeriod } from "@/features/insights/utils"
import { useBrainRuntimeState } from "@/features/insights/brain-runtime"
import { useUnreadNotifications } from "@/features/notifications/api/use-notifications"
import { NOTIFICATION_KIND_LABEL } from "@/features/notifications/components/notification-ui"
import { usePrivacyStore } from "@/features/privacy/privacy.store"
import { useCurrency } from "@/features/settings/api/use-currency"
import { QuickExpenseInput } from "@/features/transactions/components/quick-expense-input"
import { ThemePreference } from "@/features/settings/api/types"
import { useSettings, useUpsertSettings } from "@/features/settings/api/use-settings"
import { cn } from "@/lib/utils"
import { type TopbarPanelId } from "./topbar-panel-id"
import {
    TOPBAR_INLINE_KPI_VALUE_CLASS,
    TOPBAR_INLINE_LABEL_CLASS,
    TOPBAR_INLINE_SUPPORT_TEXT_CLASS,
    resolveTopbarToneClass,
} from "./topbar-tokens"

type MobilePanelId = TopbarPanelId

interface TopbarMobilePanelContentProps {
    onClose: () => void
    panelId: MobilePanelId
}

function MobileRow({
    blurValue = false,
    label,
    tone = "neutral",
    value,
}: {
    blurValue?: boolean
    label: string
    tone?: "positive" | "neutral" | "warning" | "negative"
    value: string
}) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/30 bg-white/30 px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]">
            <span className={cn(TOPBAR_INLINE_LABEL_CLASS, "mr-0")}>{label}</span>
            <span
                className={cn(
                    TOPBAR_INLINE_KPI_VALUE_CLASS,
                    resolveTopbarToneClass(tone),
                    blurValue && "select-none blur-sm opacity-55",
                    "text-right"
                )}
            >
                {value}
            </span>
        </div>
    )
}

function ThemeOptionButton({
    active,
    icon: Icon,
    label,
    onClick,
}: {
    active: boolean
    icon: typeof Monitor
    label: string
    onClick: () => void
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-center transition-[background-color,color,border-color] duration-200",
                active
                    ? "border-primary/35 bg-primary/12 text-primary"
                    : "border-white/25 bg-white/20 text-foreground/80 hover:bg-white/30 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]"
            )}
        >
            <Icon className="h-5 w-5" />
            <span className={cn(TOPBAR_INLINE_SUPPORT_TEXT_CLASS, "text-center")}>{label}</span>
        </button>
    )
}

function resolveThemeIcon(theme: ThemePreference) {
    if (theme === "dark") return Moon
    if (theme === "light") return Sun
    return Monitor
}


function MobileQuickPanel({ onClose }: { onClose: () => void }) {
    return (
        <div className="pt-0.5">
            <QuickExpenseInput
                autoFocusDescription
                onExpenseCreated={() => onClose()}
                variant="mobile-panel"
            />
        </div>
    )
}

function MobileFlashPanel() {
    const period = getCurrentPeriod()
    const { isPrivacyMode } = usePrivacyStore()
    const { data: settings } = useSettings()
    const { data, isLoading } = useDashboardSummary({ mode: "month", period })
    const { currency, locale } = useCurrency()
    const previewModel = buildFlashPreviewModel({
        currency,
        data,
        locale,
        superfluousTargetPercent: settings?.superfluousTargetPercent ?? 10,
    })

    return (
        <div className="space-y-2.5">
            <MobileRow
                blurValue={isPrivacyMode}
                label="Saldo"
                tone={previewModel.balanceTone}
                value={isLoading ? "—" : previewModel.balanceFormatted}
            />
            <MobileRow
                blurValue={isPrivacyMode}
                label="Pressione"
                tone={previewModel.expensePressurePct !== null && previewModel.expensePressurePct >= 90 ? "negative" : "neutral"}
                value={isLoading ? "—" : previewModel.expensePressureFormatted}
            />
            <MobileRow
                blurValue={isPrivacyMode}
                label="Superfluo"
                tone={previewModel.isSuperfluousOverTarget ? "negative" : "neutral"}
                value={isLoading ? "—" : previewModel.superfluousFormatted}
            />
        </div>
    )
}

function MobileThemePanel({ onClose }: { onClose: () => void }) {
    const upsertSettings = useUpsertSettings()
    const { data: settings } = useSettings()
    const theme = settings?.theme ?? "system"

    const handleThemeChange = (nextTheme: ThemePreference) => {
        if (nextTheme !== theme) {
            upsertSettings.mutate({ theme: nextTheme })
        }
        onClose()
    }

    return (
        <div className="grid grid-cols-3 gap-2">
            <ThemeOptionButton
                active={theme === "system"}
                icon={Monitor}
                label="Sistema"
                onClick={() => handleThemeChange("system")}
            />
            <ThemeOptionButton
                active={theme === "light"}
                icon={Sun}
                label="Chiaro"
                onClick={() => handleThemeChange("light")}
            />
            <ThemeOptionButton
                active={theme === "dark"}
                icon={Moon}
                label="Scuro"
                onClick={() => handleThemeChange("dark")}
            />
        </div>
    )
}

function MobileBrainPanel({ onClose }: { onClose: () => void }) {
    const { brainReadinessPercent, snapshot, stage } = useBrainRuntimeState()
    const trainedSamples = snapshot?.trainedSamples ?? 0
    const stageLabel = stage.label || "Brain"
    const readinessTone = brainReadinessPercent >= 80 ? "positive" : brainReadinessPercent >= 40 ? "neutral" : "warning"
    const historyTone = trainedSamples >= BRAIN_MATURITY_SAMPLE_TARGET ? "positive" : "neutral"

    return (
        <div className="space-y-2.5">
            <MobileRow label="Pronto" tone={readinessTone} value={`${brainReadinessPercent}%`} />
            <MobileRow label="Fase" value={stageLabel} />
            <MobileRow label="Storico" tone={historyTone} value={`${trainedSamples}/${BRAIN_MATURITY_SAMPLE_TARGET}`} />

            <Link
                href="/brain"
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/20 px-3 py-2 text-sm font-medium text-foreground/85 dark:border-white/10 dark:bg-white/[0.04]"
            >
                <BrainCircuit className="h-4 w-4 text-primary" />
                Apri Brain
            </Link>
        </div>
    )
}

function MobileNotificationsPanel({ onClose }: { onClose: () => void }) {
    const {
        notifications,
        unreadNotifications,
        unreadCount,
        criticalUnreadCount,
        isLoading,
    } = useUnreadNotifications()

    const unreadIdSet = new Set(unreadNotifications.map((notification) => notification.id))
    const previewNotifications = notifications.slice(0, 3)

    return (
        <div className="space-y-2.5">
            {criticalUnreadCount > 0 && (
                <div className="inline-flex items-center gap-1 rounded-full border border-rose-500/20 bg-rose-500/12 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-rose-700 dark:text-rose-300">
                    <AlertTriangle className="h-3 w-3" />
                    Critiche {criticalUnreadCount}
                </div>
            )}

            {isLoading ? (
                <div className={cn(TOPBAR_INLINE_SUPPORT_TEXT_CLASS, "text-muted-foreground")}>
                    Caricamento notifiche…
                </div>
            ) : previewNotifications.length === 0 ? (
                <div className={cn(TOPBAR_INLINE_SUPPORT_TEXT_CLASS, "text-muted-foreground")}>
                    Non ci sono ancora novità.
                </div>
            ) : (
                <div className="space-y-2">
                    {previewNotifications.map((notification) => (
                        <Link
                            key={notification.id}
                            href="/updates"
                            onClick={onClose}
                            className="flex items-start gap-2 rounded-2xl border border-white/25 bg-white/20 px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]"
                        >
                            <span className="mt-1 inline-flex h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                            <div className="min-w-0">
                                <div className="truncate text-sm font-semibold text-foreground/90">
                                    {NOTIFICATION_KIND_LABEL[notification.kind]} · {notification.title}
                                </div>
                                <div className={cn(TOPBAR_INLINE_SUPPORT_TEXT_CLASS, "mt-1 truncate text-muted-foreground")}>
                                    {notification.body}
                                </div>
                                {unreadIdSet.has(notification.id) && (
                                    <div className={cn(TOPBAR_INLINE_SUPPORT_TEXT_CLASS, "mt-1 text-primary")}>
                                        Non letta
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            <Link
                href="/updates"
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/20 px-3 py-2 text-sm font-medium text-foreground/85 dark:border-white/10 dark:bg-white/[0.04]"
            >
                <Bell className="h-4 w-4 text-primary" />
                Apri novità{unreadCount > 0 ? ` (${unreadCount})` : ""}
            </Link>
        </div>
    )
}

export function TopbarMobilePanelContent({ onClose, panelId }: TopbarMobilePanelContentProps) {
    if (panelId === "quick") {
        return <MobileQuickPanel onClose={onClose} />
    }

    if (panelId === "flash") {
        return <MobileFlashPanel />
    }

    if (panelId === "theme") {
        return <MobileThemePanel onClose={onClose} />
    }

    if (panelId === "brain") {
        return <MobileBrainPanel onClose={onClose} />
    }

    return <MobileNotificationsPanel onClose={onClose} />
}

export function resolveMobilePanelTitle(panelId: MobilePanelId): string {
    if (panelId === "quick") return "Transazione"
    if (panelId === "flash") return "Flash"
    if (panelId === "theme") return "Tema"
    if (panelId === "brain") return "Brain"
    return "Novità"
}

export function resolveMobileTriggerIcon(theme: ThemePreference | undefined, panelId: MobilePanelId) {
    if (panelId === "quick") return Plus
    if (panelId === "flash") return Sparkles
    if (panelId === "theme") return resolveThemeIcon(theme ?? "system")
    if (panelId === "brain") return BrainCircuit
    return Bell
}
