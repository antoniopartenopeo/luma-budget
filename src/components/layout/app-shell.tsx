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
                <div className="absolute top-0 left-[10%] w-[1000px] h-[1000px] bg-indigo-50/80 dark:bg-indigo-950/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-70" />
                <div className="absolute bottom-0 right-[10%] w-[800px] h-[800px] bg-teal-50/80 dark:bg-teal-950/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen opacity-70" />
                {/* Sidebar Activation Glow */}
                <div className="absolute top-1/2 -left-20 -translate-y-1/2 w-[600px] h-[80vh] bg-cyan-400/20 dark:bg-cyan-900/20 rounded-full blur-[140px] opacity-80 pointer-events-none" />
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
