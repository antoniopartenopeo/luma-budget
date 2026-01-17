"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Receipt, PiggyBank, LineChart, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSettings } from "@/features/settings/api/use-settings"

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Receipt, label: "Transazioni", href: "/transactions" },
  { icon: PiggyBank, label: "Budget", href: "/budget" },
  { icon: LineChart, label: "Insights", href: "/insights" },
  { icon: Settings, label: "Impostazioni", href: "/settings" },
]

interface SidebarProps {
  className?: string
  onNavigate?: () => void
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const { data: settings } = useSettings()
  const displayName = settings?.profile?.displayName || "Account locale"
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <aside className={cn("flex h-full w-full flex-col bg-sidebar text-sidebar-foreground", className)}>
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Logo Area */}
        <div className="flex h-20 items-center border-b px-4">
          <Link href="/" className="flex items-center">
            <div className="relative h-12 w-52 overflow-hidden">
              <Image
                src="/app-logo.png"
                alt="LumaBudget"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-3">
          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href} passHref>
                  <Button
                    variant="ghost"
                    onClick={onNavigate}
                    className={cn(
                      "w-full justify-start gap-3 px-3 py-6 text-base font-medium transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground relative",
                      isActive && "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                    <span className="flex-1 text-left">{item.label}</span>
                  </Button>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* User Profile / Footer (Optional placeholder) */}
        <div className="border-t border-sidebar-border/50 p-4">
          <div className="group flex items-center gap-3 rounded-2xl bg-sidebar-accent/30 p-3 transition-all hover:bg-sidebar-accent/50 border border-transparent hover:border-sidebar-border/50">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm">
              {initial}
            </div>
            <div className="flex flex-1 flex-col overflow-hidden">
              <span className="truncate text-sm font-semibold">{displayName}</span>
              <span className="truncate text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold">Dati locali</span>
            </div>
            <Link href="/settings" className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-sidebar-accent rounded-lg text-muted-foreground">
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </aside>
  )
}
