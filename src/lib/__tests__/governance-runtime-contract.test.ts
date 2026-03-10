import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { STORAGE_KEY_BUDGET_PLANS } from "@/lib/storage-keys"

const README_PATH = join(process.cwd(), "README.md")
const SYSTEM_ARCHITECTURE_PATH = join(process.cwd(), "docs/core/system-architecture.md")
const AUDIT_PROCESS_PATH = join(process.cwd(), "docs/operations/governance-audit-process.md")
const QUICK_CHECK_SCRIPT_PATH = join(process.cwd(), "scripts/audit/governance-quick-check.sh")
const DOE_VERIFY_WORKFLOW_PATH = join(process.cwd(), ".github/workflows/doe-verify.yml")
const OPEN_BANKING_GUARD_PATH = join(process.cwd(), "src/app/api/open-banking/guard.ts")

const GENERATED_REPORT_PATH = "docs/reports/generated-governance-quick-check.md"
const GENERATED_SUMMARY_PATH = "docs/reports/generated-governance-quick-check-summary.env"
const OPEN_BANKING_ENV_FLAG = "NUMA_ENABLE_OPEN_BANKING"

describe("Governance runtime contract", () => {
    it("keeps quick-check outputs aligned across script, docs, and CI", () => {
        const quickCheckScript = readFileSync(QUICK_CHECK_SCRIPT_PATH, "utf-8")
        const auditProcess = readFileSync(AUDIT_PROCESS_PATH, "utf-8")
        const workflow = readFileSync(DOE_VERIFY_WORKFLOW_PATH, "utf-8")

        expect(quickCheckScript).toContain('OUT_DIR="$ROOT_DIR/docs/reports"')
        expect(quickCheckScript).toContain('OUT_FILE="$OUT_DIR/generated-governance-quick-check.md"')
        expect(quickCheckScript).toContain('SUMMARY_FILE="$OUT_DIR/generated-governance-quick-check-summary.env"')

        expect(auditProcess).toContain(`Generated output runtime: \`${GENERATED_REPORT_PATH}\``)
        expect(auditProcess).toContain(`Artifact CI: \`${GENERATED_REPORT_PATH}\` + \`${GENERATED_SUMMARY_PATH}\``)

        expect(workflow).toContain(`name: governance-quick-check`)
        expect(workflow).toContain(GENERATED_REPORT_PATH)
        expect(workflow).toContain(GENERATED_SUMMARY_PATH)
    })

    it("keeps open banking docs aligned with the runtime feature flag", () => {
        const readme = readFileSync(README_PATH, "utf-8")
        const architecture = readFileSync(SYSTEM_ARCHITECTURE_PATH, "utf-8")
        const openBankingGuard = readFileSync(OPEN_BANKING_GUARD_PATH, "utf-8")

        expect(openBankingGuard).toContain(`const OPEN_BANKING_ENABLE_ENV = "${OPEN_BANKING_ENV_FLAG}"`)

        expect(readme).toContain("Open banking routes -> present in codebase but disabled by default")
        expect(readme).toContain(`${OPEN_BANKING_ENV_FLAG}=true`)

        expect(architecture).toContain("/api/open-banking/institutions")
        expect(architecture).toContain("/api/open-banking/session")
        expect(architecture).toContain("/api/open-banking/sync")
        expect(architecture).toContain(`${OPEN_BANKING_ENV_FLAG}=true`)
    })

    it("keeps the legacy budget key documented as compatibility-only", () => {
        const readme = readFileSync(README_PATH, "utf-8")
        const architecture = readFileSync(SYSTEM_ARCHITECTURE_PATH, "utf-8")

        expect(STORAGE_KEY_BUDGET_PLANS).toBe("luma_budget_plans_v1")
        expect(readme).toContain(`- \`${STORAGE_KEY_BUDGET_PLANS}\``)
        expect(readme).toContain("Legacy compatibility key")
        expect(architecture).toContain(`- \`${STORAGE_KEY_BUDGET_PLANS}\``)
        expect(architecture).toContain("Legacy compatibility key")
    })
})
