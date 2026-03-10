"use client"

import { Suspense } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { DashboardKpiGrid } from "@/features/dashboard/components/kpi-cards"
import { SpendingCompositionCard } from "@/features/dashboard/components/charts/spending-composition-card"
import { RecentTransactions } from "@/features/dashboard/components/recent-transactions"
import { useDashboardSummary } from "@/features/dashboard/api/use-dashboard"
import { DashboardFilterBar } from "@/features/dashboard/components/dashboard-filter-bar"
import { formatPeriodLabel } from "@/lib/date-ranges"
import { PageHeader } from "@/components/ui/page-header"
import { StaggerContainer } from "@/components/patterns/stagger-container"
import { Skeleton } from "@/components/ui/skeleton"
import {
  parseDashboardTimeFilter,
  writeDashboardTimeFilter
} from "@/features/dashboard/utils/dashboard-filter"

function DashboardPageContent() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const filter = parseDashboardTimeFilter(searchParams)
  const { data, isLoading } = useDashboardSummary(filter)

  const handleFilterChange = (nextFilter: typeof filter) => {
    const nextParams = writeDashboardTimeFilter(new URLSearchParams(searchParams.toString()), nextFilter)
    const nextQuery = nextParams.toString()

    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false })
  }

  return (
    <div className="space-y-8 w-full">
      <PageHeader
        title="Dashboard"
        description="Il punto di riferimento per capire come stanno andando le tue finanze."
      />

      <StaggerContainer>
        {/* HERO SECTION: Financial Overview & KPIs */}
        <DashboardKpiGrid
          totalSpentCents={data?.totalSpentCents}
          netBalanceCents={data?.netBalanceCents}
          uselessSpendPercent={data?.uselessSpendPercent}
          cardsUsed={data?.cardsUsed}
          isLoading={isLoading}
          filter={filter}
          headerActions={<DashboardFilterBar filter={filter} onFilterChange={handleFilterChange} />}
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

function DashboardLoading() {
  return (
    <div className="space-y-8 w-full">
      <PageHeader
        title="Dashboard"
        description="Il punto di riferimento per capire come stanno andando le tue finanze."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={`dashboard-kpi-skeleton-${index}`} className="h-40 rounded-[2rem]" />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Skeleton className="h-[420px] rounded-[2.5rem] xl:col-span-2" />
        <Skeleton className="h-[420px] rounded-[2.5rem]" />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardPageContent />
    </Suspense>
  )
}
