import { Sidebar } from "./sidebar"
import { TopBar } from "./topbar"
import { AmbientBackdrop } from "./ambient-backdrop"

interface AppShellProps {
    children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
    return (
        <div className="min-h-screen bg-background selection:bg-primary/20">
            <AmbientBackdrop />

            <Sidebar className="fixed left-0 top-0 z-50 hidden h-screen w-64 lg:block" />
            <div className="relative min-h-screen w-full">
                <TopBar />
                <main id="main-content" className="min-h-[calc(100vh-80px)] w-full space-y-8 px-4 pb-10 md:px-8 lg:pl-72">
                    {children}
                </main>
            </div>
        </div>
    )
}
