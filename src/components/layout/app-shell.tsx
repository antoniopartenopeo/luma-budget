import { Sidebar } from "./sidebar"
import { TopBar } from "./topbar"

interface AppShellProps {
    children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
    return (
        <div className="min-h-screen bg-background selection:bg-primary/20">
            {/* Ambient Background Mesh */}
            <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-[10%] w-[720px] h-[720px] bg-primary/12 dark:bg-primary/8 rounded-full blur-[96px] mix-blend-multiply dark:mix-blend-screen opacity-40" />
                <div className="absolute bottom-0 right-[10%] w-[640px] h-[640px] bg-teal-500/12 dark:bg-teal-500/8 rounded-full blur-[90px] mix-blend-multiply dark:mix-blend-screen opacity-35" />
            </div>

            <Sidebar className="fixed left-0 top-0 z-50 hidden h-screen w-64 lg:block" />
            <div className="w-full min-h-screen transition-all duration-300 relative">
                <TopBar />
                <main className="w-full px-4 md:px-8 pb-8 lg:pl-72 space-y-8 min-h-[calc(100vh-80px)]">
                    {children}
                </main>
            </div>
        </div>
    )
}
