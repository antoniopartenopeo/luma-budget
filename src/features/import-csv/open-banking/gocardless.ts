interface GoCardlessTokenResponse {
    access?: string
}

export interface GoCardlessInstitution {
    id: string
    name: string
    logo?: string
    bic?: string
    transaction_total_days?: string
}

interface GoCardlessRequisition {
    id?: string
    status?: string
    link?: string
    accounts?: string[]
}

interface GoCardlessTransactionAmount {
    amount?: string
    currency?: string
}

interface GoCardlessTransaction {
    transactionId?: string
    bookingDate?: string
    valueDate?: string
    bookingDateTime?: string
    valueDateTime?: string
    transactionAmount?: GoCardlessTransactionAmount
    remittanceInformationUnstructured?: string
    remittanceInformationUnstructuredArray?: string[]
    additionalInformation?: string
    creditorName?: string
    debtorName?: string
    bankTransactionCode?: string
    creditDebitIndicator?: string
}

interface GoCardlessTransactionsResponse {
    transactions?: {
        booked?: GoCardlessTransaction[]
    }
}

export interface BankCsvSyncResult {
    status: "ready" | "pending"
    requisitionStatus: string | null
    accountCount: number
    transactionCount: number
    csvContent?: string
}

const DEFAULT_BASE_URL = "https://bankaccountdata.gocardless.com"

export class GoCardlessConfigError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "GoCardlessConfigError"
    }
}

function getConfig() {
    const secretId = process.env.GOCARDLESS_SECRET_ID?.trim()
    const secretKey = process.env.GOCARDLESS_SECRET_KEY?.trim()
    const baseUrl = (process.env.GOCARDLESS_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(/\/+$/, "")

    if (!secretId || !secretKey) {
        throw new GoCardlessConfigError("Collegamento banca non configurato. Aggiungi GOCARDLESS_SECRET_ID e GOCARDLESS_SECRET_KEY.")
    }

    return { secretId, secretKey, baseUrl }
}

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null
}

function asString(value: unknown): string | null {
    if (typeof value !== "string") return null
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
}

function compactJson(input: unknown): string {
    try {
        return JSON.stringify(input)
    } catch {
        return ""
    }
}

function extractApiError(payload: unknown): string | null {
    if (!isObject(payload)) return null
    const summary = asString(payload.summary)
    const detail = asString(payload.detail)
    if (summary && detail) return `${summary}: ${detail}`
    if (detail) return detail
    if (summary) return summary
    return null
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
    const { baseUrl } = getConfig()
    const response = await fetch(`${baseUrl}${path}`, {
        ...init,
        cache: "no-store",
    })
    const payload = (await response.json().catch(() => null)) as unknown

    if (!response.ok) {
        const apiError = extractApiError(payload)
        throw new Error(apiError || `Richiesta GoCardless fallita (${response.status}).`)
    }

    return payload as T
}

async function getAccessToken(): Promise<string> {
    const { secretId, secretKey } = getConfig()
    const payload = await requestJson<GoCardlessTokenResponse>("/api/v2/token/new/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            secret_id: secretId,
            secret_key: secretKey,
        }),
    })

    if (!payload.access) {
        throw new Error("Token GoCardless non disponibile.")
    }

    return payload.access
}

async function authorizedRequest<T>(path: string, init?: RequestInit): Promise<T> {
    const accessToken = await getAccessToken()
    const headers = new Headers(init?.headers)
    headers.set("Authorization", `Bearer ${accessToken}`)
    if (!headers.has("Content-Type") && init?.method && init.method !== "GET") {
        headers.set("Content-Type", "application/json")
    }
    return requestJson<T>(path, {
        ...init,
        headers,
    })
}

function buildReference() {
    return `numa-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export async function listInstitutions(country = "IT"): Promise<GoCardlessInstitution[]> {
    const safeCountry = country.toUpperCase()
    const result = await authorizedRequest<unknown>(`/api/v2/institutions/?country=${encodeURIComponent(safeCountry)}`)
    if (!Array.isArray(result)) return []

    return result
        .filter((item): item is GoCardlessInstitution => isObject(item) && typeof item.id === "string" && typeof item.name === "string")
        .sort((a, b) => a.name.localeCompare(b.name, "it"))
}

export async function createRequisition(params: {
    institutionId: string
    redirectUrl: string
    userLanguage?: string
}) {
    const payload = await authorizedRequest<GoCardlessRequisition>("/api/v2/requisitions/", {
        method: "POST",
        body: JSON.stringify({
            institution_id: params.institutionId,
            redirect: params.redirectUrl,
            reference: buildReference(),
            user_language: params.userLanguage || "IT",
            account_selection: false,
            redirect_immediate: true,
        }),
    })

    if (!payload.id || !payload.link) {
        throw new Error(`Requisizione non valida: ${compactJson(payload)}`)
    }

    return {
        id: payload.id,
        status: payload.status || null,
        link: payload.link,
    }
}

async function getRequisition(requisitionId: string): Promise<GoCardlessRequisition> {
    return authorizedRequest<GoCardlessRequisition>(`/api/v2/requisitions/${encodeURIComponent(requisitionId)}/`)
}

async function getAccountTransactions(accountId: string): Promise<GoCardlessTransactionsResponse> {
    return authorizedRequest<GoCardlessTransactionsResponse>(`/api/v2/accounts/${encodeURIComponent(accountId)}/transactions/`)
}

function readDate(transaction: GoCardlessTransaction): string | null {
    const candidates = [
        transaction.bookingDate,
        transaction.valueDate,
        transaction.bookingDateTime,
        transaction.valueDateTime,
    ]
    for (const candidate of candidates) {
        const value = asString(candidate)
        if (!value) continue
        const normalized = value.slice(0, 10)
        if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
            return normalized
        }
    }
    return null
}

function readDescription(transaction: GoCardlessTransaction): string {
    const fromArray = transaction.remittanceInformationUnstructuredArray?.map(item => item.trim()).filter(Boolean).join(" ")
    const candidates = [
        asString(transaction.remittanceInformationUnstructured),
        asString(fromArray),
        asString(transaction.additionalInformation),
        asString(transaction.creditorName),
        asString(transaction.debtorName),
        asString(transaction.bankTransactionCode),
    ]
    for (const candidate of candidates) {
        if (candidate) return candidate
    }
    return "Movimento bancario"
}

function readAmount(transaction: GoCardlessTransaction): string | null {
    const raw = asString(transaction.transactionAmount?.amount)
    if (!raw) return null

    const normalized = raw.replace(",", ".")
    const value = Number.parseFloat(normalized)
    if (!Number.isFinite(value)) return null

    let signed = value
    const indicator = asString(transaction.creditDebitIndicator)?.toUpperCase()
    const hasSign = normalized.startsWith("-") || normalized.startsWith("+")

    if (!hasSign && indicator) {
        if (indicator === "DBIT") signed = -Math.abs(value)
        if (indicator === "CRDT") signed = Math.abs(value)
    }

    return signed.toFixed(2)
}

function escapeCsv(value: string): string {
    if (!/[",\n]/.test(value)) return value
    return `"${value.replace(/"/g, "\"\"")}"`
}

function toCsv(rows: Array<{ date: string; description: string; amount: string }>): string {
    const header = "Data,Descrizione,Importo"
    const body = rows.map(row =>
        `${escapeCsv(row.date)},${escapeCsv(row.description)},${escapeCsv(row.amount)}`
    )
    return [header, ...body].join("\n")
}

export async function syncRequisitionToCsv(requisitionId: string): Promise<BankCsvSyncResult> {
    const requisition = await getRequisition(requisitionId)
    const accountIds = Array.isArray(requisition.accounts)
        ? requisition.accounts.filter(accountId => typeof accountId === "string" && accountId.length > 0)
        : []

    if (accountIds.length === 0) {
        return {
            status: "pending",
            requisitionStatus: requisition.status || null,
            accountCount: 0,
            transactionCount: 0,
        }
    }

    const rows: Array<{ date: string; description: string; amount: string; fingerprint: string }> = []

    for (const accountId of accountIds) {
        const accountTransactions = await getAccountTransactions(accountId)
        const booked = accountTransactions.transactions?.booked
        if (!Array.isArray(booked)) continue

        for (const transaction of booked) {
            const date = readDate(transaction)
            const amount = readAmount(transaction)
            if (!date || !amount) continue

            const description = readDescription(transaction)
            const fingerprint = [
                accountId,
                transaction.transactionId || "",
                date,
                amount,
                description,
            ].join("|")

            rows.push({ date, description, amount, fingerprint })
        }
    }

    const dedupedRows = Array.from(
        new Map(rows.map(row => [row.fingerprint, row])).values()
    ).map(({ date, description, amount }) => ({ date, description, amount }))

    dedupedRows.sort((a, b) => b.date.localeCompare(a.date))

    return {
        status: "ready",
        requisitionStatus: requisition.status || null,
        accountCount: accountIds.length,
        transactionCount: dedupedRows.length,
        csvContent: toCsv(dedupedRows),
    }
}
