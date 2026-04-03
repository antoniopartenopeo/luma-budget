"use client"

import { useMemo } from "react"
import type { NotificationKind } from "../types"
import { Clock3 } from "lucide-react"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { StateMessage } from "@/components/ui/state-message"
import { StaggerContainer } from "@/components/patterns/stagger-container"
import { macroItemVariants } from "@/components/patterns/macro-section"
import { PublicSupportIntro, PublicSupportSurface } from "@/components/layout/public-support-surface"
import { useNotificationsFeed } from "../api/use-notifications"
import { formatItalianDate } from "./notification-ui"

const KIND_ORDER: NotificationKind[] = ["feature", "improvement", "fix", "breaking"]

const KIND_BULLET_COPY: Record<NotificationKind, string> = {
    feature: "Abbiamo introdotto nuove funzioni in punti chiave dell'app.",
    improvement: "Abbiamo reso alcuni flussi più chiari e più semplici da usare.",
    fix: "Abbiamo migliorato performance, stabilità e affidabilità generale.",
    breaking: "Questa release include indicazioni importanti su comportamenti aggiornati.",
}

const KIND_LEAD_FRAGMENT: Record<NotificationKind, string> = {
    feature: "nuove funzioni",
    improvement: "miglioramenti all'esperienza",
    fix: "più stabilità",
    breaking: "indicazioni importanti",
}

function joinItalianList(parts: string[]): string {
    if (parts.length <= 1) return parts[0] ?? ""
    if (parts.length === 2) return `${parts[0]} e ${parts[1]}`
    return `${parts.slice(0, -1).join(", ")} e ${parts.at(-1)}`
}

function buildReleaseLead(kinds: NotificationKind[]): string {
    const fragments = kinds.map((kind) => KIND_LEAD_FRAGMENT[kind]).filter(Boolean)
    if (fragments.length === 0) {
        return "Aggiornamento generale dell'app."
    }

    return `Include ${joinItalianList(fragments)}.`
}

function buildReleaseTitle(kinds: NotificationKind[]): string {
    if (kinds.includes("feature")) return "Nuove funzioni"
    if (kinds.includes("improvement")) return "Miglioramenti"
    if (kinds.includes("fix")) return "Correzioni e stabilità"
    if (kinds.includes("breaking")) return "Avviso importante"
    return "Aggiornamento"
}

export function UpdatesPageContent() {
    const feedQuery = useNotificationsFeed()
    const notifications = useMemo(() => feedQuery.data ?? [], [feedQuery.data])

    const groupedByVersion = useMemo(() => {
        const groups = new Map<string, typeof notifications>()

        for (const notification of notifications) {
            const current = groups.get(notification.version) ?? []
            current.push(notification)
            groups.set(notification.version, current)
        }

        return Array.from(groups.entries())
    }, [notifications])

    const releaseCards = useMemo(() => {
        return groupedByVersion.map(([version, items]) => {
            const kinds = KIND_ORDER.filter((kind) => items.some((item) => item.kind === kind))

            return {
                version,
                items,
                title: buildReleaseTitle(kinds),
                lead: buildReleaseLead(kinds),
                highlights: kinds.map((kind) => KIND_BULLET_COPY[kind]).slice(0, 4),
            }
        })
    }, [groupedByVersion])

    return (
        <StaggerContainer className="w-full space-y-6">
            <motion.div variants={macroItemVariants}>
                <PublicSupportIntro
                    eyebrow="Aggiornamenti"
                    title="Le novità recenti di Numa."
                    description="Novità, miglioramenti e correzioni delle ultime versioni."
                />
            </motion.div>

            {feedQuery.isLoading && (
                <motion.div variants={macroItemVariants}>
                    <PublicSupportSurface className="space-y-4 rounded-[2rem] p-5 sm:p-6">
                        <div className="flex items-center justify-between gap-3">
                            <Skeleton className="h-4 w-28 rounded-full" />
                            <Skeleton className="h-4 w-20 rounded-full" />
                        </div>
                        <div className="space-y-3">
                            <Skeleton className="h-28 w-full rounded-[1.5rem]" />
                            <Skeleton className="h-24 w-full rounded-[1.5rem]" />
                        </div>
                    </PublicSupportSurface>
                </motion.div>
            )}

            {!feedQuery.isLoading && notifications.length === 0 && (
                <motion.div variants={macroItemVariants}>
                    <PublicSupportSurface className="overflow-hidden rounded-[2rem] p-0">
                        <StateMessage
                            variant="empty"
                            title="Nessun aggiornamento da mostrare"
                            description="Le prossime release compariranno qui, con una sintesi semplice e leggibile delle novità introdotte."
                        />
                    </PublicSupportSurface>
                </motion.div>
            )}

            {!feedQuery.isLoading && releaseCards.length > 0 && (
                <motion.div variants={macroItemVariants}>
                    <section className="space-y-4">
                        {releaseCards.map((release) => (
                            <PublicSupportSurface
                                key={release.version}
                                className="rounded-[2rem] p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.34)]"
                            >
                                <article id={`v-${release.version.replaceAll(".", "-")}`}>
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                                                Versione {release.version}
                                            </h2>
                                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                                                <Clock3 className="h-3.5 w-3.5 text-primary" />
                                                {formatItalianDate(release.items[0].publishedAt)}
                                            </span>
                                        </div>
                                        <p className="text-sm font-semibold tracking-tight text-foreground">
                                            {release.title}
                                        </p>
                                        <p className="max-w-[42rem] text-sm font-normal leading-relaxed text-muted-foreground sm:text-base">
                                            {release.lead}
                                        </p>
                                    </div>
                                </div>

                                {release.highlights.length > 0 && (
                                    <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm font-normal leading-relaxed text-muted-foreground">
                                        {release.highlights.map((highlight, index) => (
                                            <li
                                                key={`${release.version}-highlight-${index}`}
                                                className="pl-1 marker:text-primary"
                                            >
                                                {highlight}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                </article>
                            </PublicSupportSurface>
                        ))}
                    </section>
                </motion.div>
            )}
        </StaggerContainer>
    )
}
