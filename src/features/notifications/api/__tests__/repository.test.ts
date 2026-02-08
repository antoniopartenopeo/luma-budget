import { beforeEach, describe, expect, it, vi } from "vitest"
import { storage } from "@/lib/storage-utils"
import {
    fetchChangelogNotifications,
    fetchNotificationsState,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    NOTIFICATIONS_STATE_STORAGE_KEY,
} from "../repository"

vi.mock("../../data/beta-changelog-feed.json", () => ({
    default: [
        {
            id: "beta-old",
            version: "0.1.0",
            kind: "fix",
            audience: "beta",
            title: "Fix vecchio",
            body: "Dettaglio fix",
            publishedAt: "2026-02-01T10:00:00.000Z",
        },
        {
            id: "alpha-hidden",
            version: "0.1.1",
            kind: "feature",
            audience: "alpha",
            title: "Non deve apparire",
            body: "Audience non valida",
            publishedAt: "2026-02-08T10:00:00.000Z",
        },
        {
            id: "beta-new",
            version: "0.1.2",
            kind: "improvement",
            audience: "beta",
            title: "Miglioria recente",
            body: "Dettaglio miglioramento",
            publishedAt: "2026-02-08T12:00:00.000Z",
        },
        {
            id: "beta-mid",
            version: "0.1.1",
            kind: "feature",
            audience: "beta",
            title: "Feature media",
            body: "Dettaglio feature",
            publishedAt: "2026-02-05T09:00:00.000Z",
        },
    ],
}))

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
    })

    it("ordina il feed per publishedAt desc e filtra audience beta", async () => {
        const feed = await fetchChangelogNotifications()
        expect(feed.map(item => item.id)).toEqual(["beta-new", "beta-mid", "beta-old"])
    })

    it("ritorna stato di default quando storage e mancante", async () => {
        vi.mocked(storage.get).mockReturnValue(null)

        const state = await fetchNotificationsState()

        expect(state.version).toBe(1)
        expect(state.readIds).toEqual([])
        expect(Number.isFinite(new Date(state.updatedAt).getTime())).toBe(true)
    })

    it("fa fallback sicuro quando stato e corrotto", async () => {
        vi.mocked(storage.get).mockReturnValue({ version: 999, readIds: ["beta-old"], updatedAt: "bad-date" })

        const state = await fetchNotificationsState()

        expect(state.version).toBe(1)
        expect(state.readIds).toEqual([])
        expect(Number.isFinite(new Date(state.updatedAt).getTime())).toBe(true)
    })

    it("markNotificationAsRead e idempotente", async () => {
        let storedState: unknown = {
            version: 1,
            readIds: [],
            updatedAt: "2026-02-08T00:00:00.000Z",
        }

        vi.mocked(storage.get).mockImplementation(() => storedState)
        vi.mocked(storage.set).mockImplementation((_key, value) => {
            storedState = value
        })

        const first = await markNotificationAsRead("beta-new")
        const second = await markNotificationAsRead("beta-new")

        expect(first.readIds).toEqual(["beta-new"])
        expect(second.readIds).toEqual(["beta-new"])
        expect(vi.mocked(storage.set)).toHaveBeenCalledTimes(2)
    })

    it("markAllNotificationsAsRead salva tutti gli id del feed", async () => {
        const feed = await fetchChangelogNotifications()
        const ids = feed.map(item => item.id)

        const state = await markAllNotificationsAsRead(ids)

        expect(state.readIds).toEqual(ids)
        expect(vi.mocked(storage.set)).toHaveBeenCalledWith(
            NOTIFICATIONS_STATE_STORAGE_KEY,
            expect.objectContaining({
                version: 1,
                readIds: ids,
            })
        )
    })
})
