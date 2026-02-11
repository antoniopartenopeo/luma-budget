# Governance Quick Check

Generated at (UTC): 2026-02-11T20:17:03Z

Scope:
- Repository: numa-budget
- Target: non-destructive governance audit
- Constraints: cents-only, overlay+Tailwind, filterByRange, test integrity

## Summary

| Check | Status | Count |
|---|---|---:|
| parseFloat on monetary flows (excluding CSV normalize exception) | PASS | 0 |
| Deprecated `amount` key / string amounts | WARN | key:41 string:21 legacy-files:7 |
| Period filters without `filterByRange` | WARN | 4 |
| Inline style in TSX | WARN | 8 |
| Tests with formula-duplication heuristic | WARN | 3 |

## 1) parseFloat checks

Rule: no `parseFloat` on monetary logic in app flows.

Findings (first 40):

_None_

## 2) amount deprecated / string amount checks

Rule: transaction source of truth is `amountCents` integer.

Amount key occurrences (first 60):

/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/insights/use-ai-advisor.ts:16:    amount: number
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/insights/use-ai-advisor.ts:267:                amount: amount,
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/import-csv/core/parse.ts:9:    amount: ["importo", "amount", "ammontare", "entrate", "uscite", "dare", "avere", "saldo", "valore"],
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/import-csv/core/parse.ts:86:        amount: -1,
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/import-csv/core/subgrouping.ts:34:    const recurring: Array<{ amount: number; rows: EnrichedRow[] }> = [];
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/import-csv/core/__tests__/parse.test.ts:17:            amount: "-50.00",
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/import-csv/core/__tests__/normalize.test.ts:7:        const rows = [{ lineNumber: 1, raw: { date: "2024-01-15", amount: "-12.50", description: " Test " } }];
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/import-csv/core/__tests__/normalize.test.ts:17:        const rows = [{ lineNumber: 1, raw: { date: "15/01/2024", amount: "-1.200,50", description: "EU" } }];
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/import-csv/core/__tests__/normalize.test.ts:25:        const rows = [{ lineNumber: 1, raw: { date: "2024-01-01", amount: "1,200.50", description: "US" } }];
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/import-csv/core/__tests__/normalize.test.ts:31:        const rows = [{ lineNumber: 1, raw: { date: "2024-01-01", amount: "(50.00)", description: "Neg" } }];
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/import-csv/core/__tests__/normalize.test.ts:37:        const rows = [{ lineNumber: 1, raw: { date: "2024-01-01", amount: "0.00", description: "Zero" } }];
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/import-csv/core/__tests__/normalize.test.ts:43:        const rows = [{ lineNumber: 1, raw: { date: "invalid", amount: "10", description: "Bad Date" } }];
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/import-csv/core/__tests__/normalize.test.ts:57:        const rows = [{ lineNumber: 1, raw: { date: "15.01.2024", amount: "10", description: "DE" } }];
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/import-csv/core/__tests__/normalize.test.ts:63:        const rows = [{ lineNumber: 1, raw: { date: "5.1.2024", amount: "10", description: "DE" } }];
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/import-csv/core/__tests__/normalize.test.ts:70:        const rows = [{ lineNumber: 1, raw: { date: "15/01/26", amount: "10", description: "2YR" } }];
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/import-csv/core/__tests__/normalize.test.ts:76:        const rows = [{ lineNumber: 1, raw: { date: "15.01.26", amount: "10", description: "2YR DE" } }];
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/import-csv/core/__tests__/normalize.test.ts:82:        const rows = [{ lineNumber: 1, raw: { date: "15-01-26", amount: "10", description: "2YR" } }];
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/import-csv/core/__tests__/normalize.test.ts:92:        const rows = [{ lineNumber: 1, raw: { date: "01/01/00", amount: "10", description: "Y2K" } }];
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/import-csv/core/__tests__/normalize.test.ts:98:        const rows = [{ lineNumber: 1, raw: { date: "01/06/50", amount: "10", description: "2050" } }];
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/import-csv/core/__tests__/normalize.test.ts:105:        const rows = [{ lineNumber: 1, raw: { date: "5/1/26", amount: "10", description: "Short" } }];
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/import-csv/core/__tests__/normalize.test.ts:112:        const rows = [{ lineNumber: 1, raw: { date: "12/25/2024", amount: "10", description: "US" } }];
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/import-csv/core/merchant/normalizers.ts:62:    // Card number with amount: "*7298 DI EUR 25,04"
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/dashboard/__tests__/superfluous-kpi.test.ts:17:    amount: string,
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/dashboard/__tests__/superfluous-kpi.test.ts:148:                amount: '-€100.00',
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/dashboard/api/__tests__/dashboard-summary.test.ts:54:            amount: 250.00,
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/dashboard/api/__tests__/dashboard-summary.test.ts:65:            amount: 100.00,
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/dashboard/api/__tests__/dashboard-summary.test.ts:78:            amount: 500.00,
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/dashboard/api/__tests__/dashboard-summary.test.ts:121:            amount: 100.00,
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/dashboard/api/__tests__/dashboard-summary.test.ts:132:            amount: 100.00,
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/dashboard/api/__tests__/dashboard-summary.test.ts:152:        await createTransaction({ amount: 100.00, amountCents: 10000, type: 'expense', description: 'May', categoryId: 'c1', category: 'C1' })
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/dashboard/api/__tests__/dashboard-summary.test.ts:156:        await createTransaction({ amount: 200.00, amountCents: 20000, type: 'expense', description: 'Apr', categoryId: 'c1', category: 'C1' })
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/dashboard/api/__tests__/dashboard-summary.test.ts:160:        await createTransaction({ amount: 300.00, amountCents: 30000, type: 'expense', description: 'Mar', categoryId: 'c1', category: 'C1' })
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/dashboard/api/__tests__/dashboard-summary.test.ts:164:        await createTransaction({ amount: 500.00, amountCents: 50000, type: 'expense', description: 'Jan', categoryId: 'c1', category: 'C1' })
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/dashboard/api/__tests__/dashboard-summary.test.ts:189:            amount: 111.00,
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/dashboard/api/__tests__/dashboard-summary.test.ts:199:            amount: 222.00,
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/transactions/__tests__/transactions-logic.test.ts:14:        amount: "€100,00",
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/transactions/__tests__/transactions-logic.test.ts:26:        amount: "€50,00",
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/transactions/__tests__/transactions-logic.test.ts:39:        amount: "€20,00",
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/transactions/api/__tests__/transactions-persistence.test.ts:55:            amount: 50.00,
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/domain/money/currency.ts:68:export function euroToCents(amount: number): number {
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/VAULT/goals/logic/__tests__/financial-baseline.test.ts:19:    amount: number,

String amount occurrences (first 60):

/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/import-csv/core/__tests__/parse.test.ts:17:            amount: "-50.00",
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/import-csv/core/__tests__/normalize.test.ts:7:        const rows = [{ lineNumber: 1, raw: { date: "2024-01-15", amount: "-12.50", description: " Test " } }];
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/import-csv/core/__tests__/normalize.test.ts:17:        const rows = [{ lineNumber: 1, raw: { date: "15/01/2024", amount: "-1.200,50", description: "EU" } }];
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/import-csv/core/__tests__/normalize.test.ts:25:        const rows = [{ lineNumber: 1, raw: { date: "2024-01-01", amount: "1,200.50", description: "US" } }];
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/import-csv/core/__tests__/normalize.test.ts:31:        const rows = [{ lineNumber: 1, raw: { date: "2024-01-01", amount: "(50.00)", description: "Neg" } }];
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/import-csv/core/__tests__/normalize.test.ts:37:        const rows = [{ lineNumber: 1, raw: { date: "2024-01-01", amount: "0.00", description: "Zero" } }];
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/import-csv/core/__tests__/normalize.test.ts:43:        const rows = [{ lineNumber: 1, raw: { date: "invalid", amount: "10", description: "Bad Date" } }];
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/import-csv/core/__tests__/normalize.test.ts:57:        const rows = [{ lineNumber: 1, raw: { date: "15.01.2024", amount: "10", description: "DE" } }];
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/import-csv/core/__tests__/normalize.test.ts:63:        const rows = [{ lineNumber: 1, raw: { date: "5.1.2024", amount: "10", description: "DE" } }];
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/import-csv/core/__tests__/normalize.test.ts:70:        const rows = [{ lineNumber: 1, raw: { date: "15/01/26", amount: "10", description: "2YR" } }];
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/import-csv/core/__tests__/normalize.test.ts:76:        const rows = [{ lineNumber: 1, raw: { date: "15.01.26", amount: "10", description: "2YR DE" } }];
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/import-csv/core/__tests__/normalize.test.ts:82:        const rows = [{ lineNumber: 1, raw: { date: "15-01-26", amount: "10", description: "2YR" } }];
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/import-csv/core/__tests__/normalize.test.ts:92:        const rows = [{ lineNumber: 1, raw: { date: "01/01/00", amount: "10", description: "Y2K" } }];
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/import-csv/core/__tests__/normalize.test.ts:98:        const rows = [{ lineNumber: 1, raw: { date: "01/06/50", amount: "10", description: "2050" } }];
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/import-csv/core/__tests__/normalize.test.ts:105:        const rows = [{ lineNumber: 1, raw: { date: "5/1/26", amount: "10", description: "Short" } }];
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/import-csv/core/__tests__/normalize.test.ts:112:        const rows = [{ lineNumber: 1, raw: { date: "12/25/2024", amount: "10", description: "US" } }];
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/import-csv/core/merchant/normalizers.ts:62:    // Card number with amount: "*7298 DI EUR 25,04"
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/dashboard/__tests__/superfluous-kpi.test.ts:148:                amount: '-€100.00',
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/transactions/__tests__/transactions-logic.test.ts:14:        amount: "€100,00",
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/transactions/__tests__/transactions-logic.test.ts:26:        amount: "€50,00",
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/transactions/__tests__/transactions-logic.test.ts:39:        amount: "€20,00",

Files containing both `amount` and `amountCents` (first 40):

/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/VAULT/goals/logic/__tests__/financial-baseline.test.ts
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/dashboard/__tests__/superfluous-kpi.test.ts
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/dashboard/api/__tests__/dashboard-summary.test.ts
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/import-csv/core/__tests__/normalize.test.ts
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/import-csv/core/subgrouping.ts
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/insights/use-ai-advisor.ts
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/transactions/__tests__/transactions-logic.test.ts

## 3) filterByRange period checks

Rule: temporal filters should use `filterByRange` where applicable.

filterByRange usage (first 60):

/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/insights/utils.ts:7:import { getMonthBoundariesLocal, filterByRange, formatDateLocalISO } from "@/lib/date-ranges"
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/insights/utils.ts:60:    return filterByRange(transactions, start, end)
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/dashboard/utils/spending-composition.ts:3:import { calculateDateRangeLocal, filterByRange } from "@/lib/date-ranges"
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/dashboard/utils/spending-composition.ts:33:    const periodTransactions = filterByRange(transactions, startDate, endDate)
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/dashboard/components/recent-transactions.tsx:3:import { calculateDateRangeLocal, filterByRange } from "@/lib/date-ranges"
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/dashboard/components/recent-transactions.tsx:74:        filteredTransactions = filterByRange(filteredTransactions, startDate, endDate)
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/dashboard/api/repository.ts:5:import { calculateDateRange, filterByRange } from "@/lib/date-ranges"
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/dashboard/api/repository.ts:41:    const rangeTransactions = filterByRange(transactions, startDate, endDate)
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/dashboard/api/repository.ts:53:    const targetMonthTransactions = filterByRange(transactions, pivotStart, pivotEnd)
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/transactions/utils/transactions-logic.ts:3:import { filterByRange } from "@/lib/date-ranges";
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/transactions/utils/transactions-logic.ts:52:    const scopedTransactions = filterByRange(transactions, start, end)
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/simulator/utils.ts:4:import { calculateDateRange, filterByRange } from "@/lib/date-ranges"
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/simulator/utils.ts:54:    const inRangeTransactions = filterByRange(transactions, startDate, endDate)
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/lib/date-ranges.ts:133:export function filterByRange<T extends { timestamp: number }>(

Candidate files with period logic and no `filterByRange` (first 40):

/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/dashboard/components/dashboard-filter-bar.tsx
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/dashboard/components/kpi-cards.tsx
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/transactions/components/transactions-filter-bar.tsx
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/transactions/hooks/use-transactions-view.ts

## 4) Inline style checks

Rule: prefer Tailwind classes; inline styles only where technically unavoidable.

Inline style hits (first 80):

/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/insights/components/insight-card.tsx:146:                                                    style={{ width: `${impactPct}%` }}
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/dashboard/components/charts/echarts-wrapper.tsx:32:        <div className={className} style={{ width: "100%", height: "100%", ...style }}>
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/dashboard/components/charts/echarts-wrapper.tsx:35:                style={{ height: "100%", width: "100%" }}
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/dashboard/components/charts/premium-chart-section.tsx:45:                <div style={{ height: chartHeight }}>
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/dashboard/components/charts/premium-chart-section.tsx:82:                                <div className="absolute w-[70%] h-[60%] border border-primary/10 rounded-[2rem] animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite]" style={{ animationDelay: '0.5s' }} />
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/dashboard/components/charts/premium-chart-section.tsx:91:                <div style={{ height: chartHeight }} className="flex items-center justify-center relative z-10">
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/dashboard/components/charts/premium-chart-section.tsx:100:                    <div className="w-full relative text-foreground" style={{ height: chartHeight }}>
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/dashboard/components/charts/spending-composition-card.tsx:234:                            style={{

## 5) Test formula duplication checks (heuristic)

Rule: tests should import production utilities when possible, not replicate business formulas.

Candidate test files (first 60):

/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/VAULT/goals/logic/__tests__/sustainability-guard.test.ts
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/domain/narration/__tests__/semantic-enforcement.test.ts
/Users/acvisuals/.gemini/antigravity/scratch/numa-budget/src/features/dashboard/api/__tests__/dashboard-calculation.test.ts

## Backlog candidates (non-fix in this pass)

- Any file in section 3 (period logic without `filterByRange`) that impacts runtime behavior.
- Any file in section 4 where inline style is not a strict technical requirement.
- Any file in section 5 that duplicates domain formulas instead of importing util.

## Execution

Run:

 bash scripts/audit/governance-quick-check.sh

Output:
- `docs/audit/quick-check.md`
