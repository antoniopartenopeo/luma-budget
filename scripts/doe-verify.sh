#!/bin/bash

# DOE Verification Spec
# 1. Lint & Test (Always run on full project)
# 2. Pattern Policy: 'parseFloat' in .ts/.tsx
#    - Rule: Fail if found in any MODIFIED file (diff vs main) that is NOT whitelisted.
#    - Rule: Warn if found in a whitelisted file (even if unmodified).

set -e

echo "🔍 [DOE] Starting Verification Protocol..."

# 1. Linting
echo "🧹 [1/3] Running Linter..."
npm run lint

# 2. Testing
echo "🧪 [2/3] Running Tests..."
npm run test:run

# 3. Pattern Policing (Anti-Legacy)
echo "👮 [3/3] Checking for Prohibited Patterns (Diff-Based)..."

# Define whitelist files (Paths relative to root)
LEGACY_FLOAT_FILES=(
    "src/features/transactions/api/repository.ts"
    "src/features/dashboard/__tests__/superfluous-kpi.test.ts"
)

# Determine Base Branch
BASE_BRANCH="main"
if git rev-parse --verify "origin/main" >/dev/null 2>&1; then
    BASE_BRANCH="origin/main"
elif ! git rev-parse --verify "main" >/dev/null 2>&1; then
    # Fallback for detached/pure local
    BASE_BRANCH="HEAD~1" 
fi

echo "   -> Comparing against base: $BASE_BRANCH"

# Get List of Changed Files (.ts/.tsx only)
CHANGED_FILES=$(git diff --name-only --diff-filter=ACMR "$BASE_BRANCH" | grep -E '\.(ts|tsx)$' || true)

FAILED=false

# Check modified files
for file in $CHANGED_FILES; do
    # Check if file exists (diff might show deleted files if filter failed)
    if [ ! -f "$file" ]; then continue; fi

    # Check against whitelist
    IS_WHITELISTED=false
    for legacy in "${LEGACY_FLOAT_FILES[@]}"; do
        if [[ "$file" == "$legacy" ]]; then
            IS_WHITELISTED=true
            break
        fi
    done

    # If NOT whitelisted and contains parseFloat -> Fail
    if [ "$IS_WHITELISTED" = false ]; then
        # 1. Float Check
        if grep -q "parseFloat" "$file"; then
             echo "❌ [DOE ERROR] Prohibited 'parseFloat' detected in modified file: $file"
             FAILED=true
        fi

        # 2. UI Theme Check (Glass Standard)
        # Check only .tsx files for style violations
        if [[ "$file" == *".tsx" ]]; then
            # Search for hardcoded light patterns (bg-white, text-slate-900, border-white)
            # Note: We allow 'bg-white' only if it's strictly handling a specific case, but generally we want to discourage it.
            # Using grep -E for extended regex
            if grep -qE "bg-white|text-slate-900|border-white" "$file"; then
                 echo "⚠️  [DOE WARNING] Standard Violation: Potential hardcoded light-theme styles detected in: $file"
                 echo "   -> Patterns found: bg-white*, text-slate-900, or border-white*"
                 echo "   -> Rule: Use .glass-panel/.glass-card or theme tokens (text-foreground, border-border)."
                 echo "   -> Reference: docs/doe/directives/DD-003-ui-theme-glass.md"
                 # We assert strict failure for text-slate-900 as it's definitely wrong for dark mode
                 if grep -q "text-slate-900" "$file"; then
                    FAILED=true
                 fi
            fi
        fi

        # 3. Domain Math Check
        # Check .tsx files for loose Math.* calls (heuristic)
        if [[ "$file" == *".tsx" ]]; then
            if grep -qE "Math\.(round|floor|ceil|pow)" "$file"; then
                 echo "⚠️  [DOE WARNING] Math logic detected in UI component: $file"
                 echo "   -> Found 'Math.xxx'. Please move logic to financial-math.ts or utils."
                 echo "   -> Reference: docs/doe/directives/DD-004-domain-math.md"
            fi
        fi
    fi
done

if [ "$FAILED" = true ]; then
    echo "   -> Logic must use integer cents. See docs/doe/legacy-registry.md."
    exit 1
fi

# Legacy Warnings (Always Check)
echo "   -> Scanning Legacy Registry..."
for file in "${LEGACY_FLOAT_FILES[@]}"; do
    if [ -f "$file" ] && grep -q "parseFloat" "$file"; then
        echo "⚠️  [DOE WARNING] Allowed legacy usage in: $file"
    fi
done

echo "✅ [DOE] Verification Passed. Ready to commit."
