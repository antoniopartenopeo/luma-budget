import { DashboardKpiGrid } from "@/features/dashboard/components/kpi-cards"
import { MonthlyExpensesChart } from "@/features/dashboard/components/monthly-expenses-chart"
import { CategoryDistributionChart } from "@/features/dashboard/components/category-distribution-chart"
import { RecentTransactions } from "@/features/dashboard/components/recent-transactions"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <DashboardKpiGrid />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <MonthlyExpensesChart />
        <CategoryDistributionChart />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <RecentTransactions />
      </div>
    </div>
  )
}
