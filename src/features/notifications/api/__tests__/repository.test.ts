import { afterAll, beforeEach, describe, expect, it, vi } from "vitest"
import { storage } from "@/lib/storage-utils"
import {
    fetchChangelogNotifications,
    fetchNotificationsState,
    LEGACY_NOTIFICATIONS_STATE_STORAGE_KEY,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    NOTIFICATIONS_STATE_STORAGE_KEY,
} from "../repository"

const FEED_FIXTURE = [
    {
        id: "beta-old",
        version: "0.1.0",
        kind: "fix",
        audience: "beta",
        title: "Fix vecchio",
        body: "Dettaglio fix",
        highlights: ["Fix vecchio"],
        publishedAt: "2026-02-01T10:00:00.000Z",
    },
    {
        id: "alpha-hidden",
        version: "0.1.1",
        kind: "feature",
        audience: "alpha",
        title: "Non deve apparire",
        body: "Audience non valida",
        highlights: ["Non mostrare"],
        publishedAt: "2026-02-08T10:00:00.000Z",
    },
    {
        id: "beta-new",
        version: "0.1.2",
        kind: "breaking",
        audience: "beta",
        title: "Breaking recente",
        body: "Dettaglio breaking",
        highlights: ["Breaking importante"],
        isCritical: true,
        publishedAt: "2026-02-08T12:00:00.000Z",
    },
    {
        id: "beta-mid",
        version: "0.1.1",
        kind: "feature",
        audience: "beta",
        title: "Feature media",
        body: "Dettaglio feature",
        highlights: ["Feature media"],
        publishedAt: "2026-02-05T09:00:00.000Z",
    },
    {
        id: "beta-legacy-dup",
        version: "0.1.3",
        kind: "feature",
        audience: "beta",
        title: "Legacy con duplicati",
        body: "Feature legacy",
        highlights: [
            "Feature legacy",
            "Feature legacy",
            "Altro dettaglio",
            "Altro dettaglio",
            "  Altro dettaglio  ",
        ],
        publishedAt: "2026-02-08T13:00:00.000Z",
    },
]

vi.mock("@/lib/storage-utils", () => ({
    storage: {
        get: vi.fn(),
        set: vi.fn(),
        remove: vi.fn(),
    },
}))

describe("notifications repository", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.stubGlobal("fetch", vi.fn(async () => ({
            ok: true,
            json: async () => FEED_FIXTURE,
        })))
    })

    afterAll(() => {
        vi.unstubAllGlobals()
    })

    it("ordina il feed per publishedAt desc e filtra audience beta", async () => {
        const feed = await fetchChangelogNotifications()
        expect(feed.map(item => item.id)).toEqual(["beta-legacy-dup", "beta-new", "beta-mid", "beta-old"])
    })

    it("normalizza highlights legacy rimuovendo body duplicato e voci ripetute", async () => {
        const feed = await fetchChangelogNotifications()
        const legacy = feed.find(item => item.id === "beta-legacy-dup")

        expect(legacy).toBeDefined()
        expect(legacy?.body).toBe("Feature legacy")
        expect(legacy?.highlights).toEqual(["Altro dettaglio"])
    })

    it("ritorna array vuoto quando la fetch del feed fallisce", async () => {
        vi.stubGlobal("fetch", vi.fn(async () => ({
            ok: false,
            json: async () => FEED_FIXTURE,
        })))

        const feed = await fetchChangelogNotifications()
        expect(feed).toEqual([])
    })

    it("ritorna stato V2 di default quando storage e mancante", async () => {
        vi.mocked(storage.get).mockReturnValue(null)

        const state = await fetchNotificationsState()

        expect(state.version).toBe(2)
        expect(state.readIds).toEqual([])
        expect(state.lastSeenVersion).toBeNull()
        expect(Number.isFinite(new Date(state.updatedAt).getTime())).toBe(true)
    })

    it("migra stato V1 legacy a V2 preservando readIds", async () => {
        vi.mocked(storage.get).mockImplementation((key: string) => {
            if (key === NOTIFICATIONS_STATE_STORAGE_KEY) return null
            if (key === LEGACY_NOTIFICATIONS_STATE_STORAGE_KEY) {
                return {
                    version: 1,
                    readIds: ["beta-old"],
                    updatedAt: "2026-02-08T00:00:00.000Z",
                }
            }
            return null
        })

        const state = await fetchNotificationsState()

        expect(state.version).toBe(2)
        expect(state.readIds).toEqual(["beta-old"])
        expect(state.lastSeenVersion).toBeNull()
        expect(vi.mocked(storage.set)).toHaveBeenCalledWith(
            NOTIFICATIONS_STATE_STORAGE_KEY,
            expect.objectContaining({
                version: 2,
                readIds: ["beta-old"],
            })
        )
    })

    it("markNotificationAsRead e idempotente e aggiorna lastSeenVersion", async () => {
        let storedState: unknown = {
            version: 2,
            readIds: [],
            lastSeenVersion: null,
            updatedAt: "2026-02-08T00:00:00.000Z",
        }

        vi.mocked(storage.get).mockImplementation(() => storedState)
        vi.mocked(storage.set).mockImplementation((_key, value) => {
            storedState = value
        })

        const first = await markNotificationAsRead("beta-new", "0.1.2")
        const second = await markNotificationAsRead("beta-new", "0.1.2")

        expect(first.readIds).toEqual(["beta-new"])
        expect(second.readIds).toEqual(["beta-new"])
        expect(second.lastSeenVersion).toBe("0.1.2")
        expect(vi.mocked(storage.set)).toHaveBeenCalledTimes(2)
    })

    it("markAllNotificationsAsRead salva tutti gli id del feed", async () => {
        const feed = await fetchChangelogNotifications()
        const ids = feed.map(item => item.id)

        const state = await markAllNotificationsAsRead(ids, "0.1.2")

        expect(state.readIds).toEqual(ids)
        expect(state.lastSeenVersion).toBe("0.1.2")
        expect(vi.mocked(storage.set)).toHaveBeenCalledWith(
            NOTIFICATIONS_STATE_STORAGE_KEY,
            expect.objectContaining({
                version: 2,
                readIds: ids,
                lastSeenVersion: "0.1.2",
            })
        )
    })
})
