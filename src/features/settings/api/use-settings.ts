import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchSettings, upsertSettings, resetSettings } from "./repository"

const SETTINGS_QUERY_KEY = ["settings"]

export function useSettings() {
    return useQuery({
        queryKey: SETTINGS_QUERY_KEY,
        queryFn: fetchSettings,
    })
}

export function useUpsertSettings() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: upsertSettings,
        onSuccess: (newSettings) => {
            // Invalidate queries to update UI
            queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY })
            // Optionally update cache directly for instant feedback
            queryClient.setQueryData(SETTINGS_QUERY_KEY, newSettings)
        },
    })
}

export function useResetSettings() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async () => {
            resetSettings()
            // Return default after reset
            return fetchSettings()
        },
        onSuccess: (defaultSettings) => {
            queryClient.setQueryData(SETTINGS_QUERY_KEY, defaultSettings)
            queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY })
        }
    })
}
