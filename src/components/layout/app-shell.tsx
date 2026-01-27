import { Sidebar } from "./sidebar"
import { TopBar } from "./topbar"

interface AppShellProps {
    children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
    return (
        <div className="min-h-screen bg-[#F8F9FA] dark:bg-black selection:bg-primary/20">
            {/* Ambient Background Mesh */}
            <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-[10%] w-[1000px] h-[1000px] bg-indigo-50/80 dark:bg-indigo-950/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-70" />
                <div className="absolute bottom-0 right-[10%] w-[800px] h-[800px] bg-teal-50/80 dark:bg-teal-950/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen opacity-70" />
            </div>

            <Sidebar className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r lg:block" />
            <div className="lg:pl-64">
                <TopBar />
                <main className="container mx-auto max-w-7xl p-4 md:p-8 space-y-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
