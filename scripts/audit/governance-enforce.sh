#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
THRESHOLDS_FILE="$ROOT_DIR/docs/audit/governance-thresholds.env"
SUMMARY_FILE="$ROOT_DIR/docs/audit/quick-check-summary.env"

if [ ! -f "$THRESHOLDS_FILE" ]; then
    echo "[governance-enforce] Missing thresholds file: $THRESHOLDS_FILE"
    exit 1
fi

bash "$ROOT_DIR/scripts/audit/governance-quick-check.sh"
npm --prefix "$ROOT_DIR" run release:validate

if [ ! -f "$SUMMARY_FILE" ]; then
    echo "[governance-enforce] Missing summary file: $SUMMARY_FILE"
    exit 1
fi

# shellcheck disable=SC1090
source "$THRESHOLDS_FILE"
# shellcheck disable=SC1090
source "$SUMMARY_FILE"

failures=0

check_max() {
    local label="$1"
    local value="$2"
    local max="$3"

    if [ "$value" -gt "$max" ]; then
        echo "❌ $label: $value > $max"
        failures=$((failures + 1))
    else
        echo "✅ $label: $value <= $max"
    fi
}

echo "[governance-enforce] Evaluating thresholds"
check_max "PARSEFLOAT_COUNT" "$PARSEFLOAT_COUNT" "$PARSEFLOAT_MAX"
check_max "AMOUNT_KEY_COUNT" "$AMOUNT_KEY_COUNT" "$AMOUNT_KEY_MAX"
check_max "AMOUNT_STRING_COUNT" "$AMOUNT_STRING_COUNT" "$AMOUNT_STRING_MAX"
check_max "AMOUNT_LEGACY_COUNT" "$AMOUNT_LEGACY_COUNT" "$AMOUNT_LEGACY_MAX"
check_max "PERIOD_CANDIDATE_COUNT" "$PERIOD_CANDIDATE_COUNT" "$PERIOD_CANDIDATE_MAX"
check_max "INLINE_STYLE_COUNT" "$INLINE_STYLE_COUNT" "$INLINE_STYLE_MAX"
check_max "FORMULA_CANDIDATE_COUNT" "$FORMULA_CANDIDATE_COUNT" "$FORMULA_CANDIDATE_MAX"

if [ "$failures" -gt 0 ]; then
    echo "[governance-enforce] FAILED with $failures threshold violations"
    exit 1
fi

echo "[governance-enforce] PASSED"
