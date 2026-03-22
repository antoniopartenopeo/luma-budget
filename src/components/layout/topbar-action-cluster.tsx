"use client"

import { type ReactNode, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Bell, BrainCircuit, Eye, EyeOff, Monitor, Moon, Plus, Sparkles, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { usePrivacyStore } from "@/features/privacy/privacy.store"
import { useSettings } from "@/features/settings/api/use-settings"
import { TopbarFlashPreview } from "@/features/flash/components/topbar-flash-preview"
import { TopbarNotifications } from "@/features/notifications/components/topbar-notifications"
import { TopbarBrainPreview } from "@/features/insights/components/topbar-brain-preview"
import { type TopbarPanelId } from "./topbar-panel-id"
import { TOPBAR_CLUSTER_DIVIDER_CLASS, TOPBAR_INLINE_LABEL_CLASS } from "./topbar-tokens"
import { TopbarThemeSelector } from "./topbar-theme-selector"
import {
    TopbarMobilePanelContent,
    resolveMobilePanelTitle,
} from "./topbar-mobile-panel-content"

function getAvatarInitials(profile?: { firstName?: string; lastName?: string; displayName?: string }): string {
    const firstName = profile?.firstName?.trim() || ""
    const lastName = profile?.lastName?.trim() || ""
    if (firstName && lastName) {
        return `${firstName[0]}${lastName[0]}`.toUpperCase()
    }

    const legacyName = profile?.displayName?.trim() || ""
    if (legacyName) {
        const tokens = legacyName.split(/\s+/).filter(Boolean)
        if (tokens.length >= 2) {
            return `${tokens[0][0]}${tokens[1][0]}`.toUpperCase()
        }
        return tokens[0][0].toUpperCase()
    }

    if (firstName) return firstName[0].toUpperCase()
    if (lastName) return lastName[0].toUpperCase()
    return "N"
}

const segmentButtonClass =
    "group relative h-10 w-10 rounded-full border border-primary/15 bg-transparent text-muted-foreground transition-[background-color,color,border-color,box-shadow] duration-200 hover:bg-primary/10 hover:text-primary hover:shadow-md active:bg-primary/15 active:text-primary focus-visible:ring-2 focus-visible:ring-primary/25"

interface TopbarActionClusterProps {
    activePanel?: TopbarPanelId | null
    mobileLeadingSlot?: ReactNode
    onActivePanelChange?: (panelId: TopbarPanelId | null) => void
    surface?: "embedded" | "standalone" | "mobile"
}

type DesktopClusterPanelId = Exclude<TopbarPanelId, "quick">
type MobileExpandablePanelId = TopbarPanelId

function DesktopClusterSlot({
    children,
    show,
}: {
    children: ReactNode
    show: boolean
}) {
    return (
        <AnimatePresence initial={false}>
            {show && (
                <motion.div
                    layout
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="min-w-0 overflow-hidden"
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    )
}

function MobileExpandableTrigger({
    isOpen,
    onToggle,
    panelId,
    theme,
}: {
    isOpen: boolean
    onToggle: () => void
    panelId: MobileExpandablePanelId
    theme?: "system" | "light" | "dark"
}) {
    const icon = panelId === "quick"
        ? <Plus className="h-5 w-5" />
        : panelId === "flash"
            ? <Sparkles className="h-5 w-5" />
        : panelId === "theme"
            ? theme === "dark"
                ? <Moon className="h-5 w-5" />
                : theme === "light"
                    ? <Sun className="h-5 w-5" />
                    : <Monitor className="h-5 w-5" />
            : panelId === "brain"
                ? <BrainCircuit className="h-5 w-5" />
                : <Bell className="h-5 w-5" />

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            data-testid={`topbar-mobile-trigger-${panelId}`}
            aria-label={`${isOpen ? "Chiudi" : "Apri"} ${resolveMobilePanelTitle(panelId)}`}
            aria-expanded={isOpen}
            aria-controls={`topbar-mobile-panel-${panelId}`}
            onClick={onToggle}
            className={cn(
                segmentButtonClass,
                "border-none text-primary hover:shadow-none",
                isOpen && "bg-primary/12 text-primary"
            )}
        >
            {icon}
        </Button>
    )
}

function MobileActionCluster({
    initials,
    isPrivacyMode,
    mobileLeadingSlot,
    onTogglePrivacy,
    resolvedActivePanel,
    setResolvedActivePanel,
    theme,
}: {
    initials: string
    isPrivacyMode: boolean
    mobileLeadingSlot?: ReactNode
    onTogglePrivacy: () => void
    resolvedActivePanel: TopbarPanelId | null
    setResolvedActivePanel: (panelId: TopbarPanelId | null) => void
    theme: ReturnType<typeof useSettings>["data"] extends infer T
        ? T extends { theme?: infer U }
            ? U | undefined
            : undefined
        : undefined
}) {
    const expandablePanels: MobileExpandablePanelId[] = ["quick", "flash", "theme", "brain", "notifications"]
    const mobileOpenPanel = resolvedActivePanel && expandablePanels.includes(resolvedActivePanel)
        ? resolvedActivePanel
        : null

    return (
        <motion.div
            layout
            initial={false}
            transition={{ type: "spring", stiffness: 360, damping: 30, mass: 0.9 }}
            data-testid="topbar-action-cluster"
            className="group relative w-full overflow-hidden rounded-[28px] border border-white/50 bg-white/45 p-1 shadow-sm backdrop-blur-xl dark:border-white/15 dark:bg-white/[0.07]"
        >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/35 via-transparent to-transparent dark:from-white/[0.08]" />

            <div className="relative z-10">
                <div className="flex items-center gap-1">
                    {mobileLeadingSlot ? <div className="shrink-0">{mobileLeadingSlot}</div> : null}

                    <div className="flex min-w-0 flex-1 items-center justify-between gap-1">
                        <div className="flex min-w-0 items-center gap-1">
                            <MobileExpandableTrigger
                                panelId="flash"
                                theme={theme}
                                isOpen={mobileOpenPanel === "flash"}
                                onToggle={() => setResolvedActivePanel(mobileOpenPanel === "flash" ? null : "flash")}
                            />

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onTogglePrivacy}
                                data-testid="topbar-mobile-privacy-trigger"
                                className={cn(
                                    segmentButtonClass,
                                    "border-none hover:shadow-none",
                                    isPrivacyMode ? "text-foreground" : "text-muted-foreground"
                                )}
                                title={isPrivacyMode ? "Mostra importi" : "Nascondi importi"}
                                aria-label={isPrivacyMode ? "Mostra importi" : "Nascondi importi"}
                            >
                                {isPrivacyMode ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </Button>

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/15 text-[10px] font-bold text-primary">
                                {initials}
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                            <MobileExpandableTrigger
                                panelId="theme"
                                theme={theme}
                                isOpen={mobileOpenPanel === "theme"}
                                onToggle={() => setResolvedActivePanel(mobileOpenPanel === "theme" ? null : "theme")}
                            />
                            <MobileExpandableTrigger
                                panelId="brain"
                                theme={theme}
                                isOpen={mobileOpenPanel === "brain"}
                                onToggle={() => setResolvedActivePanel(mobileOpenPanel === "brain" ? null : "brain")}
                            />
                            <MobileExpandableTrigger
                                panelId="notifications"
                                theme={theme}
                                isOpen={mobileOpenPanel === "notifications"}
                                onToggle={() => setResolvedActivePanel(mobileOpenPanel === "notifications" ? null : "notifications")}
                            />
                            <MobileExpandableTrigger
                                panelId="quick"
                                theme={theme}
                                isOpen={mobileOpenPanel === "quick"}
                                onToggle={() => setResolvedActivePanel(mobileOpenPanel === "quick" ? null : "quick")}
                            />
                        </div>
                    </div>
                </div>

                <AnimatePresence initial={false}>
                    {mobileOpenPanel && (
                        <motion.div
                            key={mobileOpenPanel}
                            id={`topbar-mobile-panel-${mobileOpenPanel}`}
                            data-testid="topbar-mobile-panel"
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            transition={{ type: "spring", stiffness: 360, damping: 34, mass: 0.95 }}
                            className="overflow-hidden"
                        >
                            <div className="rounded-[24px] border border-white/30 bg-white/18 px-3 pb-3 pt-2 dark:border-white/10 dark:bg-white/[0.04]">
                                <div className="mb-2.5 flex items-center gap-2 border-b border-white/20 pb-2 dark:border-white/10">
                                    <span className={cn(TOPBAR_INLINE_LABEL_CLASS, "mr-0")}>{resolveMobilePanelTitle(mobileOpenPanel)}</span>
                                </div>

                                <TopbarMobilePanelContent
                                    panelId={mobileOpenPanel}
                                    onClose={() => setResolvedActivePanel(null)}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}

export function TopbarActionCluster({
    activePanel,
    mobileLeadingSlot,
    onActivePanelChange,
    surface = "standalone",
}: TopbarActionClusterProps) {
    const { isPrivacyMode, togglePrivacy } = usePrivacyStore()
    const { data: settings } = useSettings()
    const initials = getAvatarInitials(settings?.profile)
    const isEmbedded = surface === "embedded"
    const isMobile = surface === "mobile"
    const [localActivePanel, setLocalActivePanel] = useState<TopbarPanelId | null>(null)
    const isControlled = activePanel !== undefined && onActivePanelChange !== undefined
    const resolvedActivePanel = isControlled ? (activePanel as TopbarPanelId | null) : localActivePanel
    const activeDesktopUtilityPanel = !isMobile && resolvedActivePanel && resolvedActivePanel !== "quick"
        ? (resolvedActivePanel as DesktopClusterPanelId)
        : null

    const setResolvedActivePanel = (panelId: TopbarPanelId | null) => {
        if (isControlled) {
            onActivePanelChange(panelId)
            return
        }

        setLocalActivePanel(panelId)
    }

    const bindPanelState = (panelId: DesktopClusterPanelId) => ({
        isOpen: resolvedActivePanel === panelId,
        onOpenChange: (nextIsOpen: boolean) => setResolvedActivePanel(nextIsOpen ? panelId : null),
    })

    if (isMobile) {
        return (
            <MobileActionCluster
                initials={initials}
                isPrivacyMode={isPrivacyMode}
                mobileLeadingSlot={mobileLeadingSlot}
                onTogglePrivacy={togglePrivacy}
                resolvedActivePanel={resolvedActivePanel}
                setResolvedActivePanel={setResolvedActivePanel}
                theme={settings?.theme}
            />
        )
    }

    return (
        <motion.div
            layout
            initial={false}
            transition={{ type: "spring", stiffness: 360, damping: 30, mass: 0.9 }}
            data-testid="topbar-action-cluster"
            className={cn(
                "group relative min-w-0 overflow-visible rounded-full motion-reduce:transform-none",
                isEmbedded
                    ? cn("p-0", activeDesktopUtilityPanel && "w-full")
                    : "border-white/50 p-1 glass-card bg-white/45 hover:shadow-lg dark:border-white/15 dark:bg-white/[0.07]"
            )}
        >
            {!isEmbedded && (
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/35 via-transparent to-transparent dark:from-white/[0.08]" />
            )}

            <div className="relative z-10 flex min-w-0 items-center">
                <DesktopClusterSlot show={!activeDesktopUtilityPanel || activeDesktopUtilityPanel === "flash"}>
                    <TopbarFlashPreview
                        {...bindPanelState("flash")}
                        triggerClassName={cn(segmentButtonClass, "border-none hover:shadow-none text-primary")}
                    />
                </DesktopClusterSlot>

                <DesktopClusterSlot show={!activeDesktopUtilityPanel}>
                    <div className="flex min-w-0 items-center">
                        <div className={TOPBAR_CLUSTER_DIVIDER_CLASS} />

                        <div className="group flex items-center gap-1 rounded-full px-0.5 transition-colors duration-300 hover:bg-primary/5">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={togglePrivacy}
                                className={cn(
                                    segmentButtonClass,
                                    "border-none hover:shadow-none",
                                    isPrivacyMode ? "text-foreground" : "text-muted-foreground"
                                )}
                                title={isPrivacyMode ? "Mostra importi" : "Nascondi importi"}
                                aria-label={isPrivacyMode ? "Mostra importi" : "Nascondi importi"}
                            >
                                {isPrivacyMode ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </Button>

                            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/20 bg-primary/15 text-[10px] font-bold text-primary">
                                {initials}
                            </div>
                        </div>

                        <div className={TOPBAR_CLUSTER_DIVIDER_CLASS} />
                    </div>
                </DesktopClusterSlot>

                <DesktopClusterSlot show={!activeDesktopUtilityPanel || activeDesktopUtilityPanel === "theme"}>
                    <TopbarThemeSelector
                        {...bindPanelState("theme")}
                        triggerClassName={cn(segmentButtonClass, "border-none hover:shadow-none text-primary")}
                    />
                </DesktopClusterSlot>

                <DesktopClusterSlot show={!activeDesktopUtilityPanel || activeDesktopUtilityPanel === "brain"}>
                    <div className={cn("flex min-w-0 items-center", !activeDesktopUtilityPanel && "ml-1")}>
                        {!activeDesktopUtilityPanel && <div aria-hidden="true" className={TOPBAR_CLUSTER_DIVIDER_CLASS} />}

                        <TopbarBrainPreview
                            {...bindPanelState("brain")}
                            triggerClassName={cn(
                                segmentButtonClass,
                                "relative overflow-visible border-none hover:shadow-none text-primary"
                            )}
                        />
                    </div>
                </DesktopClusterSlot>

                <DesktopClusterSlot show={!activeDesktopUtilityPanel || activeDesktopUtilityPanel === "notifications"}>
                    <div className={cn("flex min-w-0 items-center", !activeDesktopUtilityPanel && "ml-1")}>
                        {!activeDesktopUtilityPanel && <div className={TOPBAR_CLUSTER_DIVIDER_CLASS} />}

                        <TopbarNotifications
                            {...bindPanelState("notifications")}
                            triggerClassName={cn(
                                segmentButtonClass,
                                "border-none hover:shadow-none bg-transparent text-primary hover:bg-primary/10"
                            )}
                        />
                    </div>
                </DesktopClusterSlot>
            </div>
        </motion.div>
    )
}
