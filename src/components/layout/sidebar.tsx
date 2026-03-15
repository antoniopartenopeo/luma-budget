"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, LineChart, Settings, FlaskConical, Receipt, FileSpreadsheet, Download, ChevronDown, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { BrandLogo } from "@/components/ui/brand-logo"

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  {
    icon: Receipt,
    label: "Transazioni",
    href: "/transactions",
    children: [
      { id: "transactions-import", icon: FileSpreadsheet, label: "Importa CSV", href: "/transactions/import" },
      { id: "transactions-export", icon: Download, label: "Esporta CSV", href: "/transactions?action=export" },
    ]
  },
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
  const router = useRouter()

  const isItemActive = (href: string) => {
    const baseHref = href.split("?")[0]
    if (baseHref === "/") return pathname === "/"
    return pathname === baseHref || pathname.startsWith(`${baseHref}/`)
  }

  const isChildActive = (childId: string, href: string) => {
    if (childId === "transactions-export") {
      return pathname === "/transactions"
    }
    return isItemActive(href)
  }

  const handleParentClick = (href: string, hasChildren: boolean) => {
    if (!hasChildren) {
      if (!isItemActive(href)) {
        router.push(href)
      }
      onNavigate?.()
      return
    }

    if (!pathname.startsWith(href)) {
      router.push(href)
    }
  }

  return (
    <aside className={cn(
      "flex h-full w-full flex-col border-r border-white/35 text-foreground glass-chrome dark:border-white/8",
      className
    )}>
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Logo Area */}
        <div className="flex h-20 items-center px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <BrandLogo variant="full" height={28} />
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <nav className="space-y-1.5">
            {sidebarItems.map((item) => {
              const isActive = isItemActive(item.href)
              const hasChildren = Array.isArray(item.children) && item.children.length > 0
              const isExpanded = hasChildren && pathname.startsWith(item.href)
              return (
                <div key={item.href} className="space-y-1.5">
                  <Button
                    variant="ghost"
                    onClick={() => handleParentClick(item.href, hasChildren)}
                    className={cn(
                      "relative w-full justify-start gap-3 overflow-hidden rounded-xl px-4 py-6 text-sm font-medium",
                      isActive
                        ? "bg-primary/10 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] hover:bg-primary/15 hover:text-primary"
                        : "text-foreground/75 hover:bg-white/50 hover:text-foreground dark:hover:bg-white/5"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-foreground/75")} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {hasChildren && (
                      <ChevronDown className={cn("h-3 w-3 transition-transform", isExpanded && "rotate-180")} />
                    )}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                    )}
                  </Button>

                  {hasChildren && isExpanded && (
                    <div className="ml-4 space-y-1">
                      {(item.children ?? []).map((child) => {
                        const childActive = isChildActive(child.id, child.href)
                        return (
                          <Link key={child.id} href={child.href} passHref>
                            <Button
                              variant="ghost"
                              onClick={onNavigate}
                              className={cn(
                                "w-full justify-start gap-2.5 rounded-xl px-3 py-4 text-xs font-medium",
                                childActive
                                  ? "bg-primary/10 text-primary hover:bg-primary/15"
                                  : "text-foreground/70 hover:bg-white/40 dark:hover:bg-white/5 hover:text-foreground"
                              )}
                            >
                              <child.icon className={cn("h-3 w-3", childActive ? "text-primary" : "text-muted-foreground")} />
                              <span className="text-left">{child.label}</span>
                            </Button>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </div>

        {/* Trust Badge Footer */}
        <div className="p-4 mt-auto mb-2">
          <div className="flex items-center gap-3 rounded-xl border border-primary/25 bg-primary/10 px-3 py-3 text-primary dark:border-primary/20 dark:bg-primary/5">
            <ShieldCheck className="h-5 w-5 shrink-0 opacity-90" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider">Local AI &bull; Encrypted</span>
              <span className="text-[9px] font-medium opacity-85 leading-tight text-foreground/80 dark:text-muted-foreground">Privacy on-device</span>
            </div>
          </div>
        </div>

      </div>
    </aside>
  )
}
