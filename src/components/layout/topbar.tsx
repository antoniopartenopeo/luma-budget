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

    return (
        <header className="sticky top-0 z-30 glass-chrome">
            <div className="flex min-h-[80px] lg:min-h-[80px] h-auto flex-col">
                <div className="flex h-20 items-center justify-between gap-4 px-4 md:px-6">
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
                            <div className="flex-1 max-w-2xl hidden sm:block">
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
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={togglePrivacy}
                            className="rounded-xl text-muted-foreground hover:text-foreground"
                            title={isPrivacyMode ? "Mostra importi" : "Nascondi importi"}
                        >
                            {isPrivacyMode ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                        </Button>
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
