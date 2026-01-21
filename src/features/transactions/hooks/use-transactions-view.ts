"use client"

import { useState, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Transaction } from "../api/types"
import {
    applyFilters,
    applySorting,
    computeSummary,
    paginateData,
    SortField,
    SortOrder,
    TransactionFilters
} from "../utils/transactions-logic"
import { PeriodPreset } from "../components/transactions-filter-bar"

const PAGE_SIZE = 15

export function useTransactionsView(transactions: Transaction[]) {
    const router = useRouter()
    const searchParams = useSearchParams()

    // --- State from URL ---
    const search = searchParams.get("q") || ""
    const type = (searchParams.get("type") || "all") as "all" | "income" | "expense" | "superfluous"
    const categoryId = searchParams.get("cat") || "all"
    const period = (searchParams.get("period") || "all") as PeriodPreset
    const fromDate = searchParams.get("from") || ""
    const toDate = searchParams.get("to") || ""

    const sort = (searchParams.get("sort") || "date") as SortField
    const order = (searchParams.get("order") || "desc") as SortOrder
    const page = parseInt(searchParams.get("p") || "1", 10)

    // --- Derived Filters Object ---
    const filters = useMemo((): TransactionFilters => {
        const dateRange: { from?: Date; to?: Date } = {}

        if (period === "custom") {
            if (fromDate) dateRange.from = new Date(fromDate)
            if (toDate) dateRange.to = new Date(toDate)
        } else if (period !== "all") {
            const now = new Date()
            dateRange.to = now
            const from = new Date()
            if (period === "1m") from.setMonth(now.getMonth() - 1)
            else if (period === "3m") from.setMonth(now.getMonth() - 3)
            else if (period === "6m") from.setMonth(now.getMonth() - 6)
            else if (period === "1y") from.setFullYear(now.getFullYear() - 1)
            dateRange.from = from
        }

        return {
            search,
            type: type === "superfluous" ? "all" : type,
            categoryId,
            isSuperfluous: type === "superfluous",
            dateRange
        }
    }, [search, type, categoryId, period, fromDate, toDate])

    // --- Computed Data ---
    const { filteredList, sortedList, paginatedList, summary, totalPages } = useMemo(() => {
        const filtered = applyFilters(transactions, filters)
        const sorted = applySorting(filtered, sort, order)
        const paginated = paginateData(sorted, page, PAGE_SIZE)
        const summ = computeSummary(filtered)
        const totalP = Math.ceil(filtered.length / PAGE_SIZE)

        return {
            filteredList: filtered,
            sortedList: sorted,
            paginatedList: paginated,
            summary: summ,
            totalPages: totalP
        }
    }, [transactions, filters, sort, order, page])

    // --- URL Update Helpers ---
    const updateParams = (updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString())
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === "" || value === "all" || (key === "p" && value === "1")) {
                params.delete(key)
            } else {
                params.set(key, value)
            }
        })
        router.push(`/transactions?${params.toString()}`)
    }

    const resetFilters = () => {
        router.push("/transactions")
    }

    const handleSortChange = (field: SortField) => {
        const newOrder = sort === field && order === "desc" ? "asc" : "desc"
        updateParams({ sort: field, order: newOrder, p: "1" })
    }

    return {
        // State
        search,
        type,
        categoryId,
        period,
        fromDate,
        toDate,
        sort,
        order,
        page,
        filters,

        // Data
        filteredList,
        sortedList,
        paginatedList,
        summary,
        totalPages,

        // Actions
        updateParams,
        resetFilters,
        handleSortChange
    }
}
