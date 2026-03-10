import { calculateDateRangeLocal, formatDateLocalISO, getCurrentPeriod } from "@/lib/date-ranges"
import type { DashboardTimeFilter } from "../api/types"

const VALID_RANGE_MONTHS = new Set<DashboardTimeFilter["months"]>([3, 6, 12])

function isValidPeriod(value: string | null): value is string {
    return Boolean(value && /^\d{4}-\d{2}$/.test(value))
}

function resolveMonths(value: string | null): DashboardTimeFilter["months"] | undefined {
    if (!value) return undefined

    const parsed = Number.parseInt(value, 10) as DashboardTimeFilter["months"]
    return VALID_RANGE_MONTHS.has(parsed) ? parsed : undefined
}

export function parseDashboardTimeFilter(searchParams: Pick<URLSearchParams, "get">): DashboardTimeFilter {
    const period = isValidPeriod(searchParams.get("period")) ? searchParams.get("period")! : getCurrentPeriod()
    const mode = searchParams.get("mode") === "range" ? "range" : "month"
    const months = resolveMonths(searchParams.get("months"))

    if (mode === "range" && months) {
        return {
            mode,
            period,
            months
        }
    }

    return {
        mode: "month",
        period
    }
}

export function writeDashboardTimeFilter(searchParams: URLSearchParams, filter: DashboardTimeFilter): URLSearchParams {
    searchParams.set("period", filter.period)
    searchParams.set("mode", filter.mode)

    if (filter.mode === "range" && filter.months) {
        searchParams.set("months", String(filter.months))
    } else {
        searchParams.delete("months")
    }

    return searchParams
}

export function buildTransactionsHrefForDashboardFilter(filter: DashboardTimeFilter): string {
    const months = filter.mode === "range" && filter.months ? filter.months : 1
    const { startDate, endDate } = calculateDateRangeLocal(filter.period, months)
    const params = new URLSearchParams({
        period: "custom",
        from: formatDateLocalISO(startDate),
        to: formatDateLocalISO(endDate)
    })

    return `/transactions?${params.toString()}`
}
