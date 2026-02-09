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
            "release-0.3.0-20260204-feature",
            "release-0.3.0-20260204-improvement",
            "release-0.2.5-20260201-feature",
        ])
        expect(feed.every(item => !item.highlights.includes(item.body))).toBe(true)
        expect(feed[0].body).toBe("Deterministic Narration Layer.")
        expect(feed[0].highlights).toEqual(["Technical Audit Panel."])
        expect(feed[0].publishedAt >= feed[1].publishedAt).toBe(true)
    })

    it("mantiene snapshot consistente del payload principale", () => {
        const feed = buildNotificationsFromReleases(parseChangelogMarkdown(SAMPLE_CHANGELOG))

        expect(feed).toMatchInlineSnapshot(`
          [
            {
              "audience": "beta",
              "body": "Deterministic Narration Layer.",
              "highlights": [
                "Technical Audit Panel.",
              ],
              "id": "release-0.3.0-20260204-feature",
              "isCritical": false,
              "kind": "feature",
              "link": "/updates#v-0-3-0",
              "publishedAt": "2026-02-04T09:00:00.000Z",
              "title": "v0.3.0 · Nuove funzionalita",
              "version": "0.3.0",
            },
            {
              "audience": "beta",
              "body": "No Inline Strings mandate.",
              "highlights": [],
              "id": "release-0.3.0-20260204-improvement",
              "isCritical": true,
              "kind": "improvement",
              "link": "/updates#v-0-3-0",
              "publishedAt": "2026-02-04T09:00:00.000Z",
              "title": "v0.3.0 · Miglioramenti",
              "version": "0.3.0",
            },
            {
              "audience": "beta",
              "body": "Living Effect.",
              "highlights": [],
              "id": "release-0.2.5-20260201-feature",
              "isCritical": false,
              "kind": "feature",
              "link": "/updates#v-0-2-5",
              "publishedAt": "2026-02-01T09:00:00.000Z",
              "title": "v0.2.5 · Nuove funzionalita",
              "version": "0.2.5",
            },
          ]
        `)
    })
})
