"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { QuickExpenseInput } from "@/features/transactions/components/quick-expense-input"
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

    return (
        <header className="sticky top-0 z-30 border-b border-white/20 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
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
                        <div className="flex-1 max-w-2xl hidden sm:block">
                            <QuickExpenseInput />
                        </div>
                    )}

                    <div className="flex items-center gap-3 shrink-0">
                        <FlashOverlay />
                    </div>
                </div>

                {/* Mobile QuickAdd - Revealed on mobile scroll/header */}
                {!isSettingsPage && (
                    <div className="sm:hidden px-4 pb-4 flex justify-center border-t pt-4">
                        <div className="w-full max-w-md">
                            <QuickExpenseInput />
                        </div>
                    </div>
                )}
            </div>
        </header>
    )
}
