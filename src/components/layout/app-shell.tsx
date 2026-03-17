import { Sidebar } from "./sidebar"
import { TopBar } from "./topbar"
import { AmbientBackdrop } from "./ambient-backdrop"
import { PullToRefresh } from "@/components/ui/pull-to-refresh"

interface AppShellProps {
    children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
    return (
        <div className="h-screen overflow-hidden bg-background selection:bg-primary/20">
            <AmbientBackdrop />

            <Sidebar className="fixed left-0 top-0 z-50 hidden h-screen w-64 lg:block" />
            <div className="relative h-full w-full overflow-hidden">
                <TopBar />
                <main id="main-content" className="h-[calc(100vh-80px)] w-full lg:pl-64">
                    <PullToRefresh className="px-4 pb-10 md:px-8 lg:pl-[2rem]">
                        <div className="space-y-8 pt-6">
                            {children}
                        </div>
                    </PullToRefresh>
                </main>
            </div>
        </div>
    )
}
