import { useQuery } from "@tanstack/react-query"
import { CategorySummary, DashboardTimeFilter } from "./types"
import { fetchDashboardSummary } from "./repository"

export const useDashboardSummary = (filter: DashboardTimeFilter) => {
    return useQuery({
        queryKey: ["dashboard-summary", filter.mode, filter.period, filter.months],
        queryFn: () => fetchDashboardSummary(filter),
    })
}
