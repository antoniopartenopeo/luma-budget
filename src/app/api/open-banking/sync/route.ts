import { NextResponse } from "next/server"
import { GoCardlessConfigError, syncRequisitionToCsv } from "@/features/import-csv/open-banking/gocardless"

export const runtime = "nodejs"

interface SyncBody {
    requisitionId?: string
}

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as SyncBody
        const requisitionId = body.requisitionId?.trim()

        if (!requisitionId) {
            return NextResponse.json({ message: "ID collegamento mancante." }, { status: 400 })
        }

        const result = await syncRequisitionToCsv(requisitionId)
        const status = result.status === "pending" ? 202 : 200

        return NextResponse.json(result, {
            status,
            headers: {
                "Cache-Control": "no-store, max-age=0",
            },
        })
    } catch (error) {
        const message = error instanceof Error ? error.message : "Non riesco a scaricare i movimenti dalla banca."
        const status = error instanceof GoCardlessConfigError ? 503 : 500
        return NextResponse.json({ message }, { status })
    }
}
