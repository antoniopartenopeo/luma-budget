"use client"

import { useState } from "react"
import { DashboardKpiGrid } from "@/features/dashboard/components/kpi-cards"
import { MonthlyExpensesChart } from "@/features/dashboard/components/monthly-expenses-chart"
import { CategoryDistributionChart } from "@/features/dashboard/components/category-distribution-chart"
import { RecentTransactions } from "@/features/dashboard/components/recent-transactions"
import { useDashboardSummary } from "@/features/dashboard/api/use-dashboard"
import { DashboardFilterBar } from "@/features/dashboard/components/dashboard-filter-bar"
import { DashboardTimeFilter } from "@/features/dashboard/api/types"

export default function DashboardPage() {
  const [filter, setFilter] = useState<DashboardTimeFilter>({
    mode: "month",
    period: new Date().toISOString().slice(0, 7) // Current YYYY-MM
  })

  const { data, isLoading, isError, refetch } = useDashboardSummary(filter)

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Panoramica delle tue finanze</p>
        </div>
      </div>

      <DashboardFilterBar filter={filter} onFilterChange={setFilter} />

      <DashboardKpiGrid
        totalSpent={data?.totalSpent}
        netBalance={data?.netBalance} // This is now ALL-TIME
        budgetTotal={data?.budgetTotal}
        budgetRemaining={data?.budgetRemaining}
        uselessSpendPercent={data?.uselessSpendPercent}
        isLoading={isLoading}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MonthlyExpensesChart
          data={data?.monthlyExpenses}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
        />
        <CategoryDistributionChart data={data?.categoriesSummary || []} isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RecentTransactions filter={filter} />
      </div>
    </div>
  )
}
