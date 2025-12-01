import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownIcon, ArrowUpIcon, DollarSign, Wallet, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"

interface KpiCardProps {
    title: string
    value: string
    change: string
    trend: "up" | "down" | "neutral"
    icon: React.ElementType
}

export function KpiCard({ title, value, change, trend, icon: Icon }: KpiCardProps) {
    return (
        <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-primary" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <span
                        className={cn(
                            "flex items-center font-medium",
                            trend === "up" ? "text-emerald-600" : trend === "down" ? "text-rose-600" : "text-muted-foreground"
                        )}
                    >
                        {trend === "up" ? <ArrowUpIcon className="h-3 w-3 mr-0.5" /> : trend === "down" ? <ArrowDownIcon className="h-3 w-3 mr-0.5" /> : null}
                        {change}
                    </span>
                    rispetto al mese scorso
                </p>
            </CardContent>
        </Card>
    )
}

export function DashboardKpiGrid() {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <KpiCard
                title="Saldo Totale"
                value="€ 12.450,00"
                change="+2.5%"
                trend="up"
                icon={Wallet}
            />
            <KpiCard
                title="Entrate Mensili"
                value="€ 3.200,00"
                change="+12%"
                trend="up"
                icon={DollarSign}
            />
            <KpiCard
                title="Spese Mensili"
                value="€ 1.150,00"
                change="-4%"
                trend="down"
                icon={CreditCard}
            />
        </div>
    )
}
