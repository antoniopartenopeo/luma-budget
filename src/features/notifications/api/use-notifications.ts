import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { fetchChangelogNotifications } from "./repository"

export function useNotificationsFeed() {
    return useQuery({
        queryKey: queryKeys.notifications.feed,
        queryFn: fetchChangelogNotifications,
    })
}
