"use client"

import { useState } from "react"
import { Menu, Plus, X, RotateCw, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { QuickExpenseInput } from "@/features/transactions/components/quick-expense-input"
import { usePrivacyStore } from "@/features/privacy/privacy.store"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"
import { useSettings } from "@/features/settings/api/use-settings"
import { FlashOverlay } from "@/features/flash/components/flash-overlay"

/**
 * TopBar: Streamlined for actions. 
 * Primary identity (Brand/Profile) is delegated to the Sidebar.
 */
export function TopBar() {
    const pathname = usePathname()
    const isSettingsPage = pathname === "/settings"
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)
    const { isPrivacyMode, togglePrivacy } = usePrivacyStore()
    const { data: settings } = useSettings()

    const displayName = settings?.profile?.displayName || "Account locale"
    const initial = displayName.charAt(0).toUpperCase()

    return (
        <header className="sticky top-0 z-30 glass-chrome lg:pl-64">
            <div className="flex min-h-[80px] lg:min-h-[80px] h-auto flex-col">
                <div className="flex h-20 items-center justify-between gap-4 px-4 md:px-8">
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

                    {!isSettingsPage && (
                        <>
                            {/* Desktop Quick Expense */}
                            <div className="flex-1 hidden sm:block">
                                <QuickExpenseInput />
                            </div>
                        </>
                    )}

                    <div className="flex items-center gap-3 shrink-0">
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

                        <div className="flex items-center bg-white/40 dark:bg-white/5 rounded-full p-1 border border-white/20 dark:border-white/10 backdrop-blur-sm shadow-sm hover:bg-white/60 dark:hover:bg-white/10 transition-all">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={togglePrivacy}
                                className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                                title={isPrivacyMode ? "Mostra importi" : "Nascondi importi"}
                            >
                                {isPrivacyMode ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </Button>

                            <div className="h-4 w-px bg-border/50 mx-1" />

                            <div className="flex items-center gap-2 pl-1 pr-2 cursor-default">
                                <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[10px] font-black shadow-sm border border-primary/20">
                                    {initial}
                                </div>
                                <div className="hidden sm:flex flex-col">
                                    <span className="text-[11px] font-bold tracking-tight leading-none truncate max-w-[80px]">{displayName}</span>
                                    <span className="text-[8px] uppercase tracking-wider text-muted-foreground/60 font-bold leading-none">Locale</span>
                                </div>
                            </div>
                        </div>

                        <FlashOverlay />
                    </div>
                </div>

                {/* Mobile QuickAdd - Revealed on toggle */}
                {!isSettingsPage && (
                    <div className={cn(
                        "sm:hidden overflow-hidden transition-all duration-300 ease-in-out",
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
