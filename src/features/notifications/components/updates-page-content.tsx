"use client"

import { useMemo } from "react"
import type { NotificationKind } from "../types"
import { ArrowUpRight, ShieldCheck, Sparkles, TriangleAlert, type LucideIcon } from "lucide-react"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { StateMessage } from "@/components/ui/state-message"
import { StaggerContainer } from "@/components/patterns/stagger-container"
import { macroItemVariants } from "@/components/patterns/macro-section"
import { PublicSupportIntro, PublicSupportSurface } from "@/components/layout/public-support-surface"
import { LandingEditorialCardFrame } from "@/features/landing/components/landing-editorial-card-frame"
import { LANDING_EDITORIAL_CARD_TITLE_CLASS } from "@/features/landing/components/landing-tokens"
import { useNotificationsFeed } from "../api/use-notifications"

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

const KIND_ICON_MAP: Record<NotificationKind, LucideIcon> = {
    feature: Sparkles,
    improvement: ArrowUpRight,
    fix: ShieldCheck,
    breaking: TriangleAlert,
}

const KIND_ACCENT_MAP: Record<
    NotificationKind,
    {
        border: string
        panel: string
        icon: string
        decorative: string
        orb: string
    }
> = {
    feature: {
        border: "border-cyan-400/20 dark:border-white/10",
        panel: "from-cyan-500/[0.02] via-white to-cyan-50/50 dark:from-white/[0.06] dark:via-black/84 dark:to-zinc-900/62",
        icon: "border-cyan-400/25 bg-cyan-500/10 text-cyan-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-zinc-100",
        decorative: "text-cyan-500/6 dark:text-white/[0.03]",
        orb: "bg-cyan-500/18 dark:bg-white/8",
    },
    improvement: {
        border: "border-slate-400/18 dark:border-white/9",
        panel: "from-slate-500/[0.03] via-white to-slate-50/60 dark:from-white/[0.05] dark:via-black/84 dark:to-zinc-950/68",
        icon: "border-slate-400/25 bg-slate-500/8 text-slate-700 dark:border-white/9 dark:bg-white/[0.045] dark:text-zinc-200",
        decorative: "text-slate-500/7 dark:text-white/[0.028]",
        orb: "bg-slate-500/16 dark:bg-white/7",
    },
    fix: {
        border: "border-teal-400/20 dark:border-white/10",
        panel: "from-teal-500/[0.02] via-white to-teal-50/50 dark:from-white/[0.055] dark:via-black/84 dark:to-stone-950/64",
        icon: "border-teal-400/25 bg-teal-500/10 text-teal-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-stone-200",
        decorative: "text-teal-500/6 dark:text-white/[0.03]",
        orb: "bg-teal-500/18 dark:bg-white/8",
    },
    breaking: {
        border: "border-amber-400/20 dark:border-white/10",
        panel: "from-amber-500/[0.02] via-white to-amber-50/55 dark:from-white/[0.055] dark:via-black/84 dark:to-neutral-950/64",
        icon: "border-amber-400/25 bg-amber-500/10 text-amber-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-neutral-100",
        decorative: "text-amber-500/7 dark:text-white/[0.03]",
        orb: "bg-amber-500/18 dark:bg-white/8",
    },
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

function formatEditorialDate(isoDate: string): string {
    const timestamp = new Date(isoDate).getTime()
    if (!Number.isFinite(timestamp)) return isoDate

    return new Intl.DateTimeFormat("it-IT", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
    }).format(new Date(timestamp))
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
            const publishedAt = items[0]?.publishedAt ?? ""
            const dateLabel = formatEditorialDate(publishedAt)

            return {
                version,
                items,
                dateLabel,
                primaryKind: kinds[0] ?? "improvement",
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
                            <LandingEditorialCardFrame
                                key={release.version}
                                borderClassName={KIND_ACCENT_MAP[release.primaryKind].border}
                                panelClassName={KIND_ACCENT_MAP[release.primaryKind].panel}
                                leadingIcon={KIND_ICON_MAP[release.primaryKind]}
                                leadingIconWrapperClassName={KIND_ACCENT_MAP[release.primaryKind].icon}
                                orbClassName={KIND_ACCENT_MAP[release.primaryKind].orb}
                                orbPositionClassName="-right-[14%] -top-[18%] h-[18rem] w-[18rem] sm:h-[24rem] sm:w-[24rem]"
                                decorativeText={release.dateLabel}
                                decorativeTextClassName={`-bottom-[14%] -right-[2%] text-[4.25rem] ${KIND_ACCENT_MAP[release.primaryKind].decorative} sm:-bottom-[10%] sm:text-[6.25rem] lg:text-[8rem]`}
                                className="rounded-[2rem] p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.34)] sm:p-6"
                            >
                                <article id={`v-${release.version.replaceAll(".", "-")}`}>
                                <div className="relative flex flex-col gap-4 pr-8 pt-18 sm:pr-16 sm:pt-24 lg:pr-24 lg:pt-28">
                                    <div className="space-y-3">
                                        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/52 sm:text-[12px] lg:text-[13px]">
                                            Versione {release.version}
                                        </h2>
                                        <p className={`${LANDING_EDITORIAL_CARD_TITLE_CLASS} max-w-[16ch]`}>
                                            {release.title}
                                        </p>
                                        <p className="max-w-[42rem] text-sm font-normal leading-relaxed text-muted-foreground sm:text-base">
                                            {release.lead}
                                        </p>
                                    </div>

                                    {release.highlights.length > 0 && (
                                        <ul className="relative mt-2 list-disc space-y-1.5 pl-5 text-sm font-normal leading-relaxed text-muted-foreground">
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
                                </div>
                                </article>
                            </LandingEditorialCardFrame>
                        ))}
                    </section>
                </motion.div>
            )}
        </StaggerContainer>
    )
}
