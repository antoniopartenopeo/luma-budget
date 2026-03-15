"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { BrainCircuit, Eye, EyeOff, Monitor, Moon, Sparkles, Sun } from "lucide-react"
import { BRAIN_MATURITY_SAMPLE_TARGET } from "@/brain"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { usePrivacyStore } from "@/features/privacy/privacy.store"
import { useSettings, useUpsertSettings } from "@/features/settings/api/use-settings"
import { ThemePreference } from "@/features/settings/api/types"
import { FlashOverlay } from "@/features/flash/components/flash-overlay"
import { TopbarNotifications } from "@/features/notifications/components/topbar-notifications"
import { formatBrainTopbarAriaLabel, formatBrainTopbarTitle } from "@/features/insights/brain-copy"
import { useBrainRuntimeState } from "@/features/insights/brain-runtime"

function clampPercent(value: number): number {
    return Math.max(0, Math.min(100, Math.round(value)))
}

function resolveOrbitPalette(percent: number): {
    primaryFill: string
    primaryGlow: string
} {
    const normalized = clampPercent(percent) / 100
    const baseHue = 220 - normalized * 72
    const baseSaturation = 90 - normalized * 6
    const primaryLightness = 66 - normalized * 2

    return {
        primaryFill: `hsl(${baseHue} ${baseSaturation}% ${primaryLightness}%)`,
        primaryGlow: [
            `0 0 1px hsl(${baseHue} ${baseSaturation}% ${primaryLightness}% / 1)`,
            `0 0 6px hsl(${baseHue} ${baseSaturation}% ${primaryLightness}% / 0.96)`,
            `0 0 12px hsl(${baseHue} ${baseSaturation}% ${primaryLightness}% / 0.82)`,
            `0 0 20px hsl(${baseHue} ${baseSaturation}% ${primaryLightness}% / 0.62)`,
        ].join(", "),
    }
}

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

const themeCapsuleSurfaceClass =
    "bg-white/45 dark:bg-white/[0.07] backdrop-blur-xl"

function themeLabel(theme: ThemePreference): string {
    if (theme === "dark") return "Scuro"
    if (theme === "light") return "Chiaro"
    return "Sistema"
}

function ThemeIcon({ theme }: { theme: ThemePreference }) {
    if (theme === "dark") {
        return <Moon className="h-4 w-4" />
    }
    if (theme === "light") {
        return <Sun className="h-4 w-4" />
    }
    return <Monitor className="h-4 w-4" />
}

const themeOptions: Array<{ value: ThemePreference; label: string; icon: React.ElementType; ariaLabel: string }> = [
    { value: "system", label: "Sistema", icon: Monitor, ariaLabel: "Tema sistema" },
    { value: "light", label: "Chiaro", icon: Sun, ariaLabel: "Tema chiaro" },
    { value: "dark", label: "Scuro", icon: Moon, ariaLabel: "Tema scuro" },
]

export function TopbarActionCluster() {
    const { isPrivacyMode, togglePrivacy } = usePrivacyStore()
    const upsertSettings = useUpsertSettings()
    const { data: settings } = useSettings()
    const { brainReadinessPercent, snapshot } = useBrainRuntimeState()
    const theme = settings?.theme ?? "system"
    const initials = getAvatarInitials(settings?.profile)
    const [isThemePanelOpen, setIsThemePanelOpen] = useState(false)

    const handleThemeChange = (nextTheme: string) => {
        const normalizedTheme: ThemePreference = (nextTheme === "light" || nextTheme === "dark" || nextTheme === "system")
            ? nextTheme
            : "system"
        if (normalizedTheme !== theme) {
            upsertSettings.mutate({ theme: normalizedTheme })
        }
        setIsThemePanelOpen(false)
    }

    useEffect(() => {
        if (!isThemePanelOpen) return

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsThemePanelOpen(false)
            }
        }

        const handlePointerDown = (event: MouseEvent) => {
            const target = event.target
            if (!(target instanceof Node)) return

            const cluster = document.querySelector('[data-testid="topbar-action-cluster"]')
            if (cluster?.contains(target)) {
                return
            }
            setIsThemePanelOpen(false)
        }

        document.addEventListener("keydown", handleKeyDown)
        document.addEventListener("mousedown", handlePointerDown)

        return () => {
            document.removeEventListener("keydown", handleKeyDown)
            document.removeEventListener("mousedown", handlePointerDown)
        }
    }, [isThemePanelOpen])

    const brainProgressCircumference = 2 * Math.PI * 14
    const brainProgressOffset = brainProgressCircumference * (1 - brainReadinessPercent / 100)
    const orbitPalette = resolveOrbitPalette(brainReadinessPercent)
    const brainTrainedSamples = snapshot?.trainedSamples ?? 0

    return (
        <div
            data-testid="topbar-action-cluster"
            className="group relative overflow-visible rounded-full border-white/50 p-1 glass-card bg-white/45 hover:shadow-lg motion-reduce:transform-none dark:border-white/15 dark:bg-white/[0.07]"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/35 dark:from-white/[0.08] via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 flex items-center">
                <FlashOverlay
                    trigger={
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Apri Numa Flash"
                            className={cn(segmentButtonClass, "border-none hover:shadow-none text-primary")}
                        >
                            <span className="pointer-events-none absolute inset-0 rounded-full border border-primary/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-active:opacity-100 motion-reduce:animate-none" />
                            <Sparkles className="h-5 w-5 fill-primary" />
                        </Button>
                    }
                />

                <div className="h-6 w-px bg-border/50 mx-1" />

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

                <div className="h-6 w-px bg-border/50 mx-1" />

                <div className="relative">
                    <div
                        aria-hidden="true"
                        className={cn(
                            "absolute left-1/2 top-0 z-40 -translate-x-1/2 rounded-full shadow-lg",
                            "will-change-[height,transform] transition-[height,transform] duration-320 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
                            themeCapsuleSurfaceClass,
                            isThemePanelOpen
                                ? "h-[10.25rem] w-12 translate-y-0"
                                : "h-10 w-10 translate-y-0"
                        )}
                    />

                    <div
                        aria-hidden="true"
                        className={cn(
                            "pointer-events-none absolute left-1/2 top-[1px] z-40 -translate-x-1/2 rounded-full",
                            "bg-gradient-to-b from-white/35 via-white/[0.08] to-transparent dark:from-white/[0.12] dark:via-white/[0.03] dark:to-transparent",
                            "will-change-[height,transform] transition-[height,transform] duration-320 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
                            isThemePanelOpen
                                ? "h-[10.1rem] w-[2.85rem]"
                                : "h-[2.4rem] w-[2.4rem]"
                        )}
                    />

                    <Button
                        variant="ghost"
                        size="icon"
                        data-testid="topbar-theme-trigger"
                        title={`Tema: ${themeLabel(theme)}`}
                        aria-label={`Tema: ${themeLabel(theme)}`}
                        aria-haspopup="true"
                        aria-expanded={isThemePanelOpen}
                        aria-controls="topbar-theme-panel"
                        onClick={() => setIsThemePanelOpen((prev) => !prev)}
                        className={cn(
                            segmentButtonClass,
                            "relative z-50 border-transparent bg-transparent hover:shadow-none text-primary",
                            isThemePanelOpen && "hover:bg-transparent bg-transparent"
                        )}
                    >
                        <ThemeIcon theme={theme} />
                    </Button>

                    <div
                        id="topbar-theme-panel"
                        data-testid="topbar-theme-panel"
                        role="radiogroup"
                        aria-label="Selezione tema"
                        aria-hidden={!isThemePanelOpen}
                        className={cn(
                            "absolute left-1/2 top-[2.35rem] z-50 w-12 -translate-x-1/2 overflow-hidden",
                            "origin-top transition-[max-height,opacity,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
                            isThemePanelOpen
                                ? "max-h-36 opacity-100 translate-y-0 pointer-events-auto"
                                : "max-h-0 opacity-0 -translate-y-1 pointer-events-none"
                        )}
                    >
                        <div className="flex flex-col items-center gap-1.5 p-1.5 pt-2">
                            {themeOptions.map((option) => {
                                const Icon = option.icon
                                const isActive = theme === option.value

                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        role="radio"
                                        aria-checked={isActive}
                                        aria-label={option.ariaLabel}
                                        title={option.label}
                                        data-testid={`topbar-theme-option-${option.value}`}
                                        onClick={() => handleThemeChange(option.value)}
                                        className={cn(
                                            "flex h-8 w-8 items-center justify-center rounded-full",
                                            "transition-[background-color,color,border-color] duration-200 hover:bg-primary/10 hover:text-primary",
                                            isActive
                                                ? "bg-primary/16 text-primary border border-primary/35 shadow-[0_0_0_1px_rgba(0,205,255,0.12)]"
                                                : "text-foreground/80 border border-transparent"
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <div className="h-6 w-px bg-border/50 mx-1" />

                <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className={cn(segmentButtonClass, "relative overflow-visible border-none hover:shadow-none text-primary")}
                >
                    <Link
                        href="/brain"
                        data-testid="topbar-brain-trigger"
                        title={formatBrainTopbarTitle(brainReadinessPercent, brainTrainedSamples, BRAIN_MATURITY_SAMPLE_TARGET)}
                        aria-label={formatBrainTopbarAriaLabel(brainReadinessPercent)}
                    >
                        <svg
                            viewBox="0 0 40 40"
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 m-auto h-10 w-10 -rotate-90"
                        >
                            <circle cx="20" cy="20" r="14" className="fill-none stroke-primary/20 stroke-[2.2]" />
                            <circle
                                cx="20"
                                cy="20"
                                r="14"
                                className="fill-none stroke-primary stroke-[2.2] transition-[stroke-dashoffset] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                                strokeLinecap="round"
                                strokeDasharray={brainProgressCircumference}
                                strokeDashoffset={brainProgressOffset}
                            />
                        </svg>
                        <span
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-[6px] motion-safe:animate-spin-slow motion-reduce:animate-none"
                        >
                            <span
                                className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full"
                                style={{
                                    backgroundColor: orbitPalette.primaryFill,
                                    boxShadow: orbitPalette.primaryGlow,
                                    border: "1px solid hsl(0 0% 100% / 0.74)",
                                    filter: "saturate(1.3) brightness(1.16)",
                                    transition: "background-color 640ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 640ms cubic-bezier(0.22, 1, 0.36, 1)",
                                }}
                            />
                        </span>
                        <span
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-[6px] rounded-full border border-primary/25"
                        />

                        <BrainCircuit className="relative z-10 h-[18px] w-[18px]" />

                        <span
                            data-testid="topbar-brain-percent"
                            className="pointer-events-none absolute -right-2 -top-1.5 min-w-[30px] rounded-full border border-primary/40 bg-background/95 px-1.5 py-0.5 text-center text-[9px] font-black tabular-nums leading-none text-primary shadow-sm"
                        >
                            {brainReadinessPercent}%
                        </span>
                    </Link>
                </Button>

                <div className="h-6 w-px bg-border/50 mx-1" />

                <TopbarNotifications
                    triggerClassName={cn(
                        segmentButtonClass,
                        "border-none hover:shadow-none bg-transparent text-primary hover:bg-primary/10"
                    )}
                />
            </div>
        </div>
    )
}
