import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchSettings, upsertSettings, resetSettings } from "./repository"
import { queryKeys } from "@/lib/query-keys"


export function useSettings() {
    return useQuery({
        queryKey: queryKeys.settings(),
        queryFn: fetchSettings,
    })
}

export function useUpsertSettings() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: upsertSettings,
        onSuccess: (newSettings) => {
            // Invalidate queries to update UI
            queryClient.invalidateQueries({ queryKey: queryKeys.settings() })
            // Optionally update cache directly for instant feedback
            queryClient.setQueryData(queryKeys.settings(), newSettings)
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
            queryClient.setQueryData(queryKeys.settings(), defaultSettings)
            queryClient.invalidateQueries({ queryKey: queryKeys.settings() })
        }
    })
}
