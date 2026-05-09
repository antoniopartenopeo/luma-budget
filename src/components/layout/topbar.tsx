"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LIQUID_CAPSULE_CLASS, LIQUID_CHROME_CLASS, LIQUID_REFRACTION_CLASS } from "@/components/ui/glass-tokens"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"
import { TopbarActionCluster } from "./topbar-action-cluster"
import { type TopbarPanelId } from "./topbar-panel-id"
import { TopbarQuickTransaction } from "./topbar-quick-transaction"
import { TOPBAR_CLUSTER_DIVIDER_CLASS } from "./topbar-tokens"

const DESKTOP_MENU_SHEET_ID = "topbar-desktop-menu-sheet"
const MOBILE_MENU_SHEET_ID = "topbar-mobile-menu-sheet"

function SidebarSheetPanel({ contentId, onNavigate }: { contentId: string; onNavigate: () => void }) {
    return (
        <SheetContent id={contentId} side="left" className="w-64 border-none bg-transparent p-0 shadow-2xl">
            <div className="sr-only">
                <SheetTitle>Menu di Navigazione</SheetTitle>
            </div>
            <Sidebar onNavigate={onNavigate} />
        </SheetContent>
    )
}

export function TopBar() {
    const pathname = usePathname()
    const isSettingsPage = pathname === "/settings"
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [activeDesktopPanel, setActiveDesktopPanel] = useState<TopbarPanelId | null>(null)
    const isDesktopUtilityPanelOpen = activeDesktopPanel !== null && activeDesktopPanel !== "quick"
    const isQuickPanelOpen = activeDesktopPanel === "quick"

    return (
        <header
            className={cn(
                "sticky top-0 z-30 border-b border-white/18 lg:pl-64",
                LIQUID_CHROME_CLASS,
                "sm:border-none sm:bg-transparent sm:backdrop-blur-none sm:[box-shadow:none] sm:dark:bg-transparent"
            )}
        >
            <div className="flex h-auto min-h-[80px] flex-col">
                <div className="hidden h-20 items-center gap-4 px-4 md:px-8 sm:flex">
                    <div className="hidden items-center gap-2 sm:flex">
                        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                            <SheetTrigger asChild aria-controls={DESKTOP_MENU_SHEET_ID}>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Apri menu di navigazione"
                                    title="Apri menu di navigazione"
                                    className="lg:hidden shrink-0 h-10 w-10"
                                >
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SidebarSheetPanel
                                contentId={DESKTOP_MENU_SHEET_ID}
                                onNavigate={() => setIsMenuOpen(false)}
                            />
                        </Sheet>
                    </div>

                    <div className="hidden min-w-0 flex-1 sm:flex">
                        <div
                            data-testid="topbar-desktop-capsule"
                            className={cn(
                                "group relative flex h-12 min-w-0 flex-1 items-center rounded-full pl-4 pr-3 py-1.5 transition-[border-color,box-shadow,background-color] duration-500 ease-out focus-within:border-primary/30 focus-within:shadow-lg",
                                LIQUID_CAPSULE_CLASS,
                                LIQUID_REFRACTION_CLASS,
                                isDesktopUtilityPanelOpen 
                                    ? "border-primary/30 shadow-[0_4px_80px_-12px_rgba(15,90,108,0.28)] dark:border-primary/20 dark:shadow-[0_4px_80px_-12px_rgba(161,222,235,0.18)]"
                                    : "border-white/50 shadow-sm dark:border-white/15"
                            )}
                        >
                            <div className="relative z-10 flex min-w-0 flex-1 items-center">
                                {!isSettingsPage && (
                                    <motion.div
                                        layout
                                        initial={false}
                                        animate={isDesktopUtilityPanelOpen
                                            ? { opacity: 0, maxWidth: 0, marginRight: 0 }
                                            : { opacity: 1, maxWidth: 1600, marginRight: 4 }}
                                        transition={{ type: "spring", stiffness: 360, damping: 30, mass: 0.9 }}
                                        data-testid="quick-transaction-cluster"
                                        className={cn(
                                            "min-w-0 overflow-hidden",
                                            isDesktopUtilityPanelOpen ? "pointer-events-none" : "flex-1"
                                        )}
                                    >
                                        <div className="flex min-w-0 items-center">
                                            <TopbarQuickTransaction
                                                activePanel={activeDesktopPanel}
                                                onActivePanelChange={setActiveDesktopPanel}
                                                surface="embedded"
                                            />
                                            <motion.div 
                                                animate={{ opacity: isQuickPanelOpen ? 0 : 1 }}
                                                className={cn(TOPBAR_CLUSTER_DIVIDER_CLASS, isQuickPanelOpen && "pointer-events-none")} 
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                <motion.div
                                    layout
                                    initial={false}
                                    animate={isQuickPanelOpen
                                        ? { opacity: 0, maxWidth: 0, marginLeft: 0 }
                                        : { opacity: 1, maxWidth: 1600 }
                                    }
                                    transition={{ type: "spring", stiffness: 360, damping: 30, mass: 0.9 }}
                                    className={cn(
                                        "min-w-0 overflow-hidden",
                                        (isDesktopUtilityPanelOpen || isQuickPanelOpen) ? "flex-1" : "shrink-0",
                                        isQuickPanelOpen && "pointer-events-none",
                                        isSettingsPage && "ml-auto"
                                    )}
                                >
                                    <TopbarActionCluster
                                        activePanel={activeDesktopPanel}
                                        onActivePanelChange={setActiveDesktopPanel}
                                        surface="embedded"
                                    />
                                </motion.div>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="px-4 pt-3 pb-3 sm:hidden">
                    <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                        <TopbarActionCluster
                            surface="mobile"
                            mobileLeadingSlot={(
                                <SheetTrigger asChild aria-controls={MOBILE_MENU_SHEET_ID}>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Apri menu di navigazione"
                                        title="Apri menu di navigazione"
                                        className="h-10 w-10 shrink-0"
                                    >
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                            )}
                        />
                        <SidebarSheetPanel
                            contentId={MOBILE_MENU_SHEET_ID}
                            onNavigate={() => setIsMenuOpen(false)}
                        />
                    </Sheet>
                </div>

            </div>
        </header>
    )
}
