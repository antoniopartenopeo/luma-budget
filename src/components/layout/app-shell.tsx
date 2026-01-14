import { Sidebar } from "./sidebar"
import { TopBar } from "./topbar"

interface AppShellProps {
    children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
    return (
        <div className="min-h-screen bg-muted/30">
            <Sidebar className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r bg-sidebar lg:block" />
            <div className="lg:pl-64">
                <TopBar />
                <main className="container mx-auto max-w-7xl p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
