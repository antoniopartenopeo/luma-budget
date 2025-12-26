import { useQuery } from "@tanstack/react-query"
import { CategorySummary } from "./types"
import { fetchDashboardSummary } from "./repository"

export const useDashboardSummary = () => {
    return useQuery({
        queryKey: ["dashboard-summary"],
        queryFn: fetchDashboardSummary,
    })
}
