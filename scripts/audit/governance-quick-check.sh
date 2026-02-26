#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SRC_DIR="$ROOT_DIR/src"
OUT_DIR="$ROOT_DIR/docs/reports"
OUT_FILE="$OUT_DIR/generated-governance-quick-check.md"
SUMMARY_FILE="$OUT_DIR/generated-governance-quick-check-summary.env"

mkdir -p "$OUT_DIR"

now_iso="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

trim_empty() {
    sed '/^[[:space:]]*$/d'
}

count_lines() {
    local input="$1"
    if [ -z "${input//[[:space:]]/}" ]; then
        echo 0
    else
        printf '%s\n' "$input" | trim_empty | wc -l | tr -d ' '
    fi
}

head_or_empty() {
    local input="$1"
    local max_lines="$2"
    if [ -z "${input//[[:space:]]/}" ]; then
        echo "_None_"
    else
        printf '%s\n' "$input" | trim_empty | head -n "$max_lines"
    fi
}

# ---------------------------------------------------------
# 1) parseFloat su importi (exception: import-csv normalize)
# ---------------------------------------------------------
parsefloat_hits="$({
    grep -RIn --include='*.ts' --include='*.tsx' 'parseFloat(' "$SRC_DIR" 2>/dev/null || true
    grep -RIn --include='*.ts' --include='*.tsx' 'Number.parseFloat(' "$SRC_DIR" 2>/dev/null || true
} | sort -u | grep -v 'src/features/import-csv/core/normalize.ts' || true)"
parsefloat_count="$(count_lines "$parsefloat_hits")"

# ---------------------------------------------------------
# 2) amount deprecato o string amounts
# ---------------------------------------------------------
amount_key_hits="$(grep -RIn --include='*.ts' --include='*.tsx' -E '\bamount\s*:' "$SRC_DIR" 2>/dev/null || true)"
amount_key_count="$(count_lines "$amount_key_hits")"

amount_string_hits="$(grep -RIn --include='*.ts' --include='*.tsx' -E "\bamount\s*:\s*['\"\`]" "$SRC_DIR" 2>/dev/null || true)"
amount_string_count="$(count_lines "$amount_string_hits")"

amount_legacy_files=""
while IFS= read -r file; do
    [ -z "$file" ] && continue
    if grep -q 'amountCents' "$file" 2>/dev/null && grep -Eq '\bamount\s*:' "$file" 2>/dev/null; then
        amount_legacy_files+="$file"$'\n'
    fi
done < <(find "$SRC_DIR" -type f \( -name '*.ts' -o -name '*.tsx' \) | sort)
amount_legacy_files="$(printf '%s' "$amount_legacy_files" | trim_empty || true)"
amount_legacy_count="$(count_lines "$amount_legacy_files")"

# ---------------------------------------------------------
# 3) Uso filterByRange nei filtri periodo
# ---------------------------------------------------------
filterbyrange_hits="$(grep -RIn --include='*.ts' --include='*.tsx' 'filterByRange' "$SRC_DIR" 2>/dev/null || true)"
filterbyrange_count="$(count_lines "$filterbyrange_hits")"

period_candidates=""
while IFS= read -r file; do
    [ -z "$file" ] && continue

    if grep -Eq '\bperiod\b|fromDate|toDate|dateRange|calculateDateRange(Local)?\(' "$file" 2>/dev/null; then
        if grep -Eq 'setMonth\(|setFullYear\(|dateRange\.from|dateRange\.to|calculateDateRange(Local)?\(' "$file" 2>/dev/null; then
            if ! grep -q 'filterByRange' "$file" 2>/dev/null; then
                period_candidates+="$file"$'\n'
            fi
        fi
    fi
done < <(find "$SRC_DIR/features" "$SRC_DIR/VAULT" -type f \( -name '*.ts' -o -name '*.tsx' \) -not -name '*.test.ts' -not -name '*.test.tsx' | sort)
period_candidates="$(printf '%s' "$period_candidates" | trim_empty || true)"
period_candidates_count="$(count_lines "$period_candidates")"

# ---------------------------------------------------------
# 4) Inline style in TSX
# ---------------------------------------------------------
inline_style_hits_all="$(grep -RIn --include='*.tsx' 'style={{' "$SRC_DIR" 2>/dev/null || true)"
inline_style_all_count="$(count_lines "$inline_style_hits_all")"

# Exempt technical inline-style cases explicitly allowed by governance:
# - chart runtime sizing / canvas wrappers
# - dynamic SVG orbit palette
# - runtime color chips from data source
inline_style_exempt_hits="$(printf '%s\n' "$inline_style_hits_all" | grep -E \
    'src/features/dashboard/components/charts/echarts-wrapper.tsx:|src/features/dashboard/components/charts/premium-chart-section.tsx:|src/features/dashboard/components/charts/spending-composition-card.tsx:|src/components/layout/topbar-action-cluster.tsx:' \
    || true)"
inline_style_exempt_count="$(count_lines "$inline_style_exempt_hits")"

inline_style_hits="$(printf '%s\n' "$inline_style_hits_all" | grep -Ev \
    'src/features/dashboard/components/charts/echarts-wrapper.tsx:|src/features/dashboard/components/charts/premium-chart-section.tsx:|src/features/dashboard/components/charts/spending-composition-card.tsx:|src/components/layout/topbar-action-cluster.tsx:' \
    || true)"
inline_style_count="$(count_lines "$inline_style_hits")"

# ---------------------------------------------------------
# 5) Test che replicano formule (heuristic)
# ---------------------------------------------------------
formula_candidates=""
while IFS= read -r file; do
    [ -z "$file" ] && continue

    if grep -Eq 'amountCents|spend|income|expense|balance|superfluous' "$file" 2>/dev/null; then
        if grep -Eq 'reduce\(|Math\.abs\(|/\s*100|\*\s*100|setMonth\(' "$file" 2>/dev/null; then
            if ! grep -Eq '@/domain/money|@/domain/transactions|/utils' "$file" 2>/dev/null; then
                formula_candidates+="$file"$'\n'
            fi
        fi
    fi
done < <(find "$SRC_DIR" -type f \( -name '*.test.ts' -o -name '*.test.tsx' -o -name '*.spec.ts' -o -name '*.spec.tsx' \) | sort)
formula_candidates="$(printf '%s' "$formula_candidates" | trim_empty || true)"
formula_candidates_count="$(count_lines "$formula_candidates")"

# ---------------------------------------------------------
# Summary status
# ---------------------------------------------------------
parsefloat_status="PASS"
[ "$parsefloat_count" -gt 0 ] && parsefloat_status="FAIL"

amount_status="PASS"
[ "$amount_string_count" -gt 0 ] && amount_status="WARN"
[ "$amount_legacy_count" -gt 0 ] && amount_status="WARN"

period_status="PASS"
[ "$period_candidates_count" -gt 0 ] && period_status="WARN"

inline_style_status="PASS"
[ "$inline_style_count" -gt 0 ] && inline_style_status="WARN"

formula_status="PASS"
[ "$formula_candidates_count" -gt 0 ] && formula_status="WARN"

cat > "$SUMMARY_FILE" <<EOF
PARSEFLOAT_COUNT=$parsefloat_count
AMOUNT_KEY_COUNT=$amount_key_count
AMOUNT_STRING_COUNT=$amount_string_count
AMOUNT_LEGACY_COUNT=$amount_legacy_count
PERIOD_CANDIDATE_COUNT=$period_candidates_count
INLINE_STYLE_COUNT=$inline_style_count
INLINE_STYLE_TOTAL_COUNT=$inline_style_all_count
INLINE_STYLE_EXEMPT_COUNT=$inline_style_exempt_count
FORMULA_CANDIDATE_COUNT=$formula_candidates_count
EOF

cat > "$OUT_FILE" <<EOF
# Governance Quick Check

scope: governance-quick-check-report
owner: governance
status: generated
last-verified: ${now_iso:0:10}
canonical-of: none

> Generated report (non-normative).  
> Canonical process reference: \`docs/operations/governance-audit-process.md\`.

Generated at (UTC): $now_iso

Scope:
- Repository: numa-budget
- Target: non-destructive governance audit
- Constraints: cents-only, overlay+Tailwind, filterByRange, test integrity

## Summary

| Check | Status | Count |
|---|---|---:|
| parseFloat on monetary flows (excluding CSV normalize exception) | $parsefloat_status | $parsefloat_count |
| Deprecated \`amount\` key / string amounts | $amount_status | key:$amount_key_count string:$amount_string_count legacy-files:$amount_legacy_count |
| Period filters without \`filterByRange\` | $period_status | $period_candidates_count |
| Inline style in TSX (non-exempt) | $inline_style_status | non-exempt:$inline_style_count total:$inline_style_all_count exempt:$inline_style_exempt_count |
| Tests with formula-duplication heuristic | $formula_status | $formula_candidates_count |

## 1) parseFloat checks

Rule: no \`parseFloat\` on monetary logic in app flows.

Findings (first 40):

\
$(head_or_empty "$parsefloat_hits" 40)
\

## 2) amount deprecated / string amount checks

Rule: transaction source of truth is \`amountCents\` integer.

Amount key occurrences (first 60):

\
$(head_or_empty "$amount_key_hits" 60)
\

String amount occurrences (first 60):

\
$(head_or_empty "$amount_string_hits" 60)
\

Files containing both \`amount\` and \`amountCents\` (first 40):

\
$(head_or_empty "$amount_legacy_files" 40)
\

## 3) filterByRange period checks

Rule: temporal filters should use \`filterByRange\` where applicable.

filterByRange usage (first 60):

\
$(head_or_empty "$filterbyrange_hits" 60)
\

Candidate files with period logic and no \`filterByRange\` (first 40):

\
$(head_or_empty "$period_candidates" 40)
\

## 4) Inline style checks

Rule: prefer Tailwind classes; inline styles only where technically unavoidable.

Inline style hits (non-exempt, first 80):

\
$(head_or_empty "$inline_style_hits" 80)
\

Inline style hits (exempt technical cases, first 40):

\
$(head_or_empty "$inline_style_exempt_hits" 40)
\

## 5) Test formula duplication checks (heuristic)

Rule: tests should import production utilities when possible, not replicate business formulas.

Candidate test files (first 60):

\
$(head_or_empty "$formula_candidates" 60)
\

## Backlog candidates (non-fix in this pass)

- Any file in section 3 (period logic without \`filterByRange\`) that impacts runtime behavior.
- Any file in section 4 where inline style is not a strict technical requirement.
- Any file in section 5 that duplicates domain formulas instead of importing util.

## Execution

Run:

\
 bash scripts/audit/governance-quick-check.sh
\

Output:
- \`docs/reports/generated-governance-quick-check.md\`
EOF

echo "[quick-check] report generated: $OUT_FILE"
echo "[quick-check] summary generated: $SUMMARY_FILE"
