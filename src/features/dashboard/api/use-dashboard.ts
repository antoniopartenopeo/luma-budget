import { useQuery } from "@tanstack/react-query"
import { DashboardTimeFilter } from "./types"
import { fetchDashboardSummary } from "./repository"
import { queryKeys } from "@/lib/query-keys"

export const useDashboardSummary = (filter: DashboardTimeFilter) => {
    return useQuery({
        queryKey: queryKeys.dashboard.summary(filter.mode, filter.period, filter.months),
        queryFn: () => fetchDashboardSummary(filter),
    })
}
