import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { QuickExpenseInput } from "@/features/transactions/components/quick-expense-input"

export function TopBar() {
    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-6 md:px-8 backdrop-blur-md">
            <div className="flex flex-1 items-center max-w-3xl">
                <QuickExpenseInput />
            </div>
            <div className="flex items-center gap-2 ml-auto">
                <Button variant="ghost" size="icon" className="rounded-full">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                </Button>
            </div>
        </header>
    )
}
