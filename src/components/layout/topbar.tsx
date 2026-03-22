"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"
import { TopbarActionCluster } from "./topbar-action-cluster"
import { type TopbarPanelId } from "./topbar-panel-id"
import { TopbarQuickTransaction } from "./topbar-quick-transaction"
import { TOPBAR_CLUSTER_DIVIDER_CLASS } from "./topbar-tokens"

function SidebarSheetPanel({ onNavigate }: { onNavigate: () => void }) {
    return (
        <SheetContent side="left" className="w-64 border-none bg-transparent p-0 shadow-2xl">
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

    return (
        <header
            className={cn(
                "sticky top-0 z-30 border-b border-white/30 glass-chrome dark:border-white/8 lg:pl-64",
                "sm:border-none sm:bg-transparent sm:backdrop-blur-none sm:[box-shadow:none] sm:dark:bg-transparent"
            )}
        >
            <div className="flex h-auto min-h-[80px] flex-col">
                <div className="hidden h-20 items-center gap-4 px-4 md:px-8 sm:flex">
                    <div className="hidden items-center gap-2 sm:flex">
                        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="lg:hidden shrink-0 h-10 w-10">
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SidebarSheetPanel onNavigate={() => setIsMenuOpen(false)} />
                        </Sheet>
                    </div>

                    <div className="hidden min-w-0 flex-1 sm:flex">
                        <div
                            data-testid="topbar-desktop-capsule"
                            className="group relative flex h-12 min-w-0 flex-1 items-center rounded-full border border-white/50 bg-white/45 p-1 shadow-sm backdrop-blur-xl transition-[border-color,box-shadow,background-color] duration-300 focus-within:border-primary/30 focus-within:shadow-lg dark:border-white/15 dark:bg-white/[0.07]"
                        >
                            <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-white/35 via-transparent to-transparent dark:from-white/[0.08]" />

                            <div className="relative z-10 flex min-w-0 flex-1 items-center">
                                {!isSettingsPage && (
                                    <motion.div
                                        layout
                                        initial={false}
                                        animate={isDesktopUtilityPanelOpen
                                            ? { opacity: 0, maxWidth: 0, marginRight: 0 }
                                            : { opacity: 1, maxWidth: 640, marginRight: 4 }}
                                        transition={{ type: "spring", stiffness: 360, damping: 30, mass: 0.9 }}
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
                                            <div className={TOPBAR_CLUSTER_DIVIDER_CLASS} />
                                        </div>
                                    </motion.div>
                                )}

                                <motion.div
                                    layout
                                    initial={false}
                                    className={cn(
                                        "min-w-0",
                                        isDesktopUtilityPanelOpen ? "flex-1" : "shrink-0",
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
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0">
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                            )}
                        />
                        <SidebarSheetPanel onNavigate={() => setIsMenuOpen(false)} />
                    </Sheet>
                </div>

            </div>
        </header>
    )
}
