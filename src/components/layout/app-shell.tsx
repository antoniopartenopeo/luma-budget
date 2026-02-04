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
                <div className="absolute top-0 left-[10%] w-[1000px] h-[1000px] bg-indigo-500/15 dark:bg-indigo-500/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-60" />
                <div className="absolute bottom-0 right-[10%] w-[800px] h-[800px] bg-teal-500/15 dark:bg-teal-500/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen opacity-60" />
                {/* Sidebar Activation Glow */}
                <div className="absolute top-1/2 -left-20 -translate-y-1/2 w-[600px] h-[80vh] bg-cyan-400/25 dark:bg-cyan-500/15 rounded-full blur-[140px] opacity-70 pointer-events-none" />
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
