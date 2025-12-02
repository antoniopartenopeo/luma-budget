import { useQuery } from "@tanstack/react-query"
import { fetchDashboardSummary } from "./mock-data"

export const useDashboardSummary = () => {
    return useQuery({
        queryKey: ["dashboard-summary"],
        queryFn: fetchDashboardSummary,
    })
}
