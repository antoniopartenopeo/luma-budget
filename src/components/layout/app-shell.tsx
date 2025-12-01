import { Sidebar } from "./sidebar"
import { TopBar } from "./topbar"

interface AppShellProps {
    children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
    return (
        <div className="min-h-screen bg-muted/30">
            <Sidebar />
            <div className="pl-64">
                <TopBar />
                <main className="container mx-auto max-w-7xl p-6 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
