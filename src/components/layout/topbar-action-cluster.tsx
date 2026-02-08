"use client"

import { Eye, EyeOff, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { usePrivacyStore } from "@/features/privacy/privacy.store"
import { useSettings } from "@/features/settings/api/use-settings"
import { FlashOverlay } from "@/features/flash/components/flash-overlay"
import { TopbarNotifications } from "@/features/notifications/components/topbar-notifications"

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
    "group/segment relative h-10 w-10 rounded-full border border-primary/15 bg-transparent text-muted-foreground transition-all duration-300 hover:bg-primary/10 hover:text-primary hover:-translate-y-[1px] hover:shadow-md motion-reduce:transform-none focus-visible:ring-2 focus-visible:ring-primary/25"

export function TopbarActionCluster() {
    const { isPrivacyMode, togglePrivacy } = usePrivacyStore()
    const { data: settings } = useSettings()
    const initials = getAvatarInitials(settings?.profile)

    return (
        <div
            data-testid="topbar-action-cluster"
            className="group/cluster relative overflow-hidden rounded-full p-1 glass-card bg-white/45 dark:bg-white/[0.07] border-white/50 dark:border-white/15 transition-all duration-300 hover:-translate-y-[1px] hover:shadow-xl hover:ring-1 hover:ring-primary/25 motion-reduce:transform-none"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/35 dark:from-white/[0.08] via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 flex items-center">
                <FlashOverlay
                    trigger={
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Apri Numa Flash"
                            className={cn(segmentButtonClass, "group/flash border-none hover:shadow-none text-primary")}
                        >
                            <span className="pointer-events-none absolute inset-0 rounded-full border border-primary/30 opacity-0 transition-all duration-300 group-hover/flash:opacity-100 group-hover/flash:scale-110 motion-safe:group-hover/flash:animate-ping-slow motion-reduce:animate-none" />
                            <Sparkles className="h-5 w-5 fill-primary transition-transform duration-300 group-hover/flash:rotate-12 group-hover/flash:scale-110 motion-reduce:transform-none" />
                        </Button>
                    }
                />

                <div className="h-6 w-px bg-border/50 mx-1" />

                <div className="group/account flex items-center gap-1 rounded-full px-0.5 transition-colors duration-300 hover:bg-primary/5">
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
                            <Eye className="h-4 w-4 transition-transform duration-300 group-hover/segment:scale-110 motion-reduce:transform-none" />
                        ) : (
                            <EyeOff className="h-4 w-4 transition-transform duration-300 group-hover/segment:scale-110 motion-reduce:transform-none" />
                        )}
                    </Button>

                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary text-[10px] font-black border border-primary/20 transition-all duration-300 group-hover/account:scale-[1.04] group-hover/account:shadow-[0_0_16px_-4px_rgba(8,145,178,0.45)] motion-reduce:transform-none">
                        {initials}
                    </div>
                </div>

                <div className="h-6 w-px bg-border/50 mx-1" />

                <TopbarNotifications
                    triggerClassName={cn(
                        segmentButtonClass,
                        "group/notify border-none hover:shadow-none bg-transparent text-primary hover:bg-primary/10"
                    )}
                />
            </div>
        </div>
    )
}
