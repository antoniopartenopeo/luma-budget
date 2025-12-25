"use client"

import { DashboardKpiGrid } from "@/features/dashboard/components/kpi-cards"
import { MonthlyExpensesChart } from "@/features/dashboard/components/monthly-expenses-chart"
import { CategoryDistributionChart } from "@/features/dashboard/components/category-distribution-chart"
import { RecentTransactions } from "@/features/dashboard/components/recent-transactions"
import { useDashboardSummary } from "@/features/dashboard/api/use-dashboard"
import { ErrorState } from "@/components/ui/error-state"
import { StateMessage } from "@/components/ui/state-message"

export default function DashboardPage() {
  const { data, isLoading, isError, refetch } = useDashboardSummary()

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <StateMessage
          variant="error"
          title="Impossibile caricare il riepilogo"
          description="Si è verificato un problema durante il recupero dei dati. Riprova tra poco."
          actionLabel="Riprova"
          onActionClick={() => refetch()}
        />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <DashboardKpiGrid
        totalSpent={data?.totalSpent}
        netBalance={data?.netBalance}
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
        <CategoryDistributionChart data={data?.categoriesSummary} isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RecentTransactions />
      </div>
    </div>
  )
}
