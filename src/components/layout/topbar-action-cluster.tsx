"use client"

import { type ComponentType, type ReactNode, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Bell, BrainCircuit, Eye, EyeOff, Monitor, Moon, Sparkles, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LIQUID_CAPSULE_CLASS, LIQUID_REFRACTION_CLASS } from "@/components/ui/glass-tokens"
import { cn } from "@/lib/utils"
import { usePrivacyStore } from "@/features/privacy/privacy.store"
import { useSettings } from "@/features/settings/api/use-settings"
import { TopbarFlashPreview } from "@/features/flash/components/topbar-flash-preview"
import { TopbarNotifications } from "@/features/notifications/components/topbar-notifications"
import { TopbarBrainPreview } from "@/features/insights/components/topbar-brain-preview"
import { type TopbarPanelId } from "./topbar-panel-id"
import { TopbarAvatar } from "./topbar-avatar"
import {
    TOPBAR_CLUSTER_DIVIDER_CLASS,
    TOPBAR_ICON_BUTTON_CLASS,
    TOPBAR_INLINE_LABEL_CLASS,
} from "./topbar-tokens"
import { TopbarThemeSelector } from "./topbar-theme-selector"
import {
    TopbarMobilePanelContent,
    resolveMobilePanelTitle,
} from "./topbar-mobile-panel-content"

function getAvatarInitials(profile?: { firstName?: string; lastName?: string; displayName?: string }): string | null {
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
    return null
}



interface TopbarActionClusterProps {
    activePanel?: TopbarPanelId | null
    mobileLeadingSlot?: ReactNode
    onActivePanelChange?: (panelId: TopbarPanelId | null) => void
    surface?: "embedded" | "standalone" | "mobile"
}

type DesktopClusterPanelId = Exclude<TopbarPanelId, "quick">
type MobileExpandablePanelId = TopbarPanelId

interface TopbarDesktopPanelProps {
    isOpen?: boolean
    onOpenChange?: (isOpen: boolean) => void
    triggerClassName?: string
}

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
                    className="min-w-0 overflow-visible"
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
    resolvedIcon,
}: {
    isOpen: boolean
    onToggle: () => void
    panelId: MobileExpandablePanelId
    resolvedIcon: ReactNode
}) {
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
                TOPBAR_ICON_BUTTON_CLASS,
                "border-none text-primary",
                isOpen && "bg-primary/15 text-primary shadow-inner scale-[0.97]"
            )}
        >
            {resolvedIcon}
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
    initials: string | null
    isPrivacyMode: boolean
    mobileLeadingSlot?: ReactNode
    onTogglePrivacy: () => void
    resolvedActivePanel: TopbarPanelId | null
    setResolvedActivePanel: (panelId: TopbarPanelId | null) => void
    theme: string | undefined
}) {
    const expandablePanels: MobileExpandablePanelId[] = ["quick", "flash", "theme", "brain", "notifications"]
    const mobileOpenPanel = resolvedActivePanel && expandablePanels.includes(resolvedActivePanel)
        ? resolvedActivePanel
        : null

    const MOBILE_REGISTRY: Array<{ id: MobileExpandablePanelId; icon: ReactNode }> = [
        { id: "theme", icon: theme === "dark" ? <Moon className="h-5 w-5" /> : theme === "light" ? <Sun className="h-5 w-5" /> : <Monitor className="h-5 w-5" /> },
        { id: "brain", icon: <BrainCircuit className="h-5 w-5" /> },
        { id: "notifications", icon: <Bell className="h-5 w-5" /> },
        { id: "quick", icon: <Sparkles className="h-5 w-5" /> }
    ]

    return (
        <motion.div
            layout
            initial={false}
            transition={{ type: "spring", stiffness: 360, damping: 30, mass: 0.9 }}
            data-testid="topbar-action-cluster"
            className={cn("group relative w-full rounded-[28px] p-1", LIQUID_CAPSULE_CLASS, LIQUID_REFRACTION_CLASS)}
        >
            <div className="relative z-10">
                <div className="flex items-center gap-1">
                    {mobileLeadingSlot ? <div className="shrink-0">{mobileLeadingSlot}</div> : null}

                    <div className="flex min-w-0 flex-1 items-center justify-between gap-1">
                        <div className="flex min-w-0 items-center gap-1">
                            <MobileExpandableTrigger
                                panelId="flash"
                                resolvedIcon={<Sparkles className="h-5 w-5" />}
                                isOpen={mobileOpenPanel === "flash"}
                                onToggle={() => setResolvedActivePanel(mobileOpenPanel === "flash" ? null : "flash")}
                            />

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onTogglePrivacy}
                                data-testid="topbar-mobile-privacy-trigger"
                                className={cn(
                                    TOPBAR_ICON_BUTTON_CLASS,
                                    "border-none",
                                    isPrivacyMode ? "text-foreground" : "text-muted-foreground"
                                )}
                                title={isPrivacyMode ? "Mostra importi" : "Nascondi importi"}
                                aria-label={isPrivacyMode ? "Mostra importi" : "Nascondi importi"}
                            >
                                {isPrivacyMode ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </Button>

                            <TopbarAvatar initials={initials} />
                        </div>

                        <div className="flex shrink-0 items-center gap-0.5">
                            {MOBILE_REGISTRY.map((item) => (
                                <MobileExpandableTrigger
                                    key={item.id}
                                    panelId={item.id}
                                    resolvedIcon={item.icon}
                                    isOpen={mobileOpenPanel === item.id}
                                    onToggle={() => setResolvedActivePanel(mobileOpenPanel === item.id ? null : item.id)}
                                />
                            ))}
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

    const DESKTOP_MENU_REGISTRY: Array<{
        id: DesktopClusterPanelId
        Component: ComponentType<TopbarDesktopPanelProps>
        triggerClass: string
    }> = [
        { id: "theme", Component: TopbarThemeSelector, triggerClass: cn(TOPBAR_ICON_BUTTON_CLASS, "border-none text-primary") },
        { id: "brain", Component: TopbarBrainPreview, triggerClass: cn(TOPBAR_ICON_BUTTON_CLASS, "relative overflow-visible border-none text-primary") },
        { id: "notifications", Component: TopbarNotifications, triggerClass: cn(TOPBAR_ICON_BUTTON_CLASS, "border-none bg-transparent text-primary hover:bg-primary/10") }
    ]

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
                                    : cn("p-1 hover:shadow-lg", LIQUID_CAPSULE_CLASS, LIQUID_REFRACTION_CLASS)
                            )}
        >
            <div className="relative z-10 flex min-w-0 items-center gap-1">
                <DesktopClusterSlot show={!activeDesktopUtilityPanel || activeDesktopUtilityPanel === "flash"}>
                    <TopbarFlashPreview
                        {...bindPanelState("flash")}
                        triggerClassName={cn(TOPBAR_ICON_BUTTON_CLASS, "border-none text-primary")}
                    />
                </DesktopClusterSlot>

                <DesktopClusterSlot show={!activeDesktopUtilityPanel}>
                    <div className="flex min-w-0 items-center gap-1">
                        <div className={TOPBAR_CLUSTER_DIVIDER_CLASS} />

                        <div className="group flex items-center gap-1 transition-colors duration-300">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={togglePrivacy}
                                className={cn(
                                    TOPBAR_ICON_BUTTON_CLASS,
                                    "border-none scale-100",
                                    isPrivacyMode ? "text-foreground" : "text-muted-foreground"
                                )}
                                title={isPrivacyMode ? "Mostra importi" : "Nascondi importi"}
                                aria-label={isPrivacyMode ? "Mostra importi" : "Nascondi importi"}
                            >
                                {isPrivacyMode ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </Button>

                            <TopbarAvatar initials={initials} />
                        </div>

                        <div className={TOPBAR_CLUSTER_DIVIDER_CLASS} />
                    </div>
                </DesktopClusterSlot>

                {DESKTOP_MENU_REGISTRY.map((item) => {
                    const Component = item.Component
                    return (
                        <DesktopClusterSlot key={item.id} show={!activeDesktopUtilityPanel || activeDesktopUtilityPanel === item.id}>
                            <div className="flex min-w-0 items-center gap-1">
                                <Component
                                    {...bindPanelState(item.id)}
                                    triggerClassName={item.triggerClass}
                                />
                            </div>
                        </DesktopClusterSlot>
                    )
                })}
            </div>
        </motion.div>
    )
}
