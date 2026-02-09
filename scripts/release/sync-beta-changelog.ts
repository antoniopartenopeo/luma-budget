import { readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { buildNotificationsFromReleases, parseChangelogMarkdown } from "../../src/features/notifications/release/changelog-sync.ts"

const scriptDir = fileURLToPath(new URL(".", import.meta.url))
const rootDir = resolve(scriptDir, "..", "..")
const changelogPath = resolve(rootDir, "CHANGELOG.md")
const feedPath = resolve(rootDir, "src/features/notifications/data/beta-changelog-feed.json")

function main() {
    const changelog = readFileSync(changelogPath, "utf8")
    const releases = parseChangelogMarkdown(changelog)

    if (releases.length === 0) {
        throw new Error("Nessuna release trovata in CHANGELOG.md")
    }

    const feed = buildNotificationsFromReleases(releases)

    if (feed.length === 0) {
        throw new Error("Generazione feed vuota: ogni release deve produrre almeno una notifica")
    }

    writeFileSync(feedPath, `${JSON.stringify(feed, null, 2)}\n`, "utf8")

    const versions = Array.from(new Set(feed.map(item => item.version)))
    console.log(`[release:sync] feed aggiornato: ${feedPath}`)
    console.log(`[release:sync] notifiche: ${feed.length} | release coperte: ${versions.length}`)
}

main()
