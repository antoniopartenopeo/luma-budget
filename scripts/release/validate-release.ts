import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { parseChangelogMarkdown } from "../../src/features/notifications/release/changelog-sync.ts"

type FeedItem = {
    id: string
    version: string
}

const scriptDir = fileURLToPath(new URL(".", import.meta.url))
const rootDir = resolve(scriptDir, "..", "..")
const packageJsonPath = resolve(rootDir, "package.json")
const changelogPath = resolve(rootDir, "CHANGELOG.md")
const feedPath = resolve(rootDir, "src/features/notifications/data/beta-changelog-feed.json")

function readJson<T>(path: string): T {
    return JSON.parse(readFileSync(path, "utf8")) as T
}

function main() {
    const errors: string[] = []

    const pkg = readJson<{ version: string }>(packageJsonPath)
    const changelog = readFileSync(changelogPath, "utf8")
    const releases = parseChangelogMarkdown(changelog)
    const feed = readJson<FeedItem[]>(feedPath)

    if (releases.length === 0) {
        errors.push("CHANGELOG.md non contiene release valide")
    }

    if (!Array.isArray(feed) || feed.length === 0) {
        errors.push("Feed notifiche vuoto o invalido")
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
    }

    for (const release of releases) {
        const hasEntry = feed.some(item => item.version === release.version)
        if (!hasEntry) {
            errors.push(`Release ${release.version} senza entry nel feed notifiche`)
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

    console.log(`[release:validate] OK | package=${pkg.version} | releases=${releases.length} | feed=${feed.length}`)
}

main()
