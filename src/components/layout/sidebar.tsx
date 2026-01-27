"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Receipt, PiggyBank, LineChart, Settings, Calculator } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSettings } from "@/features/settings/api/use-settings"
import { BrandLogo } from "@/components/ui/brand-logo"

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Receipt, label: "Transazioni", href: "/transactions" },
  { icon: PiggyBank, label: "Budget", href: "/budget" },
  { icon: LineChart, label: "Insights", href: "/insights" },
  { icon: Calculator, label: "Simulatore", href: "/simulator" },
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
    <aside className={cn(
      "flex h-full w-full flex-col border-r border-white/20 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl text-foreground transition-all duration-300",
      className
    )}>
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Logo Area */}
        <div className="flex h-20 items-center px-6">
          <Link href="/" className="flex items-center gap-2">
            <BrandLogo variant="full" height={28} />
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <nav className="space-y-1.5">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href} passHref>
                  <Button
                    variant="ghost"
                    onClick={onNavigate}
                    className={cn(
                      "w-full justify-start gap-3 px-4 py-6 text-sm font-medium transition-all relative overflow-hidden",
                      isActive
                        ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary rounded-xl"
                        : "text-muted-foreground hover:bg-white/50 dark:hover:bg-white/5 hover:text-foreground rounded-xl"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                    )}
                  </Button>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* User Profile / Footer */}
        <div className="p-4 mt-auto">
          <div className="group flex items-center gap-3 rounded-2xl bg-white/40 dark:bg-white/5 p-3 transition-all hover:bg-white/60 dark:hover:bg-white/10 border border-white/20 dark:border-white/5 backdrop-blur-sm shadow-sm">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-sm font-black shadow-sm">
              {initial}
            </div>
            <div className="flex flex-1 flex-col overflow-hidden">
              <span className="truncate text-sm font-bold tracking-tight">{displayName}</span>
              <span className="truncate text-[10px] uppercase tracking-wider text-muted-foreground/80 font-bold">Locale</span>
            </div>
            <Link href="/settings" className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg text-muted-foreground">
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </aside>
  )
}
