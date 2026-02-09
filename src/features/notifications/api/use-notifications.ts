import { useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import {
    fetchChangelogNotifications,
    fetchNotificationsState,
    markAllNotificationsAsRead,
    markNotificationAsRead
} from "./repository"

interface MarkNotificationAsReadParams {
    id: string
    lastSeenVersion?: string
}

interface MarkAllNotificationsAsReadParams {
    ids: string[]
    lastSeenVersion?: string
}

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
    const { notifications, unreadNotifications, criticalUnreadNotifications } = useMemo(() => {
        const notifications = feedQuery.data ?? []
        const readIds = stateQuery.data?.readIds ?? []
        const readSet = new Set(readIds)
        const unreadNotifications = notifications.filter(notification => !readSet.has(notification.id))
        const criticalUnreadNotifications = unreadNotifications.filter(notification => notification.isCritical || notification.kind === "breaking")

        return {
            notifications,
            unreadNotifications,
            criticalUnreadNotifications,
        }
    }, [feedQuery.data, stateQuery.data])

    return {
        notifications,
        unreadNotifications,
        criticalUnreadNotifications,
        unreadCount: unreadNotifications.length,
        criticalUnreadCount: criticalUnreadNotifications.length,
        lastSeenVersion: stateQuery.data?.lastSeenVersion ?? null,
        isLoading: feedQuery.isLoading || stateQuery.isLoading,
        isError: feedQuery.isError || stateQuery.isError,
    }
}

export function useMarkNotificationAsRead() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, lastSeenVersion }: MarkNotificationAsReadParams) =>
            markNotificationAsRead(id, lastSeenVersion),
        onSuccess: (nextState) => {
            queryClient.setQueryData(queryKeys.notifications.state, nextState)
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications.state })
        },
    })
}

export function useMarkAllNotificationsAsRead() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ ids, lastSeenVersion }: MarkAllNotificationsAsReadParams) =>
            markAllNotificationsAsRead(ids, lastSeenVersion),
        onSuccess: (nextState) => {
            queryClient.setQueryData(queryKeys.notifications.state, nextState)
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications.state })
        },
    })
}
