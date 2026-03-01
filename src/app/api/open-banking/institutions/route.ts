import { NextResponse } from "next/server"
import { GoCardlessConfigError, listInstitutions } from "@/features/import-csv/open-banking/gocardless"

export const runtime = "nodejs"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const country = (searchParams.get("country") || "IT").toUpperCase()

    try {
        const institutions = await listInstitutions(country)
        return NextResponse.json(
            { country, institutions },
            {
                headers: {
                    "Cache-Control": "no-store, max-age=0",
                },
            }
        )
    } catch (error) {
        const message = error instanceof Error ? error.message : "Servizio banca non disponibile."
        const status = error instanceof GoCardlessConfigError ? 503 : 500
        return NextResponse.json({ message }, { status })
    }
}
