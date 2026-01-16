"use client"

import { useState } from "react"
import { DashboardKpiGrid } from "@/features/dashboard/components/kpi-cards"
import { SpendingCompositionCard } from "@/features/dashboard/components/spending-composition-card"
import { RecentTransactions } from "@/features/dashboard/components/recent-transactions"
import { useDashboardSummary } from "@/features/dashboard/api/use-dashboard"
import { useTransactions } from "@/features/transactions/api/use-transactions"
import { DashboardFilterBar } from "@/features/dashboard/components/dashboard-filter-bar"
import { DashboardTimeFilter } from "@/features/dashboard/api/types"

import { PageHeader } from "@/components/ui/page-header"

export default function DashboardPage() {
  const [filter, setFilter] = useState<DashboardTimeFilter>({
    mode: "month",
    period: new Date().toISOString().slice(0, 7) // Current YYYY-MM
  })

  const { data, isLoading } = useDashboardSummary(filter)
  const { data: transactions, isLoading: isLoadingTransactions } = useTransactions()

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader
        title="Dashboard"
        description="Panoramica delle tue finanze"
      />

      <DashboardFilterBar filter={filter} onFilterChange={setFilter} />

      <DashboardKpiGrid
        totalSpent={data?.totalSpent}
        netBalance={data?.netBalance}
        budgetTotal={data?.budgetTotal}
        budgetRemaining={data?.budgetRemaining}
        uselessSpendPercent={data?.uselessSpendPercent}
        isLoading={isLoading}
        filter={filter}
      />

      <SpendingCompositionCard
        transactions={transactions || []}
        filter={filter}
        isLoading={isLoading || isLoadingTransactions}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RecentTransactions filter={filter} />
      </div>
    </div>
  )
}
