import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { NextResponse } from "next/server"
import {
    buildNotificationsFromReleases,
    parseChangelogMarkdown,
} from "@/features/notifications/release/changelog-sync"

const changelogPath = resolve(process.cwd(), "CHANGELOG.md")

export const runtime = "nodejs"

export async function GET() {
    try {
        const markdown = await readFile(changelogPath, "utf8")
        const releases = parseChangelogMarkdown(markdown)
        const notifications = buildNotificationsFromReleases(releases)
        return NextResponse.json(notifications, {
            headers: {
                "Cache-Control": "no-store, max-age=0",
            },
        })
    } catch {
        return NextResponse.json([], { status: 500 })
    }
}
