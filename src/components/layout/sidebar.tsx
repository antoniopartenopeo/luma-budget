"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, LineChart, Settings, FlaskConical, Receipt } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { BrandLogo } from "@/components/ui/brand-logo"

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Receipt, label: "Transazioni", href: "/transactions" },
  { icon: LineChart, label: "Insights", href: "/insights" },
  { icon: FlaskConical, label: "Financial Lab", href: "/simulator" },
  { icon: Settings, label: "Impostazioni", href: "/settings" },
]

interface SidebarProps {
  className?: string
  onNavigate?: () => void
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const isItemActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <aside className={cn(
      "flex h-full w-full flex-col glass-chrome text-foreground transition-all duration-300",
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
              const isActive = isItemActive(item.href)
              return (
                <Link key={item.href} href={item.href} passHref>
                  <Button
                    variant="ghost"
                    onClick={onNavigate}
                    className={cn(
                      "w-full justify-start gap-3 px-4 py-6 text-sm font-medium transition-all relative overflow-hidden",
                      isActive
                        ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary rounded-xl"
                        : "text-foreground/75 hover:bg-white/50 dark:hover:bg-white/5 hover:text-foreground rounded-xl"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-foreground/75")} />
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

      </div>
    </aside>
  )
}
