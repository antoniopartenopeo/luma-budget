import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import {
    getCategories,
    upsertCategory,
    archiveCategory,
    unarchiveCategory,
    resetCategoriesToDefault
} from "./repository"
import { Category } from "../config"

export function useCategories(options: { includeArchived?: boolean } = { includeArchived: false }) {
    return useQuery({
        queryKey: options.includeArchived ? queryKeys.categories.all() : queryKeys.categories.active(),
        queryFn: async () => {
            const all = await getCategories()
            if (options.includeArchived) return all
            return all.filter(c => !c.archived)
        }
    })
}

export function useUpsertCategory() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (category: Category) => upsertCategory(category),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() })
            queryClient.invalidateQueries({ queryKey: queryKeys.categories.active() })
        }
    })
}

export function useArchiveCategory() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => archiveCategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() })
            queryClient.invalidateQueries({ queryKey: queryKeys.categories.active() })
        }
    })
}

export function useUnarchiveCategory() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => unarchiveCategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() })
            queryClient.invalidateQueries({ queryKey: queryKeys.categories.active() })
        }
    })
}

export function useResetCategories() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: () => resetCategoriesToDefault(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() })
            queryClient.invalidateQueries({ queryKey: queryKeys.categories.active() })
        }
    })
}
