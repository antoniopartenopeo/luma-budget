/* @vitest-environment node */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/features/import-csv/open-banking/gocardless", () => ({
    createRequisition: vi.fn(),
    listInstitutions: vi.fn(),
    syncRequisitionToCsv: vi.fn(),
    GoCardlessConfigError: class GoCardlessConfigError extends Error {},
}))

import { OPEN_BANKING_DISABLED_MESSAGE } from "@/app/api/open-banking/guard"
import { GET as institutionsRoute } from "@/app/api/open-banking/institutions/route"
import { POST as sessionRoute } from "@/app/api/open-banking/session/route"
import { POST as syncRoute } from "@/app/api/open-banking/sync/route"
import {
    createRequisition,
    listInstitutions,
    syncRequisitionToCsv,
} from "@/features/import-csv/open-banking/gocardless"

const ORIGINAL_OPEN_BANKING_ENV = process.env.NUMA_ENABLE_OPEN_BANKING
const createRequisitionMock = vi.mocked(createRequisition)
const listInstitutionsMock = vi.mocked(listInstitutions)
const syncRequisitionToCsvMock = vi.mocked(syncRequisitionToCsv)

describe("open banking route guard", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        delete process.env.NUMA_ENABLE_OPEN_BANKING
    })

    afterEach(() => {
        if (typeof ORIGINAL_OPEN_BANKING_ENV === "string") {
            process.env.NUMA_ENABLE_OPEN_BANKING = ORIGINAL_OPEN_BANKING_ENV
            return
        }
        delete process.env.NUMA_ENABLE_OPEN_BANKING
    })

    it("returns 503 for session route when open banking is disabled", async () => {
        const response = await sessionRoute(
            new Request("http://localhost/api/open-banking/session", {
                method: "POST",
                body: JSON.stringify({ institutionId: "bank-1" }),
                headers: { "Content-Type": "application/json" },
            })
        )

        expect(response.status).toBe(503)
        await expect(response.json()).resolves.toEqual({ message: OPEN_BANKING_DISABLED_MESSAGE })
        expect(createRequisitionMock).not.toHaveBeenCalled()
    })

    it("returns 503 for institutions route when open banking is disabled", async () => {
        const response = await institutionsRoute(
            new Request("http://localhost/api/open-banking/institutions?country=IT")
        )

        expect(response.status).toBe(503)
        await expect(response.json()).resolves.toEqual({ message: OPEN_BANKING_DISABLED_MESSAGE })
        expect(listInstitutionsMock).not.toHaveBeenCalled()
    })

    it("returns 503 for sync route when open banking is disabled", async () => {
        const response = await syncRoute(
            new Request("http://localhost/api/open-banking/sync", {
                method: "POST",
                body: JSON.stringify({ requisitionId: "req-1" }),
                headers: { "Content-Type": "application/json" },
            })
        )

        expect(response.status).toBe(503)
        await expect(response.json()).resolves.toEqual({ message: OPEN_BANKING_DISABLED_MESSAGE })
        expect(syncRequisitionToCsvMock).not.toHaveBeenCalled()
    })

    it("delegates to downstream logic when the gate is explicitly enabled", async () => {
        process.env.NUMA_ENABLE_OPEN_BANKING = "true"
        listInstitutionsMock.mockResolvedValue([{ id: "bank-1", name: "Banca Test" }])

        const response = await institutionsRoute(
            new Request("http://localhost/api/open-banking/institutions?country=IT")
        )

        expect(response.status).toBe(200)
        await expect(response.json()).resolves.toEqual({
            country: "IT",
            institutions: [{ id: "bank-1", name: "Banca Test" }],
        })
        expect(listInstitutionsMock).toHaveBeenCalledWith("IT")
    })
})
