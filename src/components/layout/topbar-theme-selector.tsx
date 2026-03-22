"use client"

import { type ElementType } from "react"
import { Monitor, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { TopbarInlinePanelShell } from "./topbar-inline-panel-shell"
import { useTopbarInlinePanel } from "./use-topbar-inline-panel"
import { TopbarInlinePanelLabel } from "./topbar-inline-panel-label"
import { useSettings, useUpsertSettings } from "@/features/settings/api/use-settings"
import { ThemePreference } from "@/features/settings/api/types"

interface TopbarThemeSelectorProps {
    isOpen?: boolean
    onOpenChange?: (isOpen: boolean) => void
    triggerClassName?: string
}

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

const themeOptions: Array<{ value: ThemePreference; label: string; icon: ElementType; ariaLabel: string }> = [
    { value: "system", label: "Sistema", icon: Monitor, ariaLabel: "Tema sistema" },
    { value: "light", label: "Chiaro", icon: Sun, ariaLabel: "Tema chiaro" },
    { value: "dark", label: "Scuro", icon: Moon, ariaLabel: "Tema scuro" },
]

export function TopbarThemeSelector({ isOpen, onOpenChange, triggerClassName }: TopbarThemeSelectorProps) {
    const upsertSettings = useUpsertSettings()
    const { data: settings } = useSettings()
    const theme = settings?.theme ?? "system"
    const {
        containerRef,
        isOpen: resolvedIsOpen,
        panelWidth,
        setIsOpen,
        transition,
    } = useTopbarInlinePanel({
        isOpen,
        minWidth: 220,
        maxWidth: 1600,
        onOpenChange,
        scopeSelector: '[data-testid="topbar-desktop-capsule"]',
        widthFactor: 1,
        fallbackViewportFactor: 0.3,
    })

    const handleThemeChange = (nextTheme: ThemePreference) => {
        if (nextTheme !== theme) {
            upsertSettings.mutate({ theme: nextTheme })
        }
        setIsOpen(false)
    }

    return (
        <TopbarInlinePanelShell
            containerRef={containerRef}
            isOpen={resolvedIsOpen}
            panelAriaLabel="Selezione tema"
            panelId="topbar-theme-panel"
            panelMarginRight={4}
            panelRole="radiogroup"
            panelTestId="topbar-theme-panel"
            panelWidth={panelWidth}
            transition={transition}
            trigger={(
                <Button
                    variant="ghost"
                    size="icon"
                    data-testid="topbar-theme-trigger"
                    title={`Tema: ${themeLabel(theme)}`}
                    aria-label={`Tema: ${themeLabel(theme)}`}
                    aria-expanded={resolvedIsOpen}
                    aria-controls="topbar-theme-panel"
                    onClick={() => setIsOpen((prev) => !prev)}
                    className={cn(
                        "relative z-10 h-10 w-10 shrink-0 text-primary transition-colors focus-visible:ring-0",
                        triggerClassName,
                        resolvedIsOpen && "border-transparent bg-transparent hover:bg-transparent hover:shadow-none"
                    )}
                >
                    <ThemeIcon theme={theme} />
                </Button>
            )}
        >
            <TopbarInlinePanelLabel className="mr-1.5" testId="topbar-theme-label">Tema</TopbarInlinePanelLabel>

            <div className="flex min-w-0 items-center gap-1">
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
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-[background-color,color,border-color] duration-200 hover:bg-primary/10 hover:text-primary",
                                isActive
                                    ? "border border-primary/35 bg-primary/16 text-primary shadow-[0_0_0_1px_rgba(0,205,255,0.12)]"
                                    : "border border-transparent text-foreground/80"
                            )}
                        >
                            <Icon className="h-4 w-4" />
                        </button>
                    )
                })}
            </div>
        </TopbarInlinePanelShell>
    )
}
