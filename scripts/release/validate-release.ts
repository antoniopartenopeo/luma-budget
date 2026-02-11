import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { buildNotificationsFromReleases, parseChangelogMarkdown } from "../../src/features/notifications/release/changelog-sync.ts"

type FeedItem = {
    id: string
    version: string
    body?: unknown
    highlights?: unknown
}

const scriptDir = fileURLToPath(new URL(".", import.meta.url))
const rootDir = resolve(scriptDir, "..", "..")
const packageJsonPath = resolve(rootDir, "package.json")
const changelogPath = resolve(rootDir, "CHANGELOG.md")

function readJson<T>(path: string): T {
    return JSON.parse(readFileSync(path, "utf8")) as T
}

function main() {
    const errors: string[] = []

    const pkg = readJson<{ version: string }>(packageJsonPath)
    const changelog = readFileSync(changelogPath, "utf8")
    const releases = parseChangelogMarkdown(changelog)
    const feed = buildNotificationsFromReleases(releases) as FeedItem[]

    if (releases.length === 0) {
        errors.push("CHANGELOG.md non contiene release valide")
    }

    if (feed.length === 0) {
        errors.push("Feed notifiche generato vuoto o invalido")
    }

    const topVersion = releases[0]?.version
    if (topVersion && pkg.version !== topVersion) {
        errors.push(`Versione incoerente: package.json=${pkg.version} ma CHANGELOG top=${topVersion}`)
    }

    const seen = new Set<string>()
    for (const item of feed) {
        if (seen.has(item.id)) {
            errors.push(`ID duplicato nel feed: ${item.id}`)
            break
        }
        seen.add(item.id)

        if (typeof item.body !== "string" || item.body.trim().length === 0) {
            errors.push(`Body mancante o invalido per notifica: ${item.id}`)
            continue
        }

        if (!Array.isArray(item.highlights)) {
            errors.push(`Highlights mancanti o invalidi per notifica: ${item.id}`)
            continue
        }

        const body = item.body.trim()
        const highlightSeen = new Set<string>()
        for (const rawHighlight of item.highlights) {
            if (typeof rawHighlight !== "string") {
                errors.push(`Highlight non testuale per notifica: ${item.id}`)
                break
            }

            const highlight = rawHighlight.trim()
            if (highlight.length === 0) {
                errors.push(`Highlight vuoto per notifica: ${item.id}`)
                break
            }

            if (highlight === body) {
                errors.push(`Highlight duplicato del body per notifica: ${item.id}`)
                break
            }

            if (highlightSeen.has(highlight)) {
                errors.push(`Highlights duplicati per notifica: ${item.id}`)
                break
            }
            highlightSeen.add(highlight)
        }
    }

    const hasCurrentVersionEntry = feed.some(item => item.version === pkg.version)
    if (!hasCurrentVersionEntry) {
        errors.push(`Nessuna entry notifiche per versione corrente ${pkg.version}`)
    }

    if (errors.length > 0) {
        console.error("[release:validate] FAILED")
        for (const error of errors) {
            console.error(`- ${error}`)
        }
        process.exit(1)
    }

    console.log(`[release:validate] OK | package=${pkg.version} | releases=${releases.length} | notifications=${feed.length}`)
}

main()
