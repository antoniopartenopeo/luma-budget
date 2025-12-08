import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchRecentTransactions, createTransaction } from "./mock-data"
import { CreateTransactionDTO } from "./types"

export const useRecentTransactions = () => {
    return useQuery({
        queryKey: ["recent-transactions"],
        queryFn: fetchRecentTransactions,
    })
}

export const useTransactions = () => {
    return useQuery({
        queryKey: ["transactions"],
        queryFn: fetchRecentTransactions, // Using the same fetcher for now as it returns all
    })
}

export const useCreateTransaction = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateTransactionDTO) => createTransaction(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["recent-transactions"] })
            queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] })
            queryClient.invalidateQueries({ queryKey: ["transactions"] })
        },
    })
}

export const useUpdateTransaction = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateTransactionDTO> }) =>
            import("./mock-data").then(mod => mod.updateTransaction(id, data)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["recent-transactions"] })
            queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] })
            queryClient.invalidateQueries({ queryKey: ["transactions"] })
        },
    })
}

export const useDeleteTransaction = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) =>
            import("./mock-data").then(mod => mod.deleteTransaction(id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["recent-transactions"] })
            queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] })
            queryClient.invalidateQueries({ queryKey: ["transactions"] })
        },
    })
}

