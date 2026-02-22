import type { ChangelogNotification, NotificationKind } from "../types"

export interface ParsedReleaseSection {
    title: string
    items: string[]
}

export interface ParsedRelease {
    version: string
    date: string
    sections: ParsedReleaseSection[]
}

const VERSION_HEADER_REGEX = /^##\s+\[([^\]]+)\]\s+-\s+(\d{4}-\d{2}-\d{2})\s*$/
const SECTION_HEADER_REGEX = /^###\s+(.+?)\s*$/
const BULLET_REGEX = /^\s*-\s+(.+?)\s*$/
const CRITICAL_KEYWORDS = ["breaking", "obbligo", "vieta", "mandato", "mandate", "critical", "deprecated", "rimozione"]

function sanitizeHighlights(items: string[]): string[] {
    return items.map(item => item.trim()).filter(Boolean)
}

function dedupeHighlights(items: string[]): string[] {
    const out: string[] = []
    const seen = new Set<string>()

    for (const item of items) {
        if (seen.has(item)) continue
        seen.add(item)
        out.push(item)
    }

    return out
}

function sectionKind(title: string, highlights: string[]): NotificationKind {
    const lower = title.toLowerCase()
    const joined = highlights.join(" ").toLowerCase()

    if (lower.includes("breaking")) return "breaking"
    if (lower.includes("fix")) return "fix"
    if (lower.includes("add")) return "feature"
    if (lower.includes("change") || lower.includes("improv")) return "improvement"
    if (joined.includes("fix") || joined.includes("bug")) return "fix"
    if (joined.includes("breaking")) return "breaking"
    if (joined.includes("nuovo") || joined.includes("added")) return "feature"

    return "improvement"
}

function kindTitle(kind: NotificationKind): string {
    if (kind === "feature") return "Nuove funzionalita"
    if (kind === "fix") return "Correzioni"
    if (kind === "breaking") return "Cambiamenti Importanti"
    return "Miglioramenti"
}

function toIsoDate(date: string): string {
    return `${date}T09:00:00.000Z`
}

function hashContent(value: string): string {
    // FNV-1a 32-bit hash for stable content fingerprinting.
    let hash = 0x811c9dc5
    for (let i = 0; i < value.length; i += 1) {
        hash ^= value.charCodeAt(i)
        hash = Math.imul(hash, 0x01000193)
    }
    return (hash >>> 0).toString(36).slice(0, 8)
}

function buildContentFingerprint(sectionTitle: string, highlights: string[]): string {
    const normalized = [sectionTitle, ...highlights]
        .join(" | ")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim()
    return hashContent(normalized)
}

function buildId(
    version: string,
    date: string,
    kind: NotificationKind,
    sequence: number,
    contentFingerprint: string,
): string {
    const compactDate = date.replaceAll("-", "")
    const base = `release-${version}-${compactDate}-${kind}-${contentFingerprint}`
    return sequence === 1 ? base : `${base}-${sequence}`
}

function inferCritical(kind: NotificationKind, highlights: string[]): boolean {
    if (kind === "breaking") return true
    const joined = highlights.join(" ").toLowerCase()
    return CRITICAL_KEYWORDS.some(keyword => joined.includes(keyword))
}

export function parseChangelogMarkdown(markdown: string): ParsedRelease[] {
    const lines = markdown.split(/\r?\n/)
    const releases: ParsedRelease[] = []

    let currentRelease: ParsedRelease | null = null
    let currentSection: ParsedReleaseSection | null = null

    const pushSection = () => {
        if (!currentRelease || !currentSection) return
        const highlights = sanitizeHighlights(currentSection.items)
        if (highlights.length === 0) return

        currentRelease.sections.push({
            title: currentSection.title,
            items: highlights,
        })
    }

    const pushRelease = () => {
        if (!currentRelease) return
        if (currentRelease.sections.length === 0) return
        releases.push(currentRelease)
    }

    for (const rawLine of lines) {
        const line = rawLine.trimEnd()
        const versionMatch = line.match(VERSION_HEADER_REGEX)
        if (versionMatch) {
            pushSection()
            currentSection = null
            pushRelease()
            currentRelease = {
                version: versionMatch[1].trim(),
                date: versionMatch[2].trim(),
                sections: [],
            }
            continue
        }

        if (!currentRelease) continue

        const sectionMatch = line.match(SECTION_HEADER_REGEX)
        if (sectionMatch) {
            pushSection()
            currentSection = {
                title: sectionMatch[1].trim(),
                items: [],
            }
            continue
        }

        const bulletMatch = line.match(BULLET_REGEX)
        if (bulletMatch && currentSection) {
            currentSection.items.push(bulletMatch[1].trim())
        }
    }

    pushSection()
    pushRelease()

    return releases
}

export function buildNotificationsFromReleases(releases: ParsedRelease[]): ChangelogNotification[] {
    const out: ChangelogNotification[] = []
    const idCounter = new Map<string, number>()

    for (const release of releases) {
        const publishedAt = toIsoDate(release.date)
        const releaseEntries = release.sections.filter(section => section.items.length > 0)

        if (releaseEntries.length === 0) {
            releaseEntries.push({
                title: "Changed",
                items: [`Aggiornamento release v${release.version}`],
            })
        }

        for (const section of releaseEntries) {
            const sectionHighlights = sanitizeHighlights(section.items)
            const kind = sectionKind(section.title, sectionHighlights)
            const contentFingerprint = buildContentFingerprint(section.title, sectionHighlights)
            const key = `${release.version}:${release.date}:${kind}`
            const sequence = (idCounter.get(key) ?? 0) + 1
            idCounter.set(key, sequence)
            const id = buildId(release.version, release.date, kind, sequence, contentFingerprint)
            const body = sectionHighlights[0] ?? `Aggiornamento release v${release.version}`
            const highlights = dedupeHighlights(sectionHighlights.slice(1).filter(item => item !== body))

            out.push({
                id,
                version: release.version,
                kind,
                audience: "beta",
                title: `v${release.version} · ${kindTitle(kind)}`,
                body,
                highlights,
                isCritical: inferCritical(kind, [body, ...highlights]),
                publishedAt,
                link: `/updates#v-${release.version.replaceAll(".", "-")}`,
            })
        }
    }

    return out.sort((a, b) => {
        const diff = new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        if (diff !== 0) return diff
        return b.version.localeCompare(a.version, undefined, { numeric: true, sensitivity: "base" })
    })
}
