"use client"

import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { InsightsPageContent } from "@/features/insights/components/insights-page-content"

export default function InsightsPage() {
    return (
        <Suspense fallback={
            <div className="space-y-8 p-6">
                <Skeleton className="h-12 w-64 rounded-xl" />
                <div className="flex justify-center">
                    <Skeleton className="h-10 w-48 rounded-xl" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-48 rounded-2xl" />
                    <Skeleton className="h-48 rounded-2xl" />
                    <Skeleton className="h-48 rounded-2xl" />
                </div>
            </div>
        }>
            <InsightsPageContent />
        </Suspense>
    )
}
