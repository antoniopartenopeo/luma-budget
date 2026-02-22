import { describe, expect, it } from "vitest"
import { buildNotificationsFromReleases, parseChangelogMarkdown } from "../changelog-sync"

const SAMPLE_CHANGELOG = `
# CHANGELOG

## [0.3.0] - 2026-02-04

### Added
- Deterministic Narration Layer.
- Technical Audit Panel.

### Changed
- No Inline Strings mandate.

## [0.2.5] - 2026-02-01

### Added
- Living Effect.
`

describe("changelog-sync parser", () => {
    it("parse correttamente release e sezioni Added/Changed", () => {
        const releases = parseChangelogMarkdown(SAMPLE_CHANGELOG)

        expect(releases).toHaveLength(2)
        expect(releases[0].version).toBe("0.3.0")
        expect(releases[0].sections.map(section => section.title)).toEqual(["Added", "Changed"])
        expect(releases[0].sections[0].items).toEqual([
            "Deterministic Narration Layer.",
            "Technical Audit Panel.",
        ])
    })

    it("genera feed stabile con id deduplicati e ordinamento desc", () => {
        const releases = parseChangelogMarkdown(SAMPLE_CHANGELOG)
        const feed = buildNotificationsFromReleases(releases)

        expect(feed.map(item => item.id)).toEqual([
            expect.stringMatching(/^release-0\.3\.0-20260204-feature-[a-z0-9]+$/),
            expect.stringMatching(/^release-0\.3\.0-20260204-improvement-[a-z0-9]+$/),
            expect.stringMatching(/^release-0\.2\.5-20260201-feature-[a-z0-9]+$/),
        ])
        expect(new Set(feed.map(item => item.id)).size).toBe(feed.length)
        expect(feed.every(item => !item.highlights.includes(item.body))).toBe(true)
        expect(feed[0].body).toBe("Deterministic Narration Layer.")
        expect(feed[0].highlights).toEqual(["Technical Audit Panel."])
        expect(feed[0].publishedAt >= feed[1].publishedAt).toBe(true)
    })

    it("mantiene payload consistente del feed principale", () => {
        const feed = buildNotificationsFromReleases(parseChangelogMarkdown(SAMPLE_CHANGELOG))

        expect(feed).toHaveLength(3)
        expect(feed[0]).toMatchObject({
            audience: "beta",
            kind: "feature",
            version: "0.3.0",
            title: "v0.3.0 · Nuove funzionalita",
            body: "Deterministic Narration Layer.",
            highlights: ["Technical Audit Panel."],
            publishedAt: "2026-02-04T09:00:00.000Z",
            link: "/updates#v-0-3-0",
            isCritical: false,
        })
        expect(feed[0].id).toMatch(/^release-0\.3\.0-20260204-feature-[a-z0-9]+$/)
        expect(feed[1]).toMatchObject({
            audience: "beta",
            kind: "improvement",
            version: "0.3.0",
            title: "v0.3.0 · Miglioramenti",
            body: "No Inline Strings mandate.",
            highlights: [],
            publishedAt: "2026-02-04T09:00:00.000Z",
            link: "/updates#v-0-3-0",
            isCritical: true,
        })
        expect(feed[1].id).toMatch(/^release-0\.3\.0-20260204-improvement-[a-z0-9]+$/)
        expect(feed[2]).toMatchObject({
            audience: "beta",
            kind: "feature",
            version: "0.2.5",
            title: "v0.2.5 · Nuove funzionalita",
            body: "Living Effect.",
            highlights: [],
            publishedAt: "2026-02-01T09:00:00.000Z",
            link: "/updates#v-0-2-5",
            isCritical: false,
        })
        expect(feed[2].id).toMatch(/^release-0\.2\.5-20260201-feature-[a-z0-9]+$/)
    })

    it("genera un nuovo id quando cambia il contenuto della stessa sezione", () => {
        const before = `
# CHANGELOG

## [0.3.0] - 2026-02-04

### Changed
- Primo testo.
`
        const after = `
# CHANGELOG

## [0.3.0] - 2026-02-04

### Changed
- Primo testo aggiornato.
`

        const beforeFeed = buildNotificationsFromReleases(parseChangelogMarkdown(before))
        const afterFeed = buildNotificationsFromReleases(parseChangelogMarkdown(after))

        expect(beforeFeed).toHaveLength(1)
        expect(afterFeed).toHaveLength(1)
        expect(beforeFeed[0].id).not.toBe(afterFeed[0].id)
    })
})
