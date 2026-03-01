import { NextResponse } from "next/server"
import { createRequisition, GoCardlessConfigError } from "@/features/import-csv/open-banking/gocardless"

export const runtime = "nodejs"

interface SessionBody {
    institutionId?: string
}

function buildDefaultRedirect(request: Request): string {
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host")
    const forwardedProto = request.headers.get("x-forwarded-proto")

    if (!host) return "http://localhost:3000/transactions/import"

    const defaultProto = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https"
    const proto = forwardedProto || defaultProto
    return `${proto}://${host}/transactions/import`
}

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as SessionBody
        const institutionId = body.institutionId?.trim()

        if (!institutionId) {
            return NextResponse.json({ message: "Scegli prima la banca." }, { status: 400 })
        }

        const redirectUrl = process.env.GOCARDLESS_REDIRECT_URL?.trim() || buildDefaultRedirect(request)
        const requisition = await createRequisition({
            institutionId,
            redirectUrl,
            userLanguage: "IT",
        })

        return NextResponse.json(
            {
                requisitionId: requisition.id,
                authLink: requisition.link,
                status: requisition.status,
            },
            {
                headers: {
                    "Cache-Control": "no-store, max-age=0",
                },
            }
        )
    } catch (error) {
        const message = error instanceof Error ? error.message : "Non riesco ad avviare il collegamento banca."
        const status = error instanceof GoCardlessConfigError ? 503 : 500
        return NextResponse.json({ message }, { status })
    }
}
