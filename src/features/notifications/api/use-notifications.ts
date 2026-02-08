import { useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import {
    fetchChangelogNotifications,
    fetchNotificationsState,
    markAllNotificationsAsRead,
    markNotificationAsRead
} from "./repository"

export function useNotificationsFeed() {
    return useQuery({
        queryKey: queryKeys.notifications.feed,
        queryFn: fetchChangelogNotifications,
    })
}

export function useNotificationsState() {
    return useQuery({
        queryKey: queryKeys.notifications.state,
        queryFn: fetchNotificationsState,
    })
}

export function useUnreadNotifications() {
    const feedQuery = useNotificationsFeed()
    const stateQuery = useNotificationsState()
    const { notifications, unreadNotifications } = useMemo(() => {
        const notifications = feedQuery.data ?? []
        const readIds = stateQuery.data?.readIds ?? []
        const readSet = new Set(readIds)

        return {
            notifications,
            unreadNotifications: notifications.filter(notification => !readSet.has(notification.id)),
        }
    }, [feedQuery.data, stateQuery.data])

    return {
        notifications,
        unreadNotifications,
        unreadCount: unreadNotifications.length,
        isLoading: feedQuery.isLoading || stateQuery.isLoading,
        isError: feedQuery.isError || stateQuery.isError,
    }
}

export function useMarkNotificationAsRead() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => markNotificationAsRead(id),
        onSuccess: (nextState) => {
            queryClient.setQueryData(queryKeys.notifications.state, nextState)
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications.state })
        },
    })
}

export function useMarkAllNotificationsAsRead() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (ids: string[]) => markAllNotificationsAsRead(ids),
        onSuccess: (nextState) => {
            queryClient.setQueryData(queryKeys.notifications.state, nextState)
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications.state })
        },
    })
}
