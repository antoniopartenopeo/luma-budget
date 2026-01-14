"use client"

import { useState } from "react"
import { Bell, Menu } from "lucide-react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { QuickExpenseInput } from "@/features/transactions/components/quick-expense-input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"

export function TopBar() {
    const pathname = usePathname()
    const isSettingsPage = pathname === "/settings"
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-md">
            <div className="flex min-h-[80px] h-auto flex-col">
                <div className="flex h-20 items-center justify-between gap-4 px-4 md:px-6">
                    <div className="flex items-center gap-2">
                        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="lg:hidden shrink-0 h-10 w-10">
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 border-none w-64 bg-sidebar">
                                <Sidebar
                                    onNavigate={() => setIsMenuOpen(false)}
                                />
                            </SheetContent>
                        </Sheet>

                        {/* Desktop Search/QuickAdd placeholder */}
                        <div className="text-xl font-bold tracking-tight lg:hidden">
                            LumaBudget
                        </div>
                    </div>

                    {!isSettingsPage && (
                        <div className="flex-1 max-w-2xl hidden sm:block">
                            <QuickExpenseInput />
                        </div>
                    )}

                    <div className="flex items-center gap-2 shrink-0">
                        <Button variant="ghost" size="icon" className="rounded-full shrink-0 h-10 w-10">
                            <Bell className="h-5 w-5 text-muted-foreground" />
                        </Button>
                    </div>
                </div>

                {/* Mobile QuickAdd - Centered row */}
                {!isSettingsPage && (
                    <div className="sm:hidden px-4 pb-4 flex justify-center">
                        <div className="w-full max-w-md">
                            <QuickExpenseInput />
                        </div>
                    </div>
                )}
            </div>
        </header>
    )
}
