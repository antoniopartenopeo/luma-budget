"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Receipt, PiggyBank, LineChart, Settings, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Receipt, label: "Transazioni", href: "/transactions" },
  { icon: PiggyBank, label: "Budget", href: "/budget" },
  { icon: LineChart, label: "Insights", href: "/insights" },
  { icon: Settings, label: "Impostazioni", href: "/settings" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-sidebar text-sidebar-foreground">
      <div className="flex h-full flex-col">
        {/* Logo Area */}
        <div className="flex h-16 items-center border-b px-6">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <Wallet className="h-6 w-6" />
            <span>LumaBudget</span>
          </div>
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
                    className={cn(
                      "w-full justify-start gap-3 px-3 py-6 text-base font-medium transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isActive && "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* User Profile / Footer (Optional placeholder) */}
        <div className="border-t p-4">
          <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/50 p-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              U
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Utente Demo</span>
              <span className="text-xs text-muted-foreground">Pro Plan</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
