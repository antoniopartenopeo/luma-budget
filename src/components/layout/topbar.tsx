import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { QuickExpenseInput } from "@/features/transactions/components/quick-expense-input"

export function TopBar() {
    return (
        <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-md">
            <div className="flex h-20 items-center gap-4 px-6">
                <div className="flex flex-1 items-center">
                    <QuickExpenseInput />
                </div>
                <Button variant="ghost" size="icon" className="rounded-full shrink-0">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                </Button>
            </div>
        </header>
    )
}
