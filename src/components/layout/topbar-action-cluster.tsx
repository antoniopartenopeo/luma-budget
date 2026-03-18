"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { usePrivacyStore } from "@/features/privacy/privacy.store"
import { useSettings } from "@/features/settings/api/use-settings"
import { TopbarFlashPreview } from "@/features/flash/components/topbar-flash-preview"
import { TopbarNotifications } from "@/features/notifications/components/topbar-notifications"
import { TopbarBrainPreview } from "@/features/insights/components/topbar-brain-preview"
import { motion } from "framer-motion"
import { type TopbarPanelId } from "./topbar-panel-id"
import { TOPBAR_CLUSTER_DIVIDER_CLASS } from "./topbar-tokens"
import { TopbarThemeSelector } from "./topbar-theme-selector"

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
    onActivePanelChange?: (panelId: TopbarPanelId | null) => void
    surface?: "embedded" | "standalone"
}

type ClusterPanelId = Exclude<TopbarPanelId, "quick">

export function TopbarActionCluster({
    activePanel,
    onActivePanelChange,
    surface = "standalone",
}: TopbarActionClusterProps) {
    const { isPrivacyMode, togglePrivacy } = usePrivacyStore()
    const { data: settings } = useSettings()
    const initials = getAvatarInitials(settings?.profile)
    const isEmbedded = surface === "embedded"
    const [localActivePanel, setLocalActivePanel] = useState<ClusterPanelId | null>(null)
    const isControlled = activePanel !== undefined && onActivePanelChange !== undefined
    const resolvedActivePanel = isControlled ? (activePanel as ClusterPanelId | null) : localActivePanel

    const setResolvedActivePanel = (panelId: ClusterPanelId | null) => {
        if (isControlled) {
            onActivePanelChange(panelId)
            return
        }

        setLocalActivePanel(panelId)
    }

    const bindPanelState = (panelId: ClusterPanelId) => ({
        isOpen: resolvedActivePanel === panelId,
        onOpenChange: (nextIsOpen: boolean) => setResolvedActivePanel(nextIsOpen ? panelId : null),
    })

    return (
        <motion.div
            layout
            initial={false}
            transition={{ type: "spring", stiffness: 360, damping: 30, mass: 0.9 }}
            data-testid="topbar-action-cluster"
            className={cn(
                "group relative overflow-visible rounded-full motion-reduce:transform-none",
                isEmbedded
                    ? "p-0"
                    : "border-white/50 p-1 glass-card bg-white/45 hover:shadow-lg dark:border-white/15 dark:bg-white/[0.07]"
            )}
        >
            {!isEmbedded && (
                <div className="absolute inset-0 bg-gradient-to-br from-white/35 via-transparent to-transparent pointer-events-none dark:from-white/[0.08]" />
            )}

            <div className="relative z-10 flex items-center">
                <div className="flex min-w-0 items-center">
                    <TopbarFlashPreview
                        {...bindPanelState("flash")}
                        triggerClassName={cn(segmentButtonClass, "border-none hover:shadow-none text-primary")}
                    />

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
                            {isPrivacyMode ? (
                                <Eye className="h-4 w-4" />
                            ) : (
                                <EyeOff className="h-4 w-4" />
                            )}
                        </Button>

                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/20 bg-primary/15 text-[10px] font-bold text-primary">
                            {initials}
                        </div>
                    </div>

                    <div className={TOPBAR_CLUSTER_DIVIDER_CLASS} />

                    <TopbarThemeSelector
                        {...bindPanelState("theme")}
                        triggerClassName={cn(segmentButtonClass, "border-none hover:shadow-none text-primary")}
                    />
                </div>

                <div data-testid="topbar-right-rail" className="ml-1 flex shrink-0 items-center">
                    <div
                        aria-hidden="true"
                        className={cn(
                            TOPBAR_CLUSTER_DIVIDER_CLASS,
                            "transition-opacity duration-200",
                            resolvedActivePanel === "theme" && "opacity-0"
                        )}
                    />

                    <TopbarBrainPreview
                        {...bindPanelState("brain")}
                        triggerClassName={cn(
                            segmentButtonClass,
                            "relative overflow-visible border-none hover:shadow-none text-primary"
                        )}
                    />

                    <div className={TOPBAR_CLUSTER_DIVIDER_CLASS} />

                    <TopbarNotifications
                        {...bindPanelState("notifications")}
                        triggerClassName={cn(
                            segmentButtonClass,
                            "border-none hover:shadow-none bg-transparent text-primary hover:bg-primary/10"
                        )}
                    />
                </div>
            </div>
        </motion.div>
    )
}
