"use client"

import { useState } from "react"
import { DashboardKpiGrid } from "@/features/dashboard/components/kpi-cards"
import { SpendingCompositionCard } from "@/features/dashboard/components/charts/spending-composition-card"
import { RecentTransactions } from "@/features/dashboard/components/recent-transactions"
import { useDashboardSummary } from "@/features/dashboard/api/use-dashboard"
import { useTransactions } from "@/features/transactions/api/use-transactions"
import { DashboardFilterBar } from "@/features/dashboard/components/dashboard-filter-bar"
import { DashboardTimeFilter } from "@/features/dashboard/api/types"

import { PageHeader } from "@/components/ui/page-header"

import { StaggerContainer } from "@/components/patterns/stagger-container"


export default function DashboardPage() {
  const [filter, setFilter] = useState<DashboardTimeFilter>({
    mode: "month",
    period: new Date().toISOString().slice(0, 7) // Current YYYY-MM
  })

  const { data, isLoading } = useDashboardSummary(filter)
  const { data: transactions, isLoading: isLoadingTransactions } = useTransactions()

  return (
    <div className="space-y-8 w-full">
      <PageHeader
        title="Dashboard"
        description="Panoramica delle tue finanze"
      />

      <StaggerContainer>
        {/* HERO SECTION: Financial Overview & KPIs */}
        <DashboardKpiGrid
          totalSpent={data?.totalSpent}
          netBalance={data?.netBalance}
          budgetTotal={data?.budgetTotal}
          budgetRemaining={data?.budgetRemaining}
          uselessSpendPercent={data?.uselessSpendPercent}
          isLoading={isLoading}
          filter={filter}
          headerActions={<DashboardFilterBar filter={filter} onFilterChange={setFilter} />}
        />

        {/* SUBORDINATE CONTENT */}
        <div className="space-y-6">
          <SpendingCompositionCard
            transactions={transactions || []}
            filter={filter}
            isLoading={isLoading || isLoadingTransactions}
          />

          <RecentTransactions filter={filter} />
        </div>
      </StaggerContainer>
    </div>
  )
}
