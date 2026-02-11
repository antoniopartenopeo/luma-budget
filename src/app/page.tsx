"use client"

import { useState } from "react"
import { DashboardKpiGrid } from "@/features/dashboard/components/kpi-cards"
import { SpendingCompositionCard } from "@/features/dashboard/components/charts/spending-composition-card"
import { RecentTransactions } from "@/features/dashboard/components/recent-transactions"
import { useDashboardSummary } from "@/features/dashboard/api/use-dashboard"
import { DashboardFilterBar } from "@/features/dashboard/components/dashboard-filter-bar"
import { DashboardTimeFilter } from "@/features/dashboard/api/types"
import { formatPeriodLabel } from "@/lib/date-ranges"

import { PageHeader } from "@/components/ui/page-header"

import { StaggerContainer } from "@/components/patterns/stagger-container"


export default function DashboardPage() {
  const [filter, setFilter] = useState<DashboardTimeFilter>({
    mode: "month",
    period: new Date().toISOString().slice(0, 7) // Current YYYY-MM
  })

  const { data, isLoading } = useDashboardSummary(filter)

  return (
    <div className="space-y-8 w-full">
      <PageHeader
        title="Dashboard"
        description="Panoramica delle tue finanze"
      />

      <StaggerContainer>
        {/* HERO SECTION: Financial Overview & KPIs */}
        <DashboardKpiGrid
          totalSpentCents={data?.totalSpentCents}
          netBalanceCents={data?.netBalanceCents}
          budgetTotalCents={data?.budgetTotalCents}
          budgetRemainingCents={data?.budgetRemainingCents}
          uselessSpendPercent={data?.uselessSpendPercent}
          isLoading={isLoading}
          filter={filter}
          headerActions={<DashboardFilterBar filter={filter} onFilterChange={setFilter} />}
          activeRhythm={data?.activeRhythm}
        />

        {/* SUBORDINATE CONTENT */}
        <div className="space-y-6">
          <SpendingCompositionCard
            categoriesSummary={data?.categoriesSummary}
            periodLabel={formatPeriodLabel(filter.period, "it-IT")}
            isLoading={isLoading}
          />

          <RecentTransactions filter={filter} />
        </div>
      </StaggerContainer>
    </div>
  )
}
