import { NextResponse } from "next/server"

const OPEN_BANKING_ENABLE_ENV = "NUMA_ENABLE_OPEN_BANKING"
const OPEN_BANKING_DISABLED_HEADERS = {
    "Cache-Control": "no-store, max-age=0",
}

export const OPEN_BANKING_DISABLED_MESSAGE = "Collegamento banca non disponibile in questa build."

export function isOpenBankingEnabled(): boolean {
    return process.env[OPEN_BANKING_ENABLE_ENV]?.trim().toLowerCase() === "true"
}

export function createOpenBankingDisabledResponse() {
    return NextResponse.json(
        { message: OPEN_BANKING_DISABLED_MESSAGE },
        {
            status: 503,
            headers: OPEN_BANKING_DISABLED_HEADERS,
        }
    )
}
