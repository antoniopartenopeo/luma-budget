"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { QuickExpenseInput } from "@/features/transactions/components/quick-expense-input"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"
import { TopbarActionCluster } from "./topbar-action-cluster"
import { type TopbarPanelId } from "./topbar-panel-id"
import { TopbarQuickTransaction } from "./topbar-quick-transaction"

/**
 * TopBar: Streamlined for actions. 
 * Primary identity (Brand/Profile) is delegated to the Sidebar.
 */
export function TopBar() {
    const pathname = usePathname()
    const isSettingsPage = pathname === "/settings"
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)
    const [activeDesktopPanel, setActiveDesktopPanel] = useState<TopbarPanelId | null>(null)

    return (
        <header
            className={cn(
                "sticky top-0 z-30 border-b border-white/30 glass-chrome dark:border-white/8 lg:pl-64",
                "sm:border-none sm:bg-transparent sm:backdrop-blur-none sm:[box-shadow:none] sm:dark:bg-transparent"
            )}
        >
            <div className="flex min-h-[80px] lg:min-h-[80px] h-auto flex-col">
                <div className="flex h-20 items-center gap-4 px-4 md:px-8">
                    <div className="flex items-center gap-2">
                        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="lg:hidden shrink-0 h-10 w-10">
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 border-none w-64 bg-transparent shadow-2xl">
                                <div className="sr-only">
                                    <SheetTitle>Menu di Navigazione</SheetTitle>
                                </div>
                                <Sidebar
                                    onNavigate={() => setIsMenuOpen(false)}
                                />
                            </SheetContent>
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
                                    <>
                                        <TopbarQuickTransaction
                                            activePanel={activeDesktopPanel}
                                            onActivePanelChange={setActiveDesktopPanel}
                                            surface="embedded"
                                        />
                                        <div className="mx-1 h-6 w-px shrink-0 bg-border/50" />
                                    </>
                                )}

                                <div className={cn("min-w-0 shrink-0", isSettingsPage && "ml-auto")}>
                                    <TopbarActionCluster
                                        activePanel={activeDesktopPanel}
                                        onActivePanelChange={setActiveDesktopPanel}
                                        surface="embedded"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="ml-auto flex min-w-0 items-center justify-end gap-3 sm:hidden">
                        {/* Mobile Toggle Button */}
                        {!isSettingsPage && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="sm:hidden -mr-2"
                                onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
                            >
                                <div className={cn(
                                    "transition-transform duration-300",
                                    isQuickAddOpen ? "rotate-45 text-primary" : "rotate-0"
                                )}>
                                    <span className="text-2xl font-light leading-none">+</span>
                                </div>
                            </Button>
                        )}

                        <TopbarActionCluster />
                    </div>
                </div>

                {/* Mobile QuickAdd - Revealed on toggle */}
                {!isSettingsPage && (
                    <div className={cn(
                        "overflow-hidden sm:hidden transition-[max-height,opacity,padding] duration-300 ease-in-out",
                        isQuickAddOpen ? "max-h-96 opacity-100 pb-4" : "max-h-0 opacity-0"
                    )}>
                        <div className="px-4 flex justify-center border-t pt-4">
                            <div className="w-full max-w-md">
                                <QuickExpenseInput onExpenseCreated={() => setIsQuickAddOpen(false)} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    )
}
